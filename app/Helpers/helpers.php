<?php

use App\Models\Agent;
use App\Models\Customer;
use App\Models\ShortUrl;
use Illuminate\Support\Facades\Auth;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use App\Models\ContainerIncomeSummary;
use App\Models\ContainerExpenseSummary;
use App\Models\ContainerTransportSummary;

function checkUserRole($roleName, $user = null)
{
    $user = $user ?? Auth::user();
    if (!$user) {
        return false;
    }
    $roleId = Role::where('name', $roleName)->pluck('id')->first();
    return $user->roles()->where('id', $roleId)->exists();
}

if (!function_exists('generateUniqueId')) {

    /*function generateUniqueId($table, $column, $prefix = 'A-', $length = 6)
    {
        do {
            $randomNumber = '';

            for ($i = 0; $i < $length; $i++) {
                $randomNumber .= rand(0, 9);
            }

            $id = $prefix . $randomNumber;

            $exists = DB::table($table)->where($column, $id)->exists();

        } while ($exists);

        return $id;
    }*/

    function generateUniqueId($table, $column)
    {
        // Prefix + starting number config
        $config = [
            'leads' => ['prefix' => 'BKG-', 'start' => 1000000001],
            'jobs' => ['prefix' => 'JID-', 'start' => 2000000001],
            'trips' => ['prefix' => 'TRP-', 'start' => 3000000001],
            'containers' => ['prefix' => 'CTN-', 'start' => 2000000001],
            'customers' => ['prefix' => 'CUS-', 'start' => 1],
            'drivers' => ['prefix' => 'DRV-', 'start' => 1],
            'routes' => ['prefix' => 'RT-', 'start' => 1],
            'checkpoints' => ['prefix' => 'CP-', 'start' => 1],
            'trucks' => ['prefix' => 'TUK-', 'start' => 1],
        ];

        if (!isset($config[$table])) {
            throw new \Exception("Table not configured for ID generation");
        }

        $prefix = $config[$table]['prefix'];
        $start  = $config[$table]['start'];

        // Get last record
        $last = DB::table($table)
            ->where($column, 'like', $prefix . '%')
            ->orderByDesc($column)
            ->value($column);

        if ($last) {
            // Extract number part
            $number = (int) str_replace($prefix, '', $last);
            $nextNumber = $number + 1;
        } else {
            $nextNumber = $start;
        }

        // Format (for small IDs like CUS-0001)
        if ($start === 1) {
            return $prefix . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
        }

        return $prefix . $nextNumber;
    }



    if (!function_exists('recalculate_container_summary')) {

        function recalculate_container_summary($trip, $type, $container_id = null)
        {
            $trip->loadMissing(['containers', 'incomes', 'expenses', 'costs']);

            if ($type === 'income' && $container_id) {

                $total = $trip->incomes
                    ->where('container_id', $container_id)
                    ->sum('amount');

                ContainerIncomeSummary::updateOrCreate(
                    ['container_id' => $container_id],
                    ['total' => $total]
                );
            }

            if ($type === 'expense' && $container_id) {

                $total = $trip->expenses
                    ->where('container_id', $container_id)
                    ->sum('amount');

                ContainerExpenseSummary::updateOrCreate(
                    ['container_id' => $container_id],
                    ['total' => $total]
                );
            }

            if ($type === 'cost') {

                $containers = $trip->containers;

                if ($containers->isEmpty()) return;

                $containerCount = $containers->count();
                $totalCost = $trip->costs->sum('amount');

                $perContainerCost = $containerCount > 0
                    ? $totalCost / $containerCount
                    : 0;

                foreach ($containers as $container) {

                    ContainerTransportSummary::updateOrCreate(
                        ['container_id' => $container->container_id],
                        ['total' => $perContainerCost]
                    );
                }
            }
        }
    }
}