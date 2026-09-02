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

      style:
        `https://v2.basemap.mapid.io/styles/street-v2.0/style.json?key=${basemapKey}`,

      center: [110.3695, -7.7956],

      zoom: 13,

      pitch: 0,

      bearing: 0,
    });

    map.addControl(
      new maplibregl.NavigationControl(),
      "top-right"
    );

    map.on("load", () => {
      console.log("✅ MAPID MAP BERHASIL LOAD");
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
        height: "500px",
      }}
    />
  );
}

export default MapComponent;