<?php

namespace App\Http\Controllers;

use App\Models\Job;
use App\Models\JobAttachment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class JobDocumentController extends Controller
{
    public function index(Job $job)
    {
        $job->load('attachments.creator');

        return Inertia::render('Jobs/DocumentUpload', [
            'job' => $job,
            'attachments' => $job->attachments,
            'pageTitle'   => "Document Attachments"
        ]);
    }


    public function store(Request $request, Job $job)
    {
        $request->validate([
            'document_type' => 'required|string',
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png,xls,xlsx,csv,txt|max:10240',
        ]);

        //$filename = time() . '_' . $request->file->getClientOriginalName();
        $filename = pathinfo(
                            $request->file->getClientOriginalName(),
                            PATHINFO_FILENAME
                        ) . '_' . $job->booking_id . '_' . time()
                          . '.' . $request->file->getClientOriginalExtension();

        $path = $request->file->storeAs("logistics/job_documents", $filename, 's3');

        // Save DB record
        $job->attachments()->create([
            'document_type' => $request->document_type,
            'file_name'     => $filename,
            'file_path'     => $path,  
            'created_by'    => auth()->id(),
        ]);

        return redirect()->route('jobs.documents.index', $job->shipment_id)
            ->with('success', 'File replaced successfully.');

    }


    public function replace(Request $request, Job $job, JobAttachment $attachment)
    {
        $request->validate([
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png,xls,xlsx,csv,txt|max:10240',
        ]);

        $filename = time() . '_' . $request->file->getClientOriginalName();

        $path = $request->file->storeAs("logistics/job_documents", $filename, 's3');

        // Update DB
        $attachment->update([
            'file_name' => $filename,
            'file_path' => $path,
            'updated_by' => auth()->id(),
        ]);

        return redirect()->route('jobs.documents.index', $job->shipment_id)
            ->with('success', 'File replaced successfully.');

    }
}
