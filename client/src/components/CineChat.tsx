import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, X, Film, Loader2, ChevronDown } from 'lucide-react';
import axiosInstance from '../services/axiosInstance';
import { Link } from 'react-router-dom';

interface Message {
  sender: 'user' | 'ai';
  text: string;
  recommendations?: string[];
}

// Client-side fallback catalog so CineChat ALWAYS responds even if server is booting or offline
const fallbackCatalog: Record<string, { title: string; reason: string }[]> = {
  scifi: [
    { title: "Interstellar", reason: "Cosmic scope, mind-bending relativity, and Hans Zimmer's pipe-organ score." },
    { title: "Blade Runner 2049", reason: "Visually transcendent cyberpunk atmosphere and deep philosophical questions." },
    { title: "Arrival", reason: "Profound examination of language, determinism, time, and human connection." },
    { title: "Dune: Part Two", reason: "Massive scale desert warfare, religious fervor, and breathtaking audiovisual direction." },
  ],
  action: [
    { title: "John Wick: Chapter 4", reason: "Hyper-kinetic choreography, peak neon noir cinematography, and exhilarating stuntwork." },
    { title: "Mad Max: Fury Road", reason: "A relentless, high-octane masterclass in practical action and worldbuilding." },
    { title: "Top Gun: Maverick", reason: "Jaw-dropping cockpit aerial sequences and unmatched emotional tension." },
    { title: "The Dark Knight", reason: "Legendary clash of ideologies, gripping pacing, and Heath Ledger's iconic Joker." },
  ],
  horror: [
    { title: "Hereditary", reason: "Suffocating dread, generational grief, and unforgettable psychological horror." },
    { title: "Talk to Me", reason: "Modern supernatural thrill with chilling practical effects and rapid-fire tension." },
    { title: "Get Out", reason: "Sharp social commentary laced with razor-sharp suspense and unpredictable twists." },
  ],
  comedy: [
    { title: "The Grand Budapest Hotel", reason: "Wes Anderson's delightfully eccentric wit, pastel aesthetics, and impeccable timing." },
    { title: "Knives Out", reason: "Whodunit mystery with witty banter, clever misdirections, and standout performances." },
    { title: "Superbad", reason: "Unfiltered, laugh-out-loud coming-of-age comedy with enduring heart." },
  ],
  romance: [
    { title: "Past Lives", reason: "Delicate, heartbreaking meditation on destiny ('In-Yun') and paths not taken." },
    { title: "La La Land", reason: "Bittersweet homage to classic musicals with electric chemistry and unforgettable melodies." },
    { title: "Before Sunrise", reason: "Intimate, walk-and-talk Parisian romance centered on fleeting, honest conversation." },
  ],
  thriller: [
    { title: "Prisoners", reason: "Morally complex, pitch-black mystery with electrifying tension from start to finish." },
    { title: "Shutter Island", reason: "Haunting psychological atmosphere, paranoia-inducing score, and legendary twist." },
    { title: "Parasite", reason: "Brilliantly calibrated dark comedy turned shocking class-struggle thriller." },
  ],
};

const getClientFallbackResponse = (userPrompt: string): { reply: string; recommendations: string[] } => {
  const lower = userPrompt.toLowerCase();
  let genre = 'action';

  if (lower.match(/sci.?fi|space|future|time.?travel|alien|cyber/)) {
    genre = 'scifi';
  } else if (lower.match(/horror|scary|spooky|ghost|creepy/)) {
    genre = 'horror';
  } else if (lower.match(/romance|love|romantic|couple|date/)) {
    genre = 'romance';
  } else if (lower.match(/comedy|funny|laugh|humor/)) {
    genre = 'comedy';
  } else if (lower.match(/thriller|mystery|crime|twist|suspense|mind.?bending/)) {
    genre = lower.includes('sci') ? 'scifi' : 'thriller';
  } else if (lower.match(/action|fight|war|hero/)) {
    genre = 'action';
  } else {
    const genres = Object.keys(fallbackCatalog);
    genre = genres[Math.floor(Math.random() * genres.length)];
  }

  const recs = fallbackCatalog[genre] || fallbackCatalog.scifi;
  const reply =
    `Here are CineSphere's top curated recommendations based on your request:\n\n` +
    recs.map((r, i) => `${i + 1}. **${r.title}** — ${r.reason}`).join('\n\n') +
    `\n\n💡 *Click any of the movie tags below to explore trailers, reviews, and details!*`;

  return {
    reply,
    recommendations: recs.map((r) => r.title),
  };
};

// Simple inline markdown renderer for bold text
const renderMarkdown = (text: string): React.ReactNode => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part: string, i: number) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="text-white font-bold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
};

export const CineChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [input, setInput] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: "Hello! I'm **CineChat**, your CineSphere AI film consultant powered by Gemini. Tell me what mood, genre, director, or vibe you're craving today and I'll craft the perfect recommendation!",
    },
  ]);
  const [loading, setLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [messages, isOpen, isMinimized]);

  const handleSend = async (e?: React.FormEvent): Promise<void> => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    const updatedMessages: Message[] = [...messages, { sender: 'user', text: userMsg }];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      // 1. Try to fetch from backend Gemini endpoint
      const res = await axiosInstance.post('/ai/chat', {
        message: userMsg,
        history: updatedMessages.slice(-6).map((m: Message) => ({
          sender: m.sender,
          text: m.text,
        })),
      });

      setMessages((prev: Message[]) => [
        ...prev,
        {
          sender: 'ai',
          text: res.data.reply || 'Here are some top film recommendations for you!',
          recommendations: res.data.recommendations || [],
        },
      ]);
    } catch {
      // 2. Resilient fallback: If server is booting/offline, provide instant curated recommendations!
      const fallback = getClientFallbackResponse(userMsg);
      setMessages((prev: Message[]) => [
        ...prev,
        {
          sender: 'ai',
          text: fallback.reply,
          recommendations: fallback.recommendations,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handlePromptClick = (prompt: string): void => {
    setInput(prompt);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const samplePrompts: string[] = [
    'Mind-bending sci-fi thriller',
    'Best dark comedies 2024',
    'Heartfelt drama like Past Lives',
    'High-octane action stunts',
    'Hidden gem Bollywood films',
  ];

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => { setIsOpen(true); setIsMinimized(false); }}
          className="fixed bottom-6 left-4 sm:left-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm shadow-[0_0_25px_rgba(239,68,68,0.5)] hover:shadow-[0_0_35px_rgba(239,68,68,0.7)] transition-all hover:scale-105 active:scale-95 border border-red-400/40"
          aria-label="Open CineChat AI"
        >
          <div className="relative">
            <Bot size={20} />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
          </div>
          <span className="hidden sm:inline">CineChat AI</span>
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div
          className={`fixed bottom-4 left-3 sm:left-6 z-50 w-[calc(100vw-24px)] sm:w-[420px] bg-neutral-950/97 border border-red-900/50 rounded-3xl shadow-[0_15px_60px_rgba(220,38,38,0.35)] backdrop-blur-xl flex flex-col overflow-hidden text-white transition-all duration-300 ${
            isMinimized ? 'h-[60px]' : 'h-[560px] max-h-[85vh]'
          }`}
        >
          {/* Header */}
          <div className="flex-shrink-0 px-4 py-3 border-b border-neutral-900 bg-neutral-900/50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center shadow-md">
                <Bot size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  CineChat AI <Sparkles size={12} className="text-red-400" />
                </h3>
                <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block" />
                  Gemini 2.5 Flash · Online
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsMinimized((m: boolean) => !m)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                <ChevronDown
                  size={16}
                  className={`transition-transform ${isMinimized ? 'rotate-180' : ''}`}
                />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
                title="Close"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs sm:text-sm scroll-smooth">
                {messages.map((m: Message, idx: number) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[88%] rounded-2xl px-3.5 py-3 leading-relaxed ${
                        m.sender === 'user'
                          ? 'bg-red-600 text-white rounded-br-sm'
                          : 'bg-neutral-900/90 text-neutral-200 border border-neutral-800/80 rounded-bl-sm'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{renderMarkdown(m.text)}</div>
                    </div>

                    {/* Movie Quick-Search Pills */}
                    {m.recommendations && m.recommendations.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2 max-w-[90%]">
                        {m.recommendations.map((title: string, i: number) => (
                          <Link
                            key={i}
                            to="/search"
                            state={{ query: title }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-red-950/60 border border-neutral-800 hover:border-red-600 text-[10px] text-neutral-300 hover:text-white transition"
                          >
                            <Film size={10} className="text-red-400 flex-shrink-0" />
                            <span className="truncate max-w-[120px]">{title}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {loading && (
                  <div className="flex items-center gap-2 text-[11px] text-neutral-400 bg-neutral-900/70 px-3 py-2.5 rounded-2xl w-fit border border-neutral-800">
                    <Loader2 size={13} className="animate-spin text-red-500" />
                    <span>CineChat is analyzing film archives...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompt Chips */}
              <div className="flex-shrink-0 px-3 py-2 bg-neutral-900/30 border-t border-neutral-900 overflow-x-auto scrollbar-none">
                <div className="flex gap-1.5 whitespace-nowrap">
                  {samplePrompts.map((p: string, idx: number) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handlePromptClick(p)}
                      className="text-[10px] sm:text-[11px] px-2.5 py-1 rounded-full bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800 transition flex-shrink-0"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Bar */}
              <form
                onSubmit={handleSend}
                className="flex-shrink-0 p-3 bg-neutral-950 border-t border-neutral-900 flex gap-2"
              >
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Ask for a movie, mood, or vibe..."
                  value={input}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
                  className="flex-1 bg-neutral-900 border border-neutral-800 focus:border-red-600 text-white placeholder:text-neutral-500 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm outline-none transition"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold transition flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                  aria-label="Send message"
                >
                  <Send size={15} />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default CineChat;
