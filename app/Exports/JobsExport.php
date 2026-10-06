<?php

namespace App\Exports;

use App\Models\Job;
use Illuminate\Database\Eloquent\Builder;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class JobsExport implements FromQuery, WithHeadings, WithMapping
{
    protected array $filters;

    protected array $categories;
    protected array $modes;
    protected array $loadingPorts;
    protected array $dischargePorts;
    protected array $carriers;
    protected array $consignees;
    protected array $shipmentTypes;
    protected array $blStatuses;
    protected array $freeDayTypes;
    protected array $statuses;

    public function __construct(array $filters = [])
    {
        $this->filters = $filters;

        $this->categories = config('common.categories', []);
        $this->modes = config('common.modes', []);
        $this->loadingPorts = config('common.loading_ports', []);
        $this->dischargePorts = config('common.discharge_ports', []);
        $this->carriers = config('common.cariers', []);
        $this->consignees = config('common.consignee_names', []);
        $this->shipmentTypes = config('common.shipment_types', []);
        $this->blStatuses = config('common.bl_statuses', []);
        $this->freeDayTypes = config('common.free_day_types', []);
        $this->statuses = config('common.job_statuses', []);
    }

    public function query()
    {
        $query = Job::with('customer');

        if (!empty($this->filters['master_bl_number'])) {
            $query->where(
                'master_bl_number',
                'like',
                '%' . $this->filters['master_bl_number'] . '%'
            );
        }

        if (!empty($this->filters['house_bl_number'])) {
            $query->where(
                'house_bl_number',
                'like',
                '%' . $this->filters['house_bl_number'] . '%'
            );
        }

        if (!empty($this->filters['customer'])) {
            $query->whereHas('customer', function (Builder $q) {
                $q->where(
                    'name',
                    'like',
                    '%' . $this->filters['customer'] . '%'
                );
            });
        }

        if (
            isset($this->filters['status']) &&
            $this->filters['status'] !== ''
        ) {
            $query->where('status', $this->filters['status']);
        }

        return $query->orderBy('created_at', 'desc');
    }

    public function headings(): array
    {
        return [
            //'ID',
            'Shipment ID',
            'Booking ID',
            'Customer',
            'Mode',
            'Category',
            'ETA',
            'SI Number',
            'Loading Port',
            'Discharge Port',
            'Master BL Number',
            'House BL Number',
            'Forwarder',
            'Carrier',
            'Shipper Name',
            'Consignee',
            'Type',
            'BL Status',
            'Free Day Type',
            'Surrendered Date',
            'Status',
            'Created At',
            'Updated At',
        ];
    }

    public function map($job): array
    {
        return [
            //$job->id,
            $job->shipment_id,
            $job->booking_id,
            $job->customer?->name,
            $this->getValue($this->modes, $job->mode),
            $this->getValue($this->categories, $job->category),
            $job->eta,
            $job->si_number,
            $this->getValue($this->loadingPorts, $job->loading_port),
            $this->getValue($this->dischargePorts, $job->discharge_port),
            $job->master_bl_number,
            $job->house_bl_number,
            $job->forwarder,
            $this->getValue($this->carriers, $job->carrier),
            $job->shipper_name,
            $this->getValue($this->consignees, $job->consignee),
            $this->getValue($this->shipmentTypes, $job->type),
            $this->getValue($this->blStatuses, $job->bl_status),
            $this->getValue($this->freeDayTypes, $job->free_day_type),
            $job->surrendered_date,
            $this->getValue($this->statuses, $job->status),
            $job->created_at,
            $job->updated_at,
        ];
    }

    private function getValue(array $items, $value): string
    {
        foreach ($items as $item) {
            if (
                isset($item['value']) &&
                (string) $item['value'] === (string) $value
            ) {
                return (string) $item['label'];
            }
        }

        return '';
    }
}