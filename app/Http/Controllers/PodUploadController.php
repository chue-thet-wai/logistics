<?php

namespace App\Http\Controllers;

use App\Models\Job;
use App\Models\JobAttachment;
use App\Models\ContainerFiles;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PodUploadController extends Controller
{

    /* JOB LIST */

    public function index(Request $request)
    {
        $query = Job::with(['customer'])
            ->withCount([
                'containers as pending_containers_count' => function ($query) {
                    $query->where('status', 0);
                }
            ]);

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

        $jobs = $query->latest()
            ->paginate(config('common.paginate_per_page', 10));

        return Inertia::render('PodUpload/Index', [
            'jobs' => $jobs,
            'categories' => config('common.categories'),
            'modes' => config('common.modes'),
            'statuses' => config('common.job_statuses'),
            'pageTitle' => 'POD Upload',
        ]);
    }


    /* JOB DETAIL PAGE */

    public function edit(Job $job)
    {
        $statuses = config('common.job_statuses');

        $job->load([
            'attachments.creator',
            'customer',
            'containers.files.creator'
        ]);

        $statusLabel = collect($statuses)
            ->firstWhere('value', $job->status)['label'] ?? '-';

        return Inertia::render('PodUpload/Form', [
            'job' => array_merge(
                $job->toArray(),
                [
                    'status_label' => $statusLabel,
                ]
            ),
            'attachments' => $job->attachments,
            'containers' => $job->containers,
            'container_types' => config('common.container_types'),
            'container_statuses' => config('common.container_statuses'),
            'pageTitle' => 'Photo & POD Upload',
        ]);
    }


    /* JOB DOCUMENT UPLOAD */

    public function store(Request $request)
    {
        $request->validate([
            'job_id'        => 'required|exists:jobs,id',
            'document_type' => 'required|string',
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png,xls,xlsx,csv,txt|max:10240',
        ]);

        $job = Job::findOrFail($request->job_id);

        $filename = time() . '_' . $request->file->getClientOriginalName();

        $path = $request->file->storeAs(
            'logistics/job_documents',
            $filename,
            's3'
        );

        $job->attachments()->create([
            'document_type' => $request->document_type,
            'file_name'     => $filename,
            'file_path'     => $path,
            'created_by'    => auth()->id(),
        ]);

        return back()->with('success', 'Document uploaded');
    }


    /* REPLACE JOB DOCUMENT */

    public function replace(Request $request, JobAttachment $attachment)
    {
        $request->validate([
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png,xls,xlsx,csv,txt|max:10240',
        ]);

        $filename = time() . '_' . $request->file->getClientOriginalName();

        $path = $request->file->storeAs(
            'logistics/job_documents',
            $filename,
            's3'
        );

        $attachment->update([
            'file_name' => $filename,
            'file_path' => $path,
            'updated_by' => auth()->id(),
        ]);

        return back()->with('success', 'File replaced');
    }


    /* DELETE JOB DOCUMENT */

    public function deleteJobFile(JobAttachment $attachment)
    {
        if ($attachment->file_path) {
            Storage::disk('s3')->delete($attachment->file_path);
        }

        $attachment->delete();

        return back()->with('success', 'Document deleted');
    }


    /* CONTAINER FILE UPLOAD */

    public function uploadContainer(Request $request)
    {
        $request->validate([
            'container_id' => 'required|exists:containers,container_id',
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png,xls,xlsx,csv,txt|max:10240',
        ]);

        $filename = time() . '_' . $request->file->getClientOriginalName();

        $path = $request->file->storeAs(
            'logistics/container_documents',
            $filename,
            's3'
        );

        ContainerFiles::create([
            'container_id' => $request->container_id,
            'file_name' => $filename,
            'file_path' => $path,
            'created_by' => auth()->id(),
        ]);

        return back()->with('success', 'Container file uploaded');
    }


    /* DELETE CONTAINER FILE */

    public function deleteContainerFile(ContainerFiles $file)
    {
        if ($file->file_path) {
            Storage::disk('s3')->delete($file->file_path);
        }

        $file->delete();

        return back()->with('success', 'Container file deleted');
    }
}