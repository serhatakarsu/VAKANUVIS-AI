
export type NewsTone = 'SEO Uyumlu Özgün Haber' | 'Ulusal Medya Tipi Tık Odaklı';

export interface GroundingChunk {
  web?: {
    uri?: string;
    title?: string;
  };
}

export interface QualityAudit {
  seoScore: number;
  seoExplanation: string;
  originalityScore: number; 
  originalityExplanation: string;
  googleNewsSuitability: 'Yüksek' | 'Orta' | 'Düşük';
  trendPotential: 'Yüksek' | 'Orta' | 'Düşük';
  trendAnalysis: string;
  critique: string;
  suggestions: string[];
  alternativeHeadlines: string[]; 
  headlinePerformance: 'Güçlü' | 'Ortalama' | 'Zayıf';
  isWhyReadAnswered: boolean;
  keywordDensityCheck: string;
  readabilityScore: number; // Ateşman Okunabilirlik İndeksi (0-100)
  readabilityExplanation: string;
  readabilityAnalysis: string; // Okunabilirlik detay analizi
  jargonRemovalLog: string[]; // Temizlenen teknik jargonlar
  competitorAnalysis: string; 
  strategySuggestions: string[]; 
}

export interface SocialPreview {
  twitter: {
    title: string;
    description: string;
    hashtags: string[];
  };
  facebook: {
    title: string;
    description: string;
  };
}

export interface GeneratedNews {
  headline: string;
  spot: string;
  body: string;
  metaTitle?: string;
  metaDescription?: string;
  slug?: string;
  keywords?: string[];
  tags?: string[];
  additionalSeoTags?: string[];
  socialPreview?: SocialPreview;
  qualityAudit?: QualityAudit;
  groundingChunks?: GroundingChunk[];
  seoClickPanel?: {
    clickHeadline: string;
    clickSpot: string;
    seoSubheadingSuggestions: string[];
  };
  comparison?: {
    originalSnippet: string;
    correctedSnippet: string;
    editorNote: string;
  };
  suggestedCategories?: string[];
  expandedKeywords?: string[];
  
  // Advanced Features
  trendDiscovery?: { title: string; description: string; keywords: string[] }[];
  performancePrediction?: { ctr: string; discoverSuitability: string; trendPotential: string; readEstimate: string; targetAudience: string; whyRead: string };
  internalLinks?: { title: string; slug: string; anchorText: string }[];
  videoScript?: { intro: string; body: string; outro: string; visualCues: string[] };
  imageSuggestions?: { newsImage: string; socialImage: string; thumbnail: string; altText: string };
  aiEditorAudit?: { repeatedWords: string[]; weakSentences: string[]; agencyClichés: string[]; longSentences: string[]; toneCheck: string };
  versionAnalysis?: { altIntro: string; altParagraph: string; altHeadline: string; bulletPoints: string[] };
  archiveAnalysis?: { similarNews: string[]; pastContent: string[]; futureTopics: string[]; historicalContext: string };
  discoverOptimization?: { title: string; spot: string; analysis: string; highResImageIdea: string };
  editorialCalendar?: { title: string; reason: string; keywords: string[]; publishTime: string };
  factCheck?: { unverifiedClaims: string[]; missingData: string[]; potentialErrors: string[]; sourceReliability: string };
  distributionContent?: { xPost: string; facebookPost: string; pushNotification: string; shortVersion: string; linkedinPost: string; instagramCaption: string };
  keywordAnalysis?: { word: string; count: number; density: string }[];
}

export interface AdvancedFeatures {
  trendDiscovery: boolean;
  performancePrediction: boolean;
  internalLinks: boolean;
  videoScript: boolean;
  imageSuggestions: boolean;
  aiEditorAudit: boolean;
  versionAnalysis: boolean;
  archiveAnalysis: boolean;
  discoverOptimization: boolean;
  editorialCalendar: boolean;
  dataToNews: boolean;
  factCheck: boolean;
  distributionContent: boolean;
}

export const DEFAULT_ADVANCED_FEATURES: AdvancedFeatures = {
  trendDiscovery: false,
  performancePrediction: false,
  internalLinks: false,
  videoScript: false,
  imageSuggestions: false,
  aiEditorAudit: false,
  versionAnalysis: false,
  archiveAnalysis: false,
  discoverOptimization: false,
  editorialCalendar: false,
  dataToNews: false,
  factCheck: false,
  distributionContent: false,
};

export interface HeadlineRefinement {
  alternatives: {
    text: string;
    type: string;
    score: number;
    rationale: string;
  }[];
  analysis: string;
}

export interface SpotRefinement {
  alternatives: {
    text: string;
    type: string;
    score: number;
    rationale: string;
  }[];
  analysis: string;
}

export enum AppState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export type NewsMode = 
  | 'Gündem'
  | 'Yerel Haber' 
  | 'Ulusal Haber' 
  | 'Siyaset & Politika' 
  | 'Ekonomi' 
  | 'Polis & Asayiş'
  | 'Bilim & Teknoloji'
  | 'Çevre'
  | 'Spor' 
  | 'Kültür & Sanat' 
  | 'Magazin' 
  | 'Dünya'
  | 'Eğitim'
  | 'Sağlık';

export const NEWS_MODES: NewsMode[] = [
  'Gündem',
  'Yerel Haber',
  'Ulusal Haber',
  'Siyaset & Politika',
  'Ekonomi',
  'Polis & Asayiş',
  'Bilim & Teknoloji',
  'Çevre',
  'Spor',
  'Kültür & Sanat',
  'Magazin',
  'Dünya',
  'Eğitim',
  'Sağlık'
];

export const NEWS_TONES: NewsTone[] = ['SEO Uyumlu Özgün Haber', 'Ulusal Medya Tipi Tık Odaklı'];

export const TONE_DESCRIPTIONS: Record<NewsTone, string> = {
  'SEO Uyumlu Özgün Haber': 'Nesnel, %100 özgün ve SEO odaklı "takla attırılmış" haber.',
  'Ulusal Medya Tipi Tık Odaklı': 'Yüksek etkileşimli, merak uyandıran ulusal medya tarzı içerik.'
};

export type NewsStatus = 'active' | 'archived' | 'trashed';

export interface SavedItem {
  id: string;
  timestamp: number;
  status: NewsStatus;
  input: string;
  mode: NewsMode;
  tone: NewsTone;
  output: GeneratedNews | null;
}

export const MODE_DESCRIPTIONS: Record<NewsMode, string> = {
  'Gündem': 'Günün en sıcak ve SEO potansiyeli yüksek gelişmeleri.',
  'Yerel Haber': 'Bölgesel odaklı, yerel anahtar kelime yoğunluklu haberler.',
  'Ulusal Haber': 'Genel izleyici kitlesine yönelik resmi ve geniş kapsamlı dil.',
  'Siyaset & Politika': 'Tarafsız, terminolojiye hakim ve stratejik kurgu.',
  'Ekonomi': 'Veri odaklı, piyasa terimlerini içeren teknik anlatım.',
  'Polis & Asayiş': 'Hukuki terimlere uygun, nesnel ve hızlı akış.',
  'Bilim & Teknoloji': 'Yenilikçi, keşif odaklı ve açıklayıcı dil.',
  'Çevre': 'Sürdürülebilirlik ve ekoloji odaklı farkındalık dili.',
  'Spor': 'Dinamik, heyecan verici ve istatistik destekli kurgu.',
  'Kültür & Sanat': 'Estetik, entelektüel ve etkinlik odaklı anlatım.',
  'Magazin': 'Merak uyandırıcı, akıcı ve popüler kültür dili.',
  'Dünya': 'Diplomatik, küresel perspektifli ve karşılaştırmalı analiz.',
  'Eğitim': 'Öğrenci, öğretmen ve veli odaklı, bilgilendirici ve eğitici dil.',
  'Sağlık': 'Tıbbi terimlere dikkat eden, güvenilir ve halk sağlığı odaklı anlatım.'
};

export const EXAMPLE_INPUT_TEXT = `NOTLAR:
- İstanbul Büyükşehir Belediyesi (İBB) Meclisi toplandı.
- Gündem: Toplu ulaşıma zam teklifi.
- UKOME kararı görüşüldü.
- Otobüs, metro, metrobüs ve vapur ücretlerine %18 zam yapıldı.
- Tam bilet 15 TL'den 17.70 TL'ye çıktı.
- Öğrenci bileti değişmedi, sübvanse edilecek.
- Karar oy çokluğuyla geçti.
- Uygulama haftaya pazartesi başlayacak.
- Vatandaşlar tepkili, sosyal medyada etiket açıldı #UlaşımZammı.
- İBB Sözcüsü açıklama yaptı: "Maliyetler %100 arttı, bu zam kaçınılmazdı."`;

export interface NewsConfig {
  mode: NewsMode;
  tone: NewsTone;
}

export const DEFAULT_NEWS_CONFIG: NewsConfig = {
  mode: NEWS_MODES[0],
  tone: NEWS_TONES[0]
};
