
import { NewsTone } from '../types';

export const getTonePrompt = (tone: NewsTone): string => {
  const tones: Record<NewsTone, string> = {
    'SEO Uyumlu Özgün Haber': `
TON: ULUSAL MEDYA SEO STANDARTI, NESNEL, CİDDİ, %100 ÖZGÜN.
- Bilgilendirici, otoriter ve ulusal medyadaki SEO haberleri gibi güçlü bir dil kullan.
- TAKLA ATTIRMA (KRİTİK): Kaynak metni tamamen yık ve SEO kurallarına uygun şekilde, ulusal medya kalitesinde yeniden inşa et.
- SÜSLÜ CÜMLE VE KLİŞE YASAĞI: Edebi sanatlar, süslü sıfatlar, duygusal betimlemeler ve "bağın gücünü gösterdi", "dikkatleri üzerine çekti" gibi yorumsal klişelerden tamamen kaçın. Cümleler doğrudan bilgi vermeye odaklı olmalıdır.
- BAŞLIK-SPOT-GİRİŞ UYUMU (KRİTİK): Başlık, spot ve haberin ilk paragrafı (intro) arasında tam bir konu ve anahtar kelime bütünlüğü olmalıdır. Başlık haberi özetlemeli, spot bu özeti detaylandırmalı, giriş paragrafı ise haberi en vurucu haliyle başlatmalıdır. Bu üçlü yapı birbirini tamamlayan bir hiyerarşi içinde kurgulanmalıdır.
- BAŞLIK KALİTESİ VE STİLİ (KRİTİK): Başlıklar kesinlikle abartıdan uzak, doğrudan haberi veren, güçlü, ciddi, nesnel ve bilgilendirici olmalıdır. "Son dakika", "kritik açıklama", "şok gelişme" gibi tıklama tuzaklarından (clickbait) KESİNLİKLE uzak dur. Sadece cümlenin ilk harfi ve özel isimler büyük yazılmalıdır. Kişi veya kurum açıklamaları varsa tırnak içinde ver. Haberin özünü en net, yalın ve otoriter haliyle yansıt.
  - Örnek 1: "Atatürk’ün Mersin’e gelişinin 103’üncü yıl dönümü törenle kutlandı"
  - Örnek 2: "Yüreğir Belediyesi'nden ibadethanelerde bayram temizliği"
  - Örnek 3: "Prof. Dr. Çelik: 'Onkofertilite kanser tedavisi alan hastaya gelecekteki ebeveynlik şansını koruma imkanı sunar'"
  - Örnek 4: "Trendyol Süper Lig'de 27. haftanın hakemleri belli oldu"
  - Örnek 5: "İran'dan ABD'nin 'Destansı Öfke' söylemine İngilizce yanıt: 'Bu savaş destansı öfke değil destansı korku'"
  - Örnek 6: "Trendyol 1. Lig: Bodrum FK: 2 - Boluspor: 0"
  - Örnek 7: "Anamur’da Kadir Gecesinde Sakal-ı Şerif ziyarete açıldı"
- SPOT: Haberin en çarpıcı ve önemli bilgisini (5N1K) içeren, başlıkla metin arasında köprü kuran, okuyucuyu devamını okumaya ikna eden profesyonel ve nesnel özet.
- NESNELLİK (KRİTİK): Kaynak metinde açıkça belirtilmediği sürece asla yorum, analiz veya "değerlendiriliyor", "görülüyor", "bekleniyor" gibi yoruma açık ifadeler ekleme. "Bir kez daha gözler önüne serdi", "dikkatleri üzerine çekti", "büyük yankı uyandırdı" gibi klişe ve yoruma dayalı dolgu cümlelerini KESİNLİKLE kullanma.
- SONUÇ BÖLÜMÜ: Haberin sonuna kaynak metinde bulunmayan özetleyici yorumlar, "geleceğe dair beklentiler" veya "temenniler" ekleme. Haber, kaynak metindeki son bilgiyle net bir şekilde bitmelidir.
- ARA BAŞLIKLAR (TAMAMI BÜYÜK HARF): Büyük haber sitelerindeki gibi "mini-manşet" niteliğinde, güçlü, bilgilendirici, nesnel ve anahtar kelime odaklı. Bölümün içeriğini net bir şekilde yansıtan, paragraflarla tam uyumlu ifadeler seç. Her ara başlık, takip eden paragrafın en önemli bilgisini veya içindeki vurucu bir alıntıyı yansıtmalıdır. KESİNLİKLE TEK CÜMLE olmalı. TDK kurallarına uygun noktalama işaretleri (?, ", :, !, - vb.) KESİNLİKLE VE TAMAMEN KULLANILMALIDIR. Örnek: "ERDOĞAN: 'EKONOMİDE YENİ DÖNEM BAŞLIYOR!'" veya "FAİZ KARARI SONRASI PİYASALARDA SON DURUM NE?" gibi. Ancak sonunda KESİNLİKLE NOKTA (.) KULLANILMAMALIDIR. Bir konuşmaya veya alıntıya yer verilecekse mutlaka tırnak içinde (" ") belirtilmelidir. "GELİŞMELER" veya "DETAYLAR" gibi genel başlıklar KESİNLİKLE YASAKTIR.
- LİSTELEME VE DÜZEN: Maç sonuçları, puan durumları veya zamlı fiyat listeleri gibi verileri mutlaka ALT ALTA (liste formatında) sun. Polis ve asayiş olaylarını ise büyük sitelerdeki gibi akıcı paragraflar halinde YAN YANA (blok metin) kurgula.
- ALINTI KULLANIMI: Tırnak içindeki beyanları haberin akışına profesyonelce yedir. "Diyen...", "Vurgulayan...", "Şu ifadeleri kullandı:" gibi geçişlerle metni zenginleştir.
- CÜMLE YAPISI: Metin genelinde cümle yapılarını çeşitlendir; sadece "özne + yüklem" şeklinde değil, devrik veya bağlaçlı cümlelerle akıcılığı sağla.
`,
    'Ulusal Medya Tipi Tık Odaklı': `
TON: YÜKSEK ETKİLEŞİMLİ, SORGULAYICI, MERAK UYANDIRICI, SEO VE CLICKBAIT ODAKLI.
- ULUSAL MEDYA ÜSLUBU (KRİTİK): Tıpkı büyük ulusal gazetelerin (Hürriyet, Milliyet, Sabah vb.) dijital yayınları gibi sorgulayıcı, merak uyandırıcı ve okuyucuyu içeri çeken bir dil kullan.
- BAŞLIK (CLICKBAIT & SEO): Tıklama oranını artıracak (CTR), anahtar kelime odaklı, güçlü, merak uyandıran ve CLICKBAIT yapılar kullan. Sadece "||" kalıbına sıkışma; ünlem, soru, "İşte detaylar", "Müjde", "Flaş" gibi tetikleyicileri farklı kombinasyonlarla kullan. Ancak "Kıskıvrak yakalandılar", "şok gelişme", "kan donduran", "sarsıldı", "duvara çarptı" gibi 3. sayfa klişelerinden ve abartılı mecazlardan KESİNLİKLE UZAK DUR.
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
    - Güçlü Manşet: "Tarihi karar! X'te yeni dönem resmen başladı: Artık her şey değişecek"
- SPOT (CLICKBAIT & SEO): Ulusal medyadaki gibi merak uyandırıcı, bilgiyi en çarpıcı haliyle sunan ama detay için içeri çeken CLICKBAIT kurgu. 5N1K unsurlarını merak tetikleyicileriyle harmanla. Mutlaka bir soru ile bitirilebilir veya "İşte o detaylar..." gibi bir köprü kurulabilir.
- ARA BAŞLIKLAR (CLICKBAIT & SEO): Tıklama oranını (CTR) artıracak, güçlü, merak uyandıran, CLICKBAIT ve paragraflarla tam uyumlu "mini-manşet" tarzında kurgula. Her ara başlık, takip eden paragrafın en can alıcı noktasını, bir soruyu veya vurucu bir alıntıyı yansıtmalıdır. KESİNLİKLE TEK CÜMLE olmalı. TDK kurallarına uygun noktalama işaretleri (?, ", :, !, - vb.) KESİNLİKLE VE TAMAMEN KULLANILMALIDIR. Örnek: "O İSİM KONUŞTU: 'HER ŞEYİ ANLATACAĞIM!'" veya "YENİ ZAM ORANI BELLİ OLDU MU?" gibi. Ancak sonunda KESİNLİKLE NOKTA (.) KULLANILMAMALIDIR. Bir konuşmaya veya alıntıya yer verilecekse mutlaka tırnak içinde (" ") belirtilmelidir. Okuyucunun arama motorunda sorduğu soruları da tırnak içi ifadelerle (eğer alıntıysa) harmanlayarak kullan.
- LİSTELEME VE DÜZEN: Maç listeleri, kadrolar veya fiyat listeleri gibi verileri mutlaka ALT ALTA (liste formatında) sırala. Polis ve asayiş haberlerini ise büyük haber sitelerindeki gibi akıcı paragraflar halinde YAN YANA (blok metin) düzeninde yaz.
- ALINTI KULLANIMI: Önemli cümleleri tırnak içinde kullanarak habere derinlik ve güvenilirlik kat.
- HABER METNİ (BODY):
  - SEO SORULARI: Metin içerisinde okuyucunun arama motorlarında sorduğu soruları (Örn: "Peki, LGS'ye kaç gün kaldı, başvuru tarihleri belli oldu mu?") doğal bir akışla kullan.
  - ANAHTAR KELİME TEKRARI: Anahtar kelimeleri (şehir ismi, sınav adı, yıl vb.) metin boyunca farklı varyasyonlarla sıkça geçir.
  - KURGU: Bilgiyi hemen verme, "merak boşluğu" yarat. "Peki, ...?", "İşte detaylar!", "Belli oldu mu?" gibi tetikleyicileri paragraf girişlerinde veya sonlarında kullan.
- CÜMLE YAPISI: Tekdüze cümlelerden kaçın. Soru cümleleri, ünlemler ve kısa-vurucu ifadelerle metni hareketlendir. Kaynak metindeki anlatım sırasını tamamen değiştir.
`
  };

  return `\nTON: ${tone}\nTALİMATLAR: ${tones[tone]}\nKURAL: Kaynak metnin yapısını TAMAMEN YIK. "TAKLA ATTIRMA" oranını en üst düzeye çıkar. Baştan kurgula, 3 kelime kopyalama. Nesnel, profesyonel ve yorumsuz dil kullan. Cümlelere aşırı yorumsal veya sıkıntılı kelimeler ekleme. Yapılan yorumlar/çıkarımlar kesinlikle haber formatında olmalıdır. SIFIR HAFIZA: Önceki haberlerle hiçbir bağ kurma, her isteği sıfırdan ele al. YARGISIZ İNFAZ YASAĞI: Kaynakta olmayan "işgal suçu", "skandal" gibi yargı bildiren ifadeleri KESİNLİKLE kullanma. Başlıklar ton ve kategoriyle %100 uyumlu olmalı. BAŞLIKLARDA SENTENCE CASE (Sadece ilk harf ve özel isimler büyük) KURALINA %100 UY. ARA BAŞLIKLAR TAMAMI BÜYÜK, TEK CÜMLE OLMALI VE TDK NOKTALAMA KURALLARI (?, ", :, !, - vb.) KESİNLİKLE UYGULANMALIDIR. ARA BAŞLIK SONUNDA NOKTA (.) KESİNLİKLE OLMAYACAK. ALINTI VARSA MUTLAKA TIRNAK KULLANILMALIDIR. PARAGRAFLAR VE ARA BAŞLIKLAR ARASINDA ÇİFT SATIR BOŞLUĞU (\\n\\n) BIRAKILMALIDIR. Özel isimlere dikkat et.

YAZIM PRENSİPLERİ (KRİTİK):
- KAÇINILMASI GEREKENLER: "Yürütülen titiz çalışmalarda", "Yapılan kapsamlı incelemelerde", "Gerçekleştirilen detaylı araştırmalar sonucunda", "Yapılan çalışmalar neticesinde/çerçevesinde", "Yürütülen faaliyetler kapsamında", "Büyük panik yaşandı", "Adeta can pazarı yaşandı", "Yürekleri ağza getirdi", "Vatandaşlar isyan etti", "Ortalık savaş alanına döndü" gibi hantal bürokratik kalıpları ve melodramatik klişeleri KULLANMA.
- PRENSİPLER: Kısa ve net yaz, özne kullan (kim yaptı belli olsun), somut bilgi ver, tarafsız kal, tekrarı azalt.`;
};
