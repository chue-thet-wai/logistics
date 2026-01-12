<?php


use App\Http\Controllers\AuthController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DriverController;
use App\Http\Controllers\JobController;
use App\Http\Controllers\JobDocumentController;
use App\Http\Controllers\LeadController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\CheckpointController;
use App\Http\Controllers\AssignDriverController;
use App\Http\Controllers\RouteController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\Driver\DriverDashboardController;
use App\Http\Controllers\Driver\DriverJobController;
use App\Http\Controllers\Driver\DriverSettingController;
use App\Http\Controllers\Driver\DriverNotificationController;
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
        Route::resource('transport-routes', RouteController::class)
            ->parameters(['transport-routes' => 'routeModel']);

        Route::prefix('transport-routes/{route}')->group(function () {
            Route::resource('checkpoints', CheckpointController::class);
        });


        Route::resource('leads', LeadController::class);
        Route::post('leads/{id}/update', [LeadController::class, 'update'])->name('leads.update');

        Route::resource('jobs', JobController::class);

        Route::get('/jobs/{job}/documents', [JobDocumentController::class, 'index'])->name('jobs.documents.index');
        Route::post('/jobs/{job}/documents', [JobDocumentController::class, 'store'])->name('jobs.documents.store');
        Route::post('/jobs/{job}/documents/{attachment}/replace', [JobDocumentController::class, 'replace'])->name('jobs.documents.replace');

        Route::resource('assign-driver', AssignDriverController::class)->parameters(['assign-driver' => 'job']);

      
    });

    Route::prefix('driver')->group(function () {
        Route::get('/dashboard', [DriverDashboardController::class, 'dashboard'])->name('driver.dashboard');

        Route::get('/jobs', [DriverJobController::class, 'index'])->name('driver.jobs');
        Route::get('/jobs/{id}', [DriverJobController::class, 'show']);
        Route::get('/jobs/{job}/update', [DriverJobController::class, 'editStatus']);
        Route::post('/jobs/{job}/update', [DriverJobController::class, 'updateStatus']);

        Route::get('/notifications', [DriverNotificationController::class, 'index'])->name('driver.notifications');

        Route::post('/notifications/read/{id}', [DriverNotificationController::class, 'markAsRead']);
        Route::post('/notifications/read-all', [DriverNotificationController::class, 'markAllAsRead']);

        Route::delete('/notifications/{id}', [DriverNotificationController::class, 'destroy']);
        Route::delete('/notifications', [DriverNotificationController::class, 'destroyAll']);

        Route::get('/settings', [DriverSettingController::class, 'index'])->name('driver.settings');
        Route::get('/settings/edit', [DriverSettingController::class, 'edit'])->name('driver.settings.edit');
        Route::put('/settings', [DriverSettingController::class, 'update'])->name('driver.settings.update');

    });

    
});







