<?php

use App\Models\Drawing;
use App\Models\User;

test('guests cannot list drawings', function () {
    $this->get(route('drawings.index'))
        ->assertRedirect(route('login'));
});

test('users see only their own drawings', function () {
    $user = User::factory()->create();
    $other = User::factory()->create();

    $mine = Drawing::factory()->for($user)->create(['title' => 'Mine']);
    Drawing::factory()->for($other)->create(['title' => 'Not mine']);

    $response = $this->actingAs($user)->get(route('drawings.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('drawings/index')
        ->has('drawings', 1)
        ->where('drawings.0.id', $mine->id)
        ->where('drawings.0.title', 'Mine'));
});

test('store creates a blank drawing and redirects to the editor', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('drawings.store'));

    $drawing = $user->drawings()->latest('created_at')->first();

    $this->assertModelExists($drawing);
    expect($drawing->user_id)->toBe($user->id);
    expect($drawing->title)->toBe('Untitled drawing');
    expect($drawing->elements)->toBe([]);

    $response->assertRedirect(route('drawings.edit', $drawing));
});

test('edit returns the drawing payload', function () {
    $user = User::factory()->create();
    $drawing = Drawing::factory()->for($user)->create([
        'elements' => [['id' => 'a', 'type' => 'rectangle']],
    ]);

    $response = $this->actingAs($user)->get(route('drawings.edit', $drawing));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('drawings/edit')
        ->where('drawing.id', $drawing->id)
        ->has('drawing.elements', 1));
});

test('non-owners cannot view a drawing', function () {
    $owner = User::factory()->create();
    $intruder = User::factory()->create();
    $drawing = Drawing::factory()->for($owner)->create();

    $this->actingAs($intruder)
        ->get(route('drawings.edit', $drawing))
        ->assertForbidden();
});

test('update persists elements and title', function () {
    $user = User::factory()->create();
    $drawing = Drawing::factory()->for($user)->create();

    $payload = [
        'title' => 'My new diagram',
        'elements' => [
            ['id' => 'x', 'type' => 'rectangle', 'x' => 10, 'y' => 20, 'width' => 100, 'height' => 50],
        ],
        'app_state' => ['viewport' => ['x' => 0, 'y' => 0, 'scale' => 1]],
    ];

    $this->actingAs($user)
        ->put(route('drawings.update', $drawing), $payload)
        ->assertRedirect();

    $drawing->refresh();
    expect($drawing->title)->toBe('My new diagram');
    expect($drawing->elements)->toHaveCount(1);
    expect($drawing->elements[0]['type'])->toBe('rectangle');
});

test('update rejects request missing elements', function () {
    $user = User::factory()->create();
    $drawing = Drawing::factory()->for($user)->create();

    $this->actingAs($user)
        ->put(route('drawings.update', $drawing), ['title' => 'x'])
        ->assertSessionHasErrors('elements');
});

test('non-owners cannot update a drawing', function () {
    $owner = User::factory()->create();
    $intruder = User::factory()->create();
    $drawing = Drawing::factory()->for($owner)->create();

    $this->actingAs($intruder)
        ->put(route('drawings.update', $drawing), ['elements' => []])
        ->assertForbidden();
});

test('destroy soft-deletes the drawing', function () {
    $user = User::factory()->create();
    $drawing = Drawing::factory()->for($user)->create();

    $this->actingAs($user)
        ->delete(route('drawings.destroy', $drawing))
        ->assertRedirect(route('drawings.index'));

    $this->assertSoftDeleted($drawing);
});

test('non-owners cannot delete a drawing', function () {
    $owner = User::factory()->create();
    $intruder = User::factory()->create();
    $drawing = Drawing::factory()->for($owner)->create();

    $this->actingAs($intruder)
        ->delete(route('drawings.destroy', $drawing))
        ->assertForbidden();
});
