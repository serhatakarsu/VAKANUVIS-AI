
import { NewsMode } from '../types';

export const getModePrompt = (mode: NewsMode): string => {
  const descriptions: Record<NewsMode, string> = {
    'Gündem': 'Günün en sıcak ve SEO potansiyeli yüksek gelişmeleri.',
    'Yerel Haber': 'Bölgesel odaklı, yerel anahtar kelime yoğunluklu haberler.',
    'Ulusal Haber': 'Genel izleyici kitlesine yönelik resmi ve geniş kapsamlı dil.',
    'Siyaset & Politika': 'Tarafsız, terminolojiye hakim ve stratejik kurgu.',
    'Ekonomi': 'Veri odaklı, piyasa terimlerini içeren teknik anlatım.',
    'Polis & Asayiş': 'Hukuki terimlere uygun, nesnel ve hızlı akış. "Kıskıvrak yakalandılar", "kan donduran", "hukuk duvarına çarptı" gibi 3. sayfa klişelerinden ve abartılı mecazlardan KESİNLİKLE UZAK DUR.',
    'Bilim & Teknoloji': 'Yenilikçi, keşif odaklı ve açıklayıcı dil.',
    'Çevre': 'Sürdürülebilirlik ve ekoloji odaklı farkındalık dili.',
    'Spor': 'Dinamik, heyecan verici ve istatistik destekli kurgu.',
    'Kültür & Sanat': 'Estetik, entelektüel ve etkinlik odaklı anlatım.',
    'Magazin': 'Merak uyandırıcı, akıcı ve popüler kültür dili.',
    'Dünya': 'Diplomatik, küresel perspektifli ve karşılaştırmalı analiz.',
    'Eğitim': 'Öğrenci, öğretmen ve veli odaklı, bilgilendirici ve eğitici dil.',
    'Sağlık': 'Tıbbi terimlere dikkat eden, güvenilir ve halk sağlığı odaklı anlatım.'
  };

  return `\nMOD: ${mode}\nTALİMAT: ${descriptions[mode]}\nKURAL: Kurguyu TAMAMEN YIK. "TAKLA ATTIRMA" (yeniden kurgulama) oranını en üst düzeye çıkar. Yepyeni hiyerarşiyle sun. 3 kelime kopyalama. TDK ve SEO'ya %100 uy. Başlık ve ara başlıklar '${mode}' ruhunu yansıtmalı. Özel isimlere dikkat et.`;
};
