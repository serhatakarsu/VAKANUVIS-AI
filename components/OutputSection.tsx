
import React, { useState, useEffect } from 'react';
import { 
  Copy, Check, Coffee, Archive, ThumbsUp, ThumbsDown, 
  Search, Zap, AlertCircle, ChevronDown, ChevronUp, 
  Globe, Lightbulb, RefreshCw, BarChart3,
  MousePointer2, Sparkles, TrendingUp, Target, ShieldCheck, Loader2, Link as LinkIcon
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
    setRefineError(null);

    if (nextState && !refinedHeadlineData && editedNews && !isRefiningHeadline) {
      setIsRefiningHeadline(true);
      try {
        const result = await refineHeadline(editedNews.headline, editedNews.body);
        setRefinedHeadlineData(result);
      } catch (err: any) {
        console.error("Refinement failed", err);
        setRefineError("Başlık analizi başarısız oldu. Lütfen tekrar deneyin.");
      } finally {
        setIsRefiningHeadline(false);
      }
    }
  };

  const handleToggleRefineSpot = async () => {
    const nextState = !showSpotAlts;
    setShowSpotAlts(nextState);
    setRefineError(null);

    if (nextState && !refinedSpotData && editedNews && !isRefiningSpot) {
      setIsRefiningSpot(true);
      try {
        const result = await refineSpot(editedNews.spot, editedNews.body);
        setRefinedSpotData(result);
      } catch (err: any) {
        console.error("Spot refinement failed", err);
        setRefineError("Spot analizi başarısız oldu. Lütfen tekrar deneyin.");
      } finally {
        setIsRefiningSpot(false);
      }
    }
  };

  if (isEmpty || !editedNews) {
    return (
      <div className="bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 h-full flex items-center justify-center p-8 text-center">
        <div className="max-w-xs opacity-50">
          <Coffee className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-sm font-black text-gray-900 mb-1 uppercase tracking-widest">Haber Merkezi Hazır</h3>
          <p className="text-gray-500 text-xs font-medium">
            Verilerinizi girin; Google Search ve Thinking teknolojisi ile derinlikli bir analiz sizi bekliyor.
          </p>
        </div>
      </div>
    );
  }

  const renderBody = (text: string) => {
    const blocks = text.split(/\n+/).filter(line => line.trim().length > 0);
    return blocks.map((line, index) => {
      const trimmedLine = line.trim();
      const isHeader = trimmedLine === trimmedLine.toUpperCase() && trimmedLine.length > 5 && trimmedLine.length < 120;
      if (isHeader) {
        return (
          <div key={index} className="mt-12 mb-6">
            <h4 className="text-2xl font-black text-slate-950 font-sans tracking-tight border-l-8 border-blue-600 pl-6 py-2 bg-blue-50/30 rounded-r-lg border-y border-r border-blue-100">
              {trimmedLine}
            </h4>
          </div>
        );
      }
      return <p key={index} className="mb-8 text-slate-800 leading-[1.8] text-xl text-justify font-serif antialiased">{trimmedLine}</p>;
    });
  };

  const getReadabilityColor = (score: number) => {
    if (score >= 70) return 'text-emerald-600 bg-emerald-50 border-emerald-100';
    if (score >= 40) return 'text-amber-600 bg-amber-50 border-amber-100';
    return 'text-rose-600 bg-rose-50 border-rose-100';
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col h-full overflow-hidden">
      <div className="flex border-b border-gray-100 bg-white px-2 pt-2">
        <button onClick={() => setActiveTab('preview')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] border-b-4 transition-all ${activeTab === 'preview' ? 'border-blue-600 text-blue-600 bg-blue-50/30' : 'border-transparent text-gray-400'}`}>HABER ÖNİZLEME</button>
        <button onClick={() => setActiveTab('seo')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] border-b-4 transition-all ${activeTab === 'seo' ? 'border-blue-600 text-blue-600 bg-blue-50/30' : 'border-transparent text-gray-400'}`}>STRATEJİK ANALİZ</button>
      </div>
      
      <div className="flex-1 overflow-y-auto bg-white custom-scrollbar">
        {activeTab === 'preview' ? (
          <div className="p-0">
            <article className="max-w-4xl mx-auto px-8 md:px-14 py-14">
              <div className="flex justify-between items-center mb-12 border-b border-gray-100 pb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center font-black text-white text-[10px] shadow-xl">PRO</div>
                  <div>
                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest leading-none mb-1">GELİŞMİŞ EDİTÖRYAL ÇIKTI</p>
                    <div className="flex items-center space-x-2">
                       <span className="text-[9px] text-emerald-600 font-bold uppercase tracking-tight flex items-center bg-emerald-50 px-2 py-0.5 rounded">
                          <Zap className="w-2.5 h-2.5 mr-1" /> SEARCH GROUNDING AKTİF
                       </span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button onClick={onArchive} className="p-3 rounded-xl border border-gray-200 text-gray-500 hover:text-blue-600 bg-white shadow-sm transition-all"><Archive className="w-5 h-5"/></button>
                  <button onClick={handleCopy} className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-xs font-black transition-all border shadow-lg ${copied ? 'bg-green-600 text-white border-green-600' : 'bg-slate-900 text-white border-slate-900 hover:bg-black'}`}>
                    {copied ? <Check className="w-4 h-4 mr-2"/> : <Copy className="w-4 h-4 mr-2"/>}
                    {copied ? 'KOPYALANDI' : 'YAYINA HAZIRLA'}
                  </button>
                </div>
              </div>

              <div className="relative mb-12">
                <h1 className="text-4xl md:text-6xl font-black text-slate-950 mb-6 leading-[1.05] tracking-tighter font-sans text-balance">
                  {editedNews.headline}
                </h1>
                
                <div className="flex items-center space-x-3 mb-8">
                  <button onClick={handleToggleRefineHeadline} className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-black text-[10px] uppercase tracking-widest bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 transition-all shadow-sm">
                    {isRefiningHeadline ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    <span>TIKLANMA ODAKLI 3 BAŞLIK ÖNERİSİ</span>
                    {showHeadlineAlts ? <ChevronUp className="w-3.5 h-3.5 ml-1" /> : <ChevronDown className="w-3.5 h-3.5 ml-1" />}
                  </button>
                  <div className={`px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest flex items-center space-x-2 ${getReadabilityColor(editedNews.qualityAudit.readabilityScore)}`}>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Okunabilirlik: {editedNews.qualityAudit.readabilityScore}/100</span>
                  </div>
                </div>

                {showHeadlineAlts && (
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 mb-8 shadow-2xl animate-in fade-in slide-in-from-top-4">
                     {refineError && (
                        <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl mb-4 flex items-center space-x-3">
                           <AlertCircle className="w-5 h-5 text-rose-500" />
                           <p className="text-xs text-rose-200 font-bold">{refineError}</p>
                        </div>
                     )}
                     
                     {refinedHeadlineData ? (
                       <div className="space-y-6">
                          <div className="bg-blue-600/10 border border-blue-600/20 p-4 rounded-2xl">
                             <div className="flex items-center space-x-2 mb-2">
                                <Lightbulb className="w-4 h-4 text-blue-400" />
                                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">EDİTÖRYAL STRATEJİ</p>
                             </div>
                             <p className="text-sm text-slate-300 italic leading-relaxed">{refinedHeadlineData.analysis}</p>
                          </div>
                          
                          <div className="grid grid-cols-1 gap-4">
                            {refinedHeadlineData.alternatives.map((alt, idx) => (
                              <div key={idx} onClick={() => applyHeadline(alt.text)} className="p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 cursor-pointer transition-all flex flex-col group relative overflow-hidden border-l-4 border-l-blue-500">
                                 <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center space-x-2">
                                       <span className="px-3 py-1 rounded-full bg-blue-600/20 text-blue-400 text-[10px] font-black uppercase tracking-wider">{alt.type}</span>
                                       <span className="text-[10px] text-emerald-400 font-bold flex items-center">
                                          <TrendingUp className="w-3 h-3 mr-1" /> CTR SKORU: {alt.score}
                                       </span>
                                    </div>
                                    <div className="flex items-center text-slate-500 text-[10px] font-bold">
                                       <MousePointer2 className="w-3 h-3 mr-1" /> UYGULA
                                    </div>
                                 </div>
                                 <p className="text-lg font-bold text-white leading-tight mb-4 group-hover:text-blue-300">{alt.text}</p>
                                 <div className="bg-slate-800/50 p-3 rounded-xl border border-white/5">
                                    <p className="text-xs text-slate-400 leading-relaxed italic">
                                       <span className="text-blue-400 font-black uppercase text-[9px] not-italic mr-1">PSİKOLOJİK GEREKÇE:</span> 
                                       {alt.rationale}
                                    </p>
                                 </div>
                              </div>
                            ))}
                          </div>
                       </div>
                     ) : isRefiningHeadline ? (
                       <div className="py-12 flex flex-col items-center justify-center space-y-4 text-slate-500">
                          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                          <div className="text-center">
                             <p className="text-xs font-black uppercase tracking-widest text-slate-300">Duygusal Tetikleyiciler Analiz Ediliyor...</p>
                          </div>
                       </div>
                     ) : null}
                  </div>
                )}
              </div>

              <div className="mb-14 relative group">
                <div className="border-l-[10px] border-blue-600 pl-8 py-4 bg-slate-50 rounded-r-3xl pr-6 shadow-sm">
                   <div className="text-2xl font-bold leading-relaxed text-slate-800 italic font-serif text-balance">
                      {editedNews.spot}
                   </div>
                   
                   <div className="mt-4 flex items-center space-x-3">
                      <button onClick={handleToggleRefineSpot} className="flex items-center space-x-2 text-slate-500 hover:text-blue-600 font-black text-[9px] uppercase tracking-[0.2em] transition-all">
                        {isRefiningSpot ? <Loader2 className="w-3 h-3 animate-spin" /> : <TrendingUp className="w-3 h-3" />}
                        <span>SPOT'U OPTİMİZE ET (Thinking)</span>
                        {showSpotAlts ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
                      </button>
                   </div>
                </div>

                {showSpotAlts && (
                  <div className="mt-4 bg-white border-2 border-blue-100 rounded-3xl p-6 shadow-xl animate-in fade-in slide-in-from-top-2">
                     {refinedSpotData ? (
                        <div className="space-y-4">
                           <div className="flex items-center space-x-2 mb-2 text-blue-600">
                              <Target className="w-4 h-4" />
                              <span className="text-[10px] font-black uppercase tracking-widest">3 Merak Odaklı Spot Önerisi</span>
                           </div>
                           {refinedSpotData.alternatives.map((alt, idx) => (
                              <div key={idx} onClick={() => applySpot(alt.text)} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:border-blue-300 cursor-pointer group transition-all">
                                 <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-center space-x-2">
                                       <span className="px-2 py-0.5 bg-blue-600 text-white text-[9px] font-black uppercase rounded">{alt.type}</span>
                                       <span className="text-[9px] text-emerald-600 font-bold">SEO/CTR: {alt.score}</span>
                                    </div>
                                    <MousePointer2 className="w-3.5 h-3.5 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                 </div>
                                 <p className="text-sm font-bold text-slate-900 leading-snug group-hover:text-blue-600 mb-2">{alt.text}</p>
                                 <p className="text-[10px] text-slate-500 leading-relaxed italic"><span className="text-blue-600 font-black not-italic mr-1">STRATEJİ:</span> {alt.rationale}</p>
                              </div>
                           ))}
                        </div>
                     ) : isRefiningSpot ? (
                        <div className="py-8 flex flex-col items-center justify-center space-y-3">
                           <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Merak Unsuru Hesaplanıyor...</p>
                        </div>
                     ) : null}
                  </div>
                )}
              </div>

              <div className="news-content-area select-text">
                {renderBody(editedNews.body)}
              </div>

              {/* Sources Section */}
              {editedNews.groundingChunks && editedNews.groundingChunks.length > 0 && (
                <div className="mt-20 pt-10 border-t border-slate-100">
                  <div className="flex items-center space-x-2 mb-6">
                    <Globe className="w-5 h-5 text-blue-600" />
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Doğrulama Kaynakları (Search Grounding)</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {editedNews.groundingChunks.map((chunk, i) => chunk.web && (
                      <a 
                        key={i} 
                        href={chunk.web.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-4 bg-slate-50 border border-slate-100 rounded-xl hover:border-blue-300 hover:bg-white transition-all flex items-start space-x-3 group"
                      >
                        <LinkIcon className="w-4 h-4 text-slate-400 group-hover:text-blue-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-blue-600">{chunk.web.title || chunk.web.uri}</p>
                          <p className="text-[10px] text-slate-400 mt-1 line-clamp-1 truncate w-48">{chunk.web.uri}</p>
                        </div>
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className={`col-span-1 flex flex-col items-center justify-center p-8 rounded-3xl border ${getReadabilityColor(editedNews.qualityAudit.readabilityScore)} bg-white shadow-xl`}>
                  <div className="text-5xl font-black mb-1 tracking-tighter">{editedNews.qualityAudit.readabilityScore}</div>
                  <div className="text-[9px] font-black uppercase tracking-widest opacity-80 text-center">OKUNABİLİRLİK</div>
                </div>
                <div className="col-span-1 flex flex-col items-center justify-center p-8 rounded-3xl border border-blue-100 text-blue-600 bg-white shadow-xl">
                  <div className="text-4xl font-black mb-1 tracking-tight">{editedNews.qualityAudit.seoScore}</div>
                  <div className="text-[9px] font-black uppercase tracking-widest opacity-80">SEO PUANI</div>
                </div>
                <div className="col-span-1 flex flex-col items-center justify-center p-8 rounded-3xl border border-slate-200 text-slate-900 bg-white shadow-xl">
                   <Target className="w-6 h-6 mb-2 text-blue-600" />
                   <div className="text-lg font-black mb-1 text-center">{editedNews.qualityAudit.googleNewsSuitability}</div>
                   <div className="text-[9px] font-black uppercase tracking-widest opacity-80">GOOGLE NEWS</div>
                </div>
                <div className="col-span-1 bg-white rounded-3xl border border-slate-200 p-8 flex flex-col items-center justify-center shadow-xl text-amber-600">
                   <TrendingUp className="w-6 h-6 mb-2" />
                   <div className="text-xl font-black mb-1">{editedNews.qualityAudit.trendPotential}</div>
                   <div className="text-[9px] font-black uppercase tracking-widest opacity-80 text-center">TREND POTANSİYELİ</div>
                </div>
              </div>

              <div className="bg-slate-900 rounded-3xl p-10 shadow-2xl text-white space-y-8">
                 <div className="flex items-center space-x-4 border-b border-white/10 pb-6">
                    <Globe className="w-8 h-8 text-blue-400" />
                    <div>
                       <h3 className="text-lg font-black uppercase tracking-widest">Rakip Haber Analizi</h3>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Google Search Grounding Verileri</p>
                    </div>
                 </div>
                 <p className="text-slate-300 leading-relaxed font-medium italic">
                    {editedNews.qualityAudit.competitorAnalysis}
                 </p>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white/5 p-8 rounded-3xl border border-white/10">
                       <h4 className="flex items-center text-sm font-black uppercase tracking-widest mb-6 text-blue-400">
                          <Target className="w-5 h-5 mr-3" /> Strateji Önerileri
                       </h4>
                       <ul className="space-y-4">
                          {editedNews.qualityAudit.strategySuggestions.map((s, i) => (
                             <li key={i} className="flex items-start text-xs font-medium text-slate-300 leading-relaxed">
                                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-1.5 flex-shrink-0" />
                                {s}
                             </li>
                          ))}
                       </ul>
                    </div>
                    <div className="bg-white/5 p-8 rounded-3xl border border-white/10">
                       <h4 className="flex items-center text-sm font-black uppercase tracking-widest mb-6 text-emerald-400">
                          <Lightbulb className="w-5 h-5 mr-3" /> Editoryal Notlar
                       </h4>
                       <p className="text-xs text-slate-300 leading-relaxed">{editedNews.qualityAudit.critique}</p>
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
                  <div className="flex items-center mb-6 text-slate-400 font-black text-[9px] justify-between uppercase tracking-[0.2em]">
                    <span>Meta Title</span>
                    <span className={`px-3 py-1 rounded-full font-bold ${editedNews.metaTitle.length > 60 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>{editedNews.metaTitle.length}/60</span>
                  </div>
                  <div className="text-xl text-slate-950 font-black tracking-tight">{editedNews.metaTitle}</div>
                </div>
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
                  <div className="flex items-center mb-6 text-slate-400 font-black text-[9px] justify-between uppercase tracking-[0.2em]">
                    <span>Meta Description</span>
                    <span className={`px-3 py-1 rounded-full font-bold ${editedNews.metaDescription.length > 160 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>{editedNews.metaDescription.length}/160</span>
                  </div>
                  <div className="text-sm text-slate-700 font-bold leading-relaxed">{editedNews.metaDescription}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
