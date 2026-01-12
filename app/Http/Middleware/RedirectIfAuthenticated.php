<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RedirectIfAuthenticated
{
   
    public function handle(Request $request, Closure $next, string ...$guards): Response
    {
        if (Auth::check()) {
            $user = Auth::user();

            if ($user->hasRole('Driver')) {
                return redirect()->route('driver.dashboard');
            }

            return redirect('/dashboard'); 
        }

        return $next($request);
    }
}
