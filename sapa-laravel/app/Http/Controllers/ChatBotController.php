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

            // 2. System instruction untuk Gemini
            $systemInstruction =
                "Kamu adalah SAPA AI, asisten transportasi dan aksesibilitas Trans Jogja.\n\n"

                . "DATA HALTE TRANS JOGJA:\n"
                . json_encode($halteData, JSON_UNESCAPED_UNICODE)
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

                . "OUTPUT WAJIB JSON VALID:\n"
                . "{\n"
                . '  "reply": "Jawaban untuk pengguna",' . "\n"
                . '  "target_location": [110.3604, -7.8011] atau null,' . "\n"
                . '  "zoom_level": 15.5 atau null,' . "\n"
                . '  "filter_kelas": []' . "\n"
                . "}";

            // 3. Panggil Gemini API
            $response = Http::timeout(60)
                ->withHeaders([
                    'Content-Type' => 'application/json',
                    'x-goog-api-key' => $apiKey,
                ])
                ->post(
                    'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent',
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

                return response()->json([
                    'success' => false,
                    'message' => 'Gemini API mengalami error.',
                    'error' => $response->json()
                ], 500);
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
