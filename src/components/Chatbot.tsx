import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  Mic, 
  MicOff, 
  X, 
  User, 
  Bot, 
  Loader2,
  Volume2,
  VolumeX,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import { cn } from '../utils/cn';
import { useLanguage } from '../contexts/LanguageContext';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export default function Chatbot() {
  const { t, language: appLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isTtsEnabled, setIsTtsEnabled] = useState(true);
  const [chatLanguage, setChatLanguage] = useState('en-IN');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sync chat language with app language initially
  useEffect(() => {
    const langMap: Record<string, string> = {
      en: 'en-IN',
      hi: 'hi-IN',
      pa: 'pa-IN',
      mr: 'mr-IN',
      te: 'te-IN',
      ta: 'ta-IN',
      bn: 'bn-IN',
      gu: 'gu-IN'
    };
    setChatLanguage(langMap[appLanguage] || 'en-IN');
  }, [appLanguage]);

  const speak = (text: string) => {
    if (!isTtsEnabled) return;
    
    // Stop any current speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = chatLanguage;
    utterance.rate = 1;
    utterance.pitch = 1;
    
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const chatRef = useRef<any>(null);

  const getChat = () => {
    if (!chatRef.current) {
      chatRef.current = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: `You are AgroSmart AI, a multilingual agriculture assistant. Help farmers with soil health, crop selection, disease treatment, and market prices. Support English, Hindi, Hinglish, and regional languages. Current user language preference: ${appLanguage}. Be concise, practical, and empathetic.`,
        },
      });
    }
    return chatRef.current;
  };

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;
    
    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const chat = getChat();
      const response = await chat.sendMessage({ message: text });
      const botMsg = { role: 'bot', content: response.text };
      setMessages(prev => [...prev, botMsg]);
      speak(response.text);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSpeech = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert(t('common.speechNotSupported'));
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = chatLanguage;
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      handleSend(transcript);
    };

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-emerald-600 text-white rounded-full shadow-2xl flex items-center justify-center z-50 hover:bg-emerald-700 transition-colors"
      >
        <MessageSquare className="w-6 h-6" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-24 right-6 w-[400px] h-[600px] bg-white rounded-3xl shadow-2xl border border-zinc-100 flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-emerald-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold">{t('common.agroSmartAssistant')}</h4>
                  <p className="text-[10px] opacity-80 uppercase tracking-widest">{t('common.multilingualAI')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsTtsEnabled(!isTtsEnabled)}
                  className={cn(
                    "p-1 rounded-lg transition-colors",
                    isTtsEnabled ? "bg-white/20 text-white" : "text-white/50 hover:text-white"
                  )}
                  title={isTtsEnabled ? t('common.muteVoice') : t('common.enableVoice')}
                >
                  {isTtsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
                <select 
                  value={chatLanguage} 
                  onChange={(e) => setChatLanguage(e.target.value)}
                  className="bg-emerald-700 text-[10px] border-none rounded px-1 py-0.5 focus:ring-0"
                >
                  <option value="en-IN">English</option>
                  <option value="hi-IN">Hindi</option>
                  <option value="bn-IN">Bengali</option>
                  <option value="pa-IN">Punjabi</option>
                  <option value="mr-IN">Marathi</option>
                  <option value="te-IN">Telugu</option>
                  <option value="ta-IN">Tamil</option>
                  <option value="gu-IN">Gujarati</option>
                </select>
                <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50/50">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                  <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center">
                    <Bot className="w-8 h-8 text-emerald-600" />
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-semibold text-zinc-900">{t('common.chatbotNamaste')}</h5>
                    <p className="text-xs text-zinc-500">{t('common.chatbotHelpText')}</p>
                  </div>
                  <div className="grid grid-cols-1 gap-2 w-full">
                    <QuickAction text={t('common.quickActionSoil')} onClick={handleSend} />
                    <QuickAction text={t('common.quickActionPrice')} onClick={handleSend} />
                    <QuickAction text={t('common.quickActionDisease')} onClick={handleSend} />
                  </div>
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={cn(
                  "flex gap-3 max-w-[85%]",
                  msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                )}>
                  <div className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center shrink-0",
                    msg.role === 'user' ? "bg-zinc-900 text-white" : "bg-emerald-100 text-emerald-600"
                  )}>
                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={cn(
                    "p-3 rounded-2xl text-sm leading-relaxed",
                    msg.role === 'user' ? "bg-zinc-900 text-white rounded-tr-none" : "bg-white border border-zinc-100 shadow-sm rounded-tl-none text-zinc-700"
                  )}>
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-3 mr-auto">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="p-3 bg-white border border-zinc-100 shadow-sm rounded-2xl rounded-tl-none">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-zinc-100">
              <div className="flex items-center gap-2 bg-zinc-100 p-2 rounded-2xl">
                <button 
                  onClick={toggleSpeech}
                  className={cn(
                    "p-2 rounded-xl transition-colors",
                    isListening ? "bg-rose-500 text-white animate-pulse" : "hover:bg-zinc-200 text-zinc-500"
                  )}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
                <input 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={t('common.askAnything')}
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-1"
                />
                <button 
                  onClick={() => handleSend()}
                  disabled={!input.trim() || loading}
                  className="p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function QuickAction({ text, onClick }: any) {
  return (
    <button 
      onClick={() => onClick(text)}
      className="px-3 py-2 bg-white border border-zinc-100 rounded-xl text-[11px] font-medium text-zinc-600 hover:border-emerald-500 hover:text-emerald-600 transition-all text-left"
    >
      {text}
    </button>
  );
}
