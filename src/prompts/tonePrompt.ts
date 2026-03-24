
import { NewsTone } from '../../types';

export const getTonePrompt = (tone: NewsTone): string => {
  const tones: Record<NewsTone, string> = {
    'SEO Uyumlu Özgün Haber': `
TON: NESNEL, CİDDİ, SEO ODAKLI, YORUMSUZ.
- Bilgilendirici ve otoriter dil kullan.
- SÜSLÜ CÜMLE YASAĞI: Edebi sanatlar, süslü sıfatlar ve duygusal betimlemelerden tamamen kaçın. Cümleler doğrudan bilgi vermeye odaklı olmalıdır.
- BAŞLIK-SPOT-GİRİŞ UYUMU (KRİTİK): Başlık, spot ve haberin ilk paragrafı (intro) arasında tam bir konu ve anahtar kelime bütünlüğü olmalıdır. Başlık haberi özetlemeli, spot bu özeti detaylandırmalı, giriş paragrafı ise haberi en vurucu haliyle başlatmalıdır. Bu üçlü yapı birbirini tamamlayan bir hiyerarşi içinde kurgulanmalıdır.
- BAŞLIK KALİTESİ VE STİLİ (KRİTİK): Başlıklar kesinlikle abartıdan uzak, doğrudan haberi veren, ciddi, nesnel ve bilgilendirici olmalıdır. "Son dakika", "kritik açıklama", "şok gelişme" gibi tıklama tuzaklarından (clickbait) KESİNLİKLE uzak dur. Sadece cümlenin ilk harfi ve özel isimler büyük yazılmalıdır. Kişi veya kurum açıklamaları varsa tırnak içinde ver. Haberin özünü en net ve yalın haliyle yansıt.
  - Örnek 1: "Atatürk’ün Mersin’e gelişinin 103’üncü yıl dönümü törenle kutlandı"
  - Örnek 2: "Yüreğir Belediyesi'nden ibadethanelerde bayram temizliği"
  - Örnek 3: "Prof. Dr. Çelik: 'Onkofertilite kanser tedavisi alan hastaya gelecekteki ebeveynlik şansını koruma imkanı sunar'"
  - Örnek 4: "Trendyol Süper Lig'de 27. haftanın hakemleri belli oldu"
  - Örnek 5: "İran'dan ABD'nin 'Destansı Öfke' söylemine İngilizce yanıt: 'Bu savaş destansı öfke değil destansı korku'"
  - Örnek 6: "Trendyol 1. Lig: Bodrum FK: 2 - Boluspor: 0"
  - Örnek 7: "Anamur’da Kadir Gecesinde Sakal-ı Şerif ziyarete açıldı"
- SPOT: Haberin en can alıcı 5N1K bilgisini içeren, anahtar kelime zengini ve okuyucuyu habere hazırlayan profesyonel özet.
- NESNELLİK (KRİTİK): Kaynak metinde açıkça belirtilmediği sürece asla yorum, analiz veya "değerlendiriliyor", "görülüyor", "bekleniyor" gibi yoruma açık ifadeler ekleme. "Bir kez daha gözler önüne serdi", "dikkatleri üzerine çekti", "büyük yankı uyandırdı" gibi klişe ve yoruma dayalı dolgu cümlelerini KESİNLİKLE kullanma.
- SONUÇ BÖLÜMÜ: Haberin sonuna kaynak metinde bulunmayan özetleyici yorumlar, "geleceğe dair beklentiler" veya "temenniler" ekleme. Haber, kaynak metindeki son bilgiyle net bir şekilde bitmelidir.
- ARA BAŞLIKLAR (TAMAMI BÜYÜK HARF): Bilgilendirici, nesnel ve anahtar kelime odaklı. Bölümün içeriğini net bir şekilde yansıtan ifadeler seç. Önemli beyanları tırnak içinde (" ") ara başlıklara taşıyarak vurgula. "GELİŞMELER" veya "DETAYLAR" gibi genel başlıklar yerine "YENİ DÜZENLEMENİN KAPSAMI", "BAKANLIKTAN YAPILAN RESMİ AÇIKLAMA" gibi spesifik başlıklar kullan.
- CÜMLE YAPISI: Metin genelinde cümle yapılarını çeşitlendir; sadece "özne + yüklem" şeklinde değil, devrik veya bağlaçlı cümlelerle akıcılığı sağla.
`,
    'Ulusal Medya Tipi Tık Odaklı': `
TON: YÜKSEK ETKİLEŞİMLİ, MERAK UYANDIRAN, SEO VE SORU ODAKLI.
- BAŞLIK (CTR ODAKLI): Tıklama oranını artıracak (CTR), anahtar kelime odaklı, merak uyandıran ve çok katmanlı yapılar kullan. Sadece "||" kalıbına sıkışma; ünlem, soru, "İşte detaylar", "Müjde", "Flaş" gibi tetikleyicileri farklı kombinasyonlarla kullan.
  - KALIP ÇEŞİTLİLİĞİ (KRİTİK): Her haberde farklı bir yapı seç. Örnekler:
    - Soru & Yanıt: "X ne zaman? İşte 2026 X tarihleri ve merak edilenler"
    - Müjde/Haber: "Milyonlara müjde! X için beklenen tarih açıklandı: İşte detaylar"
    - Liste/Rehber: "X nasıl yapılır? Adım adım X rehberi ve püf noktaları"
    - Flaş Gelişme: "Son dakika: X'te flaş gelişme! Herkes bunu konuşuyor: İşte o açıklama"
    - Çift Başlık (Geleneksel): "Adana namaz vakitleri 2026 || Bugün Adana'da ezan saat kaçta okunuyor, namaz vakitleri belli mi?"
    - Dikkat Çekici: "Sakın yapmayın! X bekleyenler için kritik uyarı geldi"
    - Zaman Odaklı: "Geri sayım başladı! X için son saatler: Kimleri kapsıyor?"
    - Rakam Odaklı: "Tam X TL oldu! Yeni liste yayınlandı: İşte kalem kalem fiyatlar"
    - Lokasyon Odaklı: "Adana'da yaşayanlar dikkat! Valilikten son dakika uyarısı geldi"
- SPOT: Merak uyandırıcı, bilgiyi kısmen veren ama detay için içeri çeken kurgu. Mutlaka bir soru ile bitirilebilir veya "İşte o detaylar..." gibi bir köprü kurulabilir.
- ARA BAŞLIKLAR (TAMAMI BÜYÜK HARF): Tıklama oranını (CTR) artıracak, merak uyandıran, genellikle soru kalıbında (Örn: "X SAAT KAÇTA?", "X BELLİ OLDU MU?") veya heyecan verici anahtar kelime öbekleri. Okuyucunun arama motorunda sorduğu soruları ara başlığa taşı.
- HABER METNİ (BODY):
  - SEO SORULARI: Metin içerisinde okuyucunun arama motorlarında sorduğu soruları (Örn: "Peki, LGS'ye kaç gün kaldı, başvuru tarihleri belli oldu mu?") doğal bir akışla kullan.
  - ANAHTAR KELİME TEKRARI: Anahtar kelimeleri (şehir ismi, sınav adı, yıl vb.) metin boyunca farklı varyasyonlarla sıkça geçir.
  - KURGU: Bilgiyi hemen verme, "merak boşluğu" yarat. "Peki, ...?", "İşte detaylar!", "Belli oldu mu?" gibi tetikleyicileri paragraf girişlerinde veya sonlarında kullan.
- CÜMLE YAPISI: Tekdüze cümlelerden kaçın. Soru cümleleri, ünlemler ve kısa-vurucu ifadelerle metni hareketlendir. Kaynak metindeki anlatım sırasını tamamen değiştir.
`,
    'Daha Resmi ve Ciddi': `
TON: RESMİ HABER DİLİ, CİDDİ, OTORİTER, PROTOKOL KURALLARINA UYGUN.
- Bu mod, kurumsal duyuruları ve resmi açıklamaları "profesyonel bir haber ajansı" (AA stili) üslubuyla kurgular.
- Metin bir "resmi yazışma" değil, bir "haber metni" olmalıdır. Akıcılık ve haber kurgusu ön plandadır.
- BAŞLIK (OTORİTER): Ciddi, net ve otoriter. Kurumun veya yetkilinin adını ve ana mesajı içermeli. "Duyuru" kelimesinden kaçın, doğrudan haberi ver.
  - Örnek: "Bakan Şimşek'ten vergi reformu açıklaması: 'Adaletli dağılım önceliğimiz'", "İçişleri Bakanlığı'ndan 81 ile genelge: Güvenlik önlemleri artırılıyor"
- SPOT: Haberin en önemli bilgisini (5N1K) resmi ve ağırbaşlı bir dille özetleyen, okuyucuyu detaylara yönlendiren profesyonel giriş.
- HABER METNİ (BODY):
  - GAZETECİLİK ÜSLUBU: Resmi beyanları ve verileri haber akışı içinde eriterek sun. "Belirtildi", "vurgulandı", "ifade edildi", "kaydedildi" gibi profesyonel haber fiillerini kullan.
  - TAKLA ATTIRMA: Kaynak metindeki cümle yapılarını tamamen değiştir, bilgiyi haber hiyerarşisine göre yeniden kurgula.
  - PROTOKOL: Makam, mevki ve kurum isimlerini protokol kurallarına uygun şekilde tam ve doğru kullan.
  - NESNELLİK: Tamamen tarafsız ve olgu odaklı kal. Duygusal yorumlardan kaçın.
- ARA BAŞLIKLAR (TAMAMI BÜYÜK HARF): Konuyla doğrudan alakalı, bölümün içeriğini özetleyen ve anahtar kelime içeren profesyonel başlıklar. "DETAYLAR" gibi genel ifadeler yerine "STRATEJİK ADIMLAR", "YENİ DÜZENLEMENİN KAPSAMI", "RESMİ MAKAMLARIN DEĞERLENDİRMESİ" gibi içerik odaklı başlıklar seç.
`
  };

  return `\nSEÇİLEN TON: ${tone}\nTON TALİMATLARI: ${tones[tone]}\nEVRENSEL ANAYASA KURALI: Seçilen ton ne olursa olsun, kaynak metindeki cümle yapılarını TAMAMEN TERK ET. Haberi baştan kurgula ve "takla attırma" kuralını uygula. Haber sitesi entegrasyonu için nesnel, profesyonel ve yorumsuz bir dil kullan.`;
};
