<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class EcoHomePage extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }
    //
    public function ecoHomePage()
    {
        return view("eco.home");
    }
}
