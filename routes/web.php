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
use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\ChargesController;
use App\Http\Controllers\Driver\DriverDashboardController;
use App\Http\Controllers\Driver\DriverTripController;
use App\Http\Controllers\Driver\DriverSettingController;
use App\Http\Controllers\Driver\DriverNotificationController;
use App\Http\Controllers\Driver\TripContainerController;
use App\Http\Controllers\IncomingShipmentTrackingController;
use App\Http\Controllers\ImportController;
use App\Http\Controllers\JobContainerController;
use App\Http\Controllers\PodUploadController;
use App\Http\Controllers\TripController;
use App\Http\Controllers\TripProgressController;
use App\Http\Controllers\TruckController;
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
        Route::resource('trucks', TruckController::class);
        Route::resource('transport-routes', RouteController::class)
            ->parameters(['transport-routes' => 'routeModel']);

        Route::prefix('transport-routes/{route}')->group(function () {
            Route::resource('checkpoints', CheckpointController::class);
        });

        Route::post('/leads/filter', [LeadController::class, 'index'])->name('leads.filter');
        Route::resource('leads', LeadController::class);
        Route::post('leads/{id}/update', [LeadController::class, 'update'])->name('leads.update');

        Route::post('/jobs/filter', [JobController::class, 'index'])->name('jobs.filter');
        Route::get('/jobs/export', [JobController::class, 'export'])->name('jobs.export');
        Route::resource('jobs', JobController::class);

        Route::get('/jobs/{job}/documents', [JobDocumentController::class, 'index'])->name('jobs.documents.index');
        Route::post('/jobs/{job}/documents', [JobDocumentController::class, 'store'])->name('jobs.documents.store');
        Route::post('/jobs/{job}/documents/{attachment}/replace', [JobDocumentController::class, 'replace'])->name('jobs.documents.replace');

        Route::get('/jobs/{job}/containers', [JobContainerController::class, 'index'])->name('jobs.containers.index');
        Route::post('/jobs/{job}/containers', [JobContainerController::class, 'store'])->name('jobs.containers.store');

        Route::get('/trips/search-job', [TripController::class, 'searchJob'])->name('trips.search_job');        
        Route::post('/trips/filter', [TripController::class, 'index'])->name('trips.filter');
        Route::resource('trips', TripController::class);

        Route::post('/activity-log/filter', [ActivityLogController::class, 'index'])->name('activity-log.filter');
        Route::resource('activity-log', ActivityLogController::class)->parameters(['activity-log' => 'trip']);

        Route::post('/charges/filter', [ChargesController::class, 'index'])->name('charges.filter');
        Route::resource('charges', ChargesController::class)->parameters(['charges' => 'trip']);

        Route::prefix('charges')->group(function () {

            //costs
            Route::post('{trip}/costs', [ChargesController::class, 'storeTransportCost'])
                ->name('charges.costs.store');

            Route::post('costs/{expense}', [ChargesController::class, 'updateTransportCost'])
                ->name('charges.costs.update');

            Route::delete('costs/{expense}', [ChargesController::class, 'deleteTransportCost'])
                ->name('charges.costs.delete');

            //incomes
            Route::post('{trip}/incomes', [ChargesController::class, 'storeIncome'])
                ->name('charges.incomes.store');

            Route::put('incomes/{income}', [ChargesController::class, 'updateIncome'])
                ->name('charges.incomes.update');

            Route::delete('incomes/{income}', [ChargesController::class, 'deleteIncome'])
                ->name('charges.incomes.delete');

            //expenses
            Route::post('{trip}/expenses', [ChargesController::class, 'storeExpense'])
                ->name('charges.expenses.store');

            Route::post('expenses/{expense}', [ChargesController::class, 'updateExpense'])
                ->name('charges.expenses.update');

            Route::delete('expenses/{expense}', [ChargesController::class, 'deleteExpense'])
                ->name('charges.expenses.delete');

            Route::post('/update-charge', [ChargesController::class,'updateCharge'])
                ->name('charges.updateCharge');
        });

        Route::post('/trip-progress/filter', [TripProgressController::class, 'index'])->name('trip-progress.filter');
        Route::resource('trip-progress', TripProgressController::class)->parameters(['trip-progress' => 'trip']);

        Route::post('/pod-upload/filter', [PodUploadController::class, 'index'])->name('pod-upload.filter');
        Route::resource('pod-upload', PodUploadController::class)->parameters(['pod-upload' => 'job']);
        Route::prefix('pod-upload')->group(function () {

            Route::delete('/job-delete/{attachment}', [PodUploadController::class, 'deleteJobFile'])
                ->name('pod-upload.job-delete');

            Route::post('/container-upload', [PodUploadController::class, 'uploadContainer'])
                ->name('pod-upload.container-upload');

            Route::delete('/container-delete/{file}', [PodUploadController::class, 'deleteContainerFile'])
                ->name('pod-upload.container-delete');

            Route::post('/{job}/documents/{attachment}/replace', [PodUploadController::class, 'replace'])
                ->name('pod-upload.replace');

        }); 
        
        Route::post('/incoming-shipment-tracking/filter', [IncomingShipmentTrackingController::class, 'index'])->name('incoming-shipment-tracking.filter');
        Route::get('/incoming-shipment-tracking', [IncomingShipmentTrackingController::class, 'index'])->name('incoming-shipment-tracking.index');
        Route::get('/incoming-shipment-tracking/{id}', [IncomingShipmentTrackingController::class, 'show'])->name('incoming-shipment-tracking.show');;
        Route::post('/incoming-shipment-tracking/export', [IncomingShipmentTrackingController::class, 'export'])->name('incoming-shipment-tracking.export');

        Route::prefix('import')->group(function () {
            Route::get('/', [ImportController::class, 'index'])->name('import.index');
            Route::post('/customers', [ImportController::class, 'customers'])->name('import.customers');
            Route::post('/drivers', [ImportController::class, 'drivers'])->name('import.drivers');
            Route::post('/trucks', [ImportController::class, 'trucks'])->name('import.trucks');
        });
       
      
    });

    Route::prefix('driver')->group(function () {
        Route::get('/dashboard', [DriverDashboardController::class, 'dashboard'])->name('driver.dashboard');

        Route::get('/trips', [DriverTripController::class, 'index'])->name('driver.trips');
        Route::get('/trips/{id}', [DriverTripController::class, 'show']);
        Route::get('/trips/{trip}/update', [DriverTripController::class, 'editStatus']);
        Route::post('/trips/{trip}/update', [DriverTripController::class, 'updateStatus']);
        Route::get('/trips/{trip}/containers/{container}',[TripContainerController::class, 'show']);

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






