<?php

namespace App\Policies;

use App\Models\Drawing;
use App\Models\User;

class DrawingPolicy
{
    /**
     * Determine whether the user can view the drawing.
     */
    public function view(User $user, Drawing $drawing): bool
    {
        return $user->belongsToTeam($drawing->team);
    }

    /**
     * Determine whether the user can update the drawing.
     */
    public function update(User $user, Drawing $drawing): bool
    {
        return $user->belongsToTeam($drawing->team);
    }

    /**
     * Determine whether the user can delete the drawing.
     */
    public function delete(User $user, Drawing $drawing): bool
    {
        return $user->belongsToTeam($drawing->team);
    }
}
