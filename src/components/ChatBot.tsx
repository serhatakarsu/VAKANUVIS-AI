
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { createChatSession } from '../services/geminiService';
import { Chat, GenerateContentResponse } from '@google/genai';

interface Message {
  role: 'user' | 'model';
  text: string;
}

export const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const toggleChat = () => {
    if (!isOpen && !chatSessionRef.current) {
      chatSessionRef.current = createChatSession();
      setMessages([{ role: 'model', text: 'Merhaba! Ben Vakanüvis AI. Haberin dijital hafızası ve geleceğin kalemi olarak, haber yazımı, SEO veya gazetecilik üzerine merak ettiğiniz her şeyi sorabilirsiniz.' }]);
    }
    setIsOpen(!isOpen);
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading || !chatSessionRef.current) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const response = await chatSessionRef.current.sendMessage({ message: userMessage });
      const text = response.text || "Üzgünüm, bir yanıt oluşturamadım.";
      setMessages(prev => [...prev, { role: 'model', text }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'model', text: 'Üzgünüm, şu an bağlantı kuramıyorum. Lütfen daha sonra tekrar deneyin.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Toggle Button */}
      <button
        type="button"
        onClick={toggleChat}
        className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-95 cursor-pointer relative z-50 ${isOpen ? 'bg-zinc-900 rotate-90' : 'bg-indigo-600 hover:bg-indigo-700'}`}
      >
        {isOpen ? <X className="text-white w-6 h-6 pointer-events-none" /> : <MessageSquare className="text-white w-6 h-6 pointer-events-none" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-18 right-0 w-[380px] h-[550px] bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
          {/* Header */}
          <div className="p-4 bg-zinc-900 dark:bg-zinc-950 text-white flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold">Vakanüvis AI</h3>
                <p className="text-[10px] text-zinc-400 font-medium">Geleceğin Kalemi</p>
              </div>
            </div>
            <button type="button" onClick={toggleChat} className="text-zinc-400 hover:text-white transition-colors cursor-pointer relative z-50">
              <X className="w-5 h-5 pointer-events-none" />
            </button>
          </div>

          {/* Messages */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50 dark:bg-zinc-950 custom-scrollbar"
          >
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-tl-none shadow-sm'
                }`}>
                  <div className="flex items-center space-x-2 mb-1 opacity-70">
                    {msg.role === 'model' ? <Bot className="w-3 h-3" /> : <User className="w-3 h-3" />}
                    <span className="text-[10px] font-bold uppercase tracking-wider">{msg.role === 'model' ? 'Asistan' : 'Siz'}</span>
                  </div>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                  <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium italic">Editör düşünüyor...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Bir şey sorun..."
                className="w-full pl-4 pr-12 py-3 bg-zinc-100 dark:bg-zinc-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-600/20 outline-none transition-all placeholder-zinc-400 dark:placeholder-zinc-500 dark:text-white"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all ${input.trim() && !isLoading ? 'text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30' : 'text-zinc-300 dark:text-zinc-700'}`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[9px] text-zinc-400 dark:text-zinc-500 mt-2 text-center uppercase tracking-widest font-bold">Gazetecilik & SEO Uzmanı</p>
          </form>
        </div>
      )}
    </div>
  );
};
