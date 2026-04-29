<?php

namespace App\Models;

use Database\Factories\DrawingFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['user_id', 'title', 'elements', 'app_state', 'thumbnail'])]
class Drawing extends Model
{
    /** @use HasFactory<DrawingFactory> */
    use HasFactory, HasUuids, SoftDeletes;

    /**
     * Get the user who owns the drawing.
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'elements' => 'array',
            'app_state' => 'array',
        ];
    }
}
