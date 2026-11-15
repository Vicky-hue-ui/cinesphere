import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, X, Film, Loader2 } from 'lucide-react';
import axiosInstance from '../services/axiosInstance';
import { Link } from 'react-router-dom';

interface Message {
  sender: 'user' | 'ai';
  text: string;
  recommendations?: string[];
}

export const CineChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: "Hello! I am **CineChat**, your CineSphere AI film consultant. Tell me what mood, genre, or vibe you are craving today, and I'll tailor the perfect recommendation!",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const res = await axiosInstance.post('/ai/chat', {
        message: userMsg,
      });

      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: res.data.reply,
          recommendations: res.data.recommendations,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: "I'm having trouble connecting to CineSphere's AI servers right now. Please ensure the backend is running, or try again shortly!",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    'Recommend a mind-bending sci-fi thriller',
    'Best dark comedy for movie night',
    'Heartfelt romantic drama like Past Lives',
    'High-octane action with incredible stuntwork',
  ];

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 left-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm shadow-[0_0_25px_rgba(239,68,68,0.5)] hover:shadow-[0_0_35px_rgba(239,68,68,0.7)] transition-all hover:scale-105 active:scale-95 border border-red-400/40"
        >
          <div className="relative">
            <Bot size={20} />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
          </div>
          <span>CineChat AI</span>
        </button>
      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-6 left-6 z-50 w-[90vw] sm:w-[420px] h-[550px] max-h-[85vh] bg-neutral-950/95 border border-red-900/50 rounded-3xl shadow-[0_15px_50px_rgba(220,38,38,0.3)] backdrop-blur-xl flex flex-col overflow-hidden text-white animate-in slide-in-from-bottom-6 duration-300">
          
          {/* Header */}
          <div className="p-4 border-b border-neutral-900 bg-neutral-900/40 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white shadow-md">
                <Bot size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  CineChat AI <Sparkles size={14} className="text-red-400" />
                </h3>
                <p className="text-[10px] text-neutral-400">Intelligent CineSphere Assistant</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs sm:text-sm">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed whitespace-pre-wrap ${
                    m.sender === 'user'
                      ? 'bg-red-600 text-white rounded-br-sm shadow-md'
                      : 'bg-neutral-900/90 text-neutral-200 border border-neutral-800/80 rounded-bl-sm shadow-inner'
                  }`}
                >
                  {m.text}
                </div>

                {/* Quick Search Links if AI returned recommended titles */}
                {m.recommendations && m.recommendations.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {m.recommendations.map((title, i) => (
                      <Link
                        key={i}
                        to={`/search`}
                        state={{ query: title }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-red-950/60 border border-neutral-800 hover:border-red-600 text-[11px] text-neutral-300 hover:text-white transition"
                      >
                        <Film size={11} className="text-red-400" /> {title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-neutral-400 bg-neutral-900/60 p-3 rounded-2xl w-fit border border-neutral-800">
                <Loader2 size={14} className="animate-spin text-red-500" />
                <span>CineChat is analyzing film archives...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Bar */}
          <div className="px-3 py-1.5 bg-neutral-900/30 border-t border-neutral-900/80 overflow-x-auto whitespace-nowrap flex gap-1.5 scrollbar-none">
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInput(p);
                }}
                className="text-[11px] px-2.5 py-1 rounded-full bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800 transition flex-shrink-0"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form onSubmit={handleSend} className="p-3 bg-neutral-950 border-t border-neutral-900 flex gap-2">
            <input
              type="text"
              placeholder="Ask CineChat for a movie or vibe..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-neutral-900 border border-neutral-800 focus:border-red-600 text-white placeholder:text-neutral-500 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm outline-none transition"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:hover:bg-red-600 text-white font-bold transition flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.4)]"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default CineChat;
