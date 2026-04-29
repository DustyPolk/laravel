<?php

namespace App\Http\Controllers;

use App\Http\Requests\Drawings\SaveDrawingRequest;
use App\Models\Drawing;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class DrawingController extends Controller
{
    /**
     * Display a listing of the user's drawings.
     */
    public function index(Request $request): Response
    {
        $drawings = Drawing::whereBelongsTo($request->user())
            ->latest('updated_at')
            ->get()
            ->map(fn (Drawing $drawing) => [
                'id' => $drawing->id,
                'title' => $drawing->title,
                'thumbnail' => $drawing->thumbnail,
                'updated_at' => $drawing->updated_at->toISOString(),
            ]);

        return Inertia::render('drawings/index', [
            'drawings' => $drawings,
        ]);
    }

    /**
     * Create a new blank drawing for the authenticated user.
     */
    public function store(Request $request): RedirectResponse
    {
        $drawing = $request->user()->drawings()->create([
            'title' => 'Untitled drawing',
            'elements' => [],
        ]);

        return to_route('drawings.edit', $drawing);
    }

    /**
     * Show the drawing editor.
     */
    public function edit(Drawing $drawing): Response
    {
        Gate::authorize('view', $drawing);

        return Inertia::render('drawings/edit', [
            'drawing' => [
                'id' => $drawing->id,
                'title' => $drawing->title,
                'elements' => $drawing->elements,
                'app_state' => $drawing->app_state,
                'updated_at' => $drawing->updated_at->toISOString(),
            ],
        ]);
    }

    /**
     * Persist drawing edits (auto-save).
     */
    public function update(SaveDrawingRequest $request, Drawing $drawing): RedirectResponse
    {
        $drawing->update($request->validated());

        return back();
    }

    /**
     * Soft-delete the drawing.
     */
    public function destroy(Drawing $drawing): RedirectResponse
    {
        Gate::authorize('delete', $drawing);

        $drawing->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Drawing deleted.')]);

        return to_route('drawings.index');
    }
}
