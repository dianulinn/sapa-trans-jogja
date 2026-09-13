<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/map', function () {
    return response()
        ->view('map')
        ->header('X-Frame-Options', 'ALLOWALL');
});
