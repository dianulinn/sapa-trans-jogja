import React, { useState, useRef, useEffect } from "react";
// Import logo SAPA AI dari folder assets sesuai struktur foldermu
import sapaLogo from "../assets/sapa ai logo.png";

// --- KUMPULAN ASSET ICON ---
const icons = {
    back: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9.57 5.92993L3.5 11.9999L9.57 18.0699" stroke="#333333" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M20.5 12H3.67004" stroke="#333333" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    mic: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 15C13.6569 15 15 13.6569 15 12V6C15 4.34315 13.6569 3 12 3C10.3431 3 9 4.34315 9 6V12C9 13.6569 10.3431 15 12 15Z" stroke="#0063F3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M19 10V12C19 15.866 15.866 19 12 19C8.13401 19 5 15.866 5 12V10" stroke="#0063F3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 19V22" stroke="#0063F3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    send: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M7.39999 6.32003L15.89 3.49003C19.7 2.22003 21.77 4.30003 20.51 8.11003L17.68 16.6C15.78 22.31 12.66 22.31 10.76 16.6L9.91999 14.08L7.39999 13.24C1.68999 11.34 1.68999 8.23003 7.39999 6.32003Z" stroke="#0063F3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10.11 13.65L13.69 10.06" stroke="#0063F3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
};

export default function ChatPage({ onBack, onMapAction }) {
    // ==========================================
    // AREA STATE & REFS
    // ==========================================
    const userName = "Visitor";
    const [inputValue, setInputValue] = useState("");
    
    // 1. Ambil data dari sessionStorage saat komponen pertama kali dimuat
    const [messages, setMessages] = useState(() => {
        const savedMessages = sessionStorage.getItem("sapa_chat_messages");
        return savedMessages ? JSON.parse(savedMessages) : [];
    });
    
    const [isLoading, setIsLoading] = useState(false);
    const inputRef = useRef(null);
    const chatEndRef = useRef(null);

    // 2. Simpan ke sessionStorage setiap kali array 'messages' berubah
    useEffect(() => {
        sessionStorage.setItem("sapa_chat_messages", JSON.stringify(messages));
    }, [messages]);

    // Otomatis scroll ke pesan paling bawah setiap ada pesan baru/loading
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    // 3. Otomatis fokus ke input setelah loading selesai (AI selesai membalas)
    useEffect(() => {
        if (!isLoading) {
            // setTimeout memastikan React selesai merender UI sebelum fokus
            setTimeout(() => {
                inputRef.current?.focus();
            }, 10);
        }
    }, [isLoading]);

    // ==========================================
    // AREA HANDLER (AI BOT INTEGRATION)
    // ==========================================
    const handleBackClick = () => {
        if (onBack) onBack();
    };

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    const handleMicClick = () => {
        alert("Fitur Speech-to-Text akan segera hadir!");
    };

    const handleSendMessage = async (e) => {
        e?.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const userText = inputValue;
        const userMsg = {
            id: Date.now(),
            sender: "user",
            text: userText
        };

        // Tambahkan pesan user ke UI & Reset input
        setMessages((prev) => [...prev, userMsg]);
        setInputValue("");
        setIsLoading(true);

        try {
            // Kirim pesan ke API Laravel
            const response = await fetch("http://127.0.0.1:8000/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({ message: userText })
            });

            const data = await response.json();

            if (data.success) {
                // Tambahkan balasan dari AI ke UI
                const botMsg = {
                    id: Date.now() + 1,
                    sender: "bot",
                    text: data.reply
                };
                setMessages((prev) => [...prev, botMsg]);

                // Jika AI mengirim instruksi pergerakan peta, jalankan callback
                if (data.map_action && data.map_action.center && onMapAction) {
                    onMapAction(data.map_action);
                }
            } else {
                setMessages((prev) => [
                    ...prev,
                    {
                        id: Date.now() + 1,
                        sender: "bot",
                        text: "Maaf, SAPA AI sedang mengalami kendala. Silakan coba beberapa saat lagi."
                    }
                ]);
            }
        } catch (error) {
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now() + 1,
                    sender: "bot",
                    text: "Gagal terhubung ke server backend Laravel. Pastikan server sudah dinyalakan."
                }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

// ==========================================
// RENDER VIEW
// ==========================================
return (
    // 1. Kunci tinggi maksimal dikurangi tinggi navbar (~80px) dan matikan scroll luar
    <div className="h-[calc(100dvh-80px)] overflow-hidden bg-white md:bg-[#F7F9FC] font-['Poppins']">
        
        {/* 2. Flex column penuh untuk membagi layout (Header - Chat - Input) */}
        <div className="mx-auto w-full max-w-[1200px] h-full flex flex-col bg-white md:shadow-sm relative">
            
            {/* HEADER - Statis (Tidak ikut scroll) */}
            <header className="relative flex h-[56px] shrink-0 items-center justify-center border-b border-[#F0F0F0]">
                <button
                    onClick={handleBackClick}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                    aria-label="Kembali"
                >
                    <span className="text-xl">←</span>
                </button>

                <h1 className="text-[#1F1F1F] font-['Poppins'] text-[16px] font-medium leading-[100%]">
                    SAPA AI
                </h1>
            </header>

            {/* SCROLLABLE CHAT AREA - Fleksibel mengisi ruang tengah */}
            <main className="flex-1 overflow-y-auto px-4 py-4 scrollbar-hide flex flex-col">

                {/* Welcome Intro */}
{messages.length === 0 && (
    <div className="flex flex-col items-center justify-center text-center mt-7 sm:mt-10 mb-6 px-4">

        <img
            alt="SAPA AI Logo"
            src={sapaLogo}
            className="
                w-[200px] h-[200px]
                object-contain
                opacity-95
                pointer-events-none
                select-none
                mb-4
            "
        />

        <h2 className="text-[20px] font-semibold text-[#0063F3] mb-1">
            Hai {userName},
        </h2>

        <p className="text-[15px] text-[#4D4D4D] font-medium font-['Inter']">
            Mau kemana hari ini?
        </p>

    </div>
)}

                {/* Chat Messages List */}
                <div className="flex flex-col gap-3">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`max-w-[85%] font-['Inter'] text-[14px] leading-[150%] whitespace-pre-line ${
                                msg.sender === "user"
                                    ? "self-end bg-[#F4FAFE] text-[#0063F3] px-5 py-3.5 rounded-[20px] rounded-br-sm shadow-sm"
                                    : "self-start bg-[#F8F9FA] text-[#333333] border border-[#EAEAEA] px-5 py-3.5 rounded-[20px] rounded-bl-sm shadow-sm"
                            }`}
                        >
                            {msg.text}
                        </div>
                    ))}

                    {/* Indikator AI Sedang Berpikir */}
                    {isLoading && (
                        <div className="self-start bg-[#F8F9FA] border border-[#EAEAEA] text-[#777777] px-4 py-2.5 rounded-[20px] rounded-bl-sm text-[13px] font-['Inter'] italic flex items-center gap-2">
                            <span className="animate-pulse">SAPA AI sedang berpikir...</span>
                        </div>
                    )}

                    {/* Element jangkar untuk auto-scroll */}
                    <div ref={chatEndRef} />
                </div>
            </main>

            {/* INPUT AREA - Statis menempel di bawah container (di atas navbar) */}
            <div className="shrink-0 bg-white px-4 py-4 border-t border-[#F0F0F0] z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
                <form
                    onSubmit={handleSendMessage}
                    className="flex h-[52px] items-center rounded-full border border-[#EAEAEA] bg-white px-2 pl-5 focus-within:border-[#0063F3] transition-colors"
                >
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={handleInputChange}
                        placeholder="Tanyakan halte atau tujuan rute..."
                        disabled={isLoading}
                        className="flex-1 bg-transparent border-none outline-none text-[14px] font-normal text-[#333333] placeholder:text-[#B3B3B3] font-['Inter']"
                    />

                    <button
                        type="button"
                        onClick={handleMicClick}
                        className="ml-2 flex h-9 w-9 items-center justify-center rounded-full bg-[#F0F6FF] hover:bg-blue-100 transition-colors shrink-0"
                        aria-label="Voice Input"
                    >
                        <span>🎤</span>
                    </button>

                    <button
                        type="submit"
                        disabled={isLoading || !inputValue.trim()}
                        className="ml-1 flex h-9 w-9 items-center justify-center rounded-full bg-[#0063F3] text-white hover:bg-blue-600 disabled:opacity-40 transition-all shrink-0"
                        aria-label="Kirim Pesan"
                    >
                        <span>➤</span>
                    </button>
                </form>
            </div>
        </div>

        {/* CSS Hide Scrollbar */}
        <style jsx>{`
            .scrollbar-hide::-webkit-scrollbar { display: none; }
            .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
    </div>
);
}