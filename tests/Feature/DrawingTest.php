<?php

use App\Models\Drawing;
use App\Models\User;

test('guests cannot list drawings', function () {
    $user = User::factory()->create();

    $this->get(route('drawings.index', ['current_team' => $user->currentTeam->slug]))
        ->assertRedirect(route('login'));
});

test('users see only their current team drawings', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $mine = Drawing::factory()->create(['team_id' => $team->id, 'creator_id' => $user->id, 'title' => 'Mine']);
    $other = Drawing::factory()->create(['title' => 'Not mine']);

    $response = $this->actingAs($user)
        ->get(route('drawings.index', ['current_team' => $team->slug]));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('drawings/index')
        ->has('drawings', 1)
        ->where('drawings.0.id', $mine->id)
        ->where('drawings.0.title', 'Mine'));
});

test('store creates a blank drawing and redirects to the editor', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $response = $this->actingAs($user)
        ->post(route('drawings.store', ['current_team' => $team->slug]));

    $drawing = Drawing::where('team_id', $team->id)->latest('created_at')->first();

    expect($drawing)->not->toBeNull();
    expect($drawing->creator_id)->toBe($user->id);
    expect($drawing->title)->toBe('Untitled drawing');
    expect($drawing->elements)->toBe([]);

    $response->assertRedirect(route('drawings.edit', [
        'current_team' => $team->slug,
        'drawing' => $drawing->id,
    ]));
});

test('edit returns the drawing payload', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $drawing = Drawing::factory()->create([
        'team_id' => $team->id,
        'creator_id' => $user->id,
        'elements' => [['id' => 'a', 'type' => 'rectangle']],
    ]);

    $response = $this->actingAs($user)
        ->get(route('drawings.edit', ['current_team' => $team->slug, 'drawing' => $drawing->id]));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('drawings/edit')
        ->where('drawing.id', $drawing->id)
        ->has('drawing.elements', 1));
});

test('non-team-members cannot view a drawing', function () {
    $owner = User::factory()->create();
    $intruder = User::factory()->create();
    $drawing = Drawing::factory()->create(['team_id' => $owner->currentTeam->id]);

    $this->actingAs($intruder)
        ->get(route('drawings.edit', [
            'current_team' => $intruder->currentTeam->slug,
            'drawing' => $drawing->id,
        ]))
        ->assertForbidden();
});

test('update persists elements and title', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $drawing = Drawing::factory()->create(['team_id' => $team->id, 'creator_id' => $user->id]);

    $payload = [
        'title' => 'My new diagram',
        'elements' => [
            ['id' => 'x', 'type' => 'rectangle', 'x' => 10, 'y' => 20, 'width' => 100, 'height' => 50],
        ],
        'app_state' => ['viewport' => ['x' => 0, 'y' => 0, 'scale' => 1]],
    ];

    $this->actingAs($user)
        ->put(route('drawings.update', ['current_team' => $team->slug, 'drawing' => $drawing->id]), $payload)
        ->assertRedirect();

    $drawing->refresh();
    expect($drawing->title)->toBe('My new diagram');
    expect($drawing->elements)->toHaveCount(1);
    expect($drawing->elements[0]['type'])->toBe('rectangle');
});

test('update rejects request missing elements', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $drawing = Drawing::factory()->create(['team_id' => $team->id, 'creator_id' => $user->id]);

    $this->actingAs($user)
        ->put(
            route('drawings.update', ['current_team' => $team->slug, 'drawing' => $drawing->id]),
            ['title' => 'x']
        )
        ->assertSessionHasErrors('elements');
});

test('non-team-members cannot update a drawing', function () {
    $owner = User::factory()->create();
    $intruder = User::factory()->create();
    $drawing = Drawing::factory()->create(['team_id' => $owner->currentTeam->id]);

    $this->actingAs($intruder)
        ->put(
            route('drawings.update', [
                'current_team' => $intruder->currentTeam->slug,
                'drawing' => $drawing->id,
            ]),
            ['elements' => []]
        )
        ->assertForbidden();
});

test('destroy soft-deletes the drawing', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $drawing = Drawing::factory()->create(['team_id' => $team->id, 'creator_id' => $user->id]);

    $this->actingAs($user)
        ->delete(route('drawings.destroy', ['current_team' => $team->slug, 'drawing' => $drawing->id]))
        ->assertRedirect(route('drawings.index', ['current_team' => $team->slug]));

    expect(Drawing::find($drawing->id))->toBeNull();
    expect(Drawing::withTrashed()->find($drawing->id))->not->toBeNull();
});

test('non-team-members cannot delete a drawing', function () {
    $owner = User::factory()->create();
    $intruder = User::factory()->create();
    $drawing = Drawing::factory()->create(['team_id' => $owner->currentTeam->id]);

    $this->actingAs($intruder)
        ->delete(route('drawings.destroy', [
            'current_team' => $intruder->currentTeam->slug,
            'drawing' => $drawing->id,
        ]))
        ->assertForbidden();
});
