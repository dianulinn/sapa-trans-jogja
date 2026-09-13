import React from 'react';
import { LayoutDashboard, MapPin, BarChart2, Bus, Route, LogOut } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'peta', label: 'Peta Aksesibilitas', icon: MapPin },
    { id: 'statistik', label: 'Statistik', icon: BarChart2, width: 'w-[90px]' },
    { id: 'data-halte', label: 'Data Halte', icon: Bus },
    { id: 'data-rute', label: 'Data Rute', icon: Route },
  ];

  return (
    <aside className="w-64 bg-blue-600 text-white min-h-screen p-6 flex flex-col justify-between shrink-0">
      <div>
        {/* Tipografi "Sapa TransJogja" */}
        <h1 
          className="text-[18px] font-semibold text-white mb-8 px-2"
          style={{ fontFamily: 'Poppins, sans-serif' }}
        >
          Sapa TransJogja
        </h1>

        {/* Navigation Links */}
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive ? 'bg-white shadow-sm' : 'hover:bg-blue-500/50'
                }`}
                style={
                  isActive
                    ? {
                        color: '#0063F3',
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '16px',
                        fontWeight: 600,
                        lineHeight: '100%',
                      }
                    : {
                        color: '#FFFFFF',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '16px',
                        fontWeight: 500,
                        letterSpacing: '-0.064px',
                      }
                }
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className={item.width || ''}>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Button Keluar */}
      <button 
        className="flex items-center justify-between w-full px-4 py-3 text-white hover:bg-blue-500/50 rounded-xl transition-colors text-[16px] font-medium"
        style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-0.064px' }}
      >
        <span>Keluar</span>
        <LogOut className="w-4 h-4" />
      </button>
    </aside>
  );
}