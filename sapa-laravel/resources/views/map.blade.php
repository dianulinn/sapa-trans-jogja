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
            to { transform: rotate(360deg); }
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
        const lat = Number(urlParams.get('lat'));
        const long = Number(urlParams.get('long'));

        const hasLocation = Number.isFinite(lat) && Number.isFinite(long);

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
                        'circle-color': ['get', 'color'],
                        'circle-stroke-width': 2,
                        'circle-stroke-color': '#ffffff'
                    }
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
                return;
            }

            if (event.data?.type === 'FILTER_ACCESSIBILITY') {
                applyFilter(event.data.filters || []);
            }
        });
    </script>
</body>
</html>
