<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\response;
use App\Http\Controllers\env;

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

                    // Koordinat
                    'lat' => $halte->lat,
                    'long' => $halte->long,

                    // Informasi halte
                    'jalur' => $halte->jalur ?? null,
                    'kelas' => $halte->kelas ?? null,
                    'rating' => $halte->skor_final ?? null,
                    'jenis_halte' => $halte->jenis_halt ?? null,

                    // Fasilitas + kondisi
                    'fasilitas' => [
                        'atap' => $halte->fas_atap ?? null,
                        'kondisi_atap' => $halte->kondisi_at ?? null,

                        'ramp' => $halte->fas_ramp ?? null,
                        'kondisi_ramp' => $halte->kondisi_ra ?? null,

                        'fas_pegawa' => $halte->fas_pegawa ?? null,
                        'tempat_duduk' => $halte->fas_tempat ?? null,
                        'papan_informasi' => $halte->fas_papan_ ?? null,
                        'lampu' => $halte->fas_lampu ?? null,

                        'trotoar' => $halte->fas_trotoa ?? null,
                        'kondisi_trotoar' => $halte->kondisi_tr ?? null,

                        'guiding_block' => $halte->fas_guildi ?? null,
                        'kondisi_guiding_block' => $halte->kondisi_gu ?? null,

                        'penyeberangan' => $halte->fas_penyeb ?? null,
                        'jenis_penyeberangan' => $halte->jenis_peny ?? null,
                    ],

                    // Skor
                    'skor' => [
                        'fasilitas' => $halte->skor_fas ?? null,
                        'kondisi' => $halte->skor_kondi ?? null,
                        'total' => $halte->skor_total ?? null,
                        'final' => $halte->skor_final ?? null,
                    ],

                    // Foto dari MAPID
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
