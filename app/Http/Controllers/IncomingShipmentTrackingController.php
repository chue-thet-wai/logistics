<?php

namespace App\Http\Controllers;

use App\Models\Container;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\ContainersExport;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Collection;

class IncomingShipmentTrackingController extends Controller
{
    public function indexold(Request $request)
    {
        $query = Container::with('job.customer');

        if ($request->filled('master_bl_number')) {
            $query->whereHas('job', function ($q) use ($request) {
                $q->where('master_bl_number', 'like', '%' . $request->master_bl_number . '%');
            });
        }

        if ($request->filled('house_bl_number')) {
            $query->whereHas('job', function ($q) use ($request) {
                $q->where('house_bl_number', 'like', '%' . $request->house_bl_number . '%');
            });
        }

        /*if ($request->filled('customer')) {
            $query->whereHas('job.customer', function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->customer . '%');
            });
        }*/

        $containers = $query->whereNull('container_return_date')
            ->latest()
            ->paginate(config('common.paginate_per_page', 10))
            ->withQueryString();

        $collection = $this->applyCalculations($containers->getCollection());

        $collection = $collection->filter(function ($item) use ($request) {

            if ($request->filled('demurrage_remain') &&
                $item->demurrage_remain != $request->demurrage_remain) {
                return false;
            }

            if ($request->filled('demurrage_over') &&
                $item->demurrage_over != $request->demurrage_over) {
                return false;
            }

            if ($request->filled('detention_remain') &&
                $item->detention_remain != $request->detention_remain) {
                return false;
            }

            if ($request->filled('detention_over') &&
                $item->detention_over != $request->detention_over) {
                return false;
            }

            return true;
        });

        $containers->setCollection($collection->values());

        return Inertia::render('IncomingShipmentTracking/Index', [
            'containers' => $containers,
            'container_types' => config('common.container_types'),
            'bl_statuses' => config('common.bl_statuses'),
            'filters' => $request->only([
                'master_bl_number',
                'house_bl_number',
                'customer',
                'demurrage_remain',
                'demurrage_over',
                'detention_remain',
                'detention_over'
            ]),
            'pageTitle' => 'Incoming Shipment Tracking'
        ]);
    }

    public function index(Request $request)
    {
        $demurrageDate = 'arrival_date';
        $query = Container::with('job.customer');

        if ($request->calculated_by == "2") {
            $query->leftJoin('jobs', 'jobs.shipment_id', '=', 'containers.shipment_id')
                ->whereNotNull('jobs.eta')
                ->whereNull('arrival_date');

            $demurrageDate = 'jobs.eta';
        } else {
            $query->whereNotNull('arrival_date');
        }

        $query->select('containers.*');

        $query->selectRaw("
            CASE
                WHEN {$demurrageDate} IS NOT NULL
                THEN DATEDIFF(COALESCE(left_port_date, CURDATE()), {$demurrageDate}) + 1
                ELSE NULL
            END as demurrage_used,

            CASE
                WHEN {$demurrageDate} IS NOT NULL AND left_port_date IS NULL
                THEN GREATEST(
                    0,
                    COALESCE(demurrage_free_day,0) -
                    (DATEDIFF(COALESCE(left_port_date, CURDATE()), {$demurrageDate}) + 1)
                )
                ELSE NULL
            END as demurrage_remain,

            CASE
                WHEN {$demurrageDate} IS NOT NULL AND left_port_date IS NULL
                THEN GREATEST(
                    0,
                    (DATEDIFF(COALESCE(left_port_date, CURDATE()), {$demurrageDate}) + 1) -
                    COALESCE(demurrage_free_day,0)
                )
                ELSE 0
            END as demurrage_over,

            CASE
                WHEN {$demurrageDate} IS NOT NULL
                    AND COALESCE(demurrage_free_day,0) > 0
                THEN DATE_ADD(
                    {$demurrageDate},
                    INTERVAL COALESCE(demurrage_free_day,0) - 1 DAY
                )
                ELSE NULL
            END as cal_demurrage_last_date,

            CASE
                WHEN left_port_date IS NOT NULL
                THEN DATEDIFF(COALESCE(container_return_date, CURDATE()), left_port_date) + 1
                ELSE NULL
            END as detention_used,

            CASE
                WHEN left_port_date IS NOT NULL
                    AND container_return_date IS NULL
                THEN GREATEST(
                    0,
                    COALESCE(detention_free_day,0) -
                    (DATEDIFF(COALESCE(container_return_date, CURDATE()), left_port_date) + 1)
                )
                ELSE NULL
            END as detention_remain,

            CASE
                WHEN left_port_date IS NOT NULL
                    AND container_return_date IS NULL
                THEN GREATEST(
                    0,
                    (DATEDIFF(COALESCE(container_return_date, CURDATE()), left_port_date) + 1) -
                    COALESCE(detention_free_day,0)
                )
                ELSE NULL
            END as detention_over,

            CASE
                WHEN left_port_date IS NOT NULL
                    AND COALESCE(detention_free_day,0) > 0
                THEN DATE_ADD(
                    left_port_date,
                    INTERVAL COALESCE(detention_free_day,0) - 1 DAY
                )
                ELSE NULL
            END as cal_detention_last_date
        ");

        if ($request->filled('demurrage_remain')) {
            $query->havingBetween('demurrage_remain', [1,(int) $request->demurrage_remain]);
        }

        if ($request->filled('demurrage_over')) {
            $query->having('demurrage_over', '>=', (int) $request->demurrage_over);
        }

        if ($request->filled('detention_remain')) {
            $query->havingBetween('detention_remain', [1,(int) $request->detention_remain]);
        }

        if ($request->filled('detention_over')) {
            $query->having('detention_over', '>=', (int) $request->detention_over);
        }

        if ($request->filled('master_bl_number')) {
            $query->whereHas('job', function ($q) use ($request) {
                $q->where('master_bl_number', 'like', '%' . $request->master_bl_number . '%');
            });
        }

        if ($request->filled('house_bl_number')) {
            $query->whereHas('job', function ($q) use ($request) {
                $q->where('house_bl_number', 'like', '%' . $request->house_bl_number . '%');
            });
        }

        $containers = $query
            ->whereNull('container_return_date')
            ->latest()
            ->paginate(config('common.paginate_per_page', 10))
            ->withQueryString(); 

        return Inertia::render('IncomingShipmentTracking/Index', [
            'containers' => $containers,
            'container_types' => config('common.container_types'),
            'bl_statuses' => config('common.bl_statuses'),
            'free_day_types' => config('common.free_day_types'),
            'incoming_report_calculated_by' => config('common.incoming_report_calculated_by'),
            'filters' => $request->only([
                'master_bl_number',
                'house_bl_number',
                'customer',
                'demurrage_remain',
                'demurrage_over',
                'detention_remain',
                'detention_over'
            ]),
            'pageTitle' => 'Incoming Shipment Tracking'
        ]);
    }

    public function export(Request $request)
    {
        $demurrageDate = 'arrival_date';

        $query = Container::with('job.customer');

        if ($request->calculated_by == "2") {
            $query->leftJoin('jobs', 'jobs.shipment_id', '=', 'containers.shipment_id')
                ->whereNotNull('jobs.eta')
                ->whereNull('arrival_date');

            $demurrageDate = 'jobs.eta';
        } else {
            $query->whereNotNull('arrival_date');
        }

        $query->select('containers.*');

        $query->selectRaw("
            CASE
                WHEN {$demurrageDate} IS NOT NULL
                THEN DATEDIFF(COALESCE(left_port_date, CURDATE()), {$demurrageDate}) + 1
                ELSE NULL
            END as demurrage_used,

            CASE
                WHEN {$demurrageDate} IS NOT NULL AND left_port_date IS NULL
                THEN GREATEST(
                    0,
                    COALESCE(demurrage_free_day,0) -
                    (DATEDIFF(COALESCE(left_port_date, CURDATE()), {$demurrageDate}) + 1)
                )
                ELSE NULL
            END as demurrage_remain,

            CASE
                WHEN {$demurrageDate} IS NOT NULL AND left_port_date IS NULL
                THEN GREATEST(
                    0,
                    (DATEDIFF(COALESCE(left_port_date, CURDATE()), {$demurrageDate}) + 1) -
                    COALESCE(demurrage_free_day,0)
                )
                ELSE 0
            END as demurrage_over,

            CASE
                WHEN {$demurrageDate} IS NOT NULL
                    AND COALESCE(demurrage_free_day,0) > 0
                THEN DATE_ADD(
                    {$demurrageDate},
                    INTERVAL COALESCE(demurrage_free_day,0) - 1 DAY
                )
                ELSE NULL
            END as cal_demurrage_last_date,

            CASE
                WHEN left_port_date IS NOT NULL
                THEN DATEDIFF(COALESCE(container_return_date, CURDATE()), left_port_date) + 1
                ELSE NULL
            END as detention_used,

            CASE
                WHEN left_port_date IS NOT NULL
                    AND container_return_date IS NULL
                THEN GREATEST(
                    0,
                    COALESCE(detention_free_day,0) -
                    (DATEDIFF(COALESCE(container_return_date, CURDATE()), left_port_date) + 1)
                )
                ELSE NULL
            END as detention_remain,

            CASE
                WHEN left_port_date IS NOT NULL
                    AND container_return_date IS NULL
                THEN GREATEST(
                    0,
                    (DATEDIFF(COALESCE(container_return_date, CURDATE()), left_port_date) + 1) -
                    COALESCE(detention_free_day,0)
                )
                ELSE NULL
            END as detention_over,

            CASE
                WHEN left_port_date IS NOT NULL
                    AND COALESCE(detention_free_day,0) > 0
                THEN DATE_ADD(
                    left_port_date,
                    INTERVAL COALESCE(detention_free_day,0) - 1 DAY
                )
                ELSE NULL
            END as cal_detention_last_date
        ");

        if ($request->filled('demurrage_remain')) {
            $query->havingBetween('demurrage_remain', [1,(int) $request->demurrage_remain]);
        }

        if ($request->filled('demurrage_over')) {
            $query->having('demurrage_over', '>=', (int) $request->demurrage_over);
        }

        if ($request->filled('detention_remain')) {
            $query->havingBetween('detention_remain', [1,(int) $request->detention_remain]);
        }

        if ($request->filled('detention_over')) {
            $query->having('detention_over', '>=', (int) $request->detention_over);
        }

        if ($request->filled('master_bl_number')) {
            $query->whereHas('job', function ($q) use ($request) {
                $q->where('master_bl_number', 'like', '%' . $request->master_bl_number . '%');
            });
        }

        if ($request->filled('house_bl_number')) {
            $query->whereHas('job', function ($q) use ($request) {
                $q->where('house_bl_number', 'like', '%' . $request->house_bl_number . '%');
            });
        }

        $containers = $query
            ->whereNull('container_return_date')
            ->latest()
            ->get(); 

        return Excel::download(
            new ContainersExport($containers),
            'incoming-shipment-tracking.xlsx'
        );
    }

    private function applyCalculations(Collection $containers): Collection
    {
        $today = Carbon::today();

        return $containers->map(function ($item) use ($today) {
            $demurrageDate = $item->arrival_date ?? $item->job?->eta;
            if ($demurrageDate) {
                $start = Carbon::parse($demurrageDate);
                $end = $item->left_port_date
                    ? Carbon::parse($item->left_port_date)
                    : $today;

                $freeDays = (int) ($item->demurrage_free_day ?? 0);
                $usedDays = $start->diffInDays($end) + 1;

                $item->demurrage_last_date = $freeDays > 0
                    ? $start->copy()->addDays($freeDays - 1)->format('Y-m-d')
                    : null;

                $item->demurrage_used = $usedDays;
                if ($item->left_port_date) {
                    $item->demurrage_remain = 0;
                    $item->demurrage_over = 0;
                } else {
                    $item->demurrage_remain = max(0, $freeDays - $usedDays);
                    $item->demurrage_over = max(0, $usedDays - $freeDays);
                }
                
            }

            if ($item->left_port_date) {
                $start = Carbon::parse($item->left_port_date);
                $end = $item->container_return_date
                    ? Carbon::parse($item->container_return_date)
                    : $today;

                $freeDays = (int) ($item->detention_free_day ?? 0);
                $usedDays = $start->diffInDays($end) + 1;

                $item->detention_last_date = $freeDays > 0
                    ? $start->copy()->addDays($freeDays - 1)->format('Y-m-d')
                    : null;

                $item->detention_used = $usedDays;
                if ($item->container_return_date) {
                    $item->detention_remain = 0;
                    $item->detention_over = 0;
                } else {
                    $item->detention_remain = max(0, $freeDays - $usedDays);
                    $item->detention_over = max(0, $usedDays - $freeDays);
                }
            }

            return $item;
        });
    }
    
    public function show(string $id)
    {
        $container = Container::with('job.customer')
            ->where('container_id', $id)
            ->firstOrFail(); 
        $container = $this->applyCalculations(collect([$container]))->first();

        return Inertia::render('IncomingShipmentTracking/Show', [
            'container' => $container,
            'container_types' => config('common.container_types'),
            'bl_statuses' => config('common.bl_statuses'),
            'free_day_types' => config('common.free_day_types'),
            'pageTitle' => 'Incoming Shipment Tracking Detail'
        ]);
    }
}