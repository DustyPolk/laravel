<?php

namespace Database\Factories;

use App\Models\Drawing;
use App\Models\Team;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Drawing>
 */
class DrawingFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'team_id' => Team::factory(),
            'creator_id' => User::factory(),
            'title' => fake()->sentence(3),
            'elements' => [],
            'app_state' => null,
            'thumbnail' => null,
        ];
    }
}
