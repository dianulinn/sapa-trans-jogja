import React, { useState } from 'react';

const ChatWidget = ({ onMapAction }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Halo! Saya JogjaBus AI. Ada yang bisa saya bantu terkait rute dan halte ramah disabilitas?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userText = input;
    setInput('');
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText }),
      });

      const data = await response.json();

      if (data.success) {
        setMessages((prev) => [...prev, { sender: 'bot', text: data.reply }]);

        // JIKA AI MENGIRIMKAN INSTRUKSI PERGERAKAN PETA:
        if (data.map_action && data.map_action.center && onMapAction) {
          onMapAction(data.map_action);
        }
      } else {
        setMessages((prev) => [...prev, { sender: 'bot', text: 'Maaf, terjadi masalah saat menghubungkan ke AI.' }]);
      }
    } catch (err) {
      setMessages((prev) => [...prev, { sender: 'bot', text: 'Gagal terhubung ke server backend.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
      {/* Tombol Buka/Tutup Chat */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            backgroundColor: '#0969da',
            color: '#fff',
            border: 'none',
            borderRadius: '50px',
            padding: '12px 20px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            fontWeight: 'bold'
          }}
        >
          💬 AI Chatbot Disabilitas
        </button>
      )}

      {/* Box Chat Floating */}
      {isOpen && (
        <div style={{
          width: '340px',
          height: '450px',
          backgroundColor: '#fff',
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{ backgroundColor: '#0969da', color: '#fff', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 'bold' }}>JogjaBus AI Assistant</span>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '16px' }}>✖</button>
          </div>

          {/* Body Messages */}
          <div style={{ flex: 1, padding: '12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  backgroundColor: msg.sender === 'user' ? '#0969da' : '#f1f3f5',
                  color: msg.sender === 'user' ? '#fff' : '#333',
                  padding: '8px 12px',
                  borderRadius: '12px',
                  maxWidth: '80%',
                  fontSize: '13px',
                  lineHeight: '1.4'
                }}
              >
                {msg.text}
              </div>
            ))}
            {loading && <div style={{ fontSize: '12px', color: '#888', italic: 'true' }}>Sedang berpikir...</div>}
          </div>

          {/* Input Footer */}
          <div style={{ padding: '10px', borderTop: '1px solid #eee', display: 'flex', gap: '6px' }}>
            <input
              type="text"
              placeholder="Ketik pertanyaan / tujuan..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '13px' }}
            />
            <button
              onClick={handleSend}
              style={{ backgroundColor: '#0969da', color: '#fff', border: 'none', borderRadius: '6px', padding: '8px 12px', cursor: 'pointer' }}
            >
              Kirim
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;