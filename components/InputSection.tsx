
import React, { useMemo } from 'react';
import { Eraser, Sparkles, FileInput, Info, Trash2, Hash, TrendingUp, MessageSquare } from 'lucide-react';
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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-md">
      
      <div className="p-6 border-b border-gray-100 bg-white space-y-5">
        <div>
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Haber Kategorisi</label>
          <div className="flex flex-wrap gap-2">
            {NEWS_MODES.map((mode) => (
              <button
                key={mode}
                onClick={() => onModeChange(mode)}
                disabled={isLoading}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${selectedMode === mode ? 'bg-slate-900 text-white border-slate-900 shadow-sm' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Metin Tonu (Üslup)</label>
          <div className="flex flex-wrap gap-2">
            {NEWS_TONES.map((tone) => (
              <button
                key={tone}
                onClick={() => onToneChange(tone)}
                disabled={isLoading}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center space-x-1.5 ${selectedTone === tone ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-blue-50/50 text-blue-600 border-blue-100 hover:border-blue-300'}`}
              >
                <MessageSquare className="w-3 h-3" />
                <span>{tone}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-start space-x-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
          <Info className="w-3.5 h-3.5 mt-0.5 text-slate-400 flex-shrink-0" />
          <p className="leading-relaxed">
            <span className="font-bold text-slate-800">{selectedMode}:</span> {MODE_DESCRIPTIONS[selectedMode]}
          </p>
        </div>
      </div>
      
      <div className="flex-1 p-6 relative group bg-white flex flex-col">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Haber notlarını veya ham metni buraya yapıştırın..."
          className="flex-1 w-full resize-none outline-none text-gray-800 placeholder-gray-300 text-lg leading-relaxed bg-transparent font-serif"
          disabled={isLoading}
        />
        
        {value.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-50">
             <div className="flex items-center justify-between mb-3">
               <div className="flex items-center space-x-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <TrendingUp className="w-3 h-3" />
                  <span>Anahtar Kelime Analizi</span>
               </div>
               <span className="text-[10px] text-slate-400 font-mono">{wordCount} Kelime</span>
             </div>
             <div className="flex flex-wrap gap-2">
                {keywordDensity.map((item, i) => (
                  <div key={i} className="flex items-center bg-slate-50 border border-slate-100 rounded-lg px-2 py-1 space-x-2">
                    <span className="text-xs font-bold text-slate-700">{item.word}</span>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1 rounded">%{item.density}</span>
                  </div>
                ))}
             </div>
          </div>
        )}
        
        {!value && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             <div className="pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button onClick={handleInsertExample} className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 bg-blue-50 px-5 py-2.5 rounded-full text-sm font-bold border border-blue-100 shadow-sm">
                  <FileInput className="w-4 h-4" />
                  <span>Örnek Veri Kullan</span>
                </button>
             </div>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex flex-col items-center space-y-4">
        <div className="flex w-full space-x-4">
           {value.length > 0 && (
            <button onClick={onClear} className="px-4 py-3 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-100" title="Temizle" disabled={isLoading}>
              <Trash2 className="w-5 h-5" />
            </button>
           )}
          <button
            onClick={onGenerate}
            disabled={!value.trim() || isLoading}
            className={`flex-1 flex items-center justify-center py-4 px-6 rounded-2xl font-black text-lg tracking-widest transition-all shadow-lg ${!value.trim() || isLoading ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-black hover:-translate-y-1'}`}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                DÜŞÜNÜLÜYOR & ANALİZ EDİLİYOR...
              </span>
            ) : (
              <span className="flex items-center">
                <Sparkles className="w-5 h-5 mr-3 text-yellow-400" />
                PROFESYONEL HABERİ OLUŞTUR
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
