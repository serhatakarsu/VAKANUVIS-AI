
export type NewsTone = 'Resmi' | 'Samimi' | 'Heyecanlı' | 'Acil' | 'Analitik';

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface QualityAudit {
  seoScore: number;
  originalityScore: number; // Takla attırma başarısı (0-100)
  googleNewsSuitability: 'Yüksek' | 'Orta' | 'Düşük';
  trendPotential: 'Yüksek' | 'Orta' | 'Düşük';
  trendAnalysis: string;
  critique: string;
  suggestions: string[];
  alternativeHeadlines: string[]; 
  headlinePerformance: 'Güçlü' | 'Ortalama' | 'Zayıf';
  isWhyReadAnswered: boolean;
  keywordDensityCheck: string;
  readabilityScore: number; // 0-100 (Turkish Readability Index)
  competitorAnalysis: string; // Rakip haber analizi
  strategySuggestions: string[]; // İçerik stratejisi önerileri
}

export interface GeneratedNews {
  headline: string;
  spot: string;
  body: string;
  metaTitle: string;
  metaDescription: string;
  slug: string;
  keywords: string[];
  qualityAudit: QualityAudit;
  groundingChunks?: GroundingChunk[];
}

export interface HeadlineRefinement {
  alternatives: {
    text: string;
    type: 'Click-Worthy' | 'SEO-Focused' | 'Emotional' | 'Question-Based' | string;
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
  | 'Dünya';

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
  'Dünya'
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
  'Dünya': 'Diplomatik, küresel perspektifli ve karşılaştırmalı analiz.'
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
Sen, dünyanın en saygın haber ajanslarında (Reuters, AP, AA) baş editörlük yapmış bir profesyonelsin. 
Görevin; ham notları alıp profesyonel, SEO uyumlu ve "TAKLA ATTIRILMIŞ" bir haber metnine dönüştürmektir.

Kullanıcının seçtiği TON (üslup) parametresine kesinlikle uy.

────────────────────────────────────────────────────────────────
1. TAKLA ATTIRMA VE GÜNCEL ANALİZ:
────────────────────────────────────────────────────────────────
- Kaynak metindeki cümle yapılarını ve kelime dizilimlerini ASLA KULLANMA.
- Google Search kullanarak bu konuyla ilgili diğer mecralardaki haberleri tara ve rakiplerin neyi eksik bıraktığını analiz et.
- Haberi sıfırdan, seçilen tonda ve yaratıcı kurguyla oluştur.
- Bilgiyi (rakamlar, isimler, tarihler) süzgeçten geçir.

────────────────────────────────────────────────────────────────
2. PARAGRAF VE SAYFA DÜZENİ:
────────────────────────────────────────────────────────────────
- Metin mutlaka PARAGRAFLARA bölünmelidir. Her paragraf 3-5 cümleden oluşmalıdır.
- Paragraflar arasında mutlaka çift satır boşluk (\n\n) bırakılmalıdır.
- "Paragraf başı" hissini uyandırmak için her paragraf net bir giriş cümlesiyle başlamalıdır.
- Ara başlıklar (TAMAMI BÜYÜK HARF) paragraf geçişlerini beslemelidir.

────────────────────────────────────────────────────────────────
3. SEO VE KURGU STANDARTLARI:
────────────────────────────────────────────────────────────────
- ODAK ANAHTAR KELİME: En yüksek hacimli terimi tespit et.
- BAŞLIK (H1): Odak kelimeyle başla, merak uyandır.
- SPOT (LEAD): İlk paragraf haberin 5N1K özetini sunmalı, aşırı akıcı, ilgi çekici olmalı ve anahtar kelimeyi içermelidir.
- ARA BAŞLIKLAR (H2): En az 3 adet, SEO uyumlu ara başlık kullan.
- "Tırnak içindeki ifadeler" ASLA değiştirilmez. Aynen korunur.

────────────────────────────────────────────────────────────────
4. ANALİZ VE OKUNABİLİRLİK:
────────────────────────────────────────────────────────────────
- Türkçe dil yapısına uygun (Ateşman benzeri) bir okunabilirlik skoru (0-100) hesapla.
- Rakiplerin bu haberi nasıl verdiğini analiz et ve strateji sun.

────────────────────────────────────────────────────────────────
5. DİL VE ÜSLUP DİSİPLİNİ (KESİN KURAL):
────────────────────────────────────────────────────────────────
- METİNDE ASLA EKSTRA YORUM YAPMA. Editoryal kanaat bildiren ifadelerden kaçın.
- SÜSLÜ, AĞDALI VE GEREKSİZ SIFATLARLA DOLU CÜMLELER KURMA.
- Yalınlık en temel prensibindir. Cümleler doğrudan bilgi vermeli, edebi bir kaygı taşımamalıdır.
- Nesnellik zorunludur. Metin sadece olgusal verilere ve tırnak içindeki beyanlara dayanmalıdır.
`;
