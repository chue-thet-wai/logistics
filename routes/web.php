<?php


use App\Http\Controllers\AuthController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DriverController;
use App\Http\Controllers\JobController;
use App\Http\Controllers\LeadController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\RouteController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia; 


Route::get('/welcome', function () {
    return Inertia::render('welcome');
});

Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLoginForm'])->name('login');
    Route::get('/register', [AuthController::class, 'showRegisterForm'])->name('register');
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
});

Route::middleware(['auth'])->group(function () {

    Route::get('/profile/edit', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::post('/profile/update', [ProfileController::class, 'updateProfile'])->name('profile.update');

    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
    
    Route::get('/', [\App\Http\Controllers\HomeController::class,"dashboard"])->name("dashboard");
    Route::get('/dashboard', [\App\Http\Controllers\HomeController::class,"dashboard"])->name("dashboard");


    Route::middleware('check_permission')->group(function() {   
       
        Route::resource('roles', RoleController::class);
        Route::resource('users', UserController::class);
        Route::resource('customers', CustomerController::class);
        Route::resource('drivers', DriverController::class);
        Route::resource('routes', RouteController::class);
        Route::resource('leads', LeadController::class);
        Route::post('leads/{id}/update', [LeadController::class, 'update'])->name('leads.update');
        Route::resource('jobs', JobController::class);
       
    });
    
});







