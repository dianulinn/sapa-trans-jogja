<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ChatbotController extends Controller
{
    public function chat(Request $request)
    {
        $userMessage = $request->input('message');

        $apiKey = config('services.gemini.key') ?? env('GEMINI_API_KEY');

        if (!$apiKey) {
            return response()->json([
                'success' => false,
                'message' => 'Gemini API Key belum dipasang di .env'
            ], 500);
        }

        try {

            // 1. Ambil data halte dari database
            $halteData = DB::table('activity_utm_exp')
                ->select(
                    'id',
                    'id_mapid',
                    'halte_ona',
                    'user_name',
                    'tanggal',
                    'jalur',
                    'kelas',
                    'skor_final',
                    'lat',
                    'long',
                    'jenis_halt',
                    'fas_atap',
                    'kondisi_at',
                    'fas_ramp',
                    'kondisi_ra',
                    'fas_pegawa',
                    'fas_tempat',
                    'fas_papan_',
                    'fas_lampu',
                    'fas_trotoa',
                    'kondisi_tr',
                    'fas_guildi',
                    'kondisi_gu',
                    'fas_penyeb',
                    'jenis_peny',
                    'skor_fas',
                    'skor_kondi',
                    'skor_total'
                )
                ->get();

            // ==========================================
            // CARI LOKASI YANG DITANYAKAN USER
            // ==========================================
            $destinationLat = null;
            $destinationLong = null;
            $nearestHalte = null;

            $geocodeResponse = Http::timeout(15)
                ->withHeaders([
                    'User-Agent' => 'SAPA-Trans-Jogja/1.0',
                    'Accept-Language' => 'id',
                ])
                ->get(
                    'https://nominatim.openstreetmap.org/search',
                    [
                        'q' => $userMessage . ', Yogyakarta, Indonesia',
                        'format' => 'jsonv2',
                        'limit' => 1,
                        'countrycodes' => 'id',
                    ]
                );

            $locations = $geocodeResponse->json();

            if ($geocodeResponse->successful() && !empty($locations)) {

                $destinationLat = (float) $locations[0]['lat'];
                $destinationLong = (float) $locations[0]['lon'];

                // ==========================================
                // HITUNG HALTE TERDEKAT
                // ==========================================
                foreach ($halteData as $halte) {

                    if ($halte->lat === null || $halte->long === null) {
                        continue;
                    }

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

                    $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

                    $distance = 6371 * $c;

                    if (
                        $nearestHalte === null ||
                        $distance < $nearestHalte['distance']
                    ) {
                        $nearestHalte = [
                            'id' => $halte->id,
                            'nama' => $halte->halte_ona,
                            'lat' => (float) $halte->lat,
                            'long' => (float) $halte->long,
                            'distance' => $distance,
                        ];
                    }
                }
            }

            // 2. System instruction untuk Gemini
            $systemInstruction =
                "Kamu adalah SAPA AI, asisten transportasi dan aksesibilitas Trans Jogja.\n\n"

                . "DATA HALTE TRANS JOGJA:\n"
                . json_encode($halteData, JSON_UNESCAPED_UNICODE)
                . "\n\n"
                . "HASIL ANALISIS LOKASI USER:\n"
                . json_encode([
                    'latitude_lokasi' => $destinationLat,
                    'longitude_lokasi' => $destinationLong,
                    'halte_terdekat' => $nearestHalte
                ], JSON_UNESCAPED_UNICODE)
                . "\n\n"

                . "KETERANGAN DATA:\n"
                . "- halte_ona = nama utama halte. Selalu gunakan ini sebagai nama halte.\n"
                . "- id_mapid = ID aktivitas MAPID.\n"
                . "- jalur = jalur Trans Jogja yang tersedia.\n"
                . "- kelas = kelas aksesibilitas halte.\n"
                . "- skor_final = rating/skor akhir aksesibilitas halte.\n"
                . "- lat = latitude halte.\n"
                . "- long = longitude halte.\n"
                . "- jenis_halt = jenis halte.\n"
                . "- fas_ = ketersediaan fasilitas.\n"
                . "- kondisi_ = kondisi fasilitas.\n"
                . "- skor_fas = skor fasilitas.\n"
                . "- skor_kondi = skor kondisi.\n"
                . "- skor_total = skor total.\n"
                . "- jenis_peny = jenis fasilitas penyeberangan.\n\n"

                . "ATURAN:\n"
                . "1. Jawab berdasarkan data yang tersedia di database.\n"
                . "2. Jangan mengarang nama halte, fasilitas, skor, atau koordinat.\n"
                . "3. Gunakan halte_ona sebagai nama halte, jangan gunakan halte_mapid.\n"
                . "4. Jika pengguna meminta halte tertentu, gunakan data halte yang paling sesuai.\n"
                . "5. Jika pengguna menanyakan halte aksesibel, gunakan kelas, skor_final, fasilitas, dan kondisi fasilitas sebagai pertimbangan.\n"
                . "6. Jika pengguna menanyakan lokasi halte tertentu, masukkan koordinat halte tersebut ke target_location.\n"
                . "7. target_location harus menggunakan format [longitude, latitude].\n"
                . "8. Jika tidak ada halte atau lokasi yang perlu ditampilkan di peta, target_location harus null.\n"
                . "9. Jika tidak ada filter kelas aksesibilitas, filter_kelas harus berupa array kosong.\n"
                . "10. Jawab dengan bahasa Indonesia yang ramah, singkat, dan mudah dipahami.\n\n"
                . "11. Jika pengguna menanyakan halte terdekat dari suatu lokasi, WAJIB gunakan hasil halte_terdekat dari analisis backend, jangan memilih halte lain.\n"
                . "12. Jika halte_terdekat tersedia, sebutkan nama halte tersebut dalam reply.\n"
                . "13. Jika pengguna meminta rekomendasi halte terdekat, reply harus memberi tahu pengguna terlebih dahulu bahwa halte tersebut direkomendasikan, lalu katakan bahwa pengguna akan diarahkan ke halte tersebut.\n"
                . "14. Jika halte_terdekat tersedia, target_location WAJIB menggunakan koordinat halte_terdekat dalam format [longitude, latitude].\n"

                . "OUTPUT WAJIB JSON VALID:\n"
                . "{\n"
                . '  "reply": "Jawaban untuk pengguna",' . "\n"
                . '  "target_location": [110.3604, -7.8011] atau null,' . "\n"
                . '  "zoom_level": 15.5 atau null,' . "\n"
                . '  "filter_kelas": []' . "\n"
                . "}";

            $isNearestHalteQuestion =
                preg_match(
                    '/halte.*(terdekat|dekat)|mana.*halte|halte.*mana/i',
                    $userMessage
                );

            // 3. Panggil Gemini API
            $response = Http::timeout(60)
                ->withHeaders([
                    'Content-Type' => 'application/json',
                    'x-goog-api-key' => $apiKey,
                ])
                ->post(
                    'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent',
                    [
                        'systemInstruction' => [
                            'parts' => [
                                [
                                    'text' => $systemInstruction
                                ]
                            ]
                        ],

                        'contents' => [
                            [
                                'role' => 'user',
                                'parts' => [
                                    [
                                        'text' => $userMessage
                                    ]
                                ]
                            ]
                        ],

                        'generationConfig' => [
                            'responseMimeType' => 'application/json'
                        ]
                    ]
                );

            // 4. Jika Gemini error
            if ($response->failed()) {
                Log::error('Gemini API Error', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);

                // FALLBACK HANYA UNTUK PERTANYAAN HALTE TERDEKAT
                if ($isNearestHalteQuestion && $nearestHalte) {
                    return response()->json([
                        'success' => true,
                        'reply' =>
                        'Kamu bisa ke ' . $nearestHalte['nama'] .
                            ' karena merupakan halte terdekat dari lokasi yang kamu tanyakan. ' .
                            'Setelah ini aku akan mengarahkan kamu ke halte tersebut.',
                        'map_action' => [
                            'center' => [
                                $nearestHalte['long'],
                                $nearestHalte['lat']
                            ],
                            'zoom' => 18,
                            'halteId' => $nearestHalte['id'],
                            'filter_kelas' => []
                        ]
                    ]);
                }

                // PERTANYAAN LAIN TETAP ERROR, TIDAK MENGARANG JAWABAN
                return response()->json([
                    'success' => false,
                    'message' => 'Gemini API sedang mencapai batas penggunaan. Silakan coba lagi beberapa saat.'
                ], 429);
            }

            // 5. Ambil response Gemini
            $jsonResult = $response->json();

            $aiRawText =
                $jsonResult['candidates'][0]['content']['parts'][0]['text']
                ?? '{}';

            $aiData = json_decode($aiRawText, true);

            // 6. Jika JSON Gemini tidak valid
            if (!is_array($aiData)) {

                Log::error('Gemini JSON Invalid', [
                    'raw_response' => $aiRawText
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Respons Gemini tidak dapat diproses.'
                ], 500);
            }

            // 7. Kirim hasil ke React
            return response()->json([
                'success' => true,

                'reply' => $aiData['reply']
                    ?? 'Maaf, saya tidak dapat memahami pertanyaan tersebut.',

                'map_action' => [
                    'center' => $aiData['target_location'] ?? null,
                    'zoom' => $aiData['zoom_level'] ?? null,
                    'filter_kelas' => $aiData['filter_kelas'] ?? []
                ]
            ]);
        } catch (\Exception $e) {

            Log::error('Chatbot Controller Exception', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan sistem.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
