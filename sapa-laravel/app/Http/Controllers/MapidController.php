<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;

class MapidController extends Controller
{
    public function activities()
    {
        $apiKey = env('MAPID_API_KEY');

        $authors = [
            'dianulin',
            'kansaeka',
            'elanggadingpermana2006',
            'angelinapuspo',
            'laylanovinda',
        ];

        $allActivities = [];

        try {

            foreach ($authors as $author) {

                $response = Http::withHeaders([
                    'x-api-key' => $apiKey,
                    'Content-Type' => 'application/json',
                    'Accept' => 'application/json',
                ])->post(
                    'https://server.mapid.io/web/competition/activities',
                    [
                        'feature' => [
                            'type' => 'Polygon',
                            'coordinates' => [[
                                [109.0, -9.0],
                                [112.0, -9.0],
                                [112.0, -6.0],
                                [109.0, -6.0],
                                [109.0, -9.0],
                            ]]
                        ],

                        'start_date' => '2020-01-01',
                        'end_date' => '2030-12-31',

                        'author' => $author,
                    ]
                );

                $result = $response->json();

                if (
                    isset($result['data']['activities']) &&
                    is_array($result['data']['activities'])
                ) {

                    foreach ($result['data']['activities'] as $activity) {

                        $activity['jumlah_foto'] = count($activity['medias'] ?? []);

                        $activity['foto_mapid'] = $activity['medias'] ?? [];

                        $allActivities[] = $activity;
                    }
                }
            }

            return response()->json([
                'success' => true,
                'total' => count($allActivities),
                'data' => [
                    'activities' => $allActivities,
                ],
            ]);
        } catch (\Exception $e) {

            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data MAPID',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function haltes()
    {
        $apiKey = env('MAPID_API_KEY');

        try {

            // 1. Ambil data 345 halte dari database
            $haltes = DB::table('activity_utm_exp')->get();

            // 2. Ambil data Activities dari MAPID
            $authors = [
                'dianulin',
                'kansaeka',
                'elanggadingpermana2006',
                'angelinapuspo',
                'laylanovinda',
            ];

            $mapidActivities = [];

            foreach ($authors as $author) {

                $response = Http::withHeaders([
                    'x-api-key' => $apiKey,
                    'Content-Type' => 'application/json',
                    'Accept' => 'application/json',
                ])->post(
                    'https://server.mapid.io/web/competition/activities',
                    [
                        'feature' => [
                            'type' => 'Polygon',
                            'coordinates' => [[
                                [109.0, -9.0],
                                [112.0, -9.0],
                                [112.0, -6.0],
                                [109.0, -6.0],
                                [109.0, -9.0],
                            ]]
                        ],
                        'start_date' => '2020-01-01',
                        'end_date' => '2030-12-31',
                        'author' => $author,
                    ]
                );

                $result = $response->json();

                if (
                    isset($result['data']['activities']) &&
                    is_array($result['data']['activities'])
                ) {
                    $mapidActivities = array_merge(
                        $mapidActivities,
                        $result['data']['activities']
                    );
                }
            }

            // 3. Buat index berdasarkan ID MAPID
            $mapidById = [];

            foreach ($mapidActivities as $activity) {

                if (isset($activity['_id'])) {
                    $mapidById[$activity['_id']] = $activity;
                }
            }

            // 4. Gabungkan database dengan data MAPID
            $hasil = [];

            foreach ($haltes as $halte) {

                $mapid = $mapidById[$halte->id_mapid] ?? null;

                $hasil[] = [
                    'id' => $halte->id,
                    'nama' => $halte->halte_ona,
                    'id_mapid' => $halte->id_mapid,

                    'lat' => $halte->lat,
                    'long' => $halte->long,

                    'kelas' => $halte->kelas ?? null,
                    'rating' => $halte->skor_final ?? null,

                    'fasilitas' => [
                        'atap' => $halte->fas_atap ?? null,
                        'ramp' => $halte->fas_ramp ?? null,
                    ],

                    'foto' => $mapid['medias'] ?? [],
                ];
            }

            return response()->json([
                'success' => true,
                'total' => count($hasil),
                'data' => $hasil,
            ]);
        } catch (\Exception $e) {

            return response()->json([
                'success' => false,
                'message' => 'Gagal menggabungkan data halte',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
