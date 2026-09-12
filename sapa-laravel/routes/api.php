<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MapidController;
use App\Http\Controllers\MapController;
use App\Http\Controllers\ChatbotController;

//Endpoint data survei MAPID
Route::get('/activities', [MapidController::class, 'activities']);

//Endpoint data spasial Supabase
Route::get('map/halte', [MapController::class, 'getHalte']);
Route::get('map/jalur', [MapController::class, 'getJalur']);
Route::get('map/halte-aksesibel', [MapController::class, 'getHalteAksesibel']);

// Endpoint gabungan data halte + foto MAPID
Route::get('/haltes', [MapidController::class, 'haltes']);

//GEMINI AI
Route::post('/chat', [ChatbotController::class, 'chat']);
