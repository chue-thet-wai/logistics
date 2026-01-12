<?php

namespace App\Http\Controllers\Driver;

use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller;
use App\Models\Notification;

class DriverNotificationController extends Controller
{
    public function index()
    {
        $notifications = Notification::where('user_id', Auth::user()->id)
            ->latest()
            ->get()
            ->map(function ($n) {
                return [
                    'id'    => $n->id,
                    'title' => $n->title,
                    'message' => $n->message,
                    'read'  => $n->is_read,
                    'time'  => $n->created_at->diffForHumans(),
                ];
            });

        return Inertia::render('DriverApp/Notifications/Index', [
            'notifications' => $notifications,
        ]);
    }

    public function markAsRead($id)
    {
        Notification::where('user_id', Auth::user()->id)
            ->where('id', $id)
            ->update(['is_read' => true]);

        return back();
    }

    public function markAllAsRead()
    {
        Notification::where('user_id', Auth::user()->id)
            ->update(['is_read' => true]);

        return back();
    }

    public function destroy($id)
    {
        Notification::where('user_id', Auth::user()->id)
            ->where('id', $id)
            ->delete();

        return back();
    }

    public function destroyAll()
    {
        Notification::where('user_id', Auth::user()->id)
            ->delete();

        return back();
    }
}
