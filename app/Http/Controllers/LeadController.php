<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use App\Models\LeadFile;
use App\Models\Customer;
use App\Models\Job;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class LeadController extends Controller
{

    public function index()
    {
        $lead_statuses = config('common.lead_statuses');
        $statusMap = collect($lead_statuses)->pluck('label', 'value');

        $leads = Lead::with('customer')
            ->orderBy('id', 'desc')
            ->paginate(config('common.paginate_per_page', 10));

        $leads->getCollection()->transform(function ($lead) use ($statusMap) {
            $lead->status_label = $statusMap[$lead->status] ?? 'Unknown';
            return $lead;
        });

        return Inertia::render('Leads/Index', [
            'leads' => $leads,
            'pageTitle' => 'Leads'
        ]);
    }

    public function create()
    {
        return Inertia::render('Leads/Form', [
            'customers' => Customer::select('cus_id', 'name')->get(),
            'categories' => config('common.categories'),
            'pageTitle' => 'Create Lead'
        ]);
    }

   
    public function store(Request $request)
    {
        $action = $request->input('submitType'); 

        $validated = $request->validate([
            'cus_id' => 'required|exists:customers,cus_id',
            'mode' => 'required|in:air,sea',
            'containers' => 'nullable|integer|min:0',
            'eta' => 'nullable|date',
            'category' => 'nullable|string|max:255',
            'bl_number' => 'nullable|string|max:255',
            'free_day' => 'nullable|integer|min:0',
            'files.*' => 'nullable|file|max:20480',
        ]);

        if (!$request->booking_id) {
            $validated['booking_id'] = 'BKG-' . time();
        }

        $validated['status'] = $action === 'confirm' ? 1 : 0;
        $validated['created_by'] = auth()->id();
        $validated['updated_by'] = auth()->id();

        DB::transaction(function () use ($validated, $request, $action) {
           
            $lead = Lead::create($validated);

            if ($request->hasFile('files')) {
                foreach ($request->file('files') as $file) {
                    $path = $file->store('lead_files', 'public');
                    LeadFile::create([
                        'lead_id' => $lead->id,
                        'file_path' => $path,
                        'file_type' => $file->getClientOriginalExtension(),
                    ]);
                }
            }

            if ($action === 'confirm') {
                Job::create([
                    'booking_id' => $lead->booking_id,
                    'cus_id' => $lead->cus_id,
                    'mode' => $lead->mode,
                    'shipment_category' => $lead->category,
                    'containers' => $lead->containers,
                    'eta' => $lead->eta,
                    'bl_number' => $lead->bl_number,
                    'free_days' => $lead->free_day,
                    'created_by' => auth()->id(),
                ]);
            }
        });

        if ($action === 'save') {
            return redirect()->route('leads.index')->with('success', 'Lead saved successfully.');
        }

        return redirect()->route('jobs.index')->with('success', 'Job Sheet created successfully!');
    }

    public function edit(Lead $lead)
    {
        $lead->load('files');

        return Inertia::render('Leads/Form', [
            'lead' => $lead,
            'customers' => Customer::select('cus_id', 'name')->get(),
            'categories' => config('common.categories'),
            'pageTitle' => 'Edit Lead'
        ]);
    }

    public function update(Request $request, $leadId)
    {
        $lead = Lead::findOrFail($leadId);
        $action = $request->input('submitType'); 

        $validated = $request->validate([
            'cus_id' => 'required|exists:customers,cus_id',
            'mode' => 'required|in:air,sea',
            'containers' => 'nullable|integer|min:0',
            'eta' => 'nullable|date',
            'category' => 'nullable|string|max:255',
            'bl_number' => 'nullable|string|max:255',
            'free_day' => 'nullable|integer|min:0',
            'files.*' => 'nullable|file|max:20480',
        ]);

        $validated['status'] = $action === 'confirm' ? 1 : 0;
        $validated['updated_by'] = auth()->id();

        DB::transaction(function () use ($lead, $validated, $request, $action) {
            $lead->update($validated);

            if ($request->hasFile('files')) {
                foreach ($request->file('files') as $file) {
                    $path = $file->store('lead_files', 'public');
                    LeadFile::create([
                        'lead_id' => $lead->id,
                        'file_path' => $path,
                        'file_type' => $file->getClientOriginalExtension(),
                    ]);
                }
            }

            if ($action === 'confirm') {
                Job::updateOrCreate(
                    ['booking_id' => $lead->booking_id], 
                    [
                        'cus_id' => $lead->cus_id,
                        'mode' => $lead->mode,
                        'shipment_category' => $lead->category,
                        'containers' => $lead->containers,
                        'eta' => $lead->eta,
                        'bl_number' => $lead->bl_number,
                        'free_days' => $lead->free_day,
                        'created_by' => auth()->id(),
                    ]
                );
            }
        });

        if ($action === 'save') {
            return redirect()->route('leads.index')->with('success', 'Lead updated successfully!');
        }

        return redirect()->route('jobs.index')->with('success', 'Job Sheet updated successfully!');
    }

    public function destroy(Lead $lead)
    {
       
        foreach ($lead->files as $file) {
            if ($file->file_path && Storage::disk('public')->exists($file->file_path)) {
                Storage::disk('public')->delete($file->file_path);
            }
            $file->delete(); 
        }

        $lead->delete();

        return redirect()->route('leads.index')->with('success', 'Lead and related files deleted successfully!');
    }
}
