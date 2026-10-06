<?php

namespace App\Imports;

use App\Models\Truck;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Concerns\Importable;
use Maatwebsite\Excel\Concerns\SkipsOnError;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Validators\Failure;
use Throwable;

class TrucksImport implements
    ToModel,
    WithHeadingRow,
    SkipsOnError,
    SkipsOnFailure
{
    use Importable;

    public function model(array $row)
    {
        try {

            // Skip empty truck number
            if (empty($row['truck_number'])) {

                Log::warning('Truck import skipped: missing truck_number', [
                    'row' => $row,
                ]);

                return null;
            }

            // Skip duplicate truck number
            if (Truck::where('truck_number', $row['truck_number'])->exists()) {

                Log::warning('Truck import skipped: duplicate truck_number', [
                    'truck_number' => $row['truck_number'],
                    'row'          => $row,
                ]);

                return null;
            }

            // Generate truck id
            $truckId = generateUniqueId('trucks', 'truck_id');

            // Create truck
            return new Truck([
                'truck_id'      => $truckId,
                'truck_number'  => $row['truck_number'],
                'vehicle_type'  => $row['vehicle_type'] ?? null,
                'status'        => $row['status'] ?? null,
                'remark'        => $row['remark'] ?? null,
                'available'     => 1,
                'created_by'    => auth()->id(),
            ]);

        } catch (\Exception $e) {

            Log::error('Truck import failed', [
                'message' => $e->getMessage(),
                'row'     => $row,
                'trace'   => $e->getTraceAsString(),
            ]);

            return null;
        }
    }

    /**
     * Validation failures
     */
    public function onFailure(Failure ...$failures)
    {
        foreach ($failures as $failure) {

            Log::error('Truck import validation failure', [
                'row'       => $failure->row(),
                'attribute' => $failure->attribute(),
                'errors'    => $failure->errors(),
                'values'    => $failure->values(),
            ]);
        }
    }

    /**
     * Unexpected import errors
     */
    public function onError(Throwable $e)
    {
        Log::error('Truck import error', [
            'message' => $e->getMessage(),
        ]);
    }
}