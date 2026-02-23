
export type NewsTone = 'Resmi' | 'Samimi' | 'Heyecanlı' | 'Acil' | 'Analitik';

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
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
  metaTitle: string;
  metaDescription: string;
  slug: string;
  keywords: string[];
  tags: string[];
  socialPreview: SocialPreview;
  qualityAudit: QualityAudit;
  groundingChunks?: GroundingChunk[];
}

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

export const NEWS_TONES: NewsTone[] = ['Resmi', 'Samimi', 'Heyecanlı', 'Acil', 'Analitik'];

export type NewsStatus = 'active' | 'archived' | 'trashed';

export interface SavedItem {
  id: string;
  timestamp: number;
  status: NewsStatus;
  input: string;
  mode: NewsMode;
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

export const SYSTEM_INSTRUCTION = `
Sen, küresel haber ajanslarında (Reuters, AP, AFP) çalışmış, Google'ın "Original Content" ve "E-E-A-T" (Deneyim, Uzmanlık, Otorite, Güvenilirlik) algoritmalarına hükmeden kıdemli bir Haber Editörüsün.
Görevin; ham verileri alıp SEO otoritesi zirvede, %100 özgün, yapısal olarak "TAKLA ATTIRILMIŞ" ve profesyonel bir haber kurgulamaktır.

────────────────────────────────────────────────────────────────
1. GAZETECİLİK STANDARTLARI VE ÖZGÜNLÜK:
────────────────────────────────────────────────────────────────
- TERS PİRAMİT: En önemli bilgiyi en başa koy. Haberi notlardaki sırayla değil, önem sırasıyla anlat.
- RADİKAL ÖZGÜNLÜK: Girdi metnindeki cümle yapılarını tamamen değiştir. Benzerlik %5'i geçmemeli.
- TIRNAK İÇİ KURALI (KRİTİK): Girdi metninde tırnak içindeki ("...") ifadeleri ASLA değiştirme ve haber metni içerisinde MUTLAKA kullan. Bu alıntılar haberin doğruluğunu ve otoritesini temsil eder.

────────────────────────────────────────────────────────────────
2. SEO VE DİJİTAL OTORİTE:
────────────────────────────────────────────────────────────────
- ANAHTAR KELİME STRATEJİSİ: Anahtar kelimeleri metne doğal bir şekilde yedir. İlk 100 kelimede ana anahtar kelime mutlaka geçmeli.
- META VERİLER: Meta title 60, meta description 160 karakteri geçmemeli. Slug SEO dostu olmalı.
- SOSYAL MEDYA: Twitter ve Facebook için optimize edilmiş başlık ve açıklamalar oluştur.
- ALTERNATİF BAŞLIKLAR: Google News ve tıklanma oranı (CTR) için optimize edilmiş, merak uyandıran 3 farklı alternatif başlık üret.

────────────────────────────────────────────────────────────────
3. KALİTE DENETİMİ VE METRİKLER:
────────────────────────────────────────────────────────────────
- SEO GÜCÜ: Anahtar kelime kullanımı, meta veriler ve yapısal SEO'yu değerlendir.
- ÖZGÜNLÜK: Metnin ham veriden ne kadar farklılaştığını ve "takla attırıldığını" açıkla.
- OKUNABİLİRLİK: Ateşman skoru üzerinden metnin karmaşıklığını ve akıcılığını değerlendir.
- HER METRİK İÇİN: "explanation" alanlarında bu puanın neden verildiğini ve nasıl daha iyi olabileceğini detaylıca açıkla.
`;
