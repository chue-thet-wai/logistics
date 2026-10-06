<?php

namespace App\Http\Controllers;

use App\Models\Container;
use App\Models\Trip;
use App\Models\TripExpense;
use App\Models\TripTransportCost;
use App\Models\TripIncome;
use App\Models\TripStatusLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ChargesController extends Controller
{
  
    public function index(Request $request)
    {
        $query = Trip::with([
            'driver:id,name',
            'truck:id,truck_number',
            'containers:id,container_no,status'
        ]);
        if ($request->trip_id) {
            $query->where('trip_id','like','%'.$request->trip_id.'%');
        }

        if ($request->truck_number) {
            $query->whereHas('truck', function ($q) use ($request) {
                $q->where('truck_number','like','%'.$request->truck_number.'%');
            });
        }

        if ($request->driver) {
            $query->whereHas('driver', function ($q) use ($request) {
                $q->where('name','like','%'.$request->driver.'%');
            });
        }

        if ($request->status !== null && $request->status !== '') {
            $query->where('status',$request->status);
        }
        $trips=$query->latest()->paginate(config('common.paginate_per_page', 10));

        return Inertia::render('Charges/Index', [
            'trips'    => $trips,
            'statuses'  => config('common.trip_statuses'),
            'pageTitle' => 'Charges',
        ]);
    }

    public function edit(Trip $trip)
    {
        $trip->load([
            'containers.job.customer',
            'driver',
            'truck',
            'incomes',
            'expenses',
            'statusLogs.costs',
            'statusLogs.user'
        ]);

        $expenseTypes = config('common.expense_types');
        $containerCount = $trip->containers->count();

        $costs = $trip->statusLogs->flatMap(function ($log) use ($expenseTypes, $containerCount) {

            return $log->costs->map(function ($e) use ($log, $expenseTypes, $containerCount) {

                $typeLabel = collect($expenseTypes)
                    ->firstWhere('value', $e->type)['label'] ?? '-';
                $perContainer = $containerCount > 0
                    ? $e->amount / $containerCount
                    : 0;

                return [
                    'id'      => $e->id,
                    'title'   => $e->title,
                    'type'    => $e->type,  
                    'typeLabel' => $typeLabel,
                    'notes'   => $e->notes,
                    'amount'  => (float) $e->amount,
                    'per_container' => round((float) $perContainer, 2),
                    'receipt' => $e->receipt,
                    'receipt_url' => $e->receipt_url ?? null,
                    'receipt2_url' => $e->receipt2_url ?? null,
                    'receipt3_url' => $e->receipt3_url ?? null,
                    'user'    => $log->user?->name,
                    'role' => $log->user?->getRoleNames()->first(),
                    'created_at' => $e->created_at->format('Y-m-d H:i')
                ];

            });

        });

        return Inertia::render('Charges/Form', [
            'trip'        => $trip,
            'incomes'      => $trip->incomes,
            'expenses'      => $trip->expenses,
            'costs'         => $costs,
            'expense_types' => config('common.expense_types'),
            'income_titles' => config('common.income_titles'),
            'expense_titles' => config('common.expense_titles'),
            'pageTitle'    => 'Charges',
        ]);
    }

    public function storeTransportCost(Request $request, Trip $trip)
    {
        $validated = $request->validate([
            'type' => 'required',
            'title' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
            'receipts.*' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048'
        ]);

        $LAST_STATUS_VALUE = 10;

        $log = TripStatusLog::create([
            'trip_id'   => $trip->id,
            'status'     => $LAST_STATUS_VALUE,
            'latitude'   => null,
            'longitude'  => null,
            'notes'      => $request->notes,
            'photo'      => "",
            'created_by' => Auth::id(),
        ]);

        $receipt1 = null;
        $receipt2 = null;
        $receipt3 = null;

        if ($request->hasFile('receipts')) {

            $files = $request->file('receipts');

            if (count($files) > 3) {
                return back()->withErrors(['receipts' => 'Maximum 3 files allowed']);
            }

            foreach ($files as $index => $file) {

                $path = $file->store('expense_receipts', 's3');

                if ($index === 0) $receipt1 = $path;
                if ($index === 1) $receipt2 = $path;
                if ($index === 2) $receipt3 = $path;
            }
        }

        TripTransportCost::create([
            'trip_status_log_id' => $log->id,
            'type' => $validated['type'],
            'title' => $validated['title'],
            'amount' => $validated['amount'],
            'notes' => $validated['notes'] ?? null,
            'receipt' => $receipt1,
            'receipt_2' => $receipt2,
            'receipt_3' => $receipt3,
        ]);

        recalculate_container_summary($trip,'cost',null);

        return back()->with('success', 'Transport Cost added successfully.');
    }

    public function updateTransportCost(Request $request, TripTransportCost $expense)
    {
        $validated = $request->validate([
            'type' => 'required',
            'title' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
            'receipts.*' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048'
        ]);

        $receipt1 = $expense->receipt;
        $receipt2 = $expense->receipt_2;
        $receipt3 = $expense->receipt_3;

        if ($request->hasFile('receipts')) {

            $files = $request->file('receipts');

            if (count($files) > 3) {
                return back()->withErrors(['receipts' => 'Maximum 3 files allowed']);
            }

            foreach ($files as $index => $file) {

                $path = $file->store('expense_receipts', 's3');

                if ($index === 0) {
                    if ($receipt1) Storage::disk('s3')->delete($receipt1);
                    $receipt1 = $path;
                }

                if ($index === 1) {
                    if ($receipt2) Storage::disk('s3')->delete($receipt2);
                    $receipt2 = $path;
                }

                if ($index === 2) {
                    if ($receipt3) Storage::disk('s3')->delete($receipt3);
                    $receipt3 = $path;
                }
            }
        }

        $expense->update([
            'type' => $validated['type'],
            'title' => $validated['title'],
            'amount' => $validated['amount'],
            'notes' => $validated['notes'] ?? null,
            'receipt' => $receipt1,
            'receipt_2' => $receipt2,
            'receipt_3' => $receipt3,
        ]);

        recalculate_container_summary($expense->tripStatusLog->trip,'cost',null);

        return back()->with('success', 'Transport Cost updated successfully.');
    }

    public function deleteTransportCost(TripTransportCost $expense)
    {
        if ($expense->receipt) {
            Storage::disk('s3')->delete($expense->receipt);
        }

        if ($expense->receipt_2) {
            Storage::disk('s3')->delete($expense->receipt_2);
        }

        if ($expense->receipt_3) {
            Storage::disk('s3')->delete($expense->receipt_3);
        }

        $trip = $expense->tripStatusLog->trip;

        $expense->delete();

        recalculate_container_summary($trip, 'cost', null);

        return back()->with('success', 'Transport Cost deleted successfully.');
    }


    public function storeIncome(Request $request, Trip $trip)
    {
        $validated = $request->validate([
            'container_id'  => 'required|string|max:255',
            'title'         => 'required',
            'title_other'   => 'nullable|string|max:255',
            'amount'        => 'required|numeric|min:0',
            'notes'         => 'nullable|string',
        ]);

        $trip->incomes()->create([
            ...$validated,
            'created_by' => Auth::id(),
        ]);
        recalculate_container_summary($trip,'income',$request->container_id);

        return back()->with('success', 'Income added successfully.');
    }


    public function updateIncome(Request $request, TripIncome $income)
    {
        $validated = $request->validate([
            'container_id'  => 'required|string|max:255',
            'title'         => 'required|string|max:255',
            'title_other'   => 'nullable|string|max:255',
            'amount'        => 'required|numeric|min:0',
            'notes'         => 'nullable|string',
        ]);

        $income->update([
            ...$validated,
            'updated_by' => Auth::id(),
        ]);
        recalculate_container_summary($income->trip, 'income', $validated['container_id']);

        return back()->with('success', 'Income updated successfully.');
    }


    public function deleteIncome(TripIncome $income)
    {
        $trip = $income->trip;
        $container_id = $income->container_id;

        $income->delete();

        recalculate_container_summary($trip, 'income', $container_id);

        return back()->with('success', 'Income deleted successfully.');
    }

    public function storeExpense(Request $request, Trip $trip)
    {
        $validated = $request->validate([
            'container_id'  => 'required|string|max:255',
            'title'         => 'required',
            'title_other'   => 'nullable|string|max:255',
            'amount'        => 'required|numeric|min:0',
            'notes'         => 'nullable|string',
        ]);

        $trip->expenses()->create([
            ...$validated,
            'created_by' => Auth::id(),
        ]);

        recalculate_container_summary($trip, 'expense', $request->container_id);

        return back()->with('success', 'Expense added successfully.');
    }


    public function updateExpense(Request $request, TripExpense $expense)
    {
        $validated = $request->validate([
            'container_id'  => 'required|string|max:255',
            'title'         => 'required',
            'title_other'   => 'nullable|string|max:255',
            'amount'        => 'required|numeric|min:0',
            'notes'         => 'nullable|string',
        ]);

        $expense->update([
            ...$validated,
            'updated_by' => Auth::id(),
        ]);
        recalculate_container_summary($expense->trip, 'expense', $validated['container_id']);

        return back()->with('success', 'Expense updated successfully.');
    }


    public function deleteExpense(TripExpense $expense)
    {
        $trip = $expense->trip;
        $container_id = $expense->container_id;

        $expense->delete();

        recalculate_container_summary($trip, 'expense', $container_id); 

        return back()->with('success', 'Expense deleted successfully.');
    }

    //demurrange and detention update
    public function updateCharge(Request $request)
    {
        $container = Container::where('container_id', $request->container_id)->first();

        if (!$container) {
            return back()->with('error', 'Container not found');
        }

        if ($request->type === 'Demurrage') {

            if ($request->has('rate')) {
                $container->demurrage_rate = $request->rate;
            }

            if ($request->has('total')) {
                $container->demurrage_total = $request->total;
            }
        }

        if ($request->type === 'Detention') {

            if ($request->has('rate')) {
                $container->detention_rate = $request->rate;
            }

            if ($request->has('total')) {
                $container->detention_total = $request->total;
            }
        }

        $container->save();

        return back();
    }

    public function show(Trip $trip)
    {
        $trip->load([
            'containers.job.customer',
            'driver',
            'truck',
            'costs',
            'incomes.container',
            'expenses.container',
        ]);

        $expenseTypes = config('common.expense_types');
        $containerCount = $trip->containers->count();

        $costs = $trip->statusLogs->flatMap(function ($log) use ($expenseTypes,$containerCount) {

            return $log->costs->map(function ($e) use ($log, $expenseTypes,$containerCount) {

                $typeLabel = collect($expenseTypes)
                    ->firstWhere('value', $e->type)['label'] ?? '-';

                $perContainer = $containerCount > 0
                    ? $e->amount / $containerCount
                    : 0;
                

                return [
                    'id'      => $e->id,
                    'title'   => $e->title,
                    'type'    => $typeLabel,   
                    'notes'   => $e->notes,
                    'amount'  => (float) $e->amount,
                    'per_container'  => round((float) $perContainer, 2),
                    'receipt' => $e->receipt,
                    'receipt_url' => $e->receipt_url ?? null,
                    'user'    => $log->user?->name,
                    'role' => $log->user?->getRoleNames()->first(),
                    'created_at' => $e->created_at->format('Y-m-d H:i')
                ];

            });

        });

        $incomeTitles = collect(config('common.income_titles'))
                        ->pluck('label', 'value'); 

        $incomes = $trip->incomes->map(function ($i) use ($incomeTitles) {

            $title = $i->title == 99
                ? ($i->title_other ?: 'Other')
                : ($incomeTitles[$i->title] ?? '-');

            return [
                'id'           => $i->id,
                'title'        => $title, 
                'container_id' => $i->container_id,
                'container_no' => optional($i->container)->container_no,
                'notes'        => $i->notes,
                'amount'       => (float) $i->amount,
            ];
        });

        $expenseTitles = collect(config('common.expense_titles'))
                        ->pluck('label', 'value'); 

        $expenses = $trip->expenses->map(function ($i) use ($expenseTitles) {

            $title = $i->title == 99
                ? ($i->title_other ?: 'Other')
                : ($expenseTitles[$i->title] ?? '-');

            return [
                'id'           => $i->id,
                'title'        => $title, 
                'container_id' => $i->container_id,
                'container_no' => optional($i->container)->container_no,
                'notes'        => $i->notes,
                'amount'       => (float) $i->amount,
            ];
        });

        return Inertia::render('Charges/Show', [
            'trip'        => $trip,
            'costs'       => $costs,
            'statuses'     => config('common.trip_statuses'),
            'incomes'      => $incomes,
            'expenses'     => $expenses,
            'pageTitle'    => 'Charges Details',
        ]);
    }


}