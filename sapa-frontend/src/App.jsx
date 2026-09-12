import { useState, useRef } from "react";

import Home from "./pages/Home";
import Preference from "./pages/Preference";
import ChatPage from "./pages/ChatPage";
import MapPage from "./pages/MapPage";
import BottomNavbar from "./components/BottomNavbar";

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const mapRef = useRef(null);

  const handleNavigation = (tab) => {
    setActiveTab(tab);
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

  return (
    <div className="min-h-screen bg-white relative">

      {activeTab === "home" && (
        <Home
          onPreference={() => setActiveTab("preference")}
          onChat={() => setActiveTab("chat")}
          onMap={() => setActiveTab("map")}
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