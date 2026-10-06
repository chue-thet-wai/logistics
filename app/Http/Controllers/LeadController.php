<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use App\Models\Customer;
use App\Models\Job;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class LeadController extends Controller
{
    public function index(Request $request)
    {
        $query = Lead::with('customer');
        if ($request->filled('master_bl_number')) {
            $query->where('master_bl_number', 'like', '%' . $request->master_bl_number . '%');
        }
        if ($request->filled('house_bl_number')) {
            $query->where('house_bl_number', 'like', '%' . $request->house_bl_number . '%');
        }
        if ($request->filled('customer')) {
            $query->whereHas('customer', function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->customer . '%');
            });
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }     
        $leads=$query->latest()
            ->paginate(config('common.paginate_per_page', 10));

        return Inertia::render('Leads/Index', [
            'leads'     => $leads,
            'statuses'  => config('common.lead_statuses'),
            'modes'  => config('common.modes'),
            'categories'  => config('common.categories'),
            'pageTitle' => 'Leads'
        ]);
    }

    public function create()
    {
        return Inertia::render('Leads/Form', [
            'customers' => Customer::select('cus_id', 'name')->where('status',1)->get(),
            'modes'  => config('common.modes'),
            'categories'  => config('common.categories'),
            'pageTitle' => 'Create Lead'
        ]);
    }

    public function store(Request $request)
    {
        $action = $request->input('submitType');

        $validated = $request->validate([
            'cus_id' => 'required|exists:customers,cus_id',
            'mode' => 'required',
            'category' => 'required',
            'eta' => 'nullable|date',
            'master_bl_number' => ['nullable','string','max:255',Rule::unique('leads')->whereNull('deleted_at'),],
            'house_bl_number' => ['nullable','string','max:255',Rule::unique('leads')->whereNull('deleted_at'),],
            'forwarder' => 'nullable|string|max:255',
            'demurrage_free_day' => 'nullable|integer|min:0',
            'detention_free_day' => 'nullable|integer|min:0',
            'total_container' => 'required|integer|min:1',
        ]);

        $bookingId = generateUniqueId('leads', 'booking_id');

        $validated['booking_id'] = $bookingId;
        $validated['status'] = $action === 'confirm' ? 1 : 0;
        $validated['created_by'] = auth()->id();
        $validated['updated_by'] = auth()->id();

        DB::transaction(function () use ($validated, $request, $action) {

            $lead = Lead::create($validated);

            // If Confirm → Create Job
            if ($action === 'confirm') {
                $shipmentId = generateUniqueId('jobs', 'shipment_id');

                $job = Job::create([
                    'booking_id' => $lead->booking_id,
                    'shipment_id' => $shipmentId,
                    'cus_id' => $lead->cus_id,
                    'mode' => $lead->mode,
                    'category' => $lead->category,
                    'total_container' => $lead->total_container,
                    'eta' => $lead->eta,
                    'master_bl_number' => $lead->master_bl_number,
                    'house_bl_number' => $lead->house_bl_number,
                    'forwarder' => $lead->forwarder,
                    //'demurrage_free_day' => $lead->demurrage_free_day,
                    //'detention_free_day' => $lead->detention_free_day,
                    'created_by' => auth()->id(),
                    'updated_by' => auth()->id(),
                ]);
            }
        });

        return $action === 'save'
            ? redirect()->route('leads.index')->with('success', 'Lead saved successfully.')
            : redirect()->route('jobs.index')->with('success', 'Job Sheet created successfully!');
    }

    public function edit(Lead $lead)
    {
        return Inertia::render('Leads/Form', [
            'lead' => $lead,
            'customers' => Customer::select('cus_id', 'name')->where('status',1)->get(),
            'modes'  => config('common.modes'),
            'categories'  => config('common.categories'),
            'pageTitle' => 'Edit Lead'
        ]);
    }

    public function update(Request $request, $leadId)
    {
        $lead = Lead::findOrFail($leadId);
        $action = $request->input('submitType');

        $validated = $request->validate([
            'cus_id' => 'required|exists:customers,cus_id',
            'mode' => 'required',
            'category' => 'required',
            'eta' => 'nullable|date',
            'master_bl_number' => ['nullable','string','max:255',Rule::unique('leads')->ignore($lead->id)->whereNull('deleted_at'),],
            'house_bl_number' => ['nullable','string','max:255',Rule::unique('leads')->ignore($lead->id)->whereNull('deleted_at'),],
            'forwarder' => 'nullable|string|max:255',
            'demurrage_free_day' => 'nullable|integer|min:0',
            'detention_free_day' => 'nullable|integer|min:0',
            'total_container' => 'required|integer|min:1',
        ]);

        if ($action === 'confirm') {
            $validated['status'] = 1;
        }
        $validated['updated_by'] = auth()->id();

        DB::transaction(function () use ($lead, $validated, $request, $action) {

            $lead->update($validated);

            if ($action === 'confirm') {
                $shipmentId = generateUniqueId('jobs', 'shipment_id');

                $job = Job::updateOrCreate(
                    ['booking_id' => $lead->booking_id],
                    [
                        'shipment_id' => $shipmentId,
                        'cus_id' => $lead->cus_id,
                        'mode' => $lead->mode,
                        'category' => $lead->category,
                        'total_container' => $lead->total_container,
                        'eta' => $lead->eta,
                        'master_bl_number' => $lead->master_bl_number,
                        'house_bl_number' => $lead->house_bl_number,
                        'forwarder' => $lead->forwarder,
                        //'demurrage_free_day' => $lead->demurrage_free_day,
                        //'detention_free_day' => $lead->detention_free_day,
                        'created_by' => auth()->id(),
                        'updated_by' => auth()->id(),
                    ]
                );
            }
        });

        return $action === 'save'
            ? redirect()->route('leads.index')->with('success', 'Lead updated successfully!')
            : redirect()->route('jobs.index')->with('success', 'Job Sheet updated successfully!');
    }

    public function show(Lead $lead)
    {
        $lead->load([
            'customer',
            'createdByUser',
            'updatedByUser'
        ]);

        return Inertia::render('Leads/Show', [
            'lead' => $lead,
            'statuses'  => config('common.lead_statuses'),
            'modes'  => config('common.modes'),
            'categories'  => config('common.categories'),
            'pageTitle' => 'Lead Details',
        ]);
    }


    public function destroy(Lead $lead)
    {
        DB::beginTransaction();

        try {
            $lead->load('job.containers.files', 'job.attachments');
            
            if ($lead->job && $lead->job->status != 0) {
                return redirect()->route('leads.index')
                    ->with('error', 'Cannot delete! Job is not pending.');
            }

            if ($lead->job) {
                $job = $lead->job;

                foreach ($job->containers as $container) {
                    $container->files()->forceDelete(); 
                }

                $job->containers()->forceDelete();

                $job->attachments()->delete();
                $job->attachments()->forceDelete();
                $job->forceDelete();
            }

            $lead->forceDelete();

            DB::commit();

            return redirect()->route('leads.index')
                ->with('success', 'Lead and all related data deleted successfully!');
        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->route('leads.index')
                ->with('error', 'Delete failed!');
        }
    }
}
