
import React, { useMemo, useState } from 'react';
import { Eraser, Sparkles, FileInput, Info, Trash2, Hash, TrendingUp, MessageSquare, Feather, Settings2, ChevronDown, ChevronUp, Zap, Video, Image as ImageIcon, Search, History, Globe, Calendar, Database, ShieldCheck, Share2, MousePointer2, RefreshCw, Loader2, Mic, MicOff } from 'lucide-react';
import { NewsMode, NEWS_MODES, MODE_DESCRIPTIONS, EXAMPLE_INPUT_TEXT, NewsTone, NEWS_TONES, TONE_DESCRIPTIONS, AdvancedFeatures } from '../types';

interface InputSectionProps {
  value: string;
  onChange: (value: string) => void;
  selectedMode: NewsMode;
  onModeChange: (mode: NewsMode) => void;
  selectedTone: NewsTone;
  onToneChange: (tone: NewsTone) => void;
  advancedFeatures: AdvancedFeatures;
  onAdvancedFeatureChange: (feature: keyof AdvancedFeatures) => void;
  onClear: () => void;
  onGenerate: () => void;
  isLoading: boolean;
}

const STOP_WORDS = new Set([
  've', 'bir', 'bu', 'de', 'da', 'ne', 'mi', 'ama', 'için', 'çok', 'her', 'gibi', 
  'kadar', 'ile', 'en', 'ise', 'ki', 'o', 'bu', 'şu', 'mı', 'mu', 'mü', 'veya',
  'ise', 'ancak', 'belki', 'çünkü', 'daha', 'hem', 'hiç', 'ise', 'kez', 'neden', 'nasıl'
]);

export const InputSection: React.FC<InputSectionProps> = ({ 
  value, 
  onChange,
  selectedMode,
  onModeChange,
  selectedTone,
  onToneChange,
  advancedFeatures,
  onAdvancedFeatureChange,
  onClear, 
  onGenerate, 
  isLoading 
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const handleInsertExample = () => onChange(EXAMPLE_INPUT_TEXT);

  const toggleListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('speechRecognition' in window)) {
      alert('Tarayıcınız sesli girişi desteklemiyor.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).speechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'tr-TR';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (finalTranscript) {
        onChange(value + (value ? ' ' : '') + finalTranscript);
      }
    };

    recognition.start();
  };

  const keywordDensity = useMemo(() => {
    if (!value.trim()) return [];
    const words = value.toLocaleLowerCase('tr-TR')
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"")
      .split(/\s+/)
      .filter(w => w.length > 2 && !STOP_WORDS.has(w));
    
    const counts: Record<string, number> = {};
    words.forEach(w => { counts[w] = (counts[w] || 0) + 1; });

    return Object.entries(counts)
      .map(([word, count]) => ({ word, count, density: ((count / words.length) * 100).toFixed(1) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [value]);

  const wordCount = useMemo(() => value.trim() ? value.trim().split(/\s+/).length : 0, [value]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 flex flex-col h-full overflow-hidden transition-all duration-300">
      
      {/* Header Area */}
      <div className="p-5 px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-blue-600 flex items-center justify-center shadow-lg">
            <Feather className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Editör Masası</h2>
            <span className="text-xs font-bold text-slate-900 dark:text-white">VAKANÜVİS KONTROL PANELİ</span>
          </div>
        </div>
        <button 
          onClick={onClear} 
          className="p-2.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all border border-transparent hover:border-rose-100" 
          title="Tümünü Temizle ve Sıfırla" 
          disabled={isLoading}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Config Area */}
      <div className="p-6 pb-4 bg-gradient-to-b from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-900 space-y-6 overflow-y-auto custom-scrollbar">
        <div>
          <label className="flex items-center space-x-2 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
             <Hash className="w-3 h-3" />
             <span>Haber Kategorisi</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-2">
            {NEWS_MODES.map((mode) => (
              <button
                key={mode}
                onClick={() => onModeChange(mode)}
                disabled={isLoading}
                className={`px-2 py-2 rounded-lg text-[10px] font-bold transition-all border text-center truncate ${selectedMode === mode ? 'bg-slate-800 dark:bg-blue-600 text-white border-slate-800 dark:border-blue-600 shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                title={mode}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="flex items-center space-x-2 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
            <MessageSquare className="w-3 h-3" />
            <span>Ton & Üslup</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {NEWS_TONES.map((tone) => (
              <button
                key={tone}
                onClick={() => onToneChange(tone)}
                disabled={isLoading}
                className={`px-3 py-2 rounded-lg text-[10px] font-bold transition-all border text-center ${selectedTone === tone ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200' : 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-slate-700'}`}
              >
                {tone}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col space-y-3">
          <div className="flex items-start space-x-3 text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
            <Info className="w-4 h-4 mt-0.5 text-blue-500 flex-shrink-0" />
            <p className="leading-relaxed opacity-90">
              <span className="font-bold text-slate-900 dark:text-white">{selectedMode}:</span> {MODE_DESCRIPTIONS[selectedMode]}
            </p>
          </div>
        </div>

        {/* Advanced Features Toggle */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-5 mt-2">
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center space-x-2 text-[11px] font-black text-slate-900 dark:text-slate-300 uppercase tracking-widest hover:text-blue-600 transition-colors group"
            >
              <div className={`p-1.5 rounded-lg transition-colors ${showAdvanced ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600'}`}>
                <Settings2 className="w-3.5 h-3.5" />
              </div>
              <span>Gelişmiş Analiz Özellikleri</span>
              {showAdvanced ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
            </button>

            {showAdvanced && (
              <button 
                onClick={() => {
                  const allActive = Object.values(advancedFeatures).every(v => v);
                  Object.keys(advancedFeatures).forEach(key => {
                    if (advancedFeatures[key as keyof AdvancedFeatures] !== !allActive) {
                      onAdvancedFeatureChange(key as keyof AdvancedFeatures);
                    }
                  });
                }}
                className="text-[9px] font-bold text-blue-600 hover:underline uppercase tracking-tighter"
              >
                {Object.values(advancedFeatures).every(v => v) ? 'Tümünü Kaldır' : 'Tümünü Seç'}
              </button>
            )}
          </div>

          {showAdvanced && (
            <div className="grid grid-cols-2 gap-2 mt-2 animate-in fade-in slide-in-from-top-2 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar pb-2">
              <FeatureToggle 
                label="Trend Keşif Motoru" 
                active={advancedFeatures.trendDiscovery} 
                onClick={() => onAdvancedFeatureChange('trendDiscovery')} 
                icon={<TrendingUp className="w-3 h-3" />}
              />
              <FeatureToggle 
                label="Performans Tahmini" 
                active={advancedFeatures.performancePrediction} 
                onClick={() => onAdvancedFeatureChange('performancePrediction')} 
                icon={<Zap className="w-3 h-3" />}
              />
              <FeatureToggle 
                label="İç Bağlantı Önerisi" 
                active={advancedFeatures.internalLinks} 
                onClick={() => onAdvancedFeatureChange('internalLinks')} 
                icon={<Globe className="w-3 h-3" />}
              />
              <FeatureToggle 
                label="Video / Shorts Script" 
                active={advancedFeatures.videoScript} 
                onClick={() => onAdvancedFeatureChange('videoScript')} 
                icon={<Video className="w-3 h-3" />}
              />
              <FeatureToggle 
                label="Haber Görseli Önerisi" 
                active={advancedFeatures.imageSuggestions} 
                onClick={() => onAdvancedFeatureChange('imageSuggestions')} 
                icon={<ImageIcon className="w-3 h-3" />}
              />
              <FeatureToggle 
                label="AI Editör Kontrolü" 
                active={advancedFeatures.aiEditorAudit} 
                onClick={() => onAdvancedFeatureChange('aiEditorAudit')} 
                icon={<Search className="w-3 h-3" />}
              />
              <FeatureToggle 
                label="Haber Sürüm Analizi" 
                active={advancedFeatures.versionAnalysis} 
                onClick={() => onAdvancedFeatureChange('versionAnalysis')} 
                icon={<RefreshCw className="w-3 h-3" />}
              />
              <FeatureToggle 
                label="Haber Arşivi Analizi" 
                active={advancedFeatures.archiveAnalysis} 
                onClick={() => onAdvancedFeatureChange('archiveAnalysis')} 
                icon={<History className="w-3 h-3" />}
              />
              <FeatureToggle 
                label="Discover Optimizasyonu" 
                active={advancedFeatures.discoverOptimization} 
                onClick={() => onAdvancedFeatureChange('discoverOptimization')} 
                icon={<MousePointer2 className="w-3 h-3" />}
              />
              <FeatureToggle 
                label="Editoryal Takvim" 
                active={advancedFeatures.editorialCalendar} 
                onClick={() => onAdvancedFeatureChange('editorialCalendar')} 
                icon={<Calendar className="w-3 h-3" />}
              />
              <FeatureToggle 
                label="Veri → Haber Üretimi" 
                active={advancedFeatures.dataToNews} 
                onClick={() => onAdvancedFeatureChange('dataToNews')} 
                icon={<Database className="w-3 h-3" />}
              />
              <FeatureToggle 
                label="Fact Check (Doğrulama)" 
                active={advancedFeatures.factCheck} 
                onClick={() => onAdvancedFeatureChange('factCheck')} 
                icon={<ShieldCheck className="w-3 h-3" />}
              />
              <FeatureToggle 
                label="Otomatik Dağıtım" 
                active={advancedFeatures.distributionContent} 
                onClick={() => onAdvancedFeatureChange('distributionContent')} 
                icon={<Share2 className="w-3 h-3" />}
              />
            </div>
          )}

          {/* Haber Oluştur Button - Integrated into Advanced area */}
          <div className="mt-6">
            <button
              onClick={onGenerate}
              disabled={!value.trim() || isLoading}
              className={`w-full flex items-center justify-center py-4 px-6 rounded-2xl font-black text-[11px] uppercase tracking-[0.25em] transition-all shadow-xl ${!value.trim() || isLoading ? 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-[1.01] active:scale-95 shadow-blue-600/20'}`}
            >
              {isLoading ? (
                <div className="flex items-center space-x-3">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>İşleniyor...</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <Sparkles className="w-5 h-5 mr-3 text-yellow-300 fill-current" />
                  HABER OLUŞTUR
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Text Area */}
      <div className="flex-1 p-8 relative group bg-white dark:bg-slate-900 flex flex-col border-t border-slate-200 dark:border-slate-800 min-h-[350px]">
        <div className="absolute top-6 right-6 z-10 flex space-x-2">
           <button
             onClick={toggleListening}
             className={`p-3 rounded-2xl transition-all shadow-xl border ${isListening ? 'bg-rose-500 text-white border-rose-600 animate-pulse' : 'bg-white dark:bg-slate-800 text-slate-400 hover:text-blue-600 border-slate-200 dark:border-slate-700'}`}
             title={isListening ? 'Dinlemeyi Durdur' : 'Sesli Giriş'}
           >
             {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
           </button>
        </div>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Vakanüvis için haber notlarını, ajans metnini veya ham verileri buraya yapıştırın..."
          className="flex-1 w-full resize-none outline-none text-slate-800 dark:text-slate-200 placeholder-slate-300 dark:placeholder-slate-600 text-xl leading-relaxed bg-transparent font-serif custom-scrollbar"
          disabled={isLoading}
        />
        
        {value.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-50 animate-in fade-in slide-in-from-bottom-2">
             <div className="flex flex-wrap gap-2">
                {keywordDensity.map((item, i) => (
                  <div key={i} className="flex items-center bg-slate-50 border border-slate-100 rounded-md px-2 py-1 space-x-2">
                    <span className="text-[11px] font-bold text-slate-600">{item.word}</span>
                    <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1 rounded">%{item.density}</span>
                  </div>
                ))}
             </div>
          </div>
        )}
        
        {!value && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             <div className="pointer-events-auto opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-y-0 translate-y-2">
                <button onClick={handleInsertExample} className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 bg-white hover:bg-blue-50 px-6 py-3 rounded-full text-sm font-bold border border-blue-100 shadow-xl shadow-blue-100/50 transition-all">
                  <FileInput className="w-4 h-4" />
                  <span>Örnek Veri ile Dene</span>
                </button>
             </div>
          </div>
        )}
      </div>

      {/* Footer Stats Area */}
      {value.length > 0 && (
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
           <div className="flex items-center space-x-2 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              <TrendingUp className="w-3 h-3" />
              <span>İçerik Analizi</span>
           </div>
           <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-md shadow-sm">{wordCount} Kelime</span>
        </div>
      )}
    </div>
  );
};

interface FeatureToggleProps {
  label: string;
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}

const FeatureToggle: React.FC<FeatureToggleProps> = ({ label, active, onClick, icon }) => (
  <button 
    onClick={onClick}
    className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-[10px] font-bold transition-all border ${active ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600'}`}
  >
    <span className={active ? 'text-white' : 'text-blue-500'}>{icon}</span>
    <span className="truncate">{label}</span>
  </button>
);
