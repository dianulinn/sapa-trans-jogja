import React, { useState } from "react";
import BottomNavbar from "../components/BottomNavbar";
import sapaLogo from "../assets/sapa ai logo.png";

export default function Home({ onPreference, onChat }) {
    // Simpan Preferensi
    const savedPreferences = JSON.parse(
        localStorage.getItem("sapaPreferences") || "null"
    );
    // Greeting
    const getGreeting = () => {
        const hour = new Date().getHours();

        if (hour >= 5 && hour < 11) {
            return "Selamat pagi!";
        }

        if (hour >= 11 && hour < 15) {
            return "Selamat siang!";
        }

        if (hour >= 15 && hour < 18) {
            return "Selamat sore!";
        }

        return "Selamat malam!";
    };

    // ==========================================
    // AREA MOCK DATA (Nanti diganti data dari API)
    // ==========================================
    const mockRouteRecommendations = [
        { id: "1A", name: "Rute 1A", image: "https://maps.gstatic.com/tactile/basemap_styler/v6/roadmap_vt.png" },
        { id: "1B", name: "Rute 1B", image: "https://maps.gstatic.com/tactile/basemap_styler/v6/roadmap_vt.png" },
        { id: "2A", name: "Rute 2A", image: "https://maps.gstatic.com/tactile/basemap_styler/v6/roadmap_vt.png" }
    ];

    // ==========================================
    // AREA STATE UI 
    // ==========================================
    const [destination, setDestination] = useState("");
    const [activeTab, setActiveTab] = useState("home");

    // ==========================================
    // AREA INTEGRASI BACKEND (PLACEHOLDERS)
    // Backend dev tinggal masukkan logic API disini
    // ==========================================

    // Handler Navigasi Bawah
    const handleNavigation = (tabId) => {
        setActiveTab(tabId);
        // TODO Backend: Tambahkan routing disini misal router.push(`/${tabId}`)
    };

    // Handler Ketik Pencarian Lokasi
    const handleSearchChange = (e) => {
        setDestination(e.target.value);
        // TODO Backend: Tambahkan logic auto-complete API atau debounce search disini
    };

    // Handler Tombol Notifikasi di Header
    const handleNotificationClick = () => {
        alert("TODO Backend: Navigasi ke halaman Notifikasi / Buka Modal Notifikasi");
    };

    // Handler Tombol Preferensi Mobilitas
    const handleSetPreference = () => {
        alert("TODO Backend: Buka bottom sheet / halaman pengaturan preferensi rute");
    };

    // Handler Klik Rekomendasi Rute
    const handleRouteClick = (routeId) => {
        alert(`TODO Backend: Fetch data detail rute untuk ID: ${routeId} dan buka Map`);
    };

    // ==========================================
    // RENDER VIEW (Pure UI)
    // ==========================================
    return (
        <div className="h-screen overflow-y-auto bg-white md:bg-[#F7F9FC] font-['Poppins']">
            {/* Wrapper utama - Responsif */}
            <div className="mx-auto w-full max-w-[1200px] min-h-screen bg-white pb-24 md:shadow-sm">

                {/* HEADER SECTION */}
                <header className="flex items-center justify-between px-5 pt-8 pb-4 md:px-10">
                    <h1 className="text-[16px] font-semibold text-[#333333]">
                        {getGreeting()}
                    </h1>

                    {/* NOTIFICATION BUTTON */}
                    <button
                        onClick={handleNotificationClick}
                        className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white transition-colors hover:bg-gray-50"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="70"
                            height="70"
                            viewBox="0 0 36 36"
                            fill="none"
                        >
                            <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M17.9987 11.0801C14.9755 11.0801 12.8684 13.4573 12.8684 15.5905C12.8684 17.3956 12.3693 18.2299 11.9281 18.9662C11.5743 19.5574 11.2949 20.0245 11.2949 21.0395C11.4394 22.6769 12.5163 23.5373 17.9987 23.5373C23.4509 23.5373 24.5616 22.6387 24.7052 20.983C24.7026 20.0245 24.4232 19.5574 24.0694 18.9662C23.6282 18.2299 23.1291 17.3956 23.1291 15.5905C23.1291 13.4573 21.0219 11.0801 17.9987 11.0801ZM17.9988 24.8397C13.954 24.8397 10.2984 24.5532 10 21.095C9.99742 19.6642 10.4325 18.9367 10.8166 18.2959C11.205 17.6465 11.5709 17.0344 11.5709 15.5905C11.5709 12.7836 14.1538 9.77783 17.9988 9.77783C21.8437 9.77783 24.4266 12.7836 24.4266 15.5905C24.4266 17.0344 24.7925 17.6465 25.1809 18.2959C25.565 18.9367 26.0001 19.6642 26.0001 21.0395C25.6982 24.5531 22.0435 24.8397 17.9988 24.8397Z"
                                fill="#9B9B9B"
                            />
                            <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M17.9566 28.4446H17.9549C16.9852 28.4438 16.0674 28.0149 15.3711 27.2361C15.1315 26.9695 15.1531 26.5571 15.4195 26.3175C15.686 26.0761 16.096 26.0978 16.3356 26.3661C16.7837 26.8671 17.3589 27.1423 17.9557 27.1423H17.9566C18.5561 27.1423 19.1339 26.8671 19.5828 26.3652C19.8233 26.0987 20.2333 26.077 20.4989 26.3175C20.7653 26.558 20.7869 26.9704 20.5473 27.2369C19.8484 28.0157 18.9289 28.4446 17.9566 28.4446Z"
                                fill="#9B9B9B"
                            />
                        </svg>
                    </button>
                </header>

                <main className="px-5 md:px-10">
                    <section className="mt-2">
                        <h2 className="text-[24px] font-medium leading-[34px] text-[#333333]">
                            Mau ke mana hari ini?
                        </h2>
                    </section>

                    {/* SEARCH INPUT SECTION */}
                    <div className="mt-4 w-full">
                        <div className="h-[48px] w-full md:max-w-[600px] flex items-center gap-3 rounded-[12px] border border-[#EAEAEA] bg-white px-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0">
                                <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke="#9B9B9B" strokeWidth="1.5" />
                                <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 5.02944 7.02944 1 12 1C16.9706 1 21 5.02944 21 10Z" stroke="#9B9B9B" strokeWidth="1.5" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Jalan Malioboro ke UGM"
                                value={destination}
                                onChange={handleSearchChange}
                                className="flex-1 min-w-0 bg-transparent border-none outline-none text-[13px] font-normal text-[#333333] placeholder:text-[#9B9B9B] font-['Inter']"
                            />
                        </div>
                    </div>

                    {/* BANNER CARDS CONTAINER */}
                    <div className="mt-6 flex flex-col gap-5 md:flex-row md:items-stretch">

                        {/* CARD 1: PREFERENSI MOBILITAS */}
                        <div className="relative w-full md:flex-1 h-[170px] overflow-hidden rounded-[14px] border border-[#95B1FF] bg-[rgba(62,129,243,0.60)] shadow-sm flex flex-col justify-between p-4 transition-transform hover:-translate-y-1">

                            {/* CONTAINER KHUSUS GELOMBANG: Tinggal ubah angka "translate-x-[40%]" kalau mau digeser lagi */}
                            <div className="absolute inset-0 translate-x-[40%] -top-8 pointer-events-none">
                                <svg
                                    className="w-[392px] h-[246px]"
                                    viewBox="0 0 312 174"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        opacity="0.51"
                                        d="M65.2014 206.199C78.9047 206.885 92.959 205.961 106.019 206.023C136.304 206.164 166.59 206.306 196.876 206.447C227.89 206.593 258.994 206.088 289.961 206.337C316.15 206.548 343.763 210.753 366.854 194.995C380.64 185.587 389.977 169.936 391.704 153.341C393.432 136.746 387.517 119.509 375.964 107.466C372.347 103.696 368.173 100.361 365.425 95.9192C359.923 87.0263 361.216 75.4983 364.523 65.5783C367.831 55.6583 372.959 46.2819 374.77 35.9834C377.299 21.6083 372.753 6.15988 362.84 -4.55719C352.928 -15.2743 337.876 -21.0148 323.34 -19.6216C309.334 -18.2789 297.792 -10.3039 284.427 -7.03892C268.578 -3.16679 255.858 -9.1221 241.965 -17.4321C219.965 -30.5908 194.858 -42.3156 168.54 -38.1423C146.479 -34.6439 126.652 -19.3398 117.687 1.1094C114.602 8.14706 112.262 16.3106 105.706 20.3236C95.5028 26.569 82.8878 18.9622 71.3634 15.7483C54.9008 11.1579 36.0319 16.7768 24.7666 29.6233C13.5013 42.4699 10.402 61.9037 17.1127 77.6146C21.4683 87.8109 29.7414 98.0134 26.5336 108.627C24.0141 116.963 15.3761 121.573 9.41312 127.921C-5.84087 144.163 -1.44379 172.503 14.6229 187.943C28.5805 201.356 46.5668 205.266 65.2014 206.199Z"
                                        fill="#3E81F3"
                                    />
                                </svg>
                            </div>

                            {/* ORNAMEN BINTANG-BINTANG (Disesuaikan posisinya agar pas di kanan) */}

                            {/* Bintang 1 (Kecil di tengah-kanan) */}
                            <svg className="absolute right-[112px] top-[38px] w-[10px] h-[10px] pointer-events-none" viewBox="0 0 8 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M7.97545 4.0192C5.04793 4.60902 4.57369 5.08776 3.98773 8.03839C3.40253 5.08776 2.92752 4.60978 0 4.0192C2.92752 3.42938 3.40177 2.95063 3.98773 0C4.57293 2.95063 5.04793 3.42938 7.97545 4.0192Z" fill="white" />
                            </svg>

                            {/* Bintang 2 (Besar di pojok kanan atas) */}
                            <svg className="absolute right-[24px] top-[14px] w-[18.62px] h-[18.76px] pointer-events-none" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18.6154 9.38121C11.7823 10.7585 10.6742 11.8745 9.30772 18.7624C7.94124 11.8753 6.83392 10.7585 0 9.38121C6.83316 8.00394 7.94124 6.88787 9.30772 0C10.6742 6.88711 11.7815 8.00394 18.6154 9.38121Z" fill="white" />
                            </svg>

                            {/* Bintang 3 (Sedang di atas dekat bintang besar) */}
                            <svg className="absolute right-[74px] top-[22px] w-[14.82px] h-[14.93px] pointer-events-none" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M14.8154 7.46621C9.37688 8.56236 8.49528 9.45092 7.40772 14.9324C6.32016 9.45092 5.43856 8.56236 0 7.46621C5.43856 6.37006 6.32016 5.4815 7.40772 0C8.49528 5.4815 9.37688 6.37006 14.8154 7.46621Z" fill="white" />
                            </svg>

                            {/* Bintang 4 (Sedang di bawah kanan) */}
                            <svg className="absolute right-[32px] bottom-[65px] w-[14.82px] h-[14.93px] pointer-events-none" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M14.8154 7.46621C9.37688 8.56236 8.49528 9.45092 7.40772 14.9324C6.32016 9.45092 5.43856 8.56236 0 7.46621C5.43856 6.37006 6.32016 5.4815 7.40772 0C8.49528 5.4815 9.37688 6.37006 14.8154 7.46621Z" fill="white" />
                            </svg>

                            {/* KONTEN TEKS */}
                            <div className="relative z-10 w-[75%] md:w-full">
                                <h3 className="text-[18px] font-semibold text-white">Preferensi Mobilitas</h3>
                                <p className="mt-1 text-[12px] font-normal leading-snug text-white/90 font-['Inter']">
                                    Sesuaikan rekomendasi rute dengan kebutuhanmu. Pilih preferensimu!
                                </p>
                            </div>

                            {/* TOMBOL ATUR PREFERENSI */}
                            <button
                                onClick={onPreference}
                                className="relative z-10 mt-auto h-[44px] w-full rounded-[10px] bg-white flex items-center justify-between px-4 hover:bg-blue-50 transition-colors shadow-sm"
                            >
                                <span className="text-[14px] font-medium text-[#0063F3]">Atur Preferensi</span>
                                <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M9.62 3.95337L13.6667 8.00004L9.62 12.0467" stroke="#0063F3" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M2.33331 8H13.5533" stroke="#0063F3" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        </div>

                        {/* CARD 2: SAPA AI */}
                        <div className="relative w-full md:flex-1 h-[170px] overflow-hidden rounded-[14px] border border-[#E6E6E6] bg-white shadow-sm flex flex-col justify-between p-4 transition-transform hover:-translate-y-1">
                            {/* GLOW BIRU */}
                            <div
                                className="pointer-events-none absolute rounded-full"
                                style={{
                                    width: "68.025px",
                                    height: "68.025px",
                                    right: "70px",
                                    top: "10px",
                                    background: "rgba(91, 176, 254, 0.60)",
                                    filter: "blur(30.368099212646484px)",
                                }}
                            />

                            {/* GLOW UNGU — TENGGARA ILUSTRASI */}
                            <div
                                className="pointer-events-none absolute rounded-full"
                                style={{
                                    width: "68.025px",
                                    height: "68.025px",
                                    right: "10px",
                                    top: "50px",
                                    background: "rgba(182, 189, 254, 0.90)",
                                    filter: "blur(30.368099212646484px)",
                                }}
                            />

                            {/* GAMBAR LOGO SAPA AI DARI ASSETS */}
                            <img
                                src={sapaLogo}
                                alt="SAPA AI Logo"
                                className="absolute -right-4 bottom-3 w-[200px] h-[200px] object-contain pointer-events-none"
                            />

                            <div className="relative z-10 w-[65%] md:w-[70%]">
                                <h3 className="text-[18px] font-semibold leading-tight text-[#0063F3]">
                                    SAPA AI Mobility Assistant untukmu
                                </h3>
                                <p className="mt-1 text-[11px] md:text-[12px] font-normal leading-snug text-[#808080] font-['Inter']">
                                    Siap membantu perjalananmu ke mana pun dengan nyaman dan aman
                                </p>
                            </div>

                            <button
                                onClick={onChat}
                                className="relative z-10 mt-auto h-[44px] w-full rounded-[10px] bg-[#3E81F3] flex items-center justify-between px-4 hover:bg-[#346FDD] transition-colors"
                            >
                                <span className="text-[14px] font-medium text-white">Mulai Percakapan</span>
                                <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M9.62 3.95337L13.6667 8.00004L9.62 12.0467" stroke="white" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M2.33331 8H13.5533" stroke="white" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* SECTION: REKOMENDASI RUTE */}
                    <section className="mt-8 mb-4">
                        <h3 className="text-[16px] font-semibold text-[#333333]">
                            Rekomendasi Rute
                        </h3>
                        <div className="mt-4 flex gap-3 overflow-x-auto pb-4 md:grid md:grid-cols-3 md:gap-5 scrollbar-hide">
                            {/* Dilooping menggunakan data mockup, jika kosong tampilkan wadah kosong */}
                            {mockRouteRecommendations.length > 0 ? (
                                mockRouteRecommendations.map((route) => (
                                    <button
                                        key={route.id}
                                        onClick={() => handleRouteClick(route.id)}
                                        className="relative shrink-0 w-[110px] h-[110px] md:w-full md:h-[180px] rounded-[12px] overflow-hidden bg-gray-200 border border-gray-100 shadow-sm transition-transform hover:scale-[1.02]"
                                    >
                                        <div
                                            className="absolute inset-0 bg-cover bg-center opacity-70"
                                            style={{ backgroundImage: `url(${route.image})` }}
                                        ></div>
                                        <div className="absolute inset-0 bg-black/10"></div>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-xl font-bold text-white drop-shadow-md">
                                                {route.id}
                                            </span>
                                        </div>
                                    </button>
                                ))
                            ) : (
                                // Tampilan Empty State / Loading State (Wadah kosong)
                                [1, 2, 3].map((_, idx) => (
                                    <div key={idx} className="shrink-0 w-[110px] h-[110px] md:w-full md:h-[180px] rounded-[12px] bg-gray-100 animate-pulse border border-gray-200"></div>
                                ))
                            )}
                        </div>
                    </section>
                </main>
            </div>

            {/* CSS untuk mematikan scrollbar agar rapih (biasa diletakkan di global css) */}
            <style>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}