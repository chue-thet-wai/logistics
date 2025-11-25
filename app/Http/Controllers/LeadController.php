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

        $leads = Lead::with('customer')
            ->orderBy('id', 'desc')
            ->paginate(config('common.paginate_per_page', 10));

        return Inertia::render('Leads/Index', [
            'leads'     => $leads,
            'statuses'  => config('common.lead_statuses'),
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
                    $extension = $file->getClientOriginalExtension();
                    $filename = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME) 
                            . '_' . $lead->booking_id . '.' . $extension;

                    $path = $file->storeAs("logistics/lead_documents", $filename, 's3');

                    LeadFile::create([
                        'lead_id' => $lead->id,
                        'file_path' => $path,
                        'file_type' => $extension,
                    ]);
                }
            }

            if ($action === 'confirm') {
                $shipment_id = 'SHP-' . time();
                Job::create([
                    'booking_id' => $lead->booking_id,
                    'shipment_id' => $lead->shipment_id,
                    'cus_id' => $lead->cus_id,
                    'mode' => $lead->mode,
                    'category' => $lead->category,
                    'containers' => $lead->containers,
                    'eta' => $lead->eta,
                    'bl_number' => $lead->bl_number,
                    'free_day' => $lead->free_day,
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
        ]);

        $validated['status'] = $action === 'confirm' ? '1' : '0';
        $validated['updated_by'] = auth()->id();

        DB::transaction(function () use ($lead, $validated, $request, $action) {
            $lead->update($validated);

            if ($request->hasFile('files')) {
                foreach ($request->file('files') as $file) {
                    $extension = $file->getClientOriginalExtension();
                    $filename = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME) 
                            . '_' . $lead->booking_id . '.' . $extension;

                    $path = $file->storeAs("logistics/lead_documents", $filename, 's3');

                    LeadFile::create([
                        'lead_id' => $lead->id,
                        'file_path' => $path,
                        'file_type' => $extension,
                    ]);
                }
            }

            if ($action === 'confirm') {
                Job::updateOrCreate(
                    ['booking_id' => $lead->booking_id],
                    [
                        'shipment_id' => $lead->job->shipment_id ?? 'SHP-' . time(),
                        'cus_id' => $lead->cus_id,
                        'mode' => $lead->mode,
                        'category' => $lead->category,
                        'containers' => $lead->containers,
                        'eta' => $lead->eta,
                        'bl_number' => $lead->bl_number,
                        'free_day' => $lead->free_day,
                        'updated_by' => auth()->id(),
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
       
        foreach ($lead->files as $file) 
        {
            if ($file->file_path && Storage::disk('s3')->exists($file->file_path)) {
                Storage::disk('s3')->delete($file->file_path);
            }
            $file->delete();
        }

        $lead->delete();

        return redirect()->route('leads.index')->with('success', 'Lead and related files deleted successfully!');
    }
}
