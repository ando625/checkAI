<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class CommentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'comment_body' => ['required', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'comment_body.required' => '報告内容を入力してください。',
            'comment_body.max' => '1000文字以内で入力してください。',
        ];
    }
}
