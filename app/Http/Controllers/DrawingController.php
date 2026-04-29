<?php

namespace App\Http\Controllers;

use App\Http\Requests\Drawings\SaveDrawingRequest;
use App\Models\Drawing;
use App\Models\Team;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class DrawingController extends Controller
{
    /**
     * Display a listing of the team's drawings.
     */
    public function index(Request $request, Team $current_team): Response
    {
        $drawings = Drawing::where('team_id', $current_team->id)
            ->with('creator:id,name,avatar')
            ->latest('updated_at')
            ->get()
            ->map(fn (Drawing $drawing) => [
                'id' => $drawing->id,
                'title' => $drawing->title,
                'thumbnail' => $drawing->thumbnail,
                'updated_at' => $drawing->updated_at->toISOString(),
                'creator' => $drawing->creator ? [
                    'id' => $drawing->creator->id,
                    'name' => $drawing->creator->name,
                    'avatar' => $drawing->creator->avatar,
                ] : null,
            ]);

        return Inertia::render('drawings/index', [
            'drawings' => $drawings,
        ]);
    }

    /**
     * Create a new blank drawing for the current team.
     */
    public function store(Request $request, Team $current_team): RedirectResponse
    {
        $drawing = Drawing::create([
            'team_id' => $current_team->id,
            'creator_id' => $request->user()->id,
            'title' => 'Untitled drawing',
            'elements' => [],
        ]);

        return to_route('drawings.edit', [
            'current_team' => $current_team->slug,
            'drawing' => $drawing->id,
        ]);
    }

    /**
     * Show the drawing editor.
     */
    public function edit(Request $request, Team $current_team, Drawing $drawing): Response
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
    public function update(SaveDrawingRequest $request, Team $current_team, Drawing $drawing): RedirectResponse
    {
        $drawing->update($request->validated());

        return back();
    }

    /**
     * Soft-delete the drawing.
     */
    public function destroy(Request $request, Team $current_team, Drawing $drawing): RedirectResponse
    {
        Gate::authorize('delete', $drawing);

        $drawing->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Drawing deleted.')]);

        return to_route('drawings.index', ['current_team' => $current_team->slug]);
    }
}
