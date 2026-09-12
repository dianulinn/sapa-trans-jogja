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
    </style>
</head>

<body>

    <div id="map"></div>

    <script type="module">
        import * as maplibregl from 'https://unpkg.com/maplibre-gl@6.0.0/dist/maplibre-gl.mjs';

        const map = new maplibregl.Map({
            container: 'map',
            style: 'https://v2.basemap.mapid.io/styles/street-v2.0/style.json?key={{ env('MAPID_API_KEY') }}',
            center: [110.3695, -7.7956],
            zoom: 12
        });

        map.on('load', async () => {
            map.resize();

            const response = await fetch('/api/haltes');
            const result = await response.json();

            console.log('DATA HALTE DATABASE:', result);

            const haltes = result.data || [];

            console.log('JUMLAH HALTE DATABASE:', haltes.length);

            const geojson = {
                type: 'FeatureCollection',
                features: haltes
                    .filter(halte => halte.lat && halte.long)
                    .map(halte => ({
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
                            nama: halte.halte_ona,
                            id_mapid: halte.id_ona,
                            kelas: halte.kelas,
                            color: halte.kelas === 'Sangat Aksesibel' ?
                                '#1FC16B' :
                                halte.kelas === 'Cukup Aksesibel' ?
                                '#F5BD4F' :
                                halte.kelas === 'Kurang Aksesibel' ?
                                '#EC2735' :
                                '#999999'
                        }
                    }))
            };

            map.addSource('haltes', {
                type: 'geojson',
                data: geojson
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

            console.log('✅ TITIK HALTE DATABASE BERHASIL DITAMPILKAN');
        });
    </script>

</body>

</html>
