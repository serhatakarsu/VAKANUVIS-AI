
import React, { useState, useEffect } from 'react';
import { 
  Copy, Check, Coffee, Archive, ThumbsUp, ThumbsDown, 
  Search, Zap, AlertCircle, ChevronDown, ChevronUp, 
  Globe, Lightbulb, RefreshCw, BarChart3, Settings2,
  MousePointer2, Sparkles, TrendingUp, Target, ShieldCheck, Loader2, Link as LinkIcon, Share2, Layers,
  Quote, MessageSquareText, AlignLeft, Info, Hash, Twitter, Facebook, History, Tag, ListFilter,
  Video, Image as ImageIcon, FileSearch, Calendar, CheckCircle2, Send, Activity, FileText,
  ListChecks, Clock, ChevronRight, ChevronLeft, X
} from 'lucide-react';
import { GeneratedNews, HeadlineRefinement, SpotRefinement, NewsTone } from '../types';
import { refineHeadline, refineSpot, refineSubheadings } from '../services/geminiService';

interface OutputSectionProps {
  news: GeneratedNews | null;
  isEmpty: boolean;
  onArchive: () => void;
  selectedTone: NewsTone;
}

export const OutputSection: React.FC<OutputSectionProps> = ({ news, isEmpty, onArchive, selectedTone }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'resmi' | 'seo_panel' | 'comparison' | 'advanced'>('resmi');
  const [editedNews, setEditedNews] = useState<GeneratedNews | null>(null);
  const [showHeadlineAlts, setShowHeadlineAlts] = useState(false);
  const [showSpotAlts, setShowSpotAlts] = useState(false);
  const [refinedHeadlineData, setRefinedHeadlineData] = useState<HeadlineRefinement | null>(null);
  const [refinedSpotData, setRefinedSpotData] = useState<SpotRefinement | null>(null);
  const [isRefiningHeadline, setIsRefiningHeadline] = useState(false);
  const [isRefiningSpot, setIsRefiningSpot] = useState(false);
  const [isRefiningSubheadings, setIsRefiningSubheadings] = useState(false);
  const [refineError, setRefineError] = useState<string | null>(null);

  useEffect(() => {
    if (news) {
      setEditedNews(news);
      setShowHeadlineAlts(false);
      setShowSpotAlts(false);
      setRefinedHeadlineData(null);
      setRefinedSpotData(null);
      setRefineError(null);
    }
  }, [news]);

  const handleCopy = () => {
    if (!editedNews) return;
    const fullText = `${editedNews.headline}\n\n${editedNews.spot}\n\n${editedNews.body}`;
    navigator.clipboard.writeText(fullText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleCopyField = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const applyHeadline = (newHeadline: string) => {
    if (!editedNews) return;
    setEditedNews({ ...editedNews, headline: newHeadline });
  };

  const applySpot = (newSpot: string) => {
    if (!editedNews) return;
    setEditedNews({ ...editedNews, spot: newSpot });
  };

  const handleToggleRefineHeadline = async () => {
    const nextState = !showHeadlineAlts;
    setShowHeadlineAlts(nextState);
    if (nextState && !refinedHeadlineData && editedNews && !isRefiningHeadline) {
      setIsRefiningHeadline(true);
      try {
        const result = await refineHeadline(editedNews.headline, editedNews.body, selectedTone);
        setRefinedHeadlineData(result);
      } catch (err) {
        setRefineError("Başlık analizi başarısız oldu.");
      } finally {
        setIsRefiningHeadline(false);
      }
    }
  };

  const handleToggleRefineSpot = async () => {
    const nextState = !showSpotAlts;
    setShowSpotAlts(nextState);
    if (nextState && !refinedSpotData && editedNews && !isRefiningSpot) {
      setIsRefiningSpot(true);
      try {
        const result = await refineSpot(editedNews.spot, editedNews.body, selectedTone);
        setRefinedSpotData(result);
      } catch (err) {
        setRefineError("Spot analizi başarısız oldu.");
      } finally {
        setIsRefiningSpot(false);
      }
    }
  };

  const handleOptimizeSubheadings = async () => {
    if (!editedNews || isRefiningSubheadings) return;
    setIsRefiningSubheadings(true);
    setRefineError(null);
    try {
      const refinedBody = await refineSubheadings(editedNews.body, selectedTone);
      setEditedNews({ ...editedNews, body: refinedBody });
    } catch (err) {
      setRefineError("Ara başlık optimizasyonu başarısız oldu.");
    } finally {
      setIsRefiningSubheadings(false);
    }
  };

  if (isEmpty || !editedNews) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 h-full flex items-center justify-center p-8 text-center shadow-lg shadow-slate-200/50 dark:shadow-none">
        <div className="max-w-xs opacity-40">
          <Layers className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-6" />
          <h3 className="text-base font-black text-slate-900 dark:text-white mb-2 uppercase tracking-widest">VAKANÜVİS AI</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">
            Haberin dijital hafızası hazır. İçerik girişi yapın.
          </p>
        </div>
      </div>
    );
  }

  const renderBody = (text: string) => {
    const blocks = text.split(/\n+/).filter(line => line.trim().length > 0);
    
    return blocks.map((line, index) => {
      let trimmedLine = line.trim();
      
      const isMarkdownH2 = trimmedLine.startsWith('## ');
      const isMarkdownH3 = trimmedLine.startsWith('### ');
      const isLegacyHeader = !isMarkdownH2 && !isMarkdownH3 && trimmedLine === trimmedLine.toUpperCase() && trimmedLine.length > 5 && trimmedLine.length < 120;

      if (isMarkdownH2 || isMarkdownH3 || isLegacyHeader) {
        const rawText = trimmedLine.replace(/^#+\s+/, '');
        const displayText = rawText.toLocaleUpperCase('tr-TR');
        
        if (isMarkdownH3) {
            return (
              <div key={index} className="mt-12 mb-8">
                <h3 className="text-lg md:text-xl font-bold text-slate-800 font-sans tracking-tight border-l-4 border-slate-400 pl-4 py-1 uppercase">
                  {displayText}
                </h3>
              </div>
            );
        }

        return (
          <div key={index} className="mt-20 mb-12">
            <h2 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white font-sans tracking-tight border-l-[12px] border-blue-600 dark:border-blue-500 pl-8 py-3 leading-tight uppercase bg-slate-50/50 dark:bg-slate-800/30 rounded-r-xl">
              {displayText}
            </h2>
          </div>
        );
      }
      
      // Handle Quotes: if line starts and ends with double quotes
      if (trimmedLine.startsWith('"') && trimmedLine.endsWith('"')) {
        return (
          <blockquote 
            key={index}
            className="my-14 pl-10 pr-8 py-8 bg-blue-50/40 dark:bg-blue-900/10 border-l-[10px] border-blue-600 dark:border-blue-500 rounded-r-3xl relative overflow-hidden group"
          >
            <Quote className="absolute -top-2 -left-2 w-20 h-20 text-blue-600/5 dark:text-blue-400/5 transform -rotate-12" />
            <p className="text-2xl md:text-3xl font-serif font-bold italic text-slate-800 dark:text-slate-200 leading-relaxed relative z-10">
              {trimmedLine}
            </p>
          </blockquote>
        );
      }

      return (
        <p 
          key={index} 
          className="mb-8 text-justify text-slate-700 dark:text-slate-300 leading-relaxed text-lg md:text-xl font-serif antialiased whitespace-pre-line"
        >
          {trimmedLine}
        </p>
      );
    });
  };

  const getReadabilityColor = (score: number) => {
    if (score >= 70) return 'text-emerald-600 bg-emerald-50 border-emerald-100 ring-emerald-100/50';
    if (score >= 40) return 'text-amber-600 bg-amber-50 border-amber-100 ring-amber-100/50';
    return 'text-rose-600 bg-rose-50 border-rose-100 ring-rose-100/50';
  };

  const getReadabilityLabel = (score: number) => {
    if (score >= 90) return 'Çok Kolay';
    if (score >= 70) return 'Kolay';
    if (score >= 50) return 'Orta';
    if (score >= 30) return 'Zor';
    return 'Çok Zor';
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 flex flex-col h-full overflow-hidden ring-1 ring-slate-100 dark:ring-slate-800">
      
      {/* Top Nav */}
      <div className="flex border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-1 overflow-x-auto no-scrollbar whitespace-nowrap">
        <button onClick={() => setActiveTab('resmi')} className={`mr-6 pb-3 pt-3 text-[10px] font-black uppercase tracking-[0.2em] border-b-2 transition-all flex-shrink-0 ${activeTab === 'resmi' ? 'border-slate-900 dark:border-blue-500 text-slate-900 dark:text-blue-500' : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}>📄 RESMİ HABER</button>
        {(editedNews.metaTitle || editedNews.seoClickPanel) && (
          <button onClick={() => setActiveTab('seo_panel')} className={`mr-6 pb-3 pt-3 text-[10px] font-black uppercase tracking-[0.2em] border-b-2 transition-all flex-shrink-0 ${activeTab === 'seo_panel' ? 'border-slate-900 dark:border-blue-500 text-slate-900 dark:text-blue-500' : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}>📈 SEO & TIKLAMA PANELİ</button>
        )}
        {editedNews.comparison && (
          <button onClick={() => setActiveTab('comparison')} className={`mr-6 pb-3 pt-3 text-[10px] font-black uppercase tracking-[0.2em] border-b-2 transition-all flex-shrink-0 ${activeTab === 'comparison' ? 'border-slate-900 dark:border-blue-500 text-slate-900 dark:text-blue-500' : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}>🔄 KARŞILAŞTIRMA</button>
        )}
        <button onClick={() => setActiveTab('advanced')} className={`pb-3 pt-3 text-[10px] font-black uppercase tracking-[0.2em] border-b-2 transition-all flex-shrink-0 ${activeTab === 'advanced' ? 'border-slate-900 dark:border-blue-500 text-slate-900 dark:text-blue-500' : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}>⚡ ANALİZ & DAĞITIM</button>
      </div>
      
      <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-900 custom-scrollbar">
        {activeTab === 'resmi' ? (
          <div className="p-0">
            <article className="max-w-4xl mx-auto px-8 md:px-12 py-12">
              
              {/* Toolbar */}
              <div className="flex justify-between items-center mb-12 sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm z-10 py-4 border-b border-slate-100 dark:border-slate-800 transition-all">
                <div className="flex items-center space-x-2">
                   <span className="text-[10px] font-black bg-slate-900 dark:bg-blue-600 text-white px-3 py-1.5 rounded-full uppercase tracking-widest flex items-center">
                     <ShieldCheck className="w-3 h-3 mr-1.5" />
                     {selectedTone.toUpperCase()} MODU AKTİF
                   </span>
                   {editedNews.qualityAudit && (
                     <div className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest ${getReadabilityColor(editedNews.qualityAudit.readabilityScore)} border dark:border-transparent`}>
                        OKUNABİLİRLİK: {getReadabilityLabel(editedNews.qualityAudit.readabilityScore)}
                     </div>
                   )}
                </div>
                <div className="flex space-x-2">
                  <button onClick={onArchive} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all" title="Arşivle"><Archive className="w-3.5 h-3.5"/></button>
                  <button onClick={handleCopy} className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-[9px] font-black transition-all border ${copied ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-900 dark:bg-blue-600 text-white border-slate-900 dark:border-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700'}`}>
                    {copied ? <Check className="w-2.5 h-2.5 mr-1.5"/> : <Copy className="w-2.5 h-2.5 mr-1.5"/>}
                    {copied ? 'KOPYALANDI' : 'KOPYALA'}
                  </button>
                </div>
              </div>

              {/* Headline */}
              <div className="relative mb-14 group">
                <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-8 leading-[1.15] tracking-tight font-sans text-balance decoration-clone">
                  <span className="mr-4">{selectedTone === 'SEO Uyumlu Özgün Haber' ? '🟦' : '🟥'}</span>{editedNews.headline}
                </h1>
                
                <div className="flex items-center space-x-2 mb-8">
                  <button onClick={handleToggleRefineHeadline} className="flex items-center space-x-1.5 text-blue-600 hover:text-blue-700 font-bold text-[9px] uppercase tracking-wider bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full transition-all">
                    {isRefiningHeadline ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Sparkles className="w-2.5 h-2.5" />}
                    <span>Başlığı Güçlendir</span>
                  </button>
                  {editedNews.qualityAudit && (
                    <div className="text-[9px] font-medium text-slate-400 bg-slate-50 px-2.5 py-1.5 rounded-full border border-slate-100">
                      ÖZGÜNLÜK: <span className="text-slate-900 font-black">%{editedNews.qualityAudit.originalityScore}</span>
                    </div>
                  )}
                </div>

                {/* Model Generated Alternative Headlines */}
                {editedNews.qualityAudit && editedNews.qualityAudit.alternativeHeadlines && editedNews.qualityAudit.alternativeHeadlines.length > 0 && (
                  <div className="mb-8 p-4 bg-blue-50/30 border border-blue-100 rounded-2xl">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3 flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1" /> Google News Alternatif Başlıkları
                    </p>
                    <div className="space-y-2">
                      {editedNews.qualityAudit.alternativeHeadlines.map((alt, i) => (
                        <div 
                          key={i} 
                          onClick={() => applyHeadline(alt)}
                          className="text-sm font-bold text-slate-700 hover:text-blue-600 cursor-pointer p-2 hover:bg-white rounded-lg transition-all border border-transparent hover:border-blue-100"
                        >
                          {alt}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {showHeadlineAlts && (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-12 animate-in fade-in slide-in-from-top-2">
                     {refinedHeadlineData ? (
                       <div className="space-y-4">
                          <div className="grid grid-cols-1 gap-4">
                            {refinedHeadlineData.alternatives.map((alt, idx) => (
                              <div key={idx} onClick={() => applyHeadline(alt.text)} className="p-5 bg-white border border-slate-200 rounded-2xl hover:border-blue-400 hover:shadow-lg cursor-pointer transition-all flex flex-col group relative">
                                 <p className="text-xl font-bold text-slate-900 leading-snug mb-3 font-sans">{alt.text}</p>
                                 <p className="text-[11px] text-slate-500 leading-relaxed italic border-t border-slate-50 pt-3">{alt.rationale}</p>
                              </div>
                            ))}
                          </div>
                       </div>
                     ) : isRefiningHeadline && (
                       <div className="py-12 flex flex-col items-center justify-center space-y-4 text-slate-400">
                          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                          <p className="text-[10px] font-black uppercase tracking-[0.3em]">Alternatifler Üretiliyor</p>
                       </div>
                     )}
                  </div>
                )}
              </div>

              {/* Spot (Lead) */}
              <div className="mb-14 relative group">
                 <div className="text-2xl md:text-3xl font-medium leading-[1.6] text-slate-600 font-serif italic border-l-[10px] border-blue-600 pl-8 py-3 text-justify bg-slate-50/30">
                    <span className="font-black text-slate-900 not-italic mr-2">SPOT:</span>
                    {editedNews.spot}
                 </div>
                 
                 <div className="mt-5 flex items-center">
                    <button onClick={handleToggleRefineSpot} className="flex items-center space-x-1.5 text-slate-400 hover:text-blue-600 font-black text-[9px] uppercase tracking-[0.15em] transition-all hover:bg-slate-50 px-3 py-1.5 rounded-full border border-transparent hover:border-slate-100">
                      {isRefiningSpot ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <RefreshCw className="w-2.5 h-2.5" />}
                      <span>Spot Metnini Optimize Et</span>
                    </button>
                 </div>
              </div>

              {/* Body */}
              <div className="news-content-area select-text text-slate-800">
                <div className="mb-6 flex justify-end">
                  <button 
                    onClick={handleOptimizeSubheadings} 
                    disabled={isRefiningSubheadings}
                    className="flex items-center space-x-1.5 text-blue-600 hover:text-blue-700 font-black text-[9px] uppercase tracking-[0.15em] transition-all bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full border border-blue-100 disabled:opacity-50"
                  >
                    {isRefiningSubheadings ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <AlignLeft className="w-2.5 h-2.5" />}
                    <span>Ara Başlıkları SEO Uyumlu Güçlendir</span>
                  </button>
                </div>
                {renderBody(editedNews.body)}
              </div>

              {/* Sources */}
              {editedNews.groundingChunks && editedNews.groundingChunks.length > 0 && (
                <div className="mt-20 pt-10 border-t border-slate-100">
                  <div className="flex items-center space-x-3 mb-6">
                    <Globe className="w-5 h-5 text-slate-900" />
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-900">Doğrulanmış Kaynaklar</h3>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {editedNews.groundingChunks.map((chunk, i) => chunk.web && (
                      <a 
                        key={i} 
                        href={chunk.web.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center space-x-3 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-900 px-5 py-3 rounded-2xl transition-all group shadow-sm"
                      >
                        <LinkIcon className="w-4 h-4 text-slate-400 group-hover:text-slate-900" />
                        <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 truncate max-w-[300px]">{chunk.web.title || "Haber Kaynağı"}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </article>
          </div>
        ) : activeTab === 'seo_panel' ? (
          <div className="p-8 md:p-12 bg-slate-50 min-h-full">
            <div className="max-w-4xl mx-auto space-y-8">
              
              {/* SEO VE TIKLAMA PANELİ */}
              {editedNews.seoClickPanel && (
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50">
                   <h4 className="flex items-center text-sm font-black uppercase tracking-[0.2em] mb-8 text-slate-900 border-b border-slate-50 pb-4">
                      <MousePointer2 className="w-5 h-5 mr-3 text-rose-500" /> 🚀 SEO VE TIKLAMA PANELİ
                   </h4>
                   
                   <div className="space-y-8">
                      <div>
                         <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-3 flex items-center">
                           <TrendingUp className="w-3 h-3 mr-1" /> TIKLAYICI BAŞLIK (Click-worthy)
                         </p>
                         <div 
                           onClick={() => applyHeadline(editedNews.seoClickPanel!.clickHeadline)}
                           className="bg-rose-50/30 p-6 rounded-2xl border border-rose-100 text-lg font-bold text-slate-900 leading-tight cursor-pointer hover:bg-rose-50 transition-all"
                         >
                            <span className="mr-2">🟥</span>{editedNews.seoClickPanel.clickHeadline}
                         </div>
                      </div>

                      <div>
                         <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-3 flex items-center">
                           <RefreshCw className="w-3 h-3 mr-1" /> TIKLAYICI SPOT (Teaser)
                         </p>
                         <div 
                           onClick={() => applySpot(editedNews.seoClickPanel!.clickSpot)}
                           className="bg-rose-50/30 p-6 rounded-2xl border border-rose-100 text-sm font-medium text-slate-700 leading-relaxed italic cursor-pointer hover:bg-rose-50 transition-all"
                         >
                            {editedNews.seoClickPanel.clickSpot}
                         </div>
                      </div>

                      <div>
                         <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-3 flex items-center">
                           <Search className="w-3 h-3 mr-1" /> SEO ARA BAŞLIK ÖNERİLERİ
                         </p>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                            {editedNews.seoClickPanel.seoSubheadingSuggestions.map((suggestion, i) => (
                               <div key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs font-bold text-slate-700">
                                  {suggestion}
                               </div>
                            ))}
                         </div>

                         {editedNews.qualityAudit && (
                           <>
                             <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-3 flex items-center">
                               <TrendingUp className="w-3 h-3 mr-1" /> SEO ALTERNATİF BAŞLIKLARI
                             </p>
                             <div className="space-y-3 mb-8">
                                {editedNews.qualityAudit.alternativeHeadlines.map((alt, i) => (
                                   <div key={i} className="bg-white p-4 rounded-xl border border-rose-100 text-sm font-bold text-slate-800 shadow-sm">
                                      {alt}
                                   </div>
                                ))}
                             </div>
                           </>
                         )}

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-100">
                            {editedNews.suggestedCategories && (
                              <div>
                                 <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4 flex items-center">
                                   <Tag className="w-3 h-3 mr-2" /> ÖNERİLEN KATEGORİLER
                                 </p>
                                 <div className="flex flex-wrap gap-2">
                                    {editedNews.suggestedCategories.map((cat, i) => (
                                       <span key={i} className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-xl text-[11px] font-bold">
                                          {cat}
                                       </span>
                                    ))}
                                 </div>
                              </div>
                            )}
                            {editedNews.expandedKeywords && (
                              <div>
                                 <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-4 flex items-center">
                                   <ListFilter className="w-3 h-3 mr-2" /> GENİŞLETİLMİŞ ANAHTAR KELİMELER (LSI)
                                 </p>
                                 <div className="flex flex-wrap gap-2">
                                    {editedNews.expandedKeywords.map((kw, i) => (
                                       <span key={i} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl text-[11px] font-bold">
                                          {kw}
                                       </span>
                                    ))}
                                 </div>
                              </div>
                            )}
                         </div>
                      </div>
                   </div>
                </div>
              )}

              {/* Score Cards */}
              {editedNews.qualityAudit && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className={`p-8 rounded-3xl border bg-white shadow-xl shadow-slate-200/50 flex flex-col ${getReadabilityColor(editedNews.qualityAudit.readabilityScore)} bg-opacity-10 ring-1`}>
                     <div className="flex items-center justify-between mb-6">
                        <div className="text-5xl font-black tracking-tighter">{editedNews.qualityAudit.readabilityScore}</div>
                        <div className="text-right">
                          <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Okunabilirlik</div>
                          <div className="text-[9px] font-bold uppercase opacity-40">Ateşman İndeksi</div>
                        </div>
                     </div>
                     <div className="space-y-3">
                        <p className="text-xs font-bold leading-relaxed text-slate-800">
                          <span className="text-[10px] uppercase text-slate-400 block mb-1">Analiz ve Öneri:</span>
                          {editedNews.qualityAudit.readabilityExplanation}
                        </p>
                     </div>
                  </div>

                  <div className="p-8 rounded-3xl border border-blue-100 bg-white shadow-xl shadow-blue-100/20 flex flex-col text-blue-600 ring-1 ring-blue-50">
                     <div className="flex items-center justify-between mb-6">
                        <div className="text-5xl font-black tracking-tighter">{editedNews.qualityAudit.seoScore}</div>
                        <div className="text-right">
                          <div className="text-[10px] font-black uppercase tracking-widest opacity-60">SEO Gücü</div>
                          <div className="text-[9px] font-bold uppercase opacity-40">Algoritma Uyumu</div>
                        </div>
                     </div>
                     <div className="space-y-3">
                        <p className="text-xs font-bold leading-relaxed text-slate-800">
                          <span className="text-[10px] uppercase text-slate-400 block mb-1">SEO Stratejisi:</span>
                          {editedNews.qualityAudit.seoExplanation}
                        </p>
                     </div>
                  </div>

                  <div className="p-8 rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/30 flex flex-col text-slate-900 ring-1 ring-slate-100">
                     <div className="flex items-center justify-between mb-6">
                        <div className="text-5xl font-black tracking-tighter">%{editedNews.qualityAudit.originalityScore}</div>
                        <div className="text-right">
                          <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Özgünlük</div>
                          <div className="text-[9px] font-bold uppercase opacity-40">Yapısal Farklılık</div>
                        </div>
                     </div>
                     <div className="space-y-3">
                        <p className="text-xs font-bold leading-relaxed text-slate-800">
                          <span className="text-[10px] uppercase text-slate-400 block mb-1">Özgünlük Raporu:</span>
                          {editedNews.qualityAudit.originalityExplanation}
                        </p>
                     </div>
                  </div>
                </div>
              )}

              {/* Metadata Panel */}
              {(editedNews.metaTitle || editedNews.metaDescription || editedNews.slug) && (
                <div className="bg-slate-900 dark:bg-slate-950 rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden group">
                   <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent opacity-50 pointer-events-none" />
                   
                   <div className="relative z-10 space-y-10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                         {editedNews.metaTitle && (
                           <div className="relative group/field">
                              <div className="flex justify-between items-center mb-4">
                                 <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Meta Title (SEO Başlığı)</span>
                                 <div className="flex items-center space-x-2">
                                   <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${editedNews.metaTitle.length > 60 ? 'bg-rose-500' : 'bg-emerald-500'}`}>{editedNews.metaTitle.length}/60</span>
                                   <button onClick={() => handleCopyField(editedNews.metaTitle!)} className="p-1 hover:bg-white/10 rounded transition-colors"><Copy className="w-3 h-3" /></button>
                                 </div>
                              </div>
                              <div className="text-xl font-bold leading-tight text-white group-hover:text-blue-400 transition-colors">{editedNews.metaTitle}</div>
                           </div>
                         )}
                         {editedNews.metaDescription && (
                           <div className="relative group/field">
                              <div className="flex justify-between items-center mb-4">
                                 <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Meta Description (Açıklama)</span>
                                 <div className="flex items-center space-x-2">
                                   <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${editedNews.metaDescription.length > 160 ? 'bg-rose-500' : 'bg-emerald-500'}`}>{editedNews.metaDescription.length}/160</span>
                                   <button onClick={() => handleCopyField(editedNews.metaDescription!)} className="p-1 hover:bg-white/10 rounded transition-colors"><Copy className="w-3 h-3" /></button>
                                 </div>
                              </div>
                              <div className="text-sm text-slate-300 leading-relaxed font-medium">{editedNews.metaDescription}</div>
                           </div>
                         )}
                      </div>
                      {editedNews.slug && (
                        <div className="pt-6 border-t border-white/5 relative group/field">
                           <div className="flex justify-between items-center mb-4">
                              <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">URL Slug (Kalıcı Bağlantı)</span>
                              <button onClick={() => handleCopyField(editedNews.slug!)} className="p-1 hover:bg-white/10 rounded transition-colors"><Copy className="w-3 h-3" /></button>
                           </div>
                           <div className="text-sm font-mono text-blue-400 break-all">{editedNews.slug}</div>
                        </div>
                      )}
                   </div>
                </div>
              )}

              {/* Keywords & Tags Panel */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {editedNews.keywords && (
                   <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50">
                      <h4 className="flex items-center text-[10px] font-black uppercase tracking-[0.2em] mb-6 text-slate-400">
                         <Hash className="w-4 h-4 mr-2 text-blue-500" /> Önerilen Anahtar Kelimeler
                      </h4>
                      <div className="flex flex-wrap gap-2">
                         {editedNews.keywords.map((keyword, i) => (
                            <span key={i} className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-xl text-[11px] font-bold">
                               {keyword}
                            </span>
                         ))}
                      </div>
                   </div>
                 )}
                 {editedNews.tags && (
                   <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50">
                      <h4 className="flex items-center text-[10px] font-black uppercase tracking-[0.2em] mb-6 text-slate-400">
                         <Target className="w-4 h-4 mr-2 text-emerald-500" /> SEO Etiketleri (Tags)
                      </h4>
                      <div className="flex flex-wrap gap-2">
                         {editedNews.tags.map((tag, i) => (
                            <span key={i} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl text-[11px] font-bold">
                               <span className="mr-1">⬛</span>#{tag}
                            </span>
                         ))}
                      </div>
                   </div>
                 )}
              </div>
            </div>
          </div>
        ) : activeTab === 'comparison' ? (
          <div className="p-8 md:p-12 bg-slate-50 min-h-full">
            <div className="max-w-4xl mx-auto space-y-8">
               {editedNews.comparison && (
                 <div className="bg-white p-10 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50">
                    <h4 className="flex items-center text-sm font-black uppercase tracking-[0.2em] mb-10 text-slate-900 border-b border-slate-50 pb-4">
                       <RefreshCw className="w-5 h-5 mr-3 text-blue-600" /> EDİTÖRYAL KARŞILAŞTIRMA
                    </h4>
                    
                    <div className="space-y-10">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                          <div className="space-y-4">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Orijinal Hali</p>
                             <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-sm text-slate-500 leading-relaxed italic">
                                {editedNews.comparison.originalSnippet}
                             </div>
                          </div>
                          <div className="space-y-4">
                             <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Düzeltilmiş Hali</p>
                             <div className="bg-emerald-50/30 p-6 rounded-2xl border border-emerald-100 text-sm font-bold text-slate-900 leading-relaxed">
                                {editedNews.comparison.correctedSnippet}
                             </div>
                          </div>
                       </div>

                       <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                          <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">EDİTÖRÜN NOTU</p>
                          <p className="text-sm font-medium text-slate-700 leading-relaxed">
                             {editedNews.comparison.editorNote}
                          </p>
                       </div>
                    </div>
                 </div>
               )}
            </div>
          </div>
        ) : (
          <div className="p-8 md:p-12 bg-slate-50 min-h-full">
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Advanced Features Rendering */}
              
              {!editedNews.trendDiscovery && 
               !editedNews.performancePrediction && 
               !editedNews.videoScript && 
               !editedNews.imageSuggestions && 
               !editedNews.aiEditorAudit && 
               !editedNews.versionAnalysis && 
               !editedNews.archiveAnalysis && 
               !editedNews.editorialCalendar && 
               !editedNews.factCheck && 
               !editedNews.distributionContent && 
               !editedNews.internalLinks && 
               !editedNews.discoverOptimization && (
                <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center shadow-sm">
                  <Settings2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-black text-slate-900 mb-2 uppercase tracking-widest">Gelişmiş Analiz Seçilmedi</h3>
                  <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed">
                    Haber oluştururken "Gelişmiş Özellikler" panelinden seçim yaparak bu alanı zenginleştirebilirsiniz.
                  </p>
                </div>
              )}

              {/* Trend Discovery */}
              {editedNews.trendDiscovery && (
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50">
                  <h4 className="flex items-center text-sm font-black uppercase tracking-[0.2em] mb-6 text-slate-900">
                    <TrendingUp className="w-5 h-5 mr-3 text-blue-600" /> Trend Haber Keşif Motoru
                  </h4>
                  <div className="grid grid-cols-1 gap-4">
                    {editedNews.trendDiscovery.map((trend, i) => (
                      <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-sm font-black text-slate-900 mb-1">{trend.title}</p>
                        <p className="text-xs text-slate-600 mb-3">{trend.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {trend.keywords.map((kw, j) => (
                            <span key={j} className="text-[10px] font-bold bg-white px-2 py-1 rounded-lg border border-slate-200 text-slate-500">#{kw}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Performance Prediction */}
              {editedNews.performancePrediction && (
                <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none">
                  <h4 className="flex items-center text-sm font-black uppercase tracking-[0.2em] mb-6 text-slate-900 dark:text-white">
                    <Activity className="w-5 h-5 mr-3 text-emerald-600" /> Haber Performans Tahmini
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 text-center">
                      <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase mb-1">Tahmini CTR</p>
                      <p className="text-lg font-black text-emerald-900 dark:text-emerald-200">{editedNews.performancePrediction.ctr}</p>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-900/30 text-center">
                      <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase mb-1">Discover Uyumu</p>
                      <p className="text-lg font-black text-blue-900 dark:text-blue-200">{editedNews.performancePrediction.discoverSuitability}</p>
                    </div>
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-900/30 text-center">
                      <p className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase mb-1">Trend Potansiyeli</p>
                      <p className="text-lg font-black text-amber-900 dark:text-amber-200">{editedNews.performancePrediction.trendPotential}</p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-100 dark:border-slate-600 text-center">
                      <p className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase mb-1">Okunma Tahmini</p>
                      <p className="text-lg font-black text-slate-900 dark:text-slate-200">{editedNews.performancePrediction.readEstimate}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Hedef Kitle</p>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{editedNews.performancePrediction.targetAudience}</p>
                    </div>
                    <div className="p-5 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                      <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase mb-2">Neden Okunmalı?</p>
                      <p className="text-sm font-bold text-blue-900 dark:text-blue-200 italic">"{editedNews.performancePrediction.whyRead}"</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Video Script */}
              {editedNews.videoScript && (
                <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl text-white">
                  <h4 className="flex items-center text-sm font-black uppercase tracking-[0.2em] mb-6">
                    <Video className="w-5 h-5 mr-3 text-rose-500" /> Video / Shorts Script
                  </h4>
                  <div className="space-y-6">
                    <div>
                      <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-2">Giriş (Intro)</p>
                      <p className="text-sm text-slate-300 leading-relaxed italic">"{editedNews.videoScript.intro}"</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-2">Gelişme (Body)</p>
                      <p className="text-sm text-slate-300 leading-relaxed italic">"{editedNews.videoScript.body}"</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-2">Bitiş (Outro)</p>
                      <p className="text-sm text-slate-300 leading-relaxed italic">"{editedNews.videoScript.outro}"</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Image Suggestions */}
              {editedNews.imageSuggestions && (
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50">
                  <h4 className="flex items-center text-sm font-black uppercase tracking-[0.2em] mb-6 text-slate-900">
                    <ImageIcon className="w-5 h-5 mr-3 text-indigo-600" /> Haber Görseli Önerileri
                  </h4>
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Ana Haber Görseli</p>
                      <p className="text-sm font-bold text-slate-800">{editedNews.imageSuggestions.newsImage}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Sosyal Medya Görseli</p>
                      <p className="text-sm font-bold text-slate-800">{editedNews.imageSuggestions.socialImage}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Thumbnail</p>
                      <p className="text-sm font-bold text-slate-800">{editedNews.imageSuggestions.thumbnail}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* AI Editor Audit */}
              {editedNews.aiEditorAudit && (
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50">
                  <h4 className="flex items-center text-sm font-black uppercase tracking-[0.2em] mb-6 text-slate-900">
                    <ShieldCheck className="w-5 h-5 mr-3 text-blue-600" /> AI Editör Kontrolü
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Tekrar Eden Kelimeler</p>
                      <div className="flex flex-wrap gap-2">
                        {editedNews.aiEditorAudit.repeatedWords.map((w, i) => (
                          <span key={i} className="px-2 py-1 bg-rose-50 text-rose-600 text-[10px] font-bold rounded-lg border border-rose-100">{w}</span>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Ajans Kalıpları / Klişeler</p>
                      <div className="flex flex-wrap gap-2">
                        {editedNews.aiEditorAudit.agencyClichés.map((w, i) => (
                          <span key={i} className="px-2 py-1 bg-amber-50 text-amber-600 text-[10px] font-bold rounded-lg border border-amber-100">{w}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Version Analysis */}
              {editedNews.versionAnalysis && (
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50">
                  <h4 className="flex items-center text-sm font-black uppercase tracking-[0.2em] mb-6 text-slate-900">
                    <RefreshCw className="w-5 h-5 mr-3 text-purple-600" /> Haber Sürüm Analizi
                  </h4>
                  <div className="space-y-6">
                    <div>
                      <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-2">Alternatif Giriş</p>
                      <p className="text-sm text-slate-600 leading-relaxed bg-purple-50 p-4 rounded-2xl border border-purple-100">{editedNews.versionAnalysis.altIntro}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-2">Alternatif Başlık</p>
                      <p className="text-sm font-bold text-slate-900 leading-relaxed bg-purple-50 p-4 rounded-2xl border border-purple-100">{editedNews.versionAnalysis.altHeadline}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Archive Analysis */}
              {editedNews.archiveAnalysis && (
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50">
                  <h4 className="flex items-center text-sm font-black uppercase tracking-[0.2em] mb-6 text-slate-900">
                    <History className="w-5 h-5 mr-3 text-slate-600" /> Haber Arşivi Analizi
                  </h4>
                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Benzer Geçmiş Haberler</p>
                    <div className="space-y-2">
                      {editedNews.archiveAnalysis.similarNews.map((news, i) => (
                        <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs font-bold text-slate-700">{news}</div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Editorial Calendar */}
              {editedNews.editorialCalendar && (
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50">
                  <h4 className="flex items-center text-sm font-black uppercase tracking-[0.2em] mb-6 text-slate-900">
                    <Calendar className="w-5 h-5 mr-3 text-blue-600" /> Editoryal Takvim Önerisi
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {editedNews.editorialCalendar.map((item, i) => (
                      <div key={i} className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                        <p className="text-xs font-black text-blue-900 mb-1">{item.title}</p>
                        <p className="text-[10px] text-blue-600 leading-relaxed">{item.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Video Script */}
              {editedNews.videoScript && (
                <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-3xl border border-slate-200 dark:border-slate-700">
                  <h4 className="flex items-center text-sm font-black uppercase tracking-[0.2em] mb-6 text-slate-900 dark:text-white">
                    <Video className="w-5 h-5 mr-3 text-rose-600" /> Video / Shorts Script
                  </h4>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                        <p className="text-[10px] font-black text-rose-600 uppercase mb-2">Giriş (Hook)</p>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-relaxed">{editedNews.videoScript.intro}</p>
                      </div>
                      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                        <p className="text-[10px] font-black text-rose-600 uppercase mb-2">Gelişme (Body)</p>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">{editedNews.videoScript.body}</p>
                      </div>
                      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                        <p className="text-[10px] font-black text-rose-600 uppercase mb-2">Sonuç (CTA)</p>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-relaxed">{editedNews.videoScript.outro}</p>
                      </div>
                    </div>
                    {editedNews.videoScript.visualCues && (
                      <div className="p-4 bg-rose-50 dark:bg-rose-900/10 rounded-2xl border border-rose-100 dark:border-rose-900/20">
                        <p className="text-[10px] font-black text-rose-600 uppercase mb-3">Görsel İpuçları & B-Roll</p>
                        <div className="flex flex-wrap gap-2">
                          {editedNews.videoScript.visualCues.map((cue, i) => (
                            <span key={i} className="px-3 py-1 bg-white dark:bg-slate-800 text-[10px] font-bold text-rose-700 dark:text-rose-400 rounded-full border border-rose-100 dark:border-rose-900/30">{cue}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Image Suggestions */}
              {editedNews.imageSuggestions && (
                <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none">
                  <h4 className="flex items-center text-sm font-black uppercase tracking-[0.2em] mb-6 text-slate-900 dark:text-white">
                    <ImageIcon className="w-5 h-5 mr-3 text-blue-600" /> Görsel & Thumbnail Önerileri
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Haber Ana Görseli</p>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{editedNews.imageSuggestions.newsImage}</p>
                      </div>
                      <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Sosyal Medya Görseli</p>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{editedNews.imageSuggestions.socialImage}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                        <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase mb-2">Thumbnail Fikri</p>
                        <p className="text-sm font-bold text-blue-900 dark:text-blue-200">{editedNews.imageSuggestions.thumbnail}</p>
                      </div>
                      <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                        <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase mb-2">SEO Alt Metni</p>
                        <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200 italic">"{editedNews.imageSuggestions.altText}"</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* AI Editor Audit */}
              {editedNews.aiEditorAudit && (
                <div className="bg-slate-900 dark:bg-slate-950 p-8 rounded-3xl text-white shadow-2xl">
                  <h4 className="flex items-center text-sm font-black uppercase tracking-[0.2em] mb-8 text-white">
                    <ShieldCheck className="w-5 h-5 mr-3 text-emerald-400" /> AI Editör Denetimi
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <p className="text-[10px] font-black text-emerald-400 uppercase mb-3">Tekrar Eden Kelimeler</p>
                        <div className="flex flex-wrap gap-2">
                          {editedNews.aiEditorAudit.repeatedWords.map((word, i) => (
                            <span key={i} className="px-2 py-1 bg-white/10 rounded text-[10px] font-bold">{word}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-rose-400 uppercase mb-3">Zayıf Cümleler</p>
                        <ul className="space-y-2">
                          {editedNews.aiEditorAudit.weakSentences.map((s, i) => (
                            <li key={i} className="text-xs text-slate-300 border-l-2 border-rose-500 pl-3 italic">{s}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div>
                        <p className="text-[10px] font-black text-amber-400 uppercase mb-3">Ajans Kalıpları / Klişeler</p>
                        <div className="flex flex-wrap gap-2">
                          {editedNews.aiEditorAudit.agencyClichés.map((c, i) => (
                            <span key={i} className="px-2 py-1 bg-amber-500/20 text-amber-400 rounded text-[10px] font-bold">{c}</span>
                          ))}
                        </div>
                      </div>
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                        <p className="text-[10px] font-black text-blue-400 uppercase mb-2">Ton & Üslup Kontrolü</p>
                        <p className="text-xs font-medium text-slate-300 leading-relaxed">{editedNews.aiEditorAudit.toneCheck}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Version Analysis */}
              {editedNews.versionAnalysis && (
                <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none">
                  <h4 className="flex items-center text-sm font-black uppercase tracking-[0.2em] mb-6 text-slate-900 dark:text-white">
                    <ListChecks className="w-5 h-5 mr-3 text-blue-600" /> Haber Sürüm Analizi
                  </h4>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Alternatif Giriş</p>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed italic">"{editedNews.versionAnalysis.altIntro}"</p>
                      </div>
                      <div className="p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Alternatif Headline</p>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-relaxed">{editedNews.versionAnalysis.altHeadline}</p>
                      </div>
                    </div>
                    {editedNews.versionAnalysis.bulletPoints && (
                      <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                        <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase mb-4">Özetle (Bullet Points)</p>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {editedNews.versionAnalysis.bulletPoints.map((point, i) => (
                            <li key={i} className="flex items-start text-xs font-bold text-blue-900 dark:text-blue-200">
                              <CheckCircle2 className="w-3 h-3 mr-2 mt-0.5 flex-shrink-0 text-blue-500" />
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Archive Analysis */}
              {editedNews.archiveAnalysis && (
                <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-3xl border border-slate-200 dark:border-slate-700">
                  <h4 className="flex items-center text-sm font-black uppercase tracking-[0.2em] mb-6 text-slate-900 dark:text-white">
                    <Archive className="w-5 h-5 mr-3 text-amber-600" /> Arşiv & Bağlam Analizi
                  </h4>
                  <div className="space-y-6">
                    <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                      <p className="text-[10px] font-black text-amber-600 uppercase mb-2">Tarihsel Bağlam</p>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">{editedNews.archiveAnalysis.historicalContext}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-3">Benzer Haberler</p>
                        <ul className="space-y-2">
                          {editedNews.archiveAnalysis.similarNews.map((news, i) => (
                            <li key={i} className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center">
                              <ChevronRight className="w-3 h-3 mr-1 text-slate-300" /> {news}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-3">Geçmiş İçerikler</p>
                        <ul className="space-y-2">
                          {editedNews.archiveAnalysis.pastContent.map((content, i) => (
                            <li key={i} className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center">
                              <ChevronRight className="w-3 h-3 mr-1 text-slate-300" /> {content}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-3">Gelecek Konu Önerileri</p>
                        <ul className="space-y-2">
                          {editedNews.archiveAnalysis.futureTopics.map((topic, i) => (
                            <li key={i} className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center">
                              <ChevronRight className="w-3 h-3 mr-1 text-slate-300" /> {topic}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Editorial Calendar */}
              {editedNews.editorialCalendar && (
                <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none">
                  <h4 className="flex items-center text-sm font-black uppercase tracking-[0.2em] mb-6 text-slate-900 dark:text-white">
                    <Calendar className="w-5 h-5 mr-3 text-blue-600" /> Editoryal Takvim Önerileri
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {editedNews.editorialCalendar.map((item, i) => (
                      <div key={i} className="p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col">
                        <div className="flex justify-between items-start mb-3">
                          <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-[9px] font-black text-blue-600 dark:text-blue-400 rounded uppercase tracking-wider flex items-center">
                            <Clock className="w-2.5 h-2.5 mr-1" /> {item.publishTime}
                          </span>
                        </div>
                        <p className="text-sm font-black text-slate-900 dark:text-white mb-2 leading-tight">{item.title}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-4 flex-1 italic">"{item.reason}"</p>
                        <div className="flex flex-wrap gap-1">
                          {item.keywords.map((kw, j) => (
                            <span key={j} className="text-[9px] font-bold text-slate-400">#{kw}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Fact Check */}
              {editedNews.factCheck && (
                <div className="bg-rose-50 dark:bg-rose-900/10 p-8 rounded-3xl border border-rose-100 dark:border-rose-900/20 shadow-xl dark:shadow-none">
                  <h4 className="flex items-center text-sm font-black uppercase tracking-[0.2em] mb-6 text-rose-900 dark:text-rose-100">
                    <CheckCircle2 className="w-5 h-5 mr-3 text-rose-600" /> Fact Check (Doğrulama)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      {editedNews.factCheck.unverifiedClaims.length > 0 && (
                        <div>
                          <p className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest mb-3">Doğrulanmamış İddialar</p>
                          <ul className="space-y-2">
                            {editedNews.factCheck.unverifiedClaims.map((claim, i) => (
                              <li key={i} className="text-xs font-bold text-rose-800 dark:text-rose-300 flex items-start">
                                <AlertCircle className="w-3 h-3 mr-2 mt-0.5 flex-shrink-0 text-rose-500" />
                                {claim}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {editedNews.factCheck.potentialErrors.length > 0 && (
                        <div>
                          <p className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest mb-3">Potansiyel Hatalar</p>
                          <ul className="space-y-2">
                            {editedNews.factCheck.potentialErrors.map((err, i) => (
                              <li key={i} className="text-xs font-bold text-rose-800 dark:text-rose-300 flex items-start">
                                <X className="w-3 h-3 mr-2 mt-0.5 flex-shrink-0 text-rose-500" />
                                {err}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <div className="space-y-6">
                      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-rose-100 dark:border-rose-900/30">
                        <p className="text-[10px] font-black text-rose-400 uppercase mb-2">Kaynak Güvenilirliği</p>
                        <p className="text-xs font-bold text-rose-700 dark:text-rose-300 leading-relaxed">{editedNews.factCheck.sourceReliability}</p>
                      </div>
                      {editedNews.factCheck.missingData.length > 0 && (
                        <div>
                          <p className="text-[10px] font-black text-rose-400 uppercase mb-3">Eksik Veriler / Sorular</p>
                          <ul className="space-y-2">
                            {editedNews.factCheck.missingData.map((data, i) => (
                              <li key={i} className="text-xs font-medium text-rose-600 dark:text-rose-400 flex items-center">
                                <Info className="w-3 h-3 mr-2" /> {data}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Discover Optimization (Discover Specific) */}
              {editedNews.discoverOptimization && (
                <div className="bg-rose-50 dark:bg-rose-900/10 p-8 rounded-3xl border border-rose-100 dark:border-rose-900/20 shadow-xl dark:shadow-none">
                  <h4 className="flex items-center text-sm font-black uppercase tracking-[0.2em] mb-6 text-rose-900 dark:text-rose-100">
                    <Target className="w-5 h-5 mr-3 text-rose-600" /> Google Discover Optimizasyonu
                  </h4>
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <p className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest mb-2">Discover Başlığı</p>
                        <p className="text-lg font-black text-rose-900 dark:text-rose-100 leading-tight">{editedNews.discoverOptimization.title}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest mb-2">Discover Spotu</p>
                        <p className="text-sm font-medium text-rose-800 dark:text-rose-300 leading-relaxed italic">{editedNews.discoverOptimization.spot}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-rose-200 dark:border-rose-900/30">
                        <p className="text-[10px] font-black text-rose-400 uppercase mb-2">Stratejik Analiz</p>
                        <p className="text-xs font-bold text-rose-700 dark:text-rose-300 leading-relaxed">{editedNews.discoverOptimization.analysis}</p>
                      </div>
                      <div className="bg-rose-900 dark:bg-rose-950 p-5 rounded-2xl border border-rose-800 text-white">
                        <p className="text-[10px] font-black text-rose-400 uppercase mb-2 flex items-center"><ImageIcon className="w-3 h-3 mr-1" /> Görsel Fikri (Yüksek Çözünürlük)</p>
                        <p className="text-xs font-medium text-rose-100 leading-relaxed">{editedNews.discoverOptimization.highResImageIdea}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
