<?php

namespace App\Policies;

use App\Models\Drawing;
use App\Models\User;

class DrawingPolicy
{
    public function view(User $user, Drawing $drawing): bool
    {
        return $user->id === $drawing->user_id;
    }

    public function update(User $user, Drawing $drawing): bool
    {
        return $user->id === $drawing->user_id;
    }

    public function delete(User $user, Drawing $drawing): bool
    {
        return $user->id === $drawing->user_id;
    }
}
