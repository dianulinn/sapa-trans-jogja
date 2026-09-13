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

        #map-container {
            position: relative;
            width: 100%;
            height: 100%;
            min-height: 100vh;
        }

        #map {
            width: 100%;
            height: 100%;
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        #map-loading {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #F7F9FC;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 999;
            transition: opacity 0.3s ease;
        }

        #map-loading .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #E0E0E0;
            border-top-color: #3E81F3;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
            to {
                transform: rotate(360deg);
            }
        }

        .maplibregl-ctrl-attrib {
            font-size: 0;
        }

        .maplibregl-ctrl-attrib .maplibregl-ctrl-attrib-inner {
            font-size: 0;
        }

        .maplibregl-ctrl-attrib button {
            font-size: 14px !important;
        }
    </style>
</head>

<body>

    <div id="map-container">
        <div id="map"></div>
        <div id="map-loading">
            <div class="spinner"></div>
        </div>
    </div>

    <script type="module">
        import * as maplibregl from 'https://unpkg.com/maplibre-gl@6.0.0/dist/maplibre-gl.mjs';

        // ==========================================
        // AMBIL KOORDINAT DARI URL
        // ==========================================
        const urlParams = new URLSearchParams(window.location.search);

        const rawLat = urlParams.get('lat');
        const rawLong = urlParams.get('long');

        const hasLocation =
            rawLat !== null &&
            rawLong !== null &&
            !isNaN(Number(rawLat)) &&
            !isNaN(Number(rawLong));

        const lat = hasLocation ? Number(rawLat) : null;
        const long = hasLocation ? Number(rawLong) : null;


        // ==========================================
        // TENTUKAN CENTER DAN ZOOM
        // ==========================================
        const mapCenter = hasLocation ? [long, lat] : [110.3667762, -7.7913247];
        const mapZoom = hasLocation ? 18 : 13;

        // Dynamic key fetch from URL or Laravel ENV
        const apiKey = "{{ request('key', env('MAPID_API_KEY')) }}";

        // ==========================================
        // BUAT MAP
        // ==========================================
        const map = new maplibregl.Map({
            container: 'map',
            style: `https://v2.basemap.mapid.io/styles/street-v2.0/style.json?key=${apiKey}`,
            center: mapCenter,
            zoom: mapZoom,
        });

        // Resize otomatis jika dimasukkan ke dalam iframe
        window.addEventListener('resize', () => map.resize());

        function hideLoading() {
            const mapEl = document.getElementById('map');
            const loadingEl = document.getElementById('map-loading');

            mapEl.style.opacity = '1';

            if (loadingEl) {
                loadingEl.style.opacity = '0';
                setTimeout(() => loadingEl.remove(), 300);
            }
        }

        setTimeout(hideLoading, 5000);

        // ==========================================
        // DATA HALTE & FILTER DEFAULT
        // ==========================================
        let allFeatures = [];
        let pendingFilters = null;
        // Default menampilkan semua kategori saat pertama muat
        let currentFilters = ['sangat', 'cukup', 'kurang', 'tidak'];

        if (hasLocation) {
            new maplibregl.Marker({ color: '#EC2735' })
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
                return;
            }

            updateVisibleHaltes();
        }

        function updateVisibleHaltes() {
            const source = map.getSource('haltes');

            if (!source || allFeatures.length === 0) return;

            const bounds = map.getBounds();

            const visibleFeatures = allFeatures.filter((feature) => {
                const [long, lat] = feature.geometry.coordinates;

                if (!bounds.contains([long, lat])) return false;

                // Jika filter dari parent belum ada/kosong, tampilkan semua
                if (currentFilters.length === 0) return true;

                const kelas = feature.properties.kelas;

                return currentFilters.some((filter) => {
                    if (filter === 'sangat') return kelas === 'Sangat Aksesibel';
                    if (filter === 'cukup') return kelas === 'Cukup Aksesibel';
                    if (filter === 'kurang') return kelas === 'Kurang Aksesibel';
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

            try {
                window.parent.postMessage({
                    type: 'VISIBLE_HALTES',
                    ids: visibleFeatures.map((f) => Number(f.properties.id))
                }, '*');
            } catch (e) {
                console.error(e);
            }
        }

        // ==========================================
        // MAP SELESAI LOADING
        // ==========================================
        map.on('load', async () => {
            map.resize();

            try {
                const response = await fetch('/api/haltes');
                const result = await response.json();
                const haltes = result.data || [];

                const geojson = {
                    type: 'FeatureCollection',
                    features: haltes
                        .filter(h => h.lat && h.long)
                        .map((halte) => ({
                            type: 'Feature',
                            geometry: {
                                type: 'Point',
                                coordinates: [Number(halte.long), Number(halte.lat)]
                            },
                            properties: {
                                id: halte.id,
                                nama: halte.nama,
                                id_mapid: halte.id_mapid,
                                kelas: halte.kelas,
                                color: halte.kelas === 'Sangat Aksesibel' ? '#1FC16B' :
                                       halte.kelas === 'Cukup Aksesibel' ? '#F5BD4F' :
                                       halte.kelas === 'Kurang Aksesibel' ? '#EC2735' : '#999999'
                            }
                        }))
                };

                allFeatures = geojson.features;

                if (!hasLocation && allFeatures.length > 0) {
                    const total = allFeatures.length;
                    const centerLong = allFeatures.reduce((s, f) => s + f.geometry.coordinates[0], 0) / total;
                    const centerLat = allFeatures.reduce((s, f) => s + f.geometry.coordinates[1], 0) / total;

                    map.flyTo({
                        center: [centerLong, centerLat],
                        zoom: 13,
                        essential: true
                    });
                }

                map.addSource('haltes', {
                    type: 'geojson',
                    data: { type: 'FeatureCollection', features: [] }
                });

                map.addLayer({
                    id: 'haltes-point',
                    type: 'circle',
                    source: 'haltes',
                    paint: {
                        'circle-radius': 7,
<<<<<<< HEAD
                        'circle-color': ['get', 'color'],
                        'circle-stroke-width': 2,
                        'circle-stroke-color': '#ffffff'
                    }
=======
                        'circle-color': [
                            'get',
                            'color'
                        ],
                        'circle-stroke-width': 2,
                        'circle-stroke-color': '#ffffff'
                    }
                });

                // ==========================================
                // DATA RUTE TRANS JOGJA
                // ==========================================

                const responseJalur = await fetch('/api/map/jalur');
                const resultJalur = await responseJalur.json();

                console.log('🚌 DATA RUTE TRANS JOGJA:', resultJalur);

                map.addSource('jalur-trans-jogja', {
                    type: 'geojson',
                    data: resultJalur
                });

                map.addLayer({
                    id: 'jalur-trans-jogja-line',
                    type: 'line',
                    source: 'jalur-trans-jogja',
                    layout: {
                        'line-join': 'round',
                        'line-cap': 'round',
                        'visibility': 'none'
                    },
                    paint: {
                        'line-color': [
                            'match',
                            ['get', 'jalur'],
                            '1A', '#E91E63',
                            '1B', '#9C27B0',
                            '2A', '#FF9800',
                            '2B', '#795548',
                            '3A', '#4CAF50',
                            '3B', '#00BCD4',
                            '4A', '#F44336',
                            '5A', '#8BC34A',
                            '6A', '#FF5722',
                            '7', '#673AB7',
                            '8', '#FFC107',
                            '9', '#009688',
                            '#666666'
                        ],
                        'line-width': 4,
                        'line-opacity': 0.85
                    }
                });

                // KLIK TITIK HALTE
                map.on('click', 'haltes-point', (e) => {
                    const feature = e.features?.[0];

                    if (!feature) return;

                    window.parent.postMessage({
                            type: 'HALTE_CLICKED',
                            id: Number(feature.properties.id)
                        },
                        '*'
                    );
                });

                // Cursor jadi pointer saat diarahkan ke titik halte
                map.on('mouseenter', 'haltes-point', () => {
                    map.getCanvas().style.cursor = 'pointer';
                });

                map.on('mouseleave', 'haltes-point', () => {
                    map.getCanvas().style.cursor = '';
>>>>>>> 46df0fc (Update SAPA TransJogja 1254)
                });

                if (pendingFilters !== null) {
                    applyFilter(pendingFilters);
                    pendingFilters = null;
                }

                updateVisibleHaltes();
                map.once('idle', hideLoading);

            } catch (error) {
                console.error('❌ GAGAL MENGAMBIL DATA HALTE:', error);
                hideLoading();
            }
        });

        map.on('moveend', updateVisibleHaltes);

        // ==========================================
        // TERIMA FILTER DARI REACT
        // ==========================================
        window.addEventListener('message', (event) => {
            if (event.data?.type === 'SEARCH_LOCATION') {
                const lat = Number(event.data.lat);
                const long = Number(event.data.long);
                if (Number.isFinite(lat) && Number.isFinite(long)) {
                    map.flyTo({ center: [long, lat], zoom: 15, essential: true });
                }
<<<<<<< HEAD
                return;
=======

                if (
                    event.data?.type !== 'FILTER_ACCESSIBILITY' &&
                    event.data?.type !== 'SEARCH_LOCATION' &&
                    event.data?.type !== 'USER_LOCATION' &&
                    event.data?.type !== 'ROUTE_TO_HALTE'
                ) {
                    return;
                }

                // User Location di Map
                if (event.data?.type === 'USER_LOCATION') {
                    const lat = Number(event.data.lat);
                    const long = Number(event.data.long);

                    if (!Number.isFinite(lat) || !Number.isFinite(long)) {
                        return;
                    }

                    new maplibregl.Marker({
                            color: '#0063F3'
                        })
                        .setLngLat([long, lat])
                        .addTo(map);

                    console.log('📍 POSISI PENGGUNA DI MAP:', lat, long);
                }

                // console.log("📨 PESAN DARI REACT:", event.data);

                // if (event.data?.type === 'SEARCH_LOCATION') {
                //     const lat = Number(event.data.lat);
                //     const long = Number(event.data.long);

                //     if (!Number.isFinite(lat) || !Number.isFinite(long)) return;

                //     map.flyTo({
                //         center: [long, lat],
                //         zoom: 15,
                //         essential: true
                //     });

                //     return;
                // }

                if (event.data?.type === 'USER_LOCATION') {
                    const lat = Number(event.data.lat);
                    const long = Number(event.data.long);

                    if (!Number.isFinite(lat) || !Number.isFinite(long)) {
                        return;
                    }

                    new maplibregl.Marker({
                            color: '#0063F3'
                        })
                        .setLngLat([long, lat])
                        .addTo(map);

                    map.flyTo({
                        center: [long, lat],
                        zoom: 16,
                        essential: true
                    });

                    console.log('📍 LOKASI PENGGUNA DITERIMA MAP:', lat, long);

                    return;
                }

                if (event.data?.type === 'ROUTE_TO_HALTE') {
                    const userLat = Number(event.data.userLat);
                    const userLong = Number(event.data.userLong);
                    const halteLat = Number(event.data.halteLat);
                    const halteLong = Number(event.data.halteLong);

                    if (
                        !Number.isFinite(userLat) ||
                        !Number.isFinite(userLong) ||
                        !Number.isFinite(halteLat) ||
                        !Number.isFinite(halteLong)
                    ) {
                        console.error('❌ Koordinat tidak valid');
                        return;
                    }

                    const url =
                        `https://routing.openstreetmap.de/routed-foot/route/v1/driving/` +
                        `${userLong},${userLat};${halteLong},${halteLat}` +
                        `?overview=full&geometries=geojson&steps=true&alternatives=true`;

                    console.log('🚶 REQUEST OSRM:', url);

                    fetch(url)
                        .then((response) => response.json())
                        .then((result) => {
                            console.log('🚶 HASIL OSRM:', result);

                            console.log('JUMLAH RUTE:', result.routes.length);

                            result.routes.forEach((r, i) => {
                                console.log(
                                    `RUTE ${i + 1}:`,
                                    (r.distance / 1000).toFixed(2),
                                    'km -',
                                    Math.round(r.duration / 60),
                                    'menit'
                                );
                            });

                            if (result.code !== 'Ok' || !result.routes?.length) {
                                console.error('❌ Rute tidak ditemukan:', result);
                                return;
                            }

                            const route = result.routes[0];

                            // GAMBAR RUTE DI MAP
                            const routeGeoJSON = {
                                type: 'Feature',
                                properties: {},
                                geometry: route.geometry
                            };

                            if (map.getSource('walking-route')) {
                                map.getSource('walking-route').setData(routeGeoJSON);
                            } else {
                                map.addSource('walking-route', {
                                    type: 'geojson',
                                    data: routeGeoJSON
                                });

                                map.addLayer({
                                    id: 'walking-route-line',
                                    type: 'line',
                                    source: 'walking-route',
                                    layout: {
                                        'line-join': 'round',
                                        'line-cap': 'round'
                                    },
                                    paint: {
                                        'line-color': '#3E81F3',
                                        'line-width': 5,
                                        'line-opacity': 0.9
                                    }
                                });
                            }

                            // ZOOM KE SELURUH RUTE
                            const coordinates = route.geometry.coordinates;

                            const bounds = coordinates.reduce(
                                (bounds, coordinate) => bounds.extend(coordinate),
                                new maplibregl.LngLatBounds(coordinates[0], coordinates[0])
                            );

                            map.fitBounds(bounds, {
                                padding: 80,
                                maxZoom: 17
                            });

                            console.log(
                                '📏 Jarak:',
                                (route.distance / 1000).toFixed(2),
                                'km'
                            );

                            console.log(
                                '⏱️ Waktu:',
                                Math.round(route.duration / 60),
                                'menit'
                            );
                        })
                        .catch((error) => {
                            console.error('❌ GAGAL MENGAMBIL RUTE OSRM:', error);
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

>>>>>>> 46df0fc (Update SAPA TransJogja 1254)
            }

            if (event.data?.type === 'FILTER_ACCESSIBILITY') {
                applyFilter(event.data.filters || []);
            }
        });
    </script>
</body>
</html>
