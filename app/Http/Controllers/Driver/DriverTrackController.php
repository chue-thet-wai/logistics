<?php

namespace App\Http\Controllers\Driver;

use App\Models\Track;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Http\Controllers\Controller;
use App\Models\Container;
use App\Models\Driver;
use App\Models\Job;
use App\Models\Notification;
use App\Models\TrackStatusLog;
use App\Models\TrackExpense;
use App\Models\Truck;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class DriverTrackController extends Controller
{
    /**
     * List tracks assigned to logged-in driver
     */
    public function index()
    {
        $user = Auth::user();

        abort_unless($user->hasRole('Driver'), 403);

        $driver = $user->driver;

        $tracks = $driver->tracks()
            ->with(['truck', 'containers'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('DriverApp/Tracks/Index', [
            'pageTitle' => 'Driver Tracks',
            'tracks'    => $tracks,
        ]);
    }

    /**
     * Show track detail (only driver's track)
     */
    public function show($track_id)
    {
        $driver = Auth::user()->driver;

        $track = $driver->tracks()
            ->with([
                'truck',
                'driver.user',
                'containers'
            ])
            ->where('track_id', $track_id)
            ->firstOrFail();
        $statuses = collect(config('common.track_statuses'))
            ->filter(function ($status) {
                return $status['value'] != 10;
            })
            ->values();

        return Inertia::render('DriverApp/Tracks/Detail', [
            'track'    => $track,
            'statuses' => $statuses,
            'container_types' => config('common.container_types'),
        ]);
    }

    /**
     * Edit Track Status
     */
    public function editStatus(Track $track)
    {
        abort_unless($track->driver_id === Auth::user()->driver->id, 403);

        $statuses = collect(config('common.track_statuses'))
            ->filter(function ($status) {
                return $status['value'] != 10;
            })
            ->values();

        return Inertia::render('DriverApp/Tracks/UpdateStatus', [
            'track'    => $track,
            'statuses' => $statuses,
            'expense_types' => config('common.expense_types'),
        ]);
    }


    public function updateStatus(Request $request, Track $track)
    {
        abort_unless($track->driver_id === Auth::user()->driver->id, 403);

        $request->validate([
            'status'    => 'required|integer',
            'latitude'  => 'nullable',
            'longitude' => 'nullable',
            'notes'     => 'nullable|string',
            'photo'     => 'nullable|mimes:pdf,jpg,jpeg,png,xls,xlsx,csv,txt|max:10240',
            'expenses'  => 'nullable|array',
            'expenses.*.receipts' => 'nullable|array|max:3',
            'expenses.*.receipts.*' => 'nullable|mimes:pdf,jpg,jpeg,png,xls,xlsx,csv,txt|max:10240',
        ]);

        $track->update([
            'status' => $request->status,
            'updated_by' => Auth::id(),
        ]);

        $photoPath = null;
        if ($request->hasFile('photo')) {
            $photoPath = $request->file('photo')->store('track_statuses', 's3');
        }

        $log = TrackStatusLog::create([
            'track_id' => $track->id,
            'status' => $request->status,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'notes' => $request->notes,
            'photo' => $photoPath,
            'created_by' => Auth::id(),
        ]);

        if ($request->expenses) {

            foreach ($request->expenses as $expense) {

                $receipt1 = null;
                $receipt2 = null;
                $receipt3 = null;

                if (!empty($expense['receipts'])) {

                    foreach ($expense['receipts'] as $index => $file) {

                        if ($file instanceof \Illuminate\Http\UploadedFile) {

                            $path = $file->store('expense_receipts', 's3');

                            if ($index === 0) $receipt1 = $path;
                            if ($index === 1) $receipt2 = $path;
                            if ($index === 2) $receipt3 = $path;
                        }}
                }

                TrackExpense::create([
                    'track_status_log_id' => $log->id,
                    'type'   => $expense['type'],
                    'title'  => $expense['title'] ?? null,
                    'amount' => $expense['amount'] ?? 0,
                    'notes'  => $expense['note'] ?? null,
                    'receipt'   => $receipt1,
                    'receipt_2' => $receipt2,
                    'receipt_3' => $receipt3,
                ]);
            }
        }

        $statusLabel = collect(config('common.track_statuses'))
            ->firstWhere('value', $request->status)['label'] ?? 'Updated';


        Notification::create([
            'user_id' => Auth::id(),
            'title' => 'Track Status Updated',
            'message' => "Track {$track->track_id} status changed to {$statusLabel}",
        ]);

        $LAST_STATUS_VALUE = 9; // Trip End Status

        if ((int)$request->status === $LAST_STATUS_VALUE) 
        {

            DB::transaction(function () use ($track) {

                Driver::where('id', $track->driver_id)
                    ->update(['available' => 1]);

                Truck::where('id', $track->truck_id)
                    ->update(['available' => 1]);

                $track->containers()->update([
                    'status' => 2 // complete
                ]);

                $shipmentIds = $track->containers()
                    ->pluck('shipment_id')
                    ->unique();

                foreach ($shipmentIds as $shipmentId) {

                    $hasIncomplete = Container::where('shipment_id', $shipmentId)
                        ->where('status', '!=', 2)
                        ->exists();

                    if (!$hasIncomplete) {
                        Job::where('shipment_id', $shipmentId)
                            ->update(['status' => 2]); // job complete
                    }
                }

            });
        }


        $LEFTPORT_STATUS_VALUE = 4;

        if ((int)$request->status === $LEFTPORT_STATUS_VALUE) {

            $now = now();

            foreach ($track->containers as $container) {

                $arrival = $container->arrival_date
                    ? Carbon::parse($container->arrival_date)
                    : null;

                $leftPort = $now;

                $demurrageUsed = 0;
                $demurrageExtra = 0;
                $detentionUsed = 0;
                $detentionExtra = 0;

                if ($arrival) {

                    $demurrageFree = $container->demurrage_free_day ?? 0;

                    $demurrageUsed = $arrival->diffInDays($leftPort) + 1;

                    $demurrageExtra = max(0, $demurrageUsed - $demurrageFree);

                }

                $detentionFree = $container->detention_free_day ?? 0;

                $detentionUsed = 1; 

                $detentionExtra = max(0, $detentionUsed - $detentionFree);

                $container->update([

                    'left_port_date' => $leftPort,

                    'demurrage_used_day' => $demurrageUsed,
                    'demurrage_extra_day' => $demurrageExtra,

                    'detention_used_day' => $detentionUsed,
                    'detention_extra_day' => $detentionExtra,

                ]);

            }

        }

        $CONTAINER_RETURN_VALUE = 8;

        if ((int)$request->status === $CONTAINER_RETURN_VALUE) {

            $now = now();

            foreach ($track->containers as $container) {

                $leftPort = $container->left_port_date
                    ? Carbon::parse($container->left_port_date)
                    : null;

                $containerReturn = $now;

                $detentionUsed = 0;
                $detentionExtra = 0;

                if ($leftPort) {

                    $detentionFree = $container->detention_free_day ?? 0;

                    $detentionUsed = $leftPort->diffInDays($containerReturn) + 1;

                    $detentionExtra = max(0, $detentionUsed - $detentionFree);

                }

                $container->update([

                    'container_return_date' => $containerReturn,

                    'detention_used_day' => $detentionUsed,
                    'detention_extra_day' => $detentionExtra,

                ]);

            }

        }


        return redirect("/driver/tracks/{$track->track_id}")
                ->with('success', 'Track status updated successfully');
    } 
}