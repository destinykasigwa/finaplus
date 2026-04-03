<?php

namespace App\Rules;

use Illuminate\Contracts\Validation\Rule;

class TomorrowDate implements Rule
{
    /**
     * Create a new rule instance.
     *
     * @return void
     */
    public function __construct()
    {
        //
    }

    /**
     * Determine if the validation rule passes.
     *
     * @param  string  $attribute
     * @param  mixed  $value
     * @return bool
     */
    public function passes($attribute, $value)
    {
        //
        $tomorrow = now()->addDay()->format('Y-m-d');
        return $value === $tomorrow;
    }

    /**
     * Get the validation error message.
     *
     * @return string
     */
    public function message()
    {
        return 'La date doit être celle de demain.';
    }
}
