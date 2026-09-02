// src/App.jsx
import React, { useState, useEffect } from 'react';
import MapComponent from './components/Map/MapComponent';
import { fetchSurveyActivities } from './services/mapidService';

export default function App() {
  const [halteData, setHalteData] = useState([]);

  useEffect(() => {
    async function loadData() {

      const polygonArea = {
        type: "Polygon",
        coordinates: [[
          [110.3600, -7.8000],
          [110.3750, -7.8000],
          [110.3750, -7.7850],
          [110.3600, -7.7850],
          [110.3600, -7.8000]
        ]]
      };

      const data = await fetchSurveyActivities(polygonArea);

      console.log("Data halte dari MAPID:", data);

      setHalteData(data);
    }

    loadData();
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Panel Samping Kiri (Sidebar) */}
      <aside className="w-96 bg-white shadow-2xl z-[1000] flex flex-col p-5 border-r border-gray-100">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-blue-600 tracking-tight">SAPA Trans Jogja</h1>
          <p className="text-xs font-medium text-gray-500 mt-1">
            WebGIS Spasial Inklusif Transportasi Massal DIY
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-900">
          <p className="font-semibold mb-1">Status Sistem:</p>
          <p className="text-xs text-blue-700">API Key MAPID aktif. Memuat data halte...</p>
        </div>
      </aside>

      {/* Area Peta Sebelah Kanan */}
      <main className="flex-1 relative">
        <MapComponent stops={halteData} />
      </main>
    </div>
  );
}