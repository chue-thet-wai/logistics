<?php

namespace App\Imports;

use App\Models\Customer;
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

class CustomersImport implements
    ToModel,
    WithHeadingRow,
    SkipsOnError,
    SkipsOnFailure
{
    use Importable;

    public function model(array $row)
    {
        try {

            // Skip empty row
            if (!isset($row['name'])) {

                Log::warning('Customer import skipped: missing name', [
                    'row' => $row
                ]);

                return null;
            }

            // Skip duplicate email
            if (!empty($row['email']) &&
                User::where('email', trim($row['email']))->exists()) {

                Log::warning('Customer import skipped: duplicate email', [
                    'email' => $row['email'],
                    'row' => $row
                ]);

                return null;
            }

            // Generate customer id
            $cus_id = generateUniqueId('customers', 'cus_id');

            $email = !empty($row['email'])
                    ? trim($row['email'])
                    : $cus_id . '@email.com';

            // Create User
            $user = User::create([
                'name'       => $row['name'],
                'email'      => $email,
                'password'   => Hash::make('customer'),
                'created_by' => auth()->id(),
            ]);

            $user->assignRole('Customer');

            return new Customer([
                'user_id'           => $user->id,
                'cus_id'            => $cus_id,
                'name'              => $row['name'],
                'customer_type'     => $row['customer_type'] ?? null,
                'status'            => $row['status'] ?? null,
                'contact_person'    => $row['contact_person'] ?? null,
                'designation'       => $row['designation'] ?? null,
                'email'             => $email,
                'phone'             => $row['phone'] ?? null,
                'secondary_phone'   => $row['secondary_phone'] ?? null,
                'whatsapp'          => $row['whatsapp'] ?? null,
                'billing_address'   => $row['billing_address'] ?? null,
                'billing_country'   => $row['billing_country'] ?? null,
                'billing_state'     => $row['billing_state'] ?? null,
                'billing_city'      => $row['billing_city'] ?? null,
                'billing_zip'       => $row['billing_zip'] ?? null,
                'shipping_address'  => $row['shipping_address'] ?? null,
                'shipping_country'  => $row['shipping_country'] ?? null,
                'shipping_state'    => $row['shipping_state'] ?? null,
                'shipping_city'     => $row['shipping_city'] ?? null,
                'shipping_zip'      => $row['shipping_zip'] ?? null,
                'credit_limit'      => $row['credit_limit'] ?? null,
                'currency'          => $row['currency'] ?? null,
                'payment_terms'     => $row['payment_terms'] ?? null,
                'tax_id'            => $row['tax_id'] ?? null,
                'invoice_email'     => $row['invoice_email'] ?? null,
                'notes'             => $row['notes'] ?? null,
                'created_by'        => auth()->id(),
            ]);

        } catch (\Exception $e) {

            Log::error('Customer import failed', [
                'message' => $e->getMessage(),
                'row' => $row,
                'trace' => $e->getTraceAsString(),
            ]);

            return null;
        }
    }

    /**
     * Handle import validation errors
     */
    public function onFailure(Failure ...$failures)
    {
        foreach ($failures as $failure) {

            Log::error('Customer import validation failure', [
                'row'        => $failure->row(),
                'attribute'  => $failure->attribute(),
                'errors'     => $failure->errors(),
                'values'     => $failure->values(),
            ]);
        }
    }

    /**
     * Handle unexpected errors
     */
    public function onError(Throwable $e)
    {
        Log::error('Customer import error', [
            'message' => $e->getMessage(),
        ]);
    }
}