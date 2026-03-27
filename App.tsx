
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { InputSection } from './components/InputSection';
import { OutputSection } from './components/OutputSection';
import { HistoryDrawer } from './components/HistoryDrawer';
import { ChatBot } from './components/ChatBot';
import { generateNewsContent } from './services/geminiService';
import { GeneratedNews, AppState, NewsMode, NEWS_MODES, SavedItem, NewsTone, NEWS_TONES, AdvancedFeatures, DEFAULT_ADVANCED_FEATURES, NewsConfig, DEFAULT_NEWS_CONFIG } from './types';
import { addItemToHistory, getHistory, deleteItemFromHistory } from './services/storage';
import { KeyRound, ExternalLink, AlertCircle, RefreshCw, Loader2, Feather, CheckCircle2, Info, X, Sparkles, Zap, ShieldCheck, Globe, TrendingUp, Search, History as HistoryIcon, MessageSquare } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

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

// Helper for unique IDs
const generateId = () => {
  try {
    return crypto.randomUUID();
  } catch (e) {
    return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
  }
};

function App() {
  const [inputText, setInputText] = useState('');
  const [newsConfig, setNewsConfig] = useState<NewsConfig>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vakanuvis_news_config');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          return DEFAULT_NEWS_CONFIG;
        }
      }
    }
    return DEFAULT_NEWS_CONFIG;
  });
  const [advancedFeatures, setAdvancedFeatures] = useState<AdvancedFeatures>(DEFAULT_ADVANCED_FEATURES);
  const [generatedNews, setGeneratedNews] = useState<GeneratedNews | null>(null);
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyItems, setHistoryItems] = useState<SavedItem[]>([]);
  const [isKeyMissing, setIsKeyMissing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  
  const [showWelcome, setShowWelcome] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  // Loading state management
  const [loadingStep, setLoadingStep] = useState(0);

  useEffect(() => {
    setHistoryItems(getHistory());
    checkApiKeySelection().then(hasKey => setIsKeyMissing(!hasKey));

    const hasSeenWelcome = localStorage.getItem('vakanuvis_welcome_seen');
    if (!hasSeenWelcome) {
      setShowWelcome(true);
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

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

  useEffect(() => {
    localStorage.setItem('vakanuvis_news_config', JSON.stringify(newsConfig));
  }, [newsConfig]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  const closeWelcome = () => {
    setShowWelcome(false);
    localStorage.setItem('vakanuvis_welcome_seen', 'true');
  };

  const handleKeySelect = async () => {
    await triggerKeySelection();
    setIsKeyMissing(false);
  };

  const handleGenerate = async () => {
    const text = inputText.trim();
    if (!text) return;

    // Reset state for a fresh start
    setAppState(AppState.LOADING);
    setErrorMessage(null);
    setGeneratedNews(null); // Clear previous news to ensure loading overlay shows

    try {
      const news = await generateNewsContent(text, newsConfig.mode, newsConfig.tone, advancedFeatures);
      
      if (!news) {
        throw new Error("Haber içeriği oluşturulamadı. Lütfen tekrar deneyin.");
      }

      setGeneratedNews(news);
      setAppState(AppState.SUCCESS);
      addToast("Haber başarıyla oluşturuldu!", "success");

      const newItem: SavedItem = {
        id: generateId(),
        timestamp: Date.now(),
        status: 'active',
        input: text,
        mode: newsConfig.mode,
        output: news
      };
      setHistoryItems(addItemToHistory(newItem));

    } catch (error: any) {
      console.error("Generation Error:", error);
      setAppState(AppState.ERROR);
      
      const errorMessage = error.message || "";
      const errorStatus = error.status || error.code || 0;
      
      if (errorMessage.includes('spending cap')) {
        setErrorMessage("Seçili projenin harcama limiti dolmuş. Lütfen başka bir proje seçin.");
        setIsKeyMissing(true);
      } else if (errorMessage.includes('quota') || errorMessage.includes('429')) {
        setErrorMessage("API kullanım kotası aşıldı. Lütfen biraz bekleyip tekrar deneyin.");
      } else if (errorMessage.includes('timeout') || errorMessage.includes('deadline')) {
        setErrorMessage("İstek zaman aşımına uğradı. Lütfen tekrar deneyin.");
      } else if (errorMessage.includes('503') || errorMessage.includes('UNAVAILABLE')) {
        setErrorMessage("Sistem şu an çok yoğun. Lütfen birkaç saniye sonra tekrar deneyin.");
      } else {
        setErrorMessage(error.message || "Haber oluşturulurken bir sorun oluştu. Lütfen tekrar deneyin.");
      }
    }
  };

  const handleArchive = () => {
    const text = inputText.trim();
    if (!text) return;
    const newItem: SavedItem = {
      id: generateId(),
      timestamp: Date.now(),
      status: 'archived',
      input: text,
      mode: newsConfig.mode,
      output: generatedNews
    };
    setHistoryItems(addItemToHistory(newItem));
    setInputText('');
    setGeneratedNews(null);
    setAppState(AppState.IDLE);
    addToast("Haber arşive eklendi.", "info");
  };

  const handleClear = () => {
    const text = inputText.trim();
    if (text) {
      const newItem: SavedItem = {
        id: generateId(),
        timestamp: Date.now(),
        status: 'trashed',
        input: text,
        mode: newsConfig.mode,
        output: generatedNews
      };
      setHistoryItems(addItemToHistory(newItem));
    }
    setInputText('');
    setGeneratedNews(null);
    setAppState(AppState.IDLE);
    setNewsConfig(DEFAULT_NEWS_CONFIG);
    addToast("Form temizlendi.", "info");
  };

  const handleRestore = (item: SavedItem) => {
    setInputText(item.input);
    setNewsConfig(prev => ({ ...prev, mode: item.mode }));
    setGeneratedNews(item.output);
    setAppState(item.output ? AppState.SUCCESS : AppState.IDLE);
    setIsHistoryOpen(false);
  };

  const handleAdvancedFeatureChange = (feature: keyof AdvancedFeatures) => {
    setAdvancedFeatures(prev => ({ ...prev, [feature]: !prev[feature] }));
  };

  const handleDeleteForever = (id: string) => {
    setHistoryItems(deleteItemFromHistory(id));
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col font-sans text-slate-900 dark:text-slate-100 selection:bg-blue-100 selection:text-blue-900 transition-colors duration-300">
      <Header onOpenHistory={() => setIsHistoryOpen(true)} isDarkMode={isDarkMode} onToggleTheme={toggleTheme} />
      
      {isKeyMissing && (
        <div className="bg-blue-600 text-white px-4 py-2 flex items-center justify-center space-x-6 z-30 animate-in slide-in-from-top-full">
          <div className="flex items-center space-x-2">
            <KeyRound className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">Gelişmiş AI özelliklerini kullanmak için faturalandırması açık bir proje seçin.</span>
          </div>
          <div className="flex items-center space-x-3">
            <button onClick={handleKeySelect} className="bg-white text-blue-600 px-3 py-1 rounded-md text-[10px] font-bold uppercase hover:bg-blue-50 transition-colors">PROJE SEÇ</button>
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-[9px] underline flex items-center opacity-80 hover:opacity-100">Faturalandırma <ExternalLink className="w-2 h-2 ml-1" /></a>
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
              className="flex items-center space-x-1.5 bg-rose-600 text-white px-2.5 py-1 rounded-lg text-[10px] font-black hover:bg-rose-700 transition-colors"
            >
              <RefreshCw className="w-2.5 h-2.5" />
              <span>TEKRAR DENE</span>
            </button>
          </div>
        )}

        {/* Loading Overlay */}
        {appState === AppState.LOADING && (
          <div className="fixed inset-0 bg-white/60 dark:bg-slate-950/60 backdrop-blur-md z-50 flex flex-col items-center justify-center">
             <div className="w-full max-w-sm p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-6" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Vakanüvis Yazıyor</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs mb-8">Haberin dijital hafızası kurgulanıyor.</p>
                
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1 mb-4 overflow-hidden">
                   <div 
                      className="bg-blue-600 h-1 rounded-full transition-all duration-500 ease-out" 
                      style={{ width: `${((loadingStep + 1) / LOADING_STEPS.length) * 100}%` }}
                   />
                </div>
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                   {LOADING_STEPS[loadingStep]}
                </p>
             </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:h-[calc(100vh-140px)] lg:min-h-[700px]">
          <div className="lg:col-span-5 h-full min-h-[500px] lg:min-h-0">
            <InputSection 
              value={inputText} 
              onChange={setInputText} 
              selectedMode={newsConfig.mode} 
              onModeChange={(mode) => setNewsConfig(prev => ({ ...prev, mode }))} 
              selectedTone={newsConfig.tone} 
              onToneChange={(tone) => setNewsConfig(prev => ({ ...prev, tone }))} 
              advancedFeatures={advancedFeatures}
              onAdvancedFeatureChange={handleAdvancedFeatureChange}
              onClear={handleClear} 
              onGenerate={handleGenerate} 
              isLoading={appState === AppState.LOADING} 
            />
          </div>
          <div className="lg:col-span-7 h-full min-h-[600px] lg:min-h-0">
            <OutputSection news={generatedNews} isEmpty={appState === AppState.IDLE || (appState === AppState.LOADING && !generatedNews)} onArchive={handleArchive} selectedTone={newsConfig.tone} />
          </div>
        </div>
      </main>
      
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-blue-600 flex items-center justify-center">
                  <Feather className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-widest uppercase">Vakanüvis AI</h2>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed font-medium italic">
                "Vakanüvis, bin yıllık yazım geleneğini yapay zekanın hızıyla birleştiren profesyonel bir dijital editördür."
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                Editörlerinizin iş yükünü %80 azaltırken, haber sitenizin Google sıralamalarını ve tıklanma oranlarını yukarı taşır.
              </p>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">© 2026 Vakanüvis AI</p>
            <div className="flex space-x-6">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest cursor-default hover:text-blue-600 transition-colors">Hızlı</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest cursor-default hover:text-blue-600 transition-colors">SEO</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest cursor-default hover:text-blue-600 transition-colors">Otoriter</span>
            </div>
          </div>
        </div>
      </footer>

      <ChatBot />

      {/* Toast Notifications */}
      <div className="fixed top-20 right-6 z-[100] space-y-2 pointer-events-none">
        {toasts.map(toast => (
          <div 
            key={toast.id}
            className={`pointer-events-auto flex items-center space-x-3 px-4 py-2 rounded-lg shadow-lg border animate-in slide-in-from-right-5 duration-300 ${
              toast.type === 'success' ? 'bg-emerald-600 border-emerald-500 text-white' :
              toast.type === 'error' ? 'bg-rose-600 border-rose-500 text-white' :
              'bg-slate-900 border-slate-800 text-white'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle2 className="w-3.5 h-3.5" /> : 
             toast.type === 'error' ? <AlertCircle className="w-3.5 h-3.5" /> : 
             <Info className="w-3.5 h-3.5" />}
            <span className="text-[11px] font-medium">{toast.message}</span>
            <button onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} className="ml-2 hover:opacity-70 transition-opacity">
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      {/* Welcome Modal */}
      {showWelcome && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-500">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Feather className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-2">Vakanüvis AI</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">Haberin dijital hafızasına hoş geldiniz.</p>
              
              <div className="grid grid-cols-1 gap-4 mb-8 text-left">
                <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <Zap className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-200">Hızlı ve özgün haber üretimi</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <Search className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-200">SEO ve Discover optimizasyonu</span>
                </div>
              </div>
              
              <button 
                onClick={closeWelcome}
                className="w-full py-3 bg-slate-900 dark:bg-blue-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 dark:hover:bg-blue-700 transition-all"
              >
                Başla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
