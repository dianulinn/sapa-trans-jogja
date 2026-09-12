<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MapController extends Controller
{
    public function getHalte()
    {
        $data = DB::select("SELECT get_halte_geojson() as geojson");
        return response()->json(json_decode($data[0]->geojson));
    }

    public function getJalur()
    {
        $data = DB::select("SELECT get_jalur_geojson() as geojson");
        return response()->json(json_decode($data[0]->geojson));
    }
}
