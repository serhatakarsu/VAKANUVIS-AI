
import React, { useState, useEffect } from 'react';
import { 
  Copy, Check, Coffee, Archive, ThumbsUp, ThumbsDown, 
  Search, Zap, AlertCircle, ChevronDown, ChevronUp, 
  Globe, Lightbulb, RefreshCw, BarChart3,
  MousePointer2, Sparkles, TrendingUp, Target, ShieldCheck, Loader2, Link as LinkIcon, Share2, Layers,
  Quote, MessageSquareText, AlignLeft, Info, Hash, Twitter, Facebook
} from 'lucide-react';
import { GeneratedNews, HeadlineRefinement, SpotRefinement } from '../types';
import { refineHeadline, refineSpot } from '../services/geminiService';

interface OutputSectionProps {
  news: GeneratedNews | null;
  isEmpty: boolean;
  onArchive: () => void;
}

export const OutputSection: React.FC<OutputSectionProps> = ({ news, isEmpty, onArchive }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'seo'>('preview');
  const [editedNews, setEditedNews] = useState<GeneratedNews | null>(null);
  const [showHeadlineAlts, setShowHeadlineAlts] = useState(false);
  const [showSpotAlts, setShowSpotAlts] = useState(false);
  const [refinedHeadlineData, setRefinedHeadlineData] = useState<HeadlineRefinement | null>(null);
  const [refinedSpotData, setRefinedSpotData] = useState<SpotRefinement | null>(null);
  const [isRefiningHeadline, setIsRefiningHeadline] = useState(false);
  const [isRefiningSpot, setIsRefiningSpot] = useState(false);
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
        const result = await refineHeadline(editedNews.headline, editedNews.body);
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
        const result = await refineSpot(editedNews.spot, editedNews.body);
        setRefinedSpotData(result);
      } catch (err) {
        setRefineError("Spot analizi başarısız oldu.");
      } finally {
        setIsRefiningSpot(false);
      }
    }
  };

  if (isEmpty || !editedNews) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 h-full flex items-center justify-center p-8 text-center shadow-lg shadow-slate-200/50">
        <div className="max-w-xs opacity-40">
          <Layers className="w-16 h-16 text-slate-300 mx-auto mb-6" />
          <h3 className="text-base font-black text-slate-900 mb-2 uppercase tracking-widest">Haber Merkezi</h3>
          <p className="text-slate-500 text-sm font-medium leading-relaxed">
            İçerik bekleniyor. AI asistanınız hazır.
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
            <h2 className="text-xl md:text-3xl font-black text-slate-900 font-sans tracking-tight border-l-[12px] border-blue-600 pl-8 py-3 leading-tight uppercase bg-slate-50/50 rounded-r-xl">
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
            className="my-14 pl-10 pr-8 py-8 bg-blue-50/40 border-l-[10px] border-blue-600 rounded-r-3xl relative overflow-hidden group"
          >
            <Quote className="absolute -top-2 -left-2 w-20 h-20 text-blue-600/5 transform -rotate-12" />
            <p className="text-2xl md:text-3xl font-serif font-bold italic text-slate-800 leading-relaxed relative z-10">
              {trimmedLine}
            </p>
          </blockquote>
        );
      }

      return (
        <p 
          key={index} 
          className="mb-12 indent-20 text-justify text-slate-700 leading-[2.1] text-lg md:text-xl font-serif antialiased"
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
    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col h-full overflow-hidden ring-1 ring-slate-100">
      
      {/* Top Nav */}
      <div className="flex border-b border-slate-100 bg-white px-6 pt-2">
        <button onClick={() => setActiveTab('preview')} className={`mr-6 pb-4 pt-4 text-[11px] font-black uppercase tracking-[0.2em] border-b-2 transition-all ${activeTab === 'preview' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>Haber Kurgusu</button>
        <button onClick={() => setActiveTab('seo')} className={`pb-4 pt-4 text-[11px] font-black uppercase tracking-[0.2em] border-b-2 transition-all ${activeTab === 'seo' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>SEO & Analiz</button>
      </div>
      
      <div className="flex-1 overflow-y-auto bg-white custom-scrollbar">
        {activeTab === 'preview' ? (
          <div className="p-0">
            <article className="max-w-4xl mx-auto px-8 md:px-12 py-12">
              
              {/* Toolbar */}
              <div className="flex justify-between items-center mb-12 sticky top-0 bg-white/95 backdrop-blur-sm z-10 py-4 border-b border-slate-100 transition-all">
                <div className="flex items-center space-x-2">
                   <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-1 rounded uppercase tracking-wider">Profesyonel Taslak</span>
                   <div className={`text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider ${getReadabilityColor(editedNews.qualityAudit.readabilityScore)} border`}>
                      OKUNABİLİRLİK: {getReadabilityLabel(editedNews.qualityAudit.readabilityScore)}
                   </div>
                </div>
                <div className="flex space-x-2">
                  <button onClick={onArchive} className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all" title="Arşivle"><Archive className="w-4 h-4"/></button>
                  <button onClick={handleCopy} className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl text-[10px] font-black transition-all border ${copied ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800'}`}>
                    {copied ? <Check className="w-3 h-3 mr-2"/> : <Copy className="w-3 h-3 mr-2"/>}
                    {copied ? 'KOPYALANDI' : 'KOPYALA'}
                  </button>
                </div>
              </div>

              {/* Headline */}
              <div className="relative mb-14 group">
                <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-8 leading-[1.15] tracking-tight font-sans text-balance decoration-clone">
                  {editedNews.headline}
                </h1>
                
                <div className="flex items-center space-x-3 mb-8">
                  <button onClick={handleToggleRefineHeadline} className="flex items-center space-x-1.5 text-blue-600 hover:text-blue-700 font-bold text-[10px] uppercase tracking-wider bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-full transition-all">
                    {isRefiningHeadline ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                    <span>Başlığı Güçlendir</span>
                  </button>
                  <div className="text-[10px] font-medium text-slate-400 bg-slate-50 px-3 py-2 rounded-full border border-slate-100">
                    ÖZGÜNLÜK: <span className="text-slate-900 font-black">%{editedNews.qualityAudit.originalityScore}</span>
                  </div>
                </div>

                {/* Model Generated Alternative Headlines */}
                {editedNews.qualityAudit.alternativeHeadlines && editedNews.qualityAudit.alternativeHeadlines.length > 0 && (
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
                    {editedNews.spot}
                 </div>
                 
                 <div className="mt-6 flex items-center">
                    <button onClick={handleToggleRefineSpot} className="flex items-center space-x-2 text-slate-400 hover:text-blue-600 font-black text-[10px] uppercase tracking-[0.2em] transition-all hover:bg-slate-50 px-4 py-2 rounded-full border border-transparent hover:border-slate-100">
                      {isRefiningSpot ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                      <span>Spot Metnini Optimize Et</span>
                    </button>
                 </div>
              </div>

              {/* Body */}
              <div className="news-content-area select-text text-slate-800">
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
        ) : (
          <div className="p-8 md:p-12 bg-slate-50 min-h-full">
            <div className="max-w-4xl mx-auto space-y-8">
              
              {/* Score Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`p-8 rounded-3xl border bg-white shadow-sm flex flex-col ${getReadabilityColor(editedNews.qualityAudit.readabilityScore)} bg-opacity-20 ring-4`}>
                   <div className="flex items-center justify-between mb-4">
                      <div className="text-4xl font-black">{editedNews.qualityAudit.readabilityScore}</div>
                      <div className="text-[10px] font-black uppercase tracking-widest opacity-80">Ateşman Skoru</div>
                   </div>
                   <p className="text-xs font-bold leading-relaxed">{editedNews.qualityAudit.readabilityExplanation}</p>
                </div>
                <div className="p-8 rounded-3xl border border-blue-100 bg-white shadow-sm flex flex-col text-blue-600 ring-4 ring-blue-50/50">
                   <div className="flex items-center justify-between mb-4">
                      <div className="text-4xl font-black">{editedNews.qualityAudit.seoScore}</div>
                      <div className="text-[10px] font-black uppercase tracking-widest opacity-80">SEO Gücü</div>
                   </div>
                   <p className="text-xs font-bold leading-relaxed text-slate-600">{editedNews.qualityAudit.seoExplanation}</p>
                </div>
                <div className="p-8 rounded-3xl border border-slate-200 bg-white shadow-sm flex flex-col text-slate-900 ring-4 ring-slate-50/50">
                   <div className="flex items-center justify-between mb-4">
                      <div className="text-4xl font-black">%{editedNews.qualityAudit.originalityScore}</div>
                      <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Özgünlük</div>
                   </div>
                   <p className="text-xs font-bold leading-relaxed text-slate-600">{editedNews.qualityAudit.originalityExplanation}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-8 rounded-3xl border border-slate-200 bg-white shadow-sm flex flex-col items-center justify-center text-slate-900">
                   <Target className="w-8 h-8 mb-2 text-slate-400" />
                   <div className="text-sm font-black text-center uppercase tracking-tighter">{editedNews.qualityAudit.googleNewsSuitability}</div>
                   <div className="text-[10px] font-black uppercase tracking-widest opacity-60 mt-1">Google News Uyumu</div>
                </div>
                <div className="p-8 rounded-3xl border border-slate-200 bg-white shadow-sm flex flex-col items-center justify-center text-amber-600">
                   <TrendingUp className="w-8 h-8 mb-2" />
                   <div className="text-sm font-black text-center uppercase tracking-tighter">{editedNews.qualityAudit.trendPotential}</div>
                   <div className="text-[10px] font-black uppercase tracking-widest opacity-60 mt-1">Trend Gücü</div>
                </div>
              </div>

              {/* Okunabilirlik ve Dil Analizi */}
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50">
                 <h4 className="flex items-center text-sm font-black uppercase tracking-[0.2em] mb-8 text-slate-900 border-b border-slate-50 pb-4">
                    <AlignLeft className="w-5 h-5 mr-3 text-blue-600" /> Okunabilirlik & Dil Analizi
                 </h4>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center">
                            <Info className="w-3 h-3 mr-1" /> Editör Değerlendirmesi
                          </p>
                          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-sm font-medium text-slate-700 leading-relaxed italic">
                             "{editedNews.qualityAudit.readabilityAnalysis}"
                          </div>
                       </div>
                    </div>

                    <div className="space-y-6">
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center">
                            <Zap className="w-3 h-3 mr-1 text-amber-500" /> Temizlenen Teknik Jargonlar
                          </p>
                          <div className="flex flex-wrap gap-2">
                             {editedNews.qualityAudit.jargonRemovalLog.length > 0 ? (
                               editedNews.qualityAudit.jargonRemovalLog.map((item, i) => (
                                <span key={i} className="px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-100 rounded-lg text-[10px] font-bold">
                                   {item}
                                </span>
                               ))
                             ) : (
                               <span className="text-xs text-slate-400 italic">Teknik jargon saptanmadı.</span>
                             )}
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              {/* SEO Analysis */}
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50">
                 <h4 className="flex items-center text-sm font-black uppercase tracking-[0.2em] mb-8 text-slate-900 border-b border-slate-50 pb-4">
                    <ShieldCheck className="w-5 h-5 mr-3 text-emerald-500" /> SEO & İçerik Denetimi
                 </h4>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Anahtar Kelime Yoğunluğu</p>
                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-sm font-medium text-slate-700 leading-relaxed italic">
                             "{editedNews.qualityAudit.keywordDensityCheck}"
                          </div>
                       </div>
                    </div>

                    <div className="space-y-6">
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Stratejik Öneriler</p>
                          <ul className="space-y-3">
                             {editedNews.qualityAudit.strategySuggestions.map((s, i) => (
                                <li key={i} className="flex items-start text-xs font-bold text-slate-700 leading-relaxed bg-blue-50/50 p-3 rounded-xl border border-blue-100/50">
                                   <Zap className="w-4 h-4 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                                   {s}
                                </li>
                             ))}
                          </ul>
                       </div>
                    </div>
                 </div>
              </div>

               {/* Social Preview Panel */}
               <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50">
                  <h4 className="flex items-center text-sm font-black uppercase tracking-[0.2em] mb-8 text-slate-900 border-b border-slate-50 pb-4">
                     <Share2 className="w-5 h-5 mr-3 text-blue-500" /> Sosyal Medya Önizleme
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                     <div className="space-y-6">
                        <div className="flex items-center space-x-2 mb-2">
                           <Twitter className="w-4 h-4 text-[#1DA1F2]" />
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Twitter (X)</span>
                        </div>
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-3">
                           <p className="text-sm font-bold text-slate-900">{editedNews.socialPreview?.twitter?.title || editedNews.headline}</p>
                           <p className="text-xs text-slate-600 leading-relaxed">{editedNews.socialPreview?.twitter?.description || editedNews.spot}</p>
                           <div className="flex flex-wrap gap-2 pt-2">
                              {(editedNews.socialPreview?.twitter?.hashtags || editedNews.tags || []).map((tag, i) => (
                                 <span key={i} className="text-[10px] font-bold text-blue-600">#{tag}</span>
                              ))}
                           </div>
                        </div>
                     </div>

                     <div className="space-y-6">
                        <div className="flex items-center space-x-2 mb-2">
                           <Facebook className="w-4 h-4 text-[#1877F2]" />
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Facebook</span>
                        </div>
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-3">
                           <p className="text-sm font-bold text-slate-900">{editedNews.socialPreview?.facebook?.title || editedNews.headline}</p>
                           <p className="text-xs text-slate-600 leading-relaxed">{editedNews.socialPreview?.facebook?.description || editedNews.spot}</p>
                        </div>
                     </div>
                  </div>
               </div>

              {/* Metadata Panel */}
              <div className="bg-slate-900 rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden group">
                 <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent opacity-50 pointer-events-none" />
                 
                 <div className="relative z-10 space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                       <div>
                          <div className="flex justify-between items-center mb-4">
                             <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Meta Title (SEO Başlığı)</span>
                             <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${editedNews.metaTitle.length > 60 ? 'bg-rose-500' : 'bg-emerald-500'}`}>{editedNews.metaTitle.length}/60</span>
                          </div>
                          <div className="text-xl font-bold leading-tight text-white group-hover:text-blue-400 transition-colors">{editedNews.metaTitle}</div>
                       </div>
                       <div>
                          <div className="flex justify-between items-center mb-4">
                             <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Meta Description (Açıklama)</span>
                             <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${editedNews.metaDescription.length > 160 ? 'bg-rose-500' : 'bg-emerald-500'}`}>{editedNews.metaDescription.length}/160</span>
                          </div>
                          <div className="text-sm text-slate-300 leading-relaxed font-medium">{editedNews.metaDescription}</div>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Keywords & Tags Panel */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                 <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50">
                    <h4 className="flex items-center text-[10px] font-black uppercase tracking-[0.2em] mb-6 text-slate-400">
                       <Target className="w-4 h-4 mr-2 text-emerald-500" /> SEO Etiketleri (Tags)
                    </h4>
                    <div className="flex flex-wrap gap-2">
                       {editedNews.tags.map((tag, i) => (
                          <span key={i} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl text-[11px] font-bold">
                             #{tag}
                          </span>
                       ))}
                    </div>
                 </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
};
