import { useState, useRef } from "react";

import Home from "./pages/Home";
import Preference from "./pages/Preference";
import ChatPage from "./pages/ChatPage";
import MapPage from "./pages/MapPage";
import Dashboard from "./pages/Dashboard";
import PetaAksesibilitas from "./pages/PetaAksesibilitas";
import Sidebar from "./components/Sidebar";
import BottomNavbar from "./components/BottomNavbar";

export default function App() {
  const isUrlAdmin = window.location.pathname.startsWith("/adminers");
  
  const [activeTab, setActiveTab] = useState(isUrlAdmin ? "dashboard" : "home");
  const [mapAction, setMapAction] = useState(null);
  const mapRef = useRef(null);

  const handleNavigation = (tab) => {
    setActiveTab(tab);
  };

  const handleOpenMap = (mapData) => {
    setMapAction(mapData);
    setActiveTab("map");
  };

  const handleMapAction = (mapAction) => {
    if (activeTab !== "map") {
      setActiveTab("map");
    }

    setTimeout(() => {
      if (mapRef.current && mapAction.center) {
        mapRef.current.flyTo({
          center: mapAction.center,
          zoom: mapAction.zoom || 15.5,
          essential: true,
          speed: 1.2
        });
      }
    }, 150);
  };

  // ID disamakan persis dengan Sidebar.jsx: 'dashboard', 'peta', 'statistik', 'data-halte', 'data-rute'
  const isAdminTab = [
    "dashboard", 
    "peta", 
    "statistik", 
    "data-halte", 
    "data-rute"
  ].includes(activeTab);

  return (
    <div className="min-h-screen bg-white relative flex">

      {/* ==================== TAMPILAN ADMIN (/adminers) ==================== */}
      {isAdminTab ? (
        <>
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

          <main className="flex-1 overflow-y-auto bg-gray-50">
            {activeTab === "dashboard" && <Dashboard setActiveTab={setActiveTab} />}
            
            {/* ID 'peta' memanggil komponen PetaAksesibilitas */}
            {activeTab === "peta" && <PetaAksesibilitas />}

            {activeTab === "statistik" && (
              <div className="p-8 font-bold text-gray-700">Halaman Statistik</div>
            )}
            {activeTab === "data-halte" && (
              <div className="p-8 font-bold text-gray-700">Halaman Data Halte</div>
            )}
            {activeTab === "data-rute" && (
              <div className="p-8 font-bold text-gray-700">Halaman Data Rute</div>
            )}
          </main>
        </>
      ) : (
        /* ==================== TAMPILAN USER BIASA ==================== */
        <div className="flex-1">
          {activeTab === "home" && (
            <Home
              onPreference={() => setActiveTab("preference")}
              onChat={() => setActiveTab("chat")}
              onMap={() => setActiveTab("map")}
              onOpenMap={handleOpenMap}
            />
          )}

          {activeTab === "preference" && (
            <Preference onBack={() => setActiveTab("home")} />
          )}

          {activeTab === "chat" && (
            <ChatPage onBack={() => setActiveTab("home")} onMapAction={handleMapAction} />
          )}

          {activeTab === "map" && (
            <MapPage
              ref={mapRef}
              onBack={() => setActiveTab("home")}
              onMapAction={handleMapAction}
              mapAction={mapAction}
            />
          )}

          {activeTab !== "preference" && (
            <BottomNavbar
              activeTab={activeTab}
              handleNavigation={handleNavigation}
            />
          )}
        </div>
      )}

    </div>
  );
}