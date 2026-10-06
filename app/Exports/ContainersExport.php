<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class ContainersExport implements FromCollection, WithHeadings
{
    protected $containers;

    public function __construct($containers)
    {
        $this->containers = $containers;
    }

    private function getLabel($configKey, $value)
    {
        $items = config("common.$configKey");

        foreach ($items as $item) {
            if ($item['value'] == $value) {
                return $item['label'];
            }
        }

        return '';
    }

    public function collection()
    {
        return $this->containers->map(function ($item) {

            return [
                'Customer Name' => $item->job->customer->name ?? '',
                'Master BL No' => $item->job->master_bl_number ?? '',
                'House BL Number' => $item->job->house_bl_number ?? '',
                'Container No' => $item->container_no ?? '',
                'Container Type' => $this->getLabel('container_types', $item->container_type),
                'BL Status' => $this->getLabel('bl_statuses', $item->job->bl_status ?? null),

                'ATA' => $item->arrival_date ? date('d/m/Y', strtotime($item->arrival_date)) : '',
                'ETA' => $item->job->eta ? date('d/m/Y', strtotime($item->job->eta)) : '',

                'Approved Demurrage Free Days' => $item->demurrage_free_day ?? '',
                'Approved Detention Free Days' => $item->detention_free_day ?? '',
                'Free Day Type' => $this->getLabel('free_day_types', $item->job->free_day_type ?? null),

                'Demurrage End Date' => $item->cal_demurrage_last_date ? date('d/m/Y', strtotime($item->cal_demurrage_last_date)) : '',
                'Detention End Date' => $item->cal_detention_last_date ? date('d/m/Y', strtotime($item->cal_detention_last_date)) : '',
                'Demurrage Remain Free day (Alert)' => $item->demurrage_remain > 0 ? $item->demurrage_remain . ' Days Remain' : '-',
                'Detention Remain Free day (Alert)' => $item->detention_remain > 0 ? $item->detention_remain . ' Days Remain' : '-',
                'Demurrage Over day (Alert)' => $item->demurrage_over > 0 ? $item->demurrage_over . ' Days Over' : '-',
                'Detention Over day (Alert)' => $item->detention_over > 0 ? $item->detention_over . ' Days Over' : '-',
            ];
        });
    }

    public function headings(): array
    {
        return [
            'Customer Name',
            'Master BL No',
            'House BL Number',
            'Container No',
            'Container Type',
            'BL Status',
            'ATA',
            'ETA',
            'Approved Demurrage Free Days',
            'Approved Detention Free Days',
            'Free Day Type',

            'Demurrage End Date',
            'Detention End Date',
            'Demurrage Remain Free day (Alert)',
            'Detention Remain Free day (Alert)',
            'Demurrage Over Free day (Alert)',
            'Detention Over Free day (Alert)',
        ];
    }
}