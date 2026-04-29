<?php

namespace App\Http\Requests\Drawings;

use App\Models\Drawing;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class SaveDrawingRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $drawing = $this->route('drawing');

        if (! $drawing instanceof Drawing) {
            return false;
        }

        return $this->user()?->can('update', $drawing) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['nullable', 'string', 'max:255'],
            'elements' => ['present', 'array', 'max:5000'],
            'app_state' => ['nullable', 'array'],
            'thumbnail' => ['nullable', 'string', 'max:500000'],
        ];
    }
}
