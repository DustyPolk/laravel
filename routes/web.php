<?php

use App\Http\Controllers\DrawingController;
use Illuminate\Support\Facades\Route;
use Laravel\WorkOS\Http\Middleware\ValidateSessionWithWorkOS;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', ValidateSessionWithWorkOS::class])->group(function () {
    Route::resource('drawings', DrawingController::class)
        ->only(['index', 'store', 'edit', 'update', 'destroy']);
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
