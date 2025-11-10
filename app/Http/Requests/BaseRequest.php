<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Contracts\Validation\Validator;

class BaseRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function failedValidation(Validator $validator)
    {
        $errors = $validator->errors()->all(); 
        $errorString = implode(', ', $errors); 

        throw new HttpResponseException(response()->json([
            'status'  => 400,
            'message' => $errorString
        ], 400));
    }
}