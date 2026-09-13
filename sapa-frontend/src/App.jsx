import { useState, useRef, useEffect } from "react";

import Home from "./pages/Home";
import Preference from "./pages/Preference";
import ChatPage from "./pages/ChatPage";
import MapPage from "./pages/MapPage";
import BottomNavbar from "./components/BottomNavbar";

export default function App() {
  const [activeTab, setActiveTab] = useState("home");

  const [showSplash, setShowSplash] = useState(true); //splash screen

  const [mapAction, setMapAction] = useState(null);
  const mapRef = useRef(null);

  //splash screen selama 2.5 s
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const handleNavigation = (tab) => {
    setActiveTab(tab);
  };

  const handleOpenMap = (mapData) => {
    setMapAction(mapData);
    setActiveTab("map");
  };

  // Fungsi untuk merespons perintah pergerakan peta dari AI Chatbot
  const handleMapAction = (mapAction) => {
    // 1. Otomatis pindah ke halaman/tab peta jika sedang berada di tab lain
    if (activeTab !== "map") {
      setActiveTab("map");
    }

    // 2. Eksekusi flyTo ke lokasi tujuan
    setTimeout(() => {
      if (mapRef.current && mapAction.center) {
        mapRef.current.flyTo({
          center: mapAction.center, // [longitude, latitude]
          zoom: mapAction.zoom || 15.5,
          essential: true,
          speed: 1.2
        });
      }
    }, 150); // Delay kecil agar komponen MapPage ter-render sempurna
  };

  //tampilan splash
  if (showSplash) {
    return (
      <div
        className="w-full min-h-screen flex items-center justify-center"
        style={{
          background:
            "linear-gradient(359deg, #A1AAFF -235.18%, #7280FF -150.89%, #9EA7FC -73.51%, #F5F5F5 52.22%)",
        }}
      >
        <div
          className="relative w-full max-w-[402px] h-screen max-h-[815px] flex items-center justify-center"
          style={{
            background:
              "linear-gradient(359deg, #A1AAFF -235.18%, #7280FF -150.89%, #9EA7FC -73.51%, #F5F5F5 52.22%)",
          }}
        >
          <div className="text-center font-['Poppins'] text-[#0063F3]">
            <div className="text-[20px] font-medium leading-[26px]">
              SAPA
            </div>

            <div className="text-[20px] font-medium leading-[26px]">
              TRANS JOGJA
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative">

      {activeTab === "home" && (
        <Home
          onPreference={() => setActiveTab("preference")}
          onChat={() => setActiveTab("chat")}
          onMap={() => setActiveTab("map")}
          onOpenMap={handleOpenMap}
        />
      )}

      {activeTab === "preference" && (
        <Preference
          onBack={() => setActiveTab("home")}
        />
      )}

      {activeTab === "chat" && (
        <ChatPage
          onBack={() => setActiveTab("home")}
          onMapAction={handleMapAction}
        />
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
  );
}