import React, { useState, useEffect } from 'react';
import { Search, Bell, MessageSquare, User } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

export default function Dashboard({ setActiveTab }) {
  const [halteList, setHalteList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const mapApiKey = import.meta.env.VITE_MAPID_BASEMAP_KEY;
  const mapBackendUrl = 'http://127.0.0.1:8000/map';
  
  const iframeSrc = `${mapBackendUrl}?lat=-7.7913247&long=110.3667762${mapApiKey ? `&key=${mapApiKey}` : ''}`;

  useEffect(() => {
    async function fetchHalteData() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('activity_utm_exp')
          .select('*');

        if (error) throw error;

        const formatted = (data || []).map((item, idx) => ({
          id: item.id || `HLT-${idx + 1}`,
          nama: item.nama_halte || item.nama || `Halte ${idx + 1}`,
          skor: Number(item.skor || item.score || (Math.random() * 4 + 1).toFixed(1)),
          keterangan: item.keterangan || 'Trotoar rusak, tidak ada guiding block, tidak ada jalan ramp',
          koordinat: { lat: item.lat || -7.78, lng: item.lng || 110.36 }
        }));

        setHalteList(formatted);
      } catch (err) {
        console.error('Error fetching Supabase data:', err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchHalteData();
  }, []);

  // Hitung KPI berbasis data dari Supabase
  const totalHalte = halteList.length || 500;
  const sangatAksesibel = halteList.filter(h => h.skor >= 4.0).length;
  const cukupAksesibel = halteList.filter(h => h.skor >= 2.5 && h.skor < 4.0).length;
  const kurangAksesibel = halteList.filter(h => h.skor >= 1.0 && h.skor < 2.5).length;
  const tidakTersedia = halteList.filter(h => h.skor < 1.0).length;

  const haltePerhatian = halteList
    .filter(h => h.skor < 2.5)
    .slice(0, 5);

  return (
    <div className="flex-1 bg-[#F6F6F6] min-h-screen p-8 flex flex-col space-y-6">
      
      {/* Top Header */}
      <div className="flex justify-between items-center">
        {/* Title Dashboard */}
        <h1 
          style={{
            color: '#292D32',
            fontFamily: 'Poppins, sans-serif',
            fontSize: '20px',
            fontWeight: 600,
            lineHeight: '100%',
          }}
        >
          Dashboard
        </h1>
        
        <div className="flex items-center space-x-4">
          {/* Fitur Search Bar Sesuai Figma */}
          <div 
            className="flex items-center px-4 space-x-3"
            style={{
              width: '375px',
              height: '42px',
              borderRadius: '10px',
              background: '#FFF',
              boxShadow: '0px 10px 40px 0px rgba(0, 0, 0, 0.04)',
            }}
          >
            <Search className="w-5 h-5 text-[#C4C4C4] shrink-0" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none focus:outline-none placeholder-[#C4C4C4]"
              style={{
                color: '#292929',
                fontFamily: 'Inter, sans-serif',
                fontSize: '12px',
                fontWeight: 400,
                lineHeight: '100%',
              }}
            />
          </div>

          {/* Action Buttons */}
          <button className="p-2 bg-white rounded-full text-gray-400 hover:text-gray-600 shadow-sm">
            <Bell className="w-5 h-5" />
          </button>
          <button className="p-2 bg-white rounded-full text-gray-400 hover:text-gray-600 shadow-sm">
            <MessageSquare className="w-5 h-5" />
          </button>
          <div className="w-9 h-9 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 shadow-sm">
            <User className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Row 1: KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        
        {/* Card Jumlah Total Halte (Persis Figma) */}
        <div 
          className="shadow-sm flex items-center"
          style={{
            borderRadius: '10px',
            background: '#FFF',
            padding: '32px',
            gap: '32px',
          }}
        >
          {/* Bar Chart Bars (Rectangle 44, 39, 43, 40) */}
          <div className="flex items-end gap-[6px] h-[80px] shrink-0">
            {/* Rectangle 44 - Dark Grey */}
            <div 
              style={{
                width: '15px',
                height: '29px',
                borderRadius: '12.158px',
                background: '#4D4D4D',
                flexShrink: 0,
              }}
            />
            {/* Rectangle 39 - Red */}
            <div 
              style={{
                width: '15px',
                height: '51px',
                borderRadius: '12.158px',
                background: '#EC2735',
                flexShrink: 0,
              }}
            />
            {/* Rectangle 43 - Yellow */}
            <div 
              style={{
                width: '14px',
                height: '67px',
                borderRadius: '12.158px',
                background: '#F5BD4F',
                flexShrink: 0,
              }}
            />
            {/* Rectangle 40 - Blue */}
            <div 
              style={{
                width: '15px',
                height: '80px',
                borderRadius: '12.158px',
                background: '#0063F3',
                flexShrink: 0,
              }}
            />
          </div>

          {/* Text Info */}
          <div className="flex flex-col justify-center">
            <p 
              style={{
                color: '#4D4D4D',
                fontFamily: 'Inter, sans-serif',
                fontSize: '19.453px',
                fontWeight: 500,
                lineHeight: '100%',
                marginBottom: '8px',
              }}
            >
              Jumlah Total
            </p>
            <div className="flex items-baseline space-x-2">
              <span 
                style={{
                  color: '#292929',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '48px',
                  fontWeight: 600,
                  lineHeight: '100%',
                }}
              >
                {loading ? '...' : totalHalte}
              </span>
              <span 
                style={{
                  color: '#292929',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '20px',
                  fontWeight: 600,
                  lineHeight: '100%',
                }}
              >
                halte
              </span>
            </div>
          </div>
        </div>

        {/* Card Aksesibel */}
        <div className="bg-white p-6 rounded-[10px] shadow-sm flex flex-col justify-between">
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-gray-800">{sangatAksesibel}</span>
            <span className="text-xs text-gray-400">Aksesibel</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">55,5% dari 100%</p>
        </div>

        {/* Card Cukup Aksesibel */}
        <div className="bg-white p-6 rounded-[10px] shadow-sm flex flex-col justify-between">
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-gray-800">{cukupAksesibel}</span>
            <span className="text-xs text-gray-400">Cukup Aksesibel</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">Dengan 55,5%</p>
        </div>

        {/* Card Kurang Aksesibel */}
        <div className="bg-white p-6 rounded-[10px] shadow-sm flex flex-col justify-between">
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-gray-800">{kurangAksesibel}</span>
            <span className="text-xs text-gray-400">Kurang Aksesibel</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">Dengan 55,5%</p>
        </div>

        {/* Card Tidak Tersedia */}
        <div className="bg-white p-6 rounded-[10px] shadow-sm flex flex-col justify-between">
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-gray-800">{tidakTersedia}</span>
            <span className="text-xs text-gray-400">Tidak Tersedia</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">Dengan 55,5%</p>
        </div>
      </div>

      {/* Row 2: Map Preview & Visitors Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-gray-800">Peta Aksesibilitas</h2>
            <button 
              onClick={() => setActiveTab('peta')}
              className="text-xs text-gray-400 hover:text-blue-600"
            >
              lihat selengkapnya
            </button>
          </div>
          
          <div className="h-64 bg-slate-100 rounded-xl relative overflow-hidden border border-gray-100">
            <iframe 
              src={iframeSrc}
              title="MAPID Map"
              className="w-full h-full border-0 relative z-10"
              allowFullScreen
            />
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4 text-xs text-gray-500">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>Sangat Aksesibel (4.0 - 5.0)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              <span>Kurang Aksesibel (1.0 - 2.4)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              <span>Cukup Aksesibel (2.5 - 3.9)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-gray-800"></span>
              <span>Tidak tersedia</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-gray-800">Total Pengunjung</h2>
            <button className="text-xs text-gray-400 hover:text-blue-600">lihat selengkapnya</button>
          </div>
          <div className="h-52 w-full flex items-end justify-between px-2 pt-4">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 300 120">
              <path
                d="M 0 80 Q 30 65 60 40 T 120 50 T 180 20 T 240 55 T 300 45"
                fill="none"
                stroke="#3B82F6"
                strokeWidth="3"
              />
            </svg>
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-2 px-1">
            <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
          </div>
        </div>
      </div>

      {/* Row 3: Attention Table */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-gray-800">Halte yang perlu diperhatikan</h2>
          <button 
            onClick={() => setActiveTab('data-halte')}
            className="text-xs text-gray-400 hover:text-blue-600"
          >
            lihat selengkapnya
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="border-b border-gray-100 text-gray-400 font-medium">
              <tr>
                <th className="pb-3">Nama halte</th>
                <th className="pb-3">Skor Aksesibilitas</th>
                <th className="pb-3">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {haltePerhatian.length > 0 ? (
                haltePerhatian.map((halte) => (
                  <tr key={halte.id} className="hover:bg-gray-50/50">
                    <td className="py-3 font-medium text-gray-700">{halte.nama}</td>
                    <td className="py-3">
                      <span className="inline-flex items-center">
                        <span className="w-2 h-2 rounded-full bg-amber-400 mr-2"></span>
                        {halte.skor}/5
                      </span>
                    </td>
                    <td className="py-3 text-gray-400">{halte.keterangan}</td>
                  </tr>
                ))
              ) : (
                <>
                  <tr>
                    <td className="py-3 font-medium text-gray-700">Halte ABC</td>
                    <td className="py-3"><span className="inline-flex items-center"><span className="w-2 h-2 rounded-full bg-amber-400 mr-2"></span>1.8/5</span></td>
                    <td className="py-3 text-gray-400">Trotoar rusak, tidak ada guiding block, tidak ada jalan ramp</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-medium text-gray-700">Halte DEF</td>
                    <td className="py-3"><span className="inline-flex items-center"><span className="w-2 h-2 rounded-full bg-amber-400 mr-2"></span>2.1/5</span></td>
                    <td className="py-3 text-gray-400">Trotoar rusak, tidak ada guiding block, tidak ada jalan ramp</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-medium text-gray-700">Halte GHI</td>
                    <td className="py-3"><span className="inline-flex items-center"><span className="w-2 h-2 rounded-full bg-amber-400 mr-2"></span>2.3/5</span></td>
                    <td className="py-3 text-gray-400">Trotoar rusak, tidak ada guiding block, tidak ada jalan ramp</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}