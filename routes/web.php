<?php

use App\Http\Controllers\DrawingController;
use App\Http\Controllers\Teams\TeamInvitationController;
use App\Http\Middleware\EnsureTeamMembership;
use Illuminate\Support\Facades\Route;
use Laravel\WorkOS\Http\Middleware\ValidateSessionWithWorkOS;

Route::inertia('/', 'welcome')->name('home');

Route::prefix('{current_team}')
    ->middleware(['auth', ValidateSessionWithWorkOS::class, EnsureTeamMembership::class])
    ->group(function () {
        Route::inertia('dashboard', 'dashboard')->name('dashboard');

        Route::get('drawings', [DrawingController::class, 'index'])->name('drawings.index');
        Route::post('drawings', [DrawingController::class, 'store'])->name('drawings.store');
        Route::get('drawings/{drawing}/edit', [DrawingController::class, 'edit'])->name('drawings.edit');
        Route::put('drawings/{drawing}', [DrawingController::class, 'update'])->name('drawings.update');
        Route::delete('drawings/{drawing}', [DrawingController::class, 'destroy'])->name('drawings.destroy');
    });

Route::middleware(['auth'])->group(function () {
    Route::get('invitations/{invitation}/accept', [TeamInvitationController::class, 'accept'])->name('invitations.accept');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
