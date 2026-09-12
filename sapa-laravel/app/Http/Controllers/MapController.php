<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

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

    public function searchHalte(Request $request)
    {
        $destination = trim($request->query('destination', ''));

        $preferences = $request->query('preferences', '');

        if (is_string($preferences)) {
            $preferences = array_filter(
                explode(',', $preferences)
            );
        }

        if (!$destination) {
            return response()->json([
                'success' => false,
                'message' => 'Tujuan belum diisi',
                'data' => []
            ]);
        }

        try {

            // ==========================================
            // 1. CARI KOORDINAT TUJUAN
            // ==========================================

            $geocodeResponse = Http::withHeaders([
                'User-Agent' => 'SAPA-Trans-Jogja/1.0',
                'Accept-Language' => 'id',
            ])->get(
                'https://nominatim.openstreetmap.org/search',
                [
                    'q' => $destination . ', Yogyakarta, Indonesia',
                    'format' => 'jsonv2',
                    'limit' => 1,
                    'countrycodes' => 'id',
                ]
            );

            $locations = $geocodeResponse->json();

            if (
                !$geocodeResponse->successful() ||
                empty($locations)
            ) {
                return response()->json([
                    'success' => false,
                    'message' => 'Lokasi tujuan tidak ditemukan',
                    'data' => []
                ], 404);
            }

            $destinationLat = (float) $locations[0]['lat'];
            $destinationLong = (float) $locations[0]['lon'];

            // ==========================================
            // 2. AMBIL DATA HALTE + FASILITAS
            // ==========================================

            $haltes = DB::table('activity_utm_exp')
                ->select([
                    'id',
                    'halte_ona',
                    'lat',
                    'long',
                    'jalur',
                    'kelas',
                    'skor_final',
                    'jenis_halt',

                    // FASILITAS AKSESIBILITAS
                    'fas_ramp',
                    'fas_guildi',
                ])
                ->whereNotNull('lat')
                ->whereNotNull('long')
                ->get();

            // ==========================================
            // 3. FILTER BERDASARKAN PREFERENSI
            // ==========================================

            $haltes = $haltes->filter(function ($halte) use ($preferences) {

                $ramp = strtolower(trim((string) $halte->fas_ramp));
                $guidingBlock = strtolower(trim((string) $halte->fas_guildi));

                $hasRamp = $ramp === 'ada';
                $hasGuidingBlock = $guidingBlock === 'ada';

                // Tidak ada preferensi
                if (empty($preferences)) {
                    return true;
                }

                // Pengguna kursi roda → WAJIB ada ramp
                if (
                    in_array('wheelchair', $preferences) &&
                    !$hasRamp
                ) {
                    return false;
                }

                // Membawa stroller → WAJIB ada ramp
                if (
                    in_array('stroller', $preferences) &&
                    !$hasRamp
                ) {
                    return false;
                }

                // Alat bantu jalan → ramp ATAU guiding block
                if (
                    in_array('walkingAid', $preferences) &&
                    !$hasRamp &&
                    !$hasGuidingBlock
                ) {
                    return false;
                }

                // Membutuhkan jalur pemandu → WAJIB ada guiding block
                if (
                    in_array('guidePath', $preferences) &&
                    !$hasGuidingBlock
                ) {
                    return false;
                }

                return true;
            });

            // ==========================================
            // 4. HITUNG JARAK TUJUAN → SETIAP HALTE
            // ==========================================

            $hasil = $haltes->map(function ($halte) use (
                $destinationLat,
                $destinationLong
            ) {

                $lat1 = deg2rad($destinationLat);
                $lon1 = deg2rad($destinationLong);

                $lat2 = deg2rad((float) $halte->lat);
                $lon2 = deg2rad((float) $halte->long);

                $dLat = $lat2 - $lat1;
                $dLon = $lon2 - $lon1;

                $a =
                    sin($dLat / 2) * sin($dLat / 2) +
                    cos($lat1) *
                    cos($lat2) *
                    sin($dLon / 2) *
                    sin($dLon / 2);

                $c = 2 * atan2(
                    sqrt($a),
                    sqrt(1 - $a)
                );

                $distance = 6371 * $c;

                $halte->distance_km = round($distance, 3);

                return $halte;
            })
                ->filter(function ($halte) {

                    // Hanya halte dalam radius 1 km
                    return $halte->distance_km <= 1;
                })
                ->sortBy('distance_km')
                ->values();

            // ==========================================
            // 5. KEMBALIKAN HASIL
            // ==========================================

            return response()->json([
                'success' => true,

                'destination' => [
                    'name' => $locations[0]['display_name'] ?? $destination,
                    'lat' => $destinationLat,
                    'long' => $destinationLong,
                ],

                'preferences' => $preferences,

                'total' => $hasil->count(),

                'data' => $hasil,
            ]);
        } catch (\Exception $e) {

            return response()->json([
                'success' => false,
                'message' => 'Gagal mencari tujuan',
                'error' => $e->getMessage(),
                'data' => []
            ], 500);
        }
    }
}
