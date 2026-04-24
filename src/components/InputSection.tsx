
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
    <div className="bg-[var(--paper)] rounded-3xl shadow-xl shadow-zinc-200/50 dark:shadow-none border border-[var(--border)] flex flex-col h-full overflow-hidden transition-all duration-300">
      
      {/* Header Area */}
      <div className="p-6 border-b border-[var(--border)] flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-950/50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-xl shadow-indigo-500/30">
            <Feather className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em]">Editör Masası</h2>
            <span className="text-sm font-black text-[var(--ink)] tracking-tight">VAKANÜVİS KONTROL PANELİ</span>
          </div>
        </div>
        <button 
          onClick={onClear} 
          className="p-3 rounded-2xl text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all border border-transparent hover:border-rose-100 dark:border-zinc-800" 
          title="Tümünü Temizle ve Sıfırla" 
          disabled={isLoading}
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Config Area */}
      <div className="p-6 pb-4 bg-gradient-to-b from-white to-zinc-50/50 dark:from-zinc-900 dark:to-zinc-900 space-y-6 overflow-y-auto custom-scrollbar">
        <div>
          <label className="flex items-center gap-3 text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-4">
             <Hash className="w-3.5 h-3.5" />
             <span>Haber Kategorisi</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-2">
            {NEWS_MODES.map((mode) => (
              <button
                key={mode}
                onClick={() => onModeChange(mode)}
                disabled={isLoading}
                className={`px-3 py-3 rounded-xl text-[10px] font-black transition-all border text-center truncate ${selectedMode === mode ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-600/20' : 'bg-[var(--paper)] text-[var(--muted)] border-[var(--border)] hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-zinc-700'}`}
                title={mode}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="flex items-center gap-3 text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-4">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Ton & Üslup</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {NEWS_TONES.map((tone) => (
              <button
                key={tone}
                onClick={() => onToneChange(tone)}
                disabled={isLoading}
                className={`px-4 py-3 rounded-xl text-[10px] font-black transition-all border text-center ${selectedTone === tone ? 'bg-zinc-900 dark:bg-indigo-600 text-white border-zinc-900 dark:border-indigo-600 shadow-lg' : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-indigo-400 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700'}`}
              >
                {tone}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col space-y-3">
          <div className="flex items-start space-x-3 text-xs text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-800 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-700 shadow-sm transition-all hover:shadow-md">
            <Info className="w-4 h-4 mt-0.5 text-indigo-500 flex-shrink-0" />
            <p className="leading-relaxed opacity-90">
              <span className="font-bold text-zinc-900 dark:text-white">{selectedMode}:</span> {MODE_DESCRIPTIONS[selectedMode]}
            </p>
          </div>
        </div>

        {/* Advanced Features Toggle */}
        <div className="border-t border-zinc-100 dark:border-zinc-800 pt-5 mt-2">
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center space-x-2 text-[11px] font-black text-zinc-900 dark:text-zinc-300 uppercase tracking-widest hover:text-indigo-600 transition-colors group"
            >
              <div className={`p-1.5 rounded-lg transition-colors ${showAdvanced ? 'bg-indigo-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 group-hover:bg-indigo-50 group-hover:text-indigo-600'}`}>
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
                className="text-[9px] font-bold text-indigo-600 hover:underline uppercase tracking-tighter"
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
              className={`w-full flex items-center justify-center py-4 px-6 rounded-2xl font-black text-[11px] uppercase tracking-[0.25em] transition-all shadow-xl ${!value.trim() || isLoading ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-300 dark:text-zinc-600 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-[1.01] active:scale-95 shadow-indigo-600/20'}`}
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
      <div className="flex-1 p-8 relative group bg-[var(--paper)] flex flex-col border-t border-[var(--border)] min-h-[400px]">
        <div className="absolute top-6 right-6 z-10 flex space-x-2">
           <button
             onClick={toggleListening}
             className={`p-3 rounded-2xl transition-all shadow-xl border ${isListening ? 'bg-rose-500 text-white border-rose-600 animate-pulse' : 'bg-[var(--paper)] text-[var(--muted)] hover:text-indigo-600 border-[var(--border)] hover:scale-110 active:scale-95'}`}
             title={isListening ? 'Dinlemeyi Durdur' : 'Sesli Giriş'}
           >
             {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
           </button>
        </div>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Vakanüvis için haber notlarını, ajans metnini veya ham verileri buraya yapıştırın..."
          className="flex-1 w-full resize-none outline-none text-[var(--ink)] placeholder-zinc-300 dark:placeholder-zinc-600 text-xl leading-[1.8] bg-transparent font-serif custom-scrollbar"
          disabled={isLoading}
        />
        
        {value.length > 0 && (
          <div className="mt-4 pt-4 border-t border-zinc-50 animate-in fade-in slide-in-from-bottom-2">
             <div className="flex flex-wrap gap-2">
                {keywordDensity.map((item, i) => (
                  <div key={i} className="flex items-center bg-zinc-50 border border-zinc-100 rounded-md px-2 py-1 space-x-2">
                    <span className="text-[11px] font-bold text-zinc-600">{item.word}</span>
                    <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1 rounded">%{item.density}</span>
                  </div>
                ))}
             </div>
          </div>
        )}
        
        {!value && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             <div className="pointer-events-auto opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-y-0 translate-y-2">
                <button onClick={handleInsertExample} className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 bg-white hover:bg-indigo-50 px-6 py-3 rounded-full text-sm font-bold border border-indigo-100 shadow-xl shadow-indigo-100/50 transition-all">
                  <FileInput className="w-4 h-4" />
                  <span>Örnek Veri ile Dene</span>
                </button>
             </div>
          </div>
        )}
      </div>

      {/* Footer Stats Area */}
      {value.length > 0 && (
        <div className="px-6 py-3 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
           <div className="flex items-center space-x-2 text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
              <TrendingUp className="w-3 h-3" />
              <span>İçerik Analizi</span>
           </div>
           <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-mono bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2 py-1 rounded-md shadow-sm">{wordCount} Kelime</span>
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
    className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-[10px] font-bold transition-all border ${active ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-white dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-zinc-100 dark:border-zinc-700 hover:border-zinc-200 dark:hover:border-zinc-600'}`}
  >
    <span className={active ? 'text-white' : 'text-indigo-500'}>{icon}</span>
    <span className="truncate">{label}</span>
  </button>
);
