
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { InputSection } from './components/InputSection';
import { OutputSection } from './components/OutputSection';
import { HistoryDrawer } from './components/HistoryDrawer';
import { ChatBot } from './components/ChatBot';
import { generateNewsContent } from './services/geminiService';
import { GeneratedNews, AppState, NewsMode, NEWS_MODES, SavedItem, NewsTone, NEWS_TONES } from './types';
import { addItemToHistory, getHistory, deleteItemFromHistory } from './services/storage';
import { KeyRound, ExternalLink, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';

// AI Studio Project Selection check
const checkApiKeySelection = async () => {
  if (typeof (window as any).aistudio?.hasSelectedApiKey === 'function') {
    return await (window as any).aistudio.hasSelectedApiKey();
  }
  return true;
};

const triggerKeySelection = async () => {
  if (typeof (window as any).aistudio?.openSelectKey === 'function') {
    await (window as any).aistudio.openSelectKey();
    return true;
  }
  return false;
};

// Simulation steps for the loader to make it feel faster and more interactive
const LOADING_STEPS = [
  "Bağlam ve içerik analiz ediliyor...",
  "Veri kaynakları taranıyor...",
  "SEO uyumlu başlık kurgulanıyor...",
  "Haber metni yapılandırılıyor...",
  "Dil ve üslup denetimi yapılıyor...",
  "Okunabilirlik ve kalite kontrolü yapılıyor...",
  "Meta veriler oluşturuluyor...",
  "Son kontroller tamamlanıyor..."
];

function App() {
  const [inputText, setInputText] = useState('');
  const [newsMode, setNewsMode] = useState<NewsMode>(NEWS_MODES[0]);
  const [newsTone, setNewsTone] = useState<NewsTone>(NEWS_TONES[0]);
  const [generatedNews, setGeneratedNews] = useState<GeneratedNews | null>(null);
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyItems, setHistoryItems] = useState<SavedItem[]>([]);
  const [isKeyMissing, setIsKeyMissing] = useState(false);
  
  // Loading state management
  const [loadingStep, setLoadingStep] = useState(0);

  useEffect(() => {
    setHistoryItems(getHistory());
    checkApiKeySelection().then(hasKey => setIsKeyMissing(!hasKey));
  }, []);

  useEffect(() => {
    let interval: any;
    if (appState === AppState.LOADING) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep(prev => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
      }, 800); // Advance step every 0.8s for a smoother feel
    }
    return () => clearInterval(interval);
  }, [appState]);

  const handleKeySelect = async () => {
    await triggerKeySelection();
    setIsKeyMissing(false);
  };

  const handleGenerate = async () => {
    if (!inputText.trim()) return;

    setAppState(AppState.LOADING);
    setErrorMessage(null);

    try {
      const news = await generateNewsContent(inputText, newsMode, newsTone);
      setGeneratedNews(news);
      setAppState(AppState.SUCCESS);

      const newItem: SavedItem = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        status: 'active',
        input: inputText,
        mode: newsMode,
        output: news
      };
      setHistoryItems(addItemToHistory(newItem));

    } catch (error: any) {
      setAppState(AppState.ERROR);
      const errorStr = JSON.stringify(error);
      
      if (errorStr.includes('503') || errorStr.includes('UNAVAILABLE') || errorStr.includes('high demand')) {
        setErrorMessage("Sistem şu an çok yoğun. Birkaç saniye sonra tekrar denerseniz size yardımcı olabilirim.");
      } else if (error.message?.includes('500') || error.message?.includes('Internal Server Error')) {
        setErrorMessage("API Hatası (500). Lütfen 'Proje Seç' butonuna tıklayarak geçerli bir proje seçtiğinizden emin olun.");
        setIsKeyMissing(true);
      } else {
        setErrorMessage(error.message || "Haber oluşturulurken bir teknik sorun oluştu.");
      }
    }
  };

  const handleArchive = () => {
    if (!inputText.trim()) return;
    const newItem: SavedItem = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      status: 'archived',
      input: inputText,
      mode: newsMode,
      output: generatedNews
    };
    setHistoryItems(addItemToHistory(newItem));
    setInputText('');
    setGeneratedNews(null);
    setAppState(AppState.IDLE);
  };

  const handleClear = () => {
    if (inputText.trim()) {
      const newItem: SavedItem = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        status: 'trashed',
        input: inputText,
        mode: newsMode,
        output: generatedNews
      };
      setHistoryItems(addItemToHistory(newItem));
    }
    setInputText('');
    setGeneratedNews(null);
    setAppState(AppState.IDLE);
  };

  const handleRestore = (item: SavedItem) => {
    setInputText(item.input);
    setNewsMode(item.mode);
    setGeneratedNews(item.output);
    setAppState(item.output ? AppState.SUCCESS : AppState.IDLE);
    setIsHistoryOpen(false);
  };

  const handleDeleteForever = (id: string) => {
    setHistoryItems(deleteItemFromHistory(id));
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      <Header onOpenHistory={() => setIsHistoryOpen(true)} />
      
      {isKeyMissing && (
        <div className="bg-blue-600 text-white px-4 py-2.5 flex items-center justify-center space-x-6 z-30 shadow-lg animate-in slide-in-from-top-full">
          <div className="flex items-center space-x-2">
            <KeyRound className="w-4 h-4" />
            <span className="text-sm font-bold">Gelişmiş AI özelliklerini kullanmak için faturalandırması açık bir proje seçin.</span>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={handleKeySelect} className="bg-white text-blue-600 px-4 py-1 rounded-lg text-xs font-black uppercase hover:bg-blue-50 transition-colors">PROJE SEÇ</button>
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-[10px] underline flex items-center opacity-80 hover:opacity-100">Faturalandırma <ExternalLink className="w-2.5 h-2.5 ml-1" /></a>
          </div>
        </div>
      )}

      <HistoryDrawer isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} items={historyItems} onRestore={handleRestore} onDeleteForever={handleDeleteForever} />
      
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {errorMessage && (
          <div className="mb-6 bg-rose-50 border-l-4 border-rose-500 p-5 rounded-xl shadow-sm max-w-4xl mx-auto flex items-center justify-between animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              <span className="text-sm text-rose-700 font-bold">{errorMessage}</span>
            </div>
            <button 
              onClick={handleGenerate}
              className="flex items-center space-x-2 bg-rose-600 text-white px-3 py-1.5 rounded-lg text-xs font-black hover:bg-rose-700 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>TEKRAR DENE</span>
            </button>
          </div>
        )}

        {/* Loading Overlay */}
        {appState === AppState.LOADING && !generatedNews && (
          <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
             <div className="w-full max-w-md p-8 bg-white rounded-3xl shadow-2xl border border-slate-100 text-center">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-6" />
                <h3 className="text-xl font-black text-slate-900 mb-2">Haber Oluşturuluyor</h3>
                <p className="text-slate-500 text-sm mb-8">Yapay zeka asistanınız verileri işliyor.</p>
                
                <div className="w-full bg-slate-100 rounded-full h-2 mb-4 overflow-hidden">
                   <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out" 
                      style={{ width: `${((loadingStep + 1) / LOADING_STEPS.length) * 100}%` }}
                   />
                </div>
                <p className="text-xs font-bold text-blue-600 uppercase tracking-widest animate-pulse">
                   {LOADING_STEPS[loadingStep]}
                </p>
             </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-140px)] min-h-[700px]">
          <div className="lg:col-span-5 h-full">
            <InputSection value={inputText} onChange={setInputText} selectedMode={newsMode} onModeChange={setNewsMode} selectedTone={newsTone} onToneChange={setNewsTone} onClear={handleClear} onGenerate={handleGenerate} isLoading={appState === AppState.LOADING} />
          </div>
          <div className="lg:col-span-7 h-full">
            <OutputSection news={generatedNews} isEmpty={appState === AppState.IDLE || (appState === AppState.LOADING && !generatedNews)} onArchive={handleArchive} />
          </div>
        </div>
      </main>
      <ChatBot />
    </div>
  );
}

export default App;
