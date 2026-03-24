
import { NewsMode } from '../../types';

export const getModePrompt = (mode: NewsMode): string => {
  const descriptions: Record<NewsMode, string> = {
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

  return `\nSEÇİLEN HABER MODU: ${mode}\nMOD TALİMATI: ${descriptions[mode]}\nEVRENSEL ANAYASA KURALI: Bu kategorideki haberi yazarken kaynak metindeki cümle yapılarını TAMAMEN TERK ET. Bilgiyi yeni bir hiyerarşi ve özgün bir anlatım diliyle sun. "Takla attırma" kuralı bu mod için de zorunludur. Tüm yazım sürecinde TDK kurallarına ve Haber SEO standartlarına %100 uyum sağla.`;
};
