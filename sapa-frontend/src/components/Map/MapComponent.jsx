import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

function MapComponent() {
  const mapContainer = useRef(null);

  useEffect(() => {
    const basemapKey = import.meta.env.VITE_MAPID_BASEMAP_KEY;

    if (!basemapKey) {
      console.error("❌ MAPID BASEMAP API KEY TIDAK ADA");
      return;
    }

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://v2.basemap.mapid.io/styles/street-v2.0/style.json?key=${basemapKey}`,
      center: [110.3695, -7.7956],
      zoom: 13,
      pitch: 0,
      bearing: 0,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    map.on("load", async () => {
      console.log("✅ MAPID MAP BERHASIL LOAD");

      try {
        // 1. Fetch Data Garis Jalur Bus dari Laravel
        const resJalur = await fetch("http://127.0.0.1:8000/api/map/jalur");
        const dataJalur = await resJalur.json();

        map.addSource("jalur-source", {
          type: "geojson",
          data: dataJalur,
        });

        map.addLayer({
          id: "jalur-layer",
          type: "line",
          source: "jalur-source",
          paint: {
            "line-color": "#007cbf",
            "line-width": 3,
            "line-opacity": 0.8,
          },
        });

        // 2. Fetch Data Titik Halte dari Laravel
        const resHalte = await fetch("http://127.0.0.1:8000/api/map/halte");
        const dataHalte = await resHalte.json();

        map.addSource("halte-source", {
          type: "geojson",
          data: dataHalte,
        });

        map.addLayer({
          id: "halte-layer",
          type: "circle",
          source: "halte-source",
          paint: {
            "circle-radius": 6,
            "circle-stroke-width": 1.5,
            "circle-stroke-color": "#ffffff",
            // Pewarnaan dinamis berdasarkan kelas aksesibilitas
            "circle-color": [
              "match",
              ["get", "kelas"],
              "Sangat Aksesibel", "#2ea44f", // Hijau
              "Cukup Aksesibel",  "#0969da", // Biru
              "Kurang Aksesibel", "#bf8700", // Kuning
              "#cf222e"                      // Merah (Default/Tidak Tersedia)
            ],
          },
        });

        // 3. Popup saat Titik Halte Diklik
        map.on("click", "halte-layer", (e) => {
          const coordinates = e.features[0].geometry.coordinates.slice();
          const p = e.features[0].properties;

          new maplibregl.Popup()
            .setLngLat(coordinates)
            .setHTML(`
              <div style="font-family: sans-serif; font-size: 12px; color: #333;">
                <h4 style="margin: 0 0 5px 0;">${p.title}</h4>
                <p style="margin: 2px 0;"><b>Aksesibilitas:</b> ${p.kelas || "N/A"}</p>
                <p style="margin: 2px 0;"><b>Jalur Bus:</b> ${p.jalur || "-"}</p>
              </div>
            `)
            .addTo(map);
        });

        // Ubah kursor jadi pointer saat melayang di atas halte
        map.on("mouseenter", "halte-layer", () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", "halte-layer", () => {
          map.getCanvas().style.cursor = "";
        });

      } catch (error) {
        console.error("❌ GAGAL MEMUAT DATA DARI LARAVEL:", error);
      }
    });

    map.on("error", (e) => {
      console.error("❌ MAP ERROR:", e.error || e);
    });

    return () => {
      map.remove();
    };
  }, []);

  return (
    <div
      ref={mapContainer}
      style={{
        width: "100%",
        height: "100%",
      }}
    />
  );
}

export default MapComponent;