
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

    setAppState(AppState.LOADING);
    setErrorMessage(null);

    try {
      const news = await generateNewsContent(text, newsConfig.mode, newsConfig.tone, advancedFeatures);
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
      setAppState(AppState.ERROR);
      console.error("Generation Error:", error);
      
      const errorMessage = error.message || "";
      const errorStatus = error.status || error.code || 0;
      
      if (errorMessage.includes('spending cap')) {
        setErrorMessage("Seçili projenin harcama limiti (spending cap) dolmuş. Lütfen Google Cloud konsolundan limiti artırın veya 'PROJE SEÇ' butonuyla başka bir proje seçin.");
        setIsKeyMissing(true);
      } else if (errorMessage.includes('quota') || errorMessage.includes('429')) {
        setErrorMessage("API kullanım kotası aşıldı. Lütfen bir süre bekleyip tekrar deneyin veya farklı bir proje seçmeyi deneyin.");
      } else if (errorMessage.includes('timeout') || errorMessage.includes('deadline')) {
        setErrorMessage("İstek zaman aşımına uğradı. İnternet bağlantınızı kontrol edip tekrar deneyin.");
      } else if (errorMessage.includes('503') || errorMessage.includes('UNAVAILABLE') || errorMessage.includes('high demand')) {
        setErrorMessage("Sistem şu an çok yoğun. Birkaç saniye sonra tekrar denerseniz size yardımcı olabilirim.");
      } else if (errorStatus === 500 || errorMessage.includes('500') || errorMessage.includes('Internal Server Error')) {
        setErrorMessage("API Hatası (500). Lütfen 'Proje Seç' butonuna tıklayarak geçerli bir proje seçtiğinizden emin olun.");
        setIsKeyMissing(true);
      } else if (errorMessage.includes('API key not found') || errorMessage.includes('invalid API key')) {
        setErrorMessage("API anahtarı bulunamadı veya geçersiz. Lütfen proje seçimini kontrol edin.");
        setIsKeyMissing(true);
      } else {
        setErrorMessage(error.message || "Haber oluşturulurken bir teknik sorun oluştu. Lütfen tekrar deneyin.");
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
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex flex-col font-sans text-slate-900 dark:text-slate-100 selection:bg-blue-100 selection:text-blue-900 transition-colors duration-300">
      <Header onOpenHistory={() => setIsHistoryOpen(true)} isDarkMode={isDarkMode} onToggleTheme={toggleTheme} />
      
      {isKeyMissing && (
        <div className="bg-blue-600 text-white px-4 py-2.5 flex items-center justify-center space-x-6 z-30 shadow-lg animate-in slide-in-from-top-full">
          <div className="flex items-center space-x-2">
            <KeyRound className="w-4 h-4" />
            <span className="text-sm font-bold">Gelişmiş AI özelliklerini kullanmak için faturalandırması açık bir proje seçin.</span>
          </div>
          <div className="flex items-center space-x-3">
            <button onClick={handleKeySelect} className="bg-white text-blue-600 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase hover:bg-blue-50 transition-colors">PROJE SEÇ</button>
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
        {appState === AppState.LOADING && !generatedNews && (
          <div className="fixed inset-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
             <div className="w-full max-w-md p-8 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 text-center">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-6" />
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Vakanüvis Yazıyor</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">Haberin dijital hafızası kurgulanıyor.</p>
                
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mb-4 overflow-hidden">
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
      
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 py-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-blue-600 flex items-center justify-center shadow-lg">
                  <Feather className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-widest uppercase">Vakanüvis AI</h2>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-medium italic">
                "Vakanüvis, bin yıllık yazım geleneğini yapay zekanın hızıyla birleştiren profesyonel bir dijital editördür. Ajanslardan gelen ham haberleri saniyeler içinde SEO uyumlu, tamamen özgün ve çarpıcı başlıklarla donatılmış dijital içeriklere dönüştürür."
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Editörlerinizin iş yükünü %80 azaltırken, haber sitenizin Google sıralamalarını ve tıklanma oranlarını yukarı taşır. Adana’nın cesur girişimci ruhuyla geliştirdiğimiz bu teknolojiyle, haber odanızı bir veri fabrikasından bir içerik atölyesine dönüştürüyoruz. Vakanüvis ile sadece haber yazmayın; tarihe iz bırakın.
              </p>
              <div className="mt-4 flex items-center space-x-2">
                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700"></div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Geleceğin Kalemi</span>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">© 2026 Vakanüvis AI - Tüm Hakları Saklıdır</p>
            <div className="flex space-x-6">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest cursor-default hover:text-blue-600 transition-colors">Hızlı</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest cursor-default hover:text-blue-600 transition-colors">SEO Odaklı</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest cursor-default hover:text-blue-600 transition-colors">Otoriter</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest cursor-default hover:text-blue-600 transition-colors">Bilge</span>
            </div>
          </div>
        </div>
      </footer>

      <ChatBot />

      {/* Toast Notifications */}
      <div className="fixed top-20 right-6 z-[100] space-y-3 pointer-events-none">
        {toasts.map(toast => (
          <div 
            key={toast.id}
            className={`pointer-events-auto flex items-center space-x-3 px-4 py-3 rounded-xl shadow-2xl border animate-in slide-in-from-right-5 duration-300 ${
              toast.type === 'success' ? 'bg-emerald-600 border-emerald-500 text-white' :
              toast.type === 'error' ? 'bg-rose-600 border-rose-500 text-white' :
              'bg-slate-900 border-slate-800 text-white'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : 
             toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> : 
             <Info className="w-4 h-4" />}
            <span className="text-xs font-bold">{toast.message}</span>
            <button onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} className="ml-2 hover:opacity-70 transition-opacity">
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      {/* Welcome Modal */}
      {showWelcome && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-500">
            <div className="relative h-48 bg-slate-900 dark:bg-slate-950 flex items-center justify-center overflow-hidden">
               <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#3b82f6,transparent_70%)]" />
               </div>
               <div className="relative z-10 text-center">
                  <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl rotate-3">
                     <Feather className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-[0.3em]">Vakanüvis AI</h2>
               </div>
            </div>
            
            <div className="p-10">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                  <div className="flex items-start space-x-4">
                     <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                        <Zap className="w-5 h-5 text-blue-600" />
                     </div>
                     <div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase mb-1">Hızlı Üretim</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Saniyeler içinde ajans notlarından profesyonel haberler üretin.</p>
                     </div>
                  </div>
                  <div className="flex items-start space-x-4">
                     <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                        <Search className="w-5 h-5 text-emerald-600" />
                     </div>
                     <div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase mb-1">SEO & Discover</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Google Discover ve SEO uyumlu başlıklarla trafiğinizi artırın.</p>
                     </div>
                  </div>
                  <div className="flex items-start space-x-4">
                     <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="w-5 h-5 text-amber-600" />
                     </div>
                     <div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase mb-1">Trend Analizi</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Gündemi takip edin ve trend potansiyeli yüksek içerikler oluşturun.</p>
                     </div>
                  </div>
                  <div className="flex items-start space-x-4">
                     <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center flex-shrink-0">
                        <ShieldCheck className="w-5 h-5 text-rose-600" />
                     </div>
                     <div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase mb-1">Fact Check</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Hataları ayıklayın ve bilginin doğruluğunu denetleyin.</p>
                     </div>
                  </div>
               </div>
               
               <button 
                 onClick={closeWelcome}
                 className="w-full py-4 bg-slate-900 dark:bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-slate-800 dark:hover:bg-blue-700 transition-all shadow-xl"
               >
                 Hemen Başlayın
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
