
import React, { useMemo } from 'react';
import { Eraser, Sparkles, FileInput, Info, Trash2, Hash, TrendingUp, MessageSquare, Feather } from 'lucide-react';
import { NewsMode, NEWS_MODES, MODE_DESCRIPTIONS, EXAMPLE_INPUT_TEXT, NewsTone, NEWS_TONES } from '../types';

interface InputSectionProps {
  value: string;
  onChange: (value: string) => void;
  selectedMode: NewsMode;
  onModeChange: (mode: NewsMode) => void;
  selectedTone: NewsTone;
  onToneChange: (tone: NewsTone) => void;
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
  onClear, 
  onGenerate, 
  isLoading 
}) => {

  const handleInsertExample = () => onChange(EXAMPLE_INPUT_TEXT);

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
    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-white/50 flex flex-col h-full overflow-hidden transition-all duration-300 ring-1 ring-slate-100">
      
      {/* Header / Config Area */}
      <div className="p-6 pb-4 bg-gradient-to-b from-white to-slate-50/50 space-y-6">
        <div>
          <label className="flex items-center space-x-2 text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">
             <Feather className="w-3 h-3" />
             <span>Haber Kategorisi</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {NEWS_MODES.map((mode) => (
              <button
                key={mode}
                onClick={() => onModeChange(mode)}
                disabled={isLoading}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border ${selectedMode === mode ? 'bg-slate-800 text-white border-slate-800 shadow-lg shadow-slate-300 transform scale-105' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="flex items-center space-x-2 text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">
            <MessageSquare className="w-3 h-3" />
            <span>Ton & Üslup</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {NEWS_TONES.map((tone) => (
              <button
                key={tone}
                onClick={() => onToneChange(tone)}
                disabled={isLoading}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border ${selectedTone === tone ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200' : 'bg-white text-blue-600 border-blue-100 hover:bg-blue-50'}`}
              >
                {tone}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-start space-x-3 text-xs text-slate-600 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
          <Info className="w-4 h-4 mt-0.5 text-blue-500 flex-shrink-0" />
          <p className="leading-relaxed opacity-90">
            <span className="font-bold text-slate-900">{selectedMode}:</span> {MODE_DESCRIPTIONS[selectedMode]}
          </p>
        </div>
      </div>
      
      {/* Text Area */}
      <div className="flex-1 p-6 relative group bg-white flex flex-col border-t border-slate-100">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Haber notlarını, ajans metnini veya ham verileri buraya yapıştırın..."
          className="flex-1 w-full resize-none outline-none text-slate-800 placeholder-slate-300 text-lg leading-relaxed bg-transparent font-serif"
          disabled={isLoading}
        />
        
        {value.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-50 animate-in fade-in slide-in-from-bottom-2">
             <div className="flex items-center justify-between mb-3">
               <div className="flex items-center space-x-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <TrendingUp className="w-3 h-3" />
                  <span>İçerik Analizi</span>
               </div>
               <span className="text-[10px] text-slate-400 font-mono bg-slate-100 px-2 py-1 rounded-md">{wordCount} Kelime</span>
             </div>
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

      {/* Action Area */}
      <div className="p-6 bg-white border-t border-slate-50 flex flex-col items-center space-y-4">
        <div className="flex w-full space-x-4">
           {value.length > 0 && (
            <button 
              onClick={onClear} 
              className="px-4 py-3 rounded-2xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all border border-transparent hover:border-rose-100" 
              title="Temizle" 
              disabled={isLoading}
            >
              <Trash2 className="w-5 h-5" />
            </button>
           )}
          <button
            onClick={onGenerate}
            disabled={!value.trim() || isLoading}
            className={`flex-1 flex items-center justify-center py-4 px-6 rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all shadow-xl ${!value.trim() || isLoading ? 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none border border-slate-200' : 'bg-slate-900 text-white hover:bg-black hover:scale-[1.02] shadow-slate-900/20'}`}
          >
            {isLoading ? (
              <span className="opacity-50">İşleniyor...</span>
            ) : (
              <span className="flex items-center">
                <Sparkles className="w-4 h-4 mr-3 text-yellow-400 fill-current" />
                Haber Oluştur
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
