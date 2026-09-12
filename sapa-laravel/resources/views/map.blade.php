<!DOCTYPE html>
<html>

<head>
    <title>MAPID Map</title>

    <link rel="stylesheet" href="https://unpkg.com/maplibre-gl@6.0.0/dist/maplibre-gl.css">

    <style>
        html,
        body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
        }

        #map {
            width: 100%;
            height: 100%;
            min-height: 100vh;
        }

        /* Attribution diperkecil untuk mini-map
        .maplibregl-ctrl-attrib {
            font-size: 8px !important;
            line-height: 11px !important;
            padding: 2px 5px !important;
            max-width: calc(100vw - 70px);
            white-space: normal;
            opacity: 0.8;
        }

        .maplibregl-ctrl-attrib a {
            font-size: 8px !important;
        } */

        /* @media (min-width: 768px) {
            .maplibregl-ctrl-attrib {
                font-size: 10px !important;
                line-height: 14px !important;
                max-width: none;
                white-space: nowrap;
            }

            .maplibregl-ctrl-attrib a {
                font-size: 10px !important;
            }
        } */
    </style>
</head>

<body>

    <div id="map"></div>

    <script type="module">
        import * as maplibregl from 'https://unpkg.com/maplibre-gl@6.0.0/dist/maplibre-gl.mjs';


        // ==========================================
        // AMBIL KOORDINAT DARI URL
        // ==========================================

        const urlParams = new URLSearchParams(window.location.search);

        const lat = Number(urlParams.get('lat'));
        const long = Number(urlParams.get('long'));

        const hasLocation =
            Number.isFinite(lat) &&
            Number.isFinite(long);


        // ==========================================
        // TENTUKAN CENTER DAN ZOOM
        // ==========================================

        const mapCenter = hasLocation ? [long, lat] : [110.3695, -7.7956];

        const mapZoom = hasLocation ?
            15 :
            12;


        // ==========================================
        // BUAT MAP
        // ==========================================

        const map = new maplibregl.Map({
            container: 'map',
            style: 'https://v2.basemap.mapid.io/styles/street-v2.0/style.json?key={{ env('MAPID_API_KEY') }}',
            center: hasLocation ? [long, lat] : [110.3695, -7.7956],
            zoom: hasLocation ? 18 : 12,
        });

        // ==========================================
        // DATA HALTE
        // ==========================================

        let allFeatures = [];

        // Filter yang datang sebelum source siap
        let pendingFilters = null;

        // Filter aktif
        let currentFilters = [];

        // ==========================================
        // MARKER HALTE YANG DIPILIH
        // ==========================================

        if (hasLocation) {

            new maplibregl.Marker({
                    color: '#EC2735'
                })
                .setLngLat([long, lat])
                .addTo(map);

        }


        // ==========================================
        // FUNGSI FILTER
        // ==========================================

        function applyFilter(filters) {
            currentFilters = filters;

            const source = map.getSource('haltes');

            if (!source) {

                pendingFilters = filters;

                console.log(
                    '⏳ Filter menunggu source haltes siap:',
                    filters
                );

                return;
            }


            const filteredFeatures = allFeatures.filter((feature) => {
                const kelas = feature.properties.kelas;

                // Jika semua filter dimatikan,
                // tampilkan semua halte dalam viewport
                if (filters.length === 0) {
                    return true;
                }

                return filters.some((filter) => {
                    if (filter === 'sangat') {
                        return kelas === 'Sangat Aksesibel';
                    }

                    if (filter === 'cukup') {
                        return kelas === 'Cukup Aksesibel';
                    }

                    if (filter === 'kurang') {
                        return kelas === 'Kurang Aksesibel';
                    }

                    if (filter === 'tidak') {
                        return (
                            kelas === 'Tidak Aksesibel' ||
                            kelas === 'Tidak tersedia' ||
                            !kelas
                        );
                    }

                    return false;
                });
            });


            updateVisibleHaltes();

            console.log(
                `🔎 Filter: ${
        filters.join(', ') || 'semua'
    }`
            );


            console.log(
                `🔎 Filter: ${
                    filters.join(', ') || 'semua'
                } | ${
                    filteredFeatures.length
                }/${
                    allFeatures.length
                } titik`
            );

        }

        // ==========================================
        // FILTER HALTE SESUAI AREA MAP
        // ==========================================
        function updateVisibleHaltes() {
            const source = map.getSource('haltes');

            if (!source || allFeatures.length === 0) {
                return;
            }

            const bounds = map.getBounds();

            const visibleFeatures = allFeatures.filter((feature) => {
                const [long, lat] = feature.geometry.coordinates;

                // Hanya tampilkan halte yang berada di viewport
                if (!bounds.contains([long, lat])) {
                    return false;
                }

                const kelas = feature.properties.kelas;

                // Jika tidak ada filter aksesibilitas,
                // semua halte dalam viewport ditampilkan
                if (currentFilters.length === 0) {
                    return true;
                }

                // Jika ada filter aksesibilitas,
                // halte harus memenuhi filter DAN berada dalam viewport
                return currentFilters.some((filter) => {
                    if (filter === 'sangat') {
                        return kelas === 'Sangat Aksesibel';
                    }

                    if (filter === 'cukup') {
                        return kelas === 'Cukup Aksesibel';
                    }

                    if (filter === 'kurang') {
                        return kelas === 'Kurang Aksesibel';
                    }

                    if (filter === 'tidak') {
                        return (
                            kelas === 'Tidak Aksesibel' ||
                            kelas === 'Tidak tersedia' ||
                            !kelas
                        );
                    }

                    return false;
                });
            });

            source.setData({
                type: 'FeatureCollection',
                features: visibleFeatures
            });

            window.parent.postMessage({
                    type: 'VISIBLE_HALTES',
                    ids: visibleFeatures.map((feature) => feature.properties.id)
                },
                '*'
            );

            console.log(
                `📍 Halte dalam viewport: ${visibleFeatures.length}/${allFeatures.length}`
            );
        }

        // ==========================================
        // MAP SELESAI LOADING
        // ==========================================

        map.on('load', async () => {
            map.resize();

            // ======================================
            // AMBIL DATA HALTE
            // ======================================

            try {

                const response = await fetch('/api/haltes');

                const result = await response.json();

                console.log(
                    'DATA HALTE DATABASE:',
                    result
                );


                const haltes = result.data || [];


                console.log(
                    'JUMLAH HALTE DATABASE:',
                    haltes.length
                );


                // ==================================
                // BUAT GEOJSON
                // ==================================

                const geojson = {

                    type: 'FeatureCollection',

                    features: haltes

                        .filter(
                            halte =>
                            halte.lat &&
                            halte.long
                        )

                        .map((halte) => ({

                            type: 'Feature',

                            geometry: {

                                type: 'Point',

                                coordinates: [

                                    Number(halte.long),

                                    Number(halte.lat)

                                ]

                            },

                            properties: {

                                id: halte.id,

                                nama: halte.nama,

                                id_mapid: halte.id_mapid,

                                kelas: halte.kelas,

                                color:

                                    halte.kelas ===
                                    'Sangat Aksesibel'

                                    ?
                                    '#1FC16B'

                                    :

                                    halte.kelas ===
                                    'Cukup Aksesibel'

                                    ?
                                    '#F5BD4F'

                                    :

                                    halte.kelas ===
                                    'Kurang Aksesibel'

                                    ?
                                    '#EC2735'

                                    :

                                    '#999999'

                            }

                        }))

                };


                allFeatures = geojson.features;


                // ==================================
                // SOURCE HALTE
                // ==================================

                map.addSource('haltes', {

                    type: 'geojson',

                    data: geojson

                });


                // ==================================
                // LAYER TITIK HALTE
                // ==================================

                map.addLayer({

                    id: 'haltes-point',

                    type: 'circle',

                    source: 'haltes',

                    paint: {

                        'circle-radius': 7,

                        'circle-color': [
                            'get',
                            'color'
                        ],

                        'circle-stroke-width': 2,

                        'circle-stroke-color': '#ffffff'

                    }

                });


                // ==================================
                // TERAPKAN FILTER YANG MENUNGGU
                // ==================================

                if (pendingFilters !== null) {

                    applyFilter(
                        pendingFilters
                    );

                    pendingFilters = null;

                }
                updateVisibleHaltes();


                console.log(
                    '✅ TITIK HALTE DATABASE BERHASIL DITAMPILKAN'
                );


            } catch (error) {

                console.error(
                    '❌ GAGAL MENGAMBIL DATA HALTE:',
                    error
                );

            }

        });

        // ==========================================
        // UPDATE HALTE SAAT MAP DIGESER / DI-ZOOM
        // ==========================================
        map.on('moveend', () => {
            updateVisibleHaltes();
        });


        // ==========================================
        // TERIMA FILTER DARI REACT
        // ==========================================

        window.addEventListener(
            'message',
            (event) => {

                // Hanya izinkan frontend kita
                if (
                    event.origin !==
                    'http://127.0.0.1:5173' &&
                    event.origin !==
                    'http://localhost:5173'
                ) {

                    return;

                }


                if (
                    event.data?.type !== 'FILTER_ACCESSIBILITY' &&
                    event.data?.type !== 'SEARCH_LOCATION'
                ) {

                    return;

                }

                if (event.data?.type === 'SEARCH_LOCATION') {
                    const lat = Number(event.data.lat);
                    const long = Number(event.data.long);

                    if (!Number.isFinite(lat) || !Number.isFinite(long)) return;

                    map.flyTo({
                        center: [long, lat],
                        zoom: 15,
                        essential: true
                    });

                    return;
                }


                const filters =
                    event.data.filters || [];


                console.log(
                    '📩 FILTER DITERIMA:',
                    filters
                );


                applyFilter(filters);

            }
        );
    </script>

</body>

</html>
