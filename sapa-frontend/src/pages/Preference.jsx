import { useState } from "react";

export default function Preference({ onBack }) {
    const [preferences, setPreferences] = useState(() => {
        const saved = localStorage.getItem("sapaPreferences");

        return saved
            ? JSON.parse(saved)
            : {
                wheelchair: false,
                stroller: false,
                walkingAid: false,
                guidePath: false,
            };
    });

    const [showSuccess, setShowSuccess] = useState(false);

    const options = [
        { key: "wheelchair", label: "Pengguna kursi roda" },
        { key: "stroller", label: "Membawa stroller" },
        { key: "walkingAid", label: "Menggunakan alat bantu jalan" },
        { key: "guidePath", label: "Membutuhkan jalur pemandu" },
    ];

    const togglePreference = (key) => {
        setPreferences((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const handleSave = () => {
        localStorage.setItem(
            "sapaPreferences",
            JSON.stringify(preferences)
        );

        setShowSuccess(true);

        setTimeout(() => {
            onBack();
        }, 1800);
    };

    const handleSkip = () => {
        localStorage.removeItem("sapaPreferences");
        onBack();
    };

    return (
        <div className="min-h-screen bg-[#F7F9FC]">
            <div className="mx-auto min-h-screen w-full max-w-[1200px] bg-white pb-24 md:shadow-sm">

                {/* HEADER */}
                <header className="relative px-5 pt-8 pb-4 md:px-10">

                    {/* BACK BUTTON */}
                    <button
                        onClick={onBack}
                        className="absolute left-5 top-8 h-[18px] w-[18px] p-0 md:left-10"
                        aria-label="Kembali"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 18 18"
                            fill="none"
                        >
                            <path
                                d="M7.1775 4.44751L2.625 9.00001L7.1775 13.5525"
                                stroke="#242424"
                                strokeWidth="1.5"
                                strokeMiterlimit="10"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M15.375 9H2.7525"
                                stroke="#242424"
                                strokeWidth="1.5"
                                strokeMiterlimit="10"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </button>

                    {/* TITLE */}
                    <h1 className="text-center font-['Poppins'] text-[16px] font-medium leading-[16px] text-[#1F1F1F]">
                        Preferensi Mobilitas
                    </h1>
                </header>

                {/* CONTENT */}
                <main className="px-5 md:px-10">

                    {/* DESCRIPTION */}
                    <div className="mt-4 font-['Inter'] text-[16px] font-normal leading-[130%] text-[#767373]">
                        Pilih kebutuhan yang ingin dipertimbangkan saat mencari rute
                    </div>

                    {/* CHECKBOX OPTIONS */}
                    <div className="mt-5 flex flex-col gap-4">
                        {options.map((option) => (
                            <button
                                key={option.key}
                                type="button"
                                onClick={() => togglePreference(option.key)}
                                className="flex w-full items-center gap-4 text-left"
                            >
                                {/* CHECKBOX */}
                                <div className="flex h-[24px] w-[24px] flex-shrink-0 items-center justify-center rounded-[6px] bg-[#E7EDFF]">
                                    {preferences[option.key] && (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="16"
                                            height="16"
                                            viewBox="0 0 16 16"
                                            fill="none"
                                        >
                                            <path
                                                d="M13.3334 4L6.00002 11.3333L2.66669 8"
                                                stroke="#0063F3"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    )}
                                </div>

                                {/* TEXT */}
                                <span className="min-w-0 flex-1 font-['Nunito'] text-[14px] font-medium leading-[14px] text-[#9B9B9B]">
                                    {option.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </main>

                {/* BOTTOM ACTION */}
                <div className="fixed bottom-0 left-0 w-full bg-white px-6 pb-8 pt-4">
                    <div className="mx-auto flex w-full max-w-[354px] flex-col items-center">

                        {/* SIMPAN */}
                        <button
                            type="button"
                            onClick={handleSave}
                            className="flex h-[40px] w-full items-center justify-center rounded-[10px] bg-[#3E81F3] px-4 font-['Poppins'] text-[14px] font-medium leading-[14px] text-white"
                        >
                            Simpan
                        </button>

                        {/* TEXT */}
                        <p className="mt-5 mb-0 font-['Inter'] text-[16px] font-normal leading-[130%] text-[#767373]">
                            Tidak punya kebutuhan khusus?
                        </p>

                        {/* LANJUT */}
                        <button
                            type="button"
                            onClick={handleSkip}
                            className="mt-3 border-0 bg-transparent p-0 font-['Inter'] text-[14px] font-normal leading-[100%] text-[#0063F3] underline"
                        >
                            Lanjut tanpa preferensi
                        </button>
                    </div>
                </div>

                {/* SUCCESS NOTIFICATION */}
                {showSuccess && (
                    <div className="fixed left-1/2 top-8 z-[100] -translate-x-1/2">
                        <div className="flex items-center gap-3 rounded-[12px] bg-white px-4 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">

                            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#1FC16B]">
                                <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 14 14"
                                    fill="none"
                                >
                                    <path
                                        d="M11.5 3.5L5.5 10L2.5 7"
                                        stroke="white"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </div>

                            <span className="font-['Inter'] text-[14px] font-medium text-[#242424]">
                                Preferensi berhasil disimpan
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}