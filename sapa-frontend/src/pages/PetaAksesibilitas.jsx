import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, MapPin, CheckSquare, Square } from 'lucide-react';
// Sesuaikan path ini dengan struktur folder Anda!
import { supabase } from '../services/supabaseClient'; 

export default function PetaAksesibilitas() {
  const iframeRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [halteList, setHalteList] = useState([]);
  const [filteredHalte, setFilteredHalte] = useState([]);

  const [filters, setFilters] = useState({
    sangat: true,
    cukup: true,
    kurang: true,
    tidak: true,
  });

  const mapApiKey = import.meta.env?.VITE_MAPID_BASEMAP_KEY || '';
  const mapBackendUrl = 'http://127.0.0.1:8000/map';
  const iframeSrc = mapApiKey ? `${mapBackendUrl}?key=${mapApiKey}` : mapBackendUrl;

  useEffect(() => {
    async function fetchHalte() {
      try {
        if (!supabase) return;
        const { data, error } = await supabase.from('activity_utm_exp').select('*');
        if (error) throw error;
        setHalteList(data || []);
        setFilteredHalte(data || []);
      } catch (err) {
        console.error('Gagal mengambil data halte:', err);
      }
    }
    fetchHalte();
  }, []);

  useEffect(() => {
    const activeFilters = Object.keys(filters).filter((key) => filters[key]);
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: 'FILTER_ACCESSIBILITY', filters: activeFilters },
        '*'
      );
    }
  }, [filters]);

  const toggleFilter = (key) => {
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSelectHalte = (halte) => {
    const lat = halte?.lat || halte?.koordinat?.lat;
    const long = halte?.lng || halte?.long || halte?.koordinat?.lng;

    if (lat && long && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: 'SEARCH_LOCATION', lat: Number(lat), long: Number(long) },
        '*'
      );
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredHalte(halteList);
    } else {
      setFilteredHalte(
        halteList.filter((h) =>
          (h?.nama_halte || h?.nama || '').toLowerCase().includes(query.toLowerCase())
        )
      );
    }
  };

  return (
    <div className="flex-1 bg-gray-50 min-h-screen p-6 flex flex-col space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Peta Aksesibilitas</h1>
          <p className="text-xs text-gray-400 mt-1">
            Visualisasi dan pemetaan tingkat aksesibilitas halte
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        {/* Controls Panel */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-3">
            <div className="flex items-center space-x-2 border-b border-gray-100 pb-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <h3 className="font-bold text-gray-700 text-sm">Filter Aksesibilitas</h3>
            </div>

            <div className="space-y-1 text-xs">
              {[
                { key: 'sangat', label: 'Sangat Aksesibel', color: 'bg-emerald-500' },
                { key: 'cukup', label: 'Cukup Aksesibel', color: 'bg-amber-400' },
                { key: 'kurang', label: 'Kurang Aksesibel', color: 'bg-red-500' },
                { key: 'tidak', label: 'Tidak Tersedia', color: 'bg-gray-400' },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => toggleFilter(item.key)}
                  className="flex items-center justify-between w-full p-2 rounded-xl hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-2">
                    <span className={`w-3 h-3 rounded-full ${item.color}`}></span>
                    <span className="font-medium text-gray-700">{item.label}</span>
                  </div>
                  {filters[item.key] ? (
                    <CheckSquare className="w-4 h-4 text-blue-600" />
                  ) : (
                    <Square className="w-4 h-4 text-gray-300" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex-1 flex flex-col min-h-[300px]">
            <div className="relative mb-3">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Cari nama halte..."
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs focus:outline-none"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 max-h-[350px]">
              {filteredHalte.length > 0 ? (
                filteredHalte.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    onClick={() => handleSelectHalte(item)}
                    className="p-3 rounded-xl border border-gray-100 hover:bg-blue-50/50 cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-blue-500" />
                      <p className="text-xs font-semibold text-gray-700">
                        {item.nama_halte || item.nama || `Halte ${idx + 1}`}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-center text-gray-400 py-4">Tidak ada halte</p>
              )}
            </div>
          </div>
        </div>

        {/* Iframe Peta */}
        <div className="lg:col-span-8 bg-white p-2 rounded-2xl shadow-sm border border-gray-100 min-h-[500px]">
          <iframe
            ref={iframeRef}
            src={iframeSrc}
            title="Peta Aksesibilitas MAPID"
            className="w-full h-full rounded-xl border-0"
          />
        </div>
      </div>
    </div>
  );
}