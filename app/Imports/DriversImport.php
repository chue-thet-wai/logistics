<?php

namespace App\Imports;

use App\Models\Driver;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Concerns\Importable;
use Maatwebsite\Excel\Concerns\SkipsOnError;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Validators\Failure;
use Throwable;

class DriversImport implements
    ToModel,
    WithHeadingRow,
    SkipsOnError,
    SkipsOnFailure
{
    use Importable;

    public function model(array $row)
    {
        try {

            // Skip empty required fields
            if (
                empty($row['name']) ||
                empty($row['email'])
            ) {

                Log::warning('Driver import skipped: missing name/email', [
                    'row' => $row,
                ]);

                return null;
            }

            // Skip duplicate email
            if (User::where('email', $row['email'])->exists()) {

                Log::warning('Driver import skipped: duplicate email', [
                    'email' => $row['email'],
                    'row'   => $row,
                ]);

                return null;
            }

            // Generate driver id
            $driverId = generateUniqueId('drivers', 'driver_id');

            // Create user
            $user = User::create([
                'name'       => $row['name'],
                'email'      => $row['email'],
                'password'   => Hash::make($row['password'] ?? 'test123'),
                'created_by' => auth()->id(),
            ]);

            $user->assignRole('Driver');

            // Create driver
            return new Driver([
                'user_id'    => $user->id,
                'driver_id'  => $driverId,
                'name'       => $row['name'],
                'email'      => $row['email'],
                'phone'      => $row['phone'] ?? null,
                'status'     => $row['status'] ?? null,
                'route'      => $row['route'] ?? null,
                'checkpoint' => $row['checkpoint'] ?? null,
                'remark'     => $row['remark'] ?? null,
                'created_by' => auth()->id(),
            ]);

        } catch (\Exception $e) {

            Log::error('Driver import failed', [
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

            Log::error('Driver import validation failure', [
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
        Log::error('Driver import error', [
            'message' => $e->getMessage(),
        ]);
    }
}