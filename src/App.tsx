
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
  const [inputText, setInputText] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('vakanuvis_input_text') || '';
    }
    return '';
  });
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
  const [advancedFeatures, setAdvancedFeatures] = useState<AdvancedFeatures>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vakanuvis_advanced_features');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          return DEFAULT_ADVANCED_FEATURES;
        }
      }
    }
    return DEFAULT_ADVANCED_FEATURES;
  });
  const [generatedNews, setGeneratedNews] = useState<GeneratedNews | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vakanuvis_generated_news');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  });
  const [appState, setAppState] = useState<AppState>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('vakanuvis_generated_news') ? AppState.SUCCESS : AppState.IDLE;
    }
    return AppState.IDLE;
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyItems, setHistoryItems] = useState<SavedItem[]>([]);
  const [currentHistoryId, setCurrentHistoryId] = useState<string | null>(null);
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

  useEffect(() => {
    localStorage.setItem('vakanuvis_input_text', inputText);
  }, [inputText]);

  useEffect(() => {
    localStorage.setItem('vakanuvis_advanced_features', JSON.stringify(advancedFeatures));
  }, [advancedFeatures]);

  useEffect(() => {
    if (generatedNews) {
      localStorage.setItem('vakanuvis_generated_news', JSON.stringify(generatedNews));
    } else {
      localStorage.removeItem('vakanuvis_generated_news');
    }
  }, [generatedNews]);

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

  const handleGenerate = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    const text = inputText.trim();
    if (!text) return;

    // Reset state for a fresh start
    setAppState(AppState.LOADING);
    setErrorMessage(null);
    
    // Check for API key before starting
    const hasKey = await checkApiKeySelection();
    if (!hasKey) {
      setIsKeyMissing(true);
      setAppState(AppState.ERROR);
      setErrorMessage("Lütfen devam etmek için bir API anahtarı seçin.");
      return;
    }

    try {
      // Add a client-side timeout of 60 seconds
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("İşlem çok uzun sürdü. Lütfen tekrar deneyin.")), 60000)
      );

      const news = await Promise.race([
        generateNewsContent(text, newsConfig.mode, newsConfig.tone, advancedFeatures),
        timeoutPromise
      ]) as GeneratedNews;
      
      if (!news) {
        throw new Error("Haber içeriği oluşturulamadı. Lütfen tekrar deneyin.");
      }

      setGeneratedNews(news);
      setAppState(AppState.SUCCESS);
      addToast("Haber başarıyla oluşturuldu!", "success");

      const newId = currentHistoryId || generateId();
      const newItem: SavedItem = {
        id: newId,
        timestamp: Date.now(),
        status: 'active',
        input: text,
        mode: newsConfig.mode,
        tone: newsConfig.tone,
        output: news
      };
      setHistoryItems(addItemToHistory(newItem));
      setCurrentHistoryId(newId);

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

  const handleArchive = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    const text = inputText.trim();
    if (!text) return;
    const newItem: SavedItem = {
      id: currentHistoryId || generateId(),
      timestamp: Date.now(),
      status: 'archived',
      input: text,
      mode: newsConfig.mode,
      tone: newsConfig.tone,
      output: generatedNews
    };
    setHistoryItems(addItemToHistory(newItem));
    setInputText('');
    setGeneratedNews(null);
    setAppState(AppState.IDLE);
    setCurrentHistoryId(null);
    addToast("Haber arşive eklendi.", "info");
  };

  const handleClear = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    const text = inputText.trim();
    if (text) {
      // Always generate a new ID for the trashed backup so we don't overwrite archived/active items
      const newItem: SavedItem = {
        id: generateId(),
        timestamp: Date.now(),
        status: 'trashed',
        input: text,
        mode: newsConfig.mode,
        tone: newsConfig.tone,
        output: generatedNews
      };
      setHistoryItems(addItemToHistory(newItem));
    }
    setInputText('');
    setGeneratedNews(null);
    setAppState(AppState.IDLE);
    setNewsConfig(DEFAULT_NEWS_CONFIG);
    setCurrentHistoryId(null);
    addToast("Form temizlendi.", "info");
  };

  const handleRestore = (item: SavedItem) => {
    setInputText(item.input);
    setNewsConfig(prev => ({ ...prev, mode: item.mode, tone: item.tone || prev.tone }));
    setGeneratedNews(item.output);
    setAppState(item.output ? AppState.SUCCESS : AppState.IDLE);
    setCurrentHistoryId(item.id);
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
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] w-full max-w-2xl animate-in slide-in-from-top-4 duration-500">
          <div className="mx-4 bg-rose-600 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between border border-rose-500 ring-4 ring-rose-600/20">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Sistem Hatası</p>
                <p className="text-sm font-bold leading-tight">{errorMessage}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={handleGenerate}
                className="bg-white text-rose-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-rose-50 transition-all active:scale-95 whitespace-nowrap"
              >
                Yeniden Dene
              </button>
              <button 
                onClick={() => setErrorMessage(null)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

        {/* Loading Overlay */}
        {appState === AppState.LOADING && (
          <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center animate-in fade-in duration-300">
             <div className="w-full max-w-md p-10 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-center shadow-2xl transform transition-all">
                <div className="relative w-20 h-20 mx-auto mb-8">
                  <div className="absolute inset-0 border-4 border-blue-100 dark:border-slate-800 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Feather className="w-8 h-8 text-blue-600 animate-pulse" />
                  </div>
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Vakanüvis Yazıyor</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 font-medium">Haberin dijital hafızası kurgulanıyor.</p>
                
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mb-4 overflow-hidden shadow-inner">
                   <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-700 h-2 rounded-full transition-all duration-700 ease-out relative overflow-hidden" 
                      style={{ width: `${((loadingStep + 1) / LOADING_STEPS.length) * 100}%` }}
                   >
                     <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]"></div>
                   </div>
                </div>
                <p className="text-[11px] font-black text-blue-600 uppercase tracking-[0.2em] animate-pulse">
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
            <OutputSection 
              news={generatedNews} 
              isEmpty={!generatedNews} 
              onArchive={handleArchive} 
              selectedTone={newsConfig.tone} 
            />
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
                <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-widest uppercase">Vakanüvis AI v3.0 PRO</h2>
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
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">© 2026 Vakanüvis AI v3.0 PRO</p>
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
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-500">
            <div className="p-10 text-center">
              <div className="w-20 h-20 bg-slate-900 dark:bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl">
                <Feather className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] mb-3">Vakanüvis AI</h2>
              <p className="text-slate-500 dark:text-slate-400 text-base mb-10 font-medium">Haberin dijital hafızasına hoş geldiniz.</p>
              
              <div className="grid grid-cols-1 gap-4 mb-10 text-left">
                <div className="flex items-center space-x-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="p-2 bg-white dark:bg-slate-700 rounded-xl shadow-sm">
                    <Zap className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Hızlı ve özgün haber üretimi</span>
                </div>
                <div className="flex items-center space-x-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="p-2 bg-white dark:bg-slate-700 rounded-xl shadow-sm">
                    <Search className="w-5 h-5 text-emerald-600" />
                  </div>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">SEO ve Discover optimizasyonu</span>
                </div>
              </div>
              
              <button 
                onClick={closeWelcome}
                className="w-full py-4 bg-slate-900 dark:bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-800 dark:hover:bg-blue-700 transition-all shadow-lg hover:scale-[1.02] active:scale-95"
              >
                Sisteme Giriş Yap
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
