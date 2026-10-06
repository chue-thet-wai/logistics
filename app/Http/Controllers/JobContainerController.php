<?php

namespace App\Http\Controllers;

use App\Models\ContainerFiles;
use App\Models\Job;
use App\Models\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class JobContainerController extends Controller
{
    /**
     * Show container info page
     */
    public function index(Job $job)
    {
        $job->load([
            'lead',
            'containers.files' 
        ]);

        return Inertia::render('Jobs/ContainerInfo', [
            'job'             => $job,
            'containers'      => $job->containers,
            'container_types' => config('common.container_types'),
            'uoms'            => config('common.uoms'),
            'routes'          => Route::all(),
            'fz_options'      => config('common.fz_options'),
            'pageTitle'       => "Container Information"
        ]);
    }

    public function store(Request $request, Job $job)
    {
        $request->validate([

            'containers' => 'required|array|min:1',

            'containers.*.container_id' => 'nullable|string',
            'containers.*.container_no' => 'required|string',
            'containers.*.arrival_date' => 'nullable|date',
            'containers.*.container_type' => 'required|integer',
            'containers.*.product_category' => 'nullable|string',
            'containers.*.quantity' => 'nullable|integer',
            'containers.*.uom' => 'nullable|integer',
            'containers.*.weight' => 'nullable|numeric',
            'containers.*.cbm' => 'nullable|numeric',
            'containers.*.route_id' => 'nullable|exists:routes,id',
            'containers.*.origin' => 'nullable|string',
            'containers.*.destination' => 'nullable|string',
            'containers.*.fz' => 'nullable|integer',
            'containers.*.billing_customer' => 'nullable|string',
            'containers.*.pickup_date' => 'nullable|date',
            'containers.*.pickup_address' => 'nullable|string',
            'containers.*.pickup_contact_person' => 'nullable|string',
            'containers.*.pickup_contact_phone' => 'nullable|string',
            'containers.*.delivery_address' => 'nullable|string',
            'containers.*.delivery_contact_person' => 'nullable|string',
            'containers.*.delivery_contact_phone' => 'nullable|string',
            'containers.*.remark' => 'nullable|string',


            // Detention
            'containers.*.detention_free_day' => 'nullable|integer',
            'containers.*.detention_last_date' => 'nullable|date',
            'containers.*.detention_used_day' => 'nullable|integer',
            'containers.*.detention_extra_day' => 'nullable|integer',
            'containers.*.detention_rate' => 'nullable',
            'containers.*.detention_total' => 'nullable|numeric',
            'containers.*.detention_remark' => 'nullable|string',

            // Demurrage
            'containers.*.demurrage_free_day' => 'nullable|integer',
            'containers.*.demurrage_last_date' => 'nullable|date',
            'containers.*.demurrage_used_day' => 'nullable|integer',
            'containers.*.demurrage_extra_day' => 'nullable|integer',
            'containers.*.demurrage_rate' => 'nullable',
            'containers.*.demurrage_total' => 'nullable|numeric',
            'containers.*.demurrage_remark' => 'nullable|string',

            // Files
            'containers.*.files.*' => 'nullable|file|max:10240', // 10MB
        ]);

        DB::transaction(function () use ($request, $job) {

            foreach ($request->containers as $index => $containerData) {

                $containerId = $containerData['container_id']
                    ?? generateUniqueId('containers', 'container_id');

                $container = $job->containers()->updateOrCreate(
                    ['container_id' => $containerId],
                    [
                        'shipment_id' => $job->shipment_id,
                        'container_no' => $containerData['container_no'],
                        'arrival_date' => $containerData['arrival_date'],
                        'container_type' => $containerData['container_type'],
                        'product_category' => $containerData['product_category'] ?? null,
                        'quantity' => $containerData['quantity'] ?? 0,
                        'uom' => $containerData['uom'] ?? 1,
                        'weight' => $containerData['weight'] ?? 0,
                        'cbm' => $containerData['cbm'] ?? 0,
                        'route_id' => $containerData['route_id'] ?? null,
                        'origin' => $containerData['origin'] ?? null,
                        'destination' => $containerData['destination'] ?? null,
                        'fz' => $containerData['fz'] ?? 1,
                        'billing_customer' => $containerData['billing_customer'] ?? null,
                        'pickup_date' => $containerData['pickup_date'] ?? null,
                        'pickup_address' => $containerData['pickup_address'] ?? null,
                        'pickup_contact_person' => $containerData['pickup_contact_person'] ?? null,
                        'pickup_contact_phone' => $containerData['pickup_contact_phone'] ?? null,

                        'delivery_address' => $containerData['delivery_address'] ?? null,
                        'delivery_contact_person' => $containerData['delivery_contact_person'] ?? null,
                        'delivery_contact_phone' => $containerData['delivery_contact_phone'] ?? null,
                        'remark' => $containerData['remark'] ?? null,

                        'detention_free_day' => $containerData['detention_free_day'] ?? null,
                        'detention_last_date' => $containerData['detention_last_date'] ?? null,
                        'detention_used_day' => $containerData['detention_used_day'] ?? null,
                        'detention_extra_day' => $containerData['detention_extra_day'] ?? null,
                        'detention_rate' => $containerData['detention_rate'] ?? null,
                        'detention_total' => $containerData['detention_total'] ?? null,
                        'detention_remark' => $containerData['detention_remark'] ?? null,

                        'demurrage_free_day' => $containerData['demurrage_free_day'] ?? null,
                        'demurrage_last_date' => $containerData['demurrage_last_date'] ?? null,
                        'demurrage_used_day' => $containerData['demurrage_used_day'] ?? null,
                        'demurrage_extra_day' => $containerData['demurrage_extra_day'] ?? null,
                        'demurrage_rate' => $containerData['demurrage_rate'] ?? null,
                        'demurrage_total' => $containerData['demurrage_total'] ?? null,
                        'demurrage_remark' => $containerData['demurrage_remark'] ?? null,

                        'created_by' => Auth::id(),
                        'updated_by' => Auth::id(),
                    ]
                );

                if (!empty($containerData['deleted_files'])) {
                    foreach ($containerData['deleted_files'] as $fileId) {

                        $file = ContainerFiles::find($fileId);

                        if ($file) {
                            if ($file->file_path && Storage::disk('s3')->exists($file->file_path)) {
                                Storage::disk('s3')->delete($file->file_path);
                            }
                            $file->delete();
                        }
                    }
                }


                if ($request->hasFile("containers.$index.files")) {

                    foreach ($request->file("containers.$index.files") as $file) {

                        $filename = pathinfo(
                            $file->getClientOriginalName(),
                            PATHINFO_FILENAME
                        ) . '_' . $containerId . '_' . time()
                          . '.' . $file->getClientOriginalExtension();

                        $path = $file->storeAs(
                            "logistics/container_documents",
                            $filename,
                            's3'
                        );

                        ContainerFiles::create([
                            'container_id' => $containerId,
                            'file_name' => $filename,
                            'file_path' => $path,
                            'created_by' => Auth::id(),
                            'updated_by' => Auth::id(),
                        ]);
                    }
                }
            }
        });

        return redirect()
            ->route('jobs.edit', $job->shipment_id)
            ->with('success', 'Containers saved successfully.');
    }
}
