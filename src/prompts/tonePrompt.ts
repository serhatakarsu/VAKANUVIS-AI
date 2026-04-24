
import { NewsTone } from '../types';

export const getTonePrompt = (tone: NewsTone): string => {
  const tones: Record<NewsTone, string> = {
    'SEO Uyumlu Özgün Haber': `
TON: KURUMSAL / RESMİ HABER DİLİ, NESNEL, OTORİTER VE ÖZGÜN.
- Dil: Devlet kurumları, büyük şirketler ve ciddi haber ajanslarının (AA, İHA vb.) kullandığı resmi ve oturaklı üslubu benimse.
- Takla Attırma: Kaynak metni bir basın bülteni veya resmi duyuru disipliniyle, profesyonel bir haber metnine dönüştür. %100 özgünlük sağla.
- Yasaklar: Duygusal yorumlar, gereksiz sıfatlar ("muhteşem", "harika"), heyecan uyandırma çabaları ve klişe mecazlar kesinlikle yasaktır. 
- Başlık: Bilgilendirici, ciddi ve konuyu doğrudan özetleyen yapı. Sadece ilk harf ve özel isimler büyük. Abartıdan tamamen uzak.
- Spot: Haberin en önemli 5N1K unsurlarını içeren, ciddi bir giriş metni.
- Ara Başlıklar (TAMAMI BÜYÜK): Konuyu bölümlere ayıran, net ve kısa ifadeler. Sonunda nokta olmayacak.
- Akış: Bilgiyi önem sırasına göre (ters piramit) sun.
`,
    'Ulusal Medya Tipi Tık Odaklı': `
TON: ULUSAL MEDYA DİJİTAL YAYINCILIK, SEO ODAKLI, MERAK ODAKLI VE YÜKSEK ETKİLEŞİMLİ.
- Üslup: Hürriyet, Milliyet, Sabah gibi büyük devlerin dijital habercilik dilini kullan. "Milyonlara müjde", "Flaş flaş" gibi ucuz ve eskimiş tıklama tuzaklarından KESİNLİKLE kaçın.
- Başlık (ULUSAL SEO STİLİ): Okuyucunun Google'da arattığı soruları ve merak konularını doğrudan hedefleyen, profesyonel ama merak uyandıran başlıklar kurgula.
  - Soru ve Detay Yapısı: "1 Mayıs tatil mi, hangi güne denk geliyor, tatili kaç gün sürecek? 2026 Resmi Takvim detayları açıklandı!"
  - Ne Zaman ve Nasıl Yapısı: "TOKİ İstanbul kura çekilişi saat kaçta, ne zaman ve nasıl izlenir? İşte adım adım sorgulama rehberi"
  - Liste ve Güncel Akış: "TV Yayın Akışı Listesi 24 Nisan 2026: Bugün televizyonda hangi diziler, filmler, yarışmalar var?"
  - Şehir ve Uyarı Odaklı: "Ankara'da okullar tatil mi? 24 Nisan Cuma Valilik son dakika açıklaması geldi mi?"
- Spot: Haberin en can alıcı bilgisini verip "ayrıntılar aşağıda" mesajını profesyonelce hissettiren, okuyucuyu sayfada tutan merak uyandırıcı özet. SEO içerikli soruları ("Peki, ...?") spot içinde de kullanabilirsin.
- Ara Başlıklar (SEO SORU-CEVAP): Kullanıcıların arama motorlarında sorduğu soruları ara başlık yap. "X NE ZAMAN?", "KİMLERİ KAPSIYOR?", "BAŞVURU NASIL YAPILIR?" gibi. TAMAMI BÜYÜK, sonunda nokta yok.
- Takla Attırma (MAKSİMUM): Kaynak metindeki cümle yapılarını tamamen boz. Bilgiyi kaynak metindeki sırayla verme. Önce en son gelişmeyi ver, sonra detaylara in. Kaynak metinden 3 kelime yan yana gelmemeli.
- Metin Kurgusu: 
  - Anahtar kelimeleri (şehir, konu, isim) metnin içine profesyonelce serpiştir.
  - "Hizmet odaklı" ol: Okuyucu bu habere "bilgi almak" için geldi. Ona aradığı bilgiyi (tarih, saat, yer, fiyat) ara başlıklar altında netçe sun.
  - "Merak boşluğu" yarat: Önce soruyu sor, sonraki paragrafta cevabı ver.
`,
  };

  return `\nTON: ${tone}\nTALİMATLAR: ${tones[tone]}\nKURAL: Kaynak metnin yapısını TAMAMEN YIK. "TAKLA ATTIRMA" oranını en üst düzeye çıkar. Baştan kurgula, 3 kelime kopyalama. Nesnel, profesyonel ve yorumsuz dil kullan. Cümlelere aşırı yorumsal veya sıkıntılı kelimeler ekleme. Yapılan yorumlar/çıkarımlar kesinlikle haber formatında olmalıdır. SIFIR HAFIZA: Önceki haberlerle hiçbir bağ kurma, her isteği sıfırdan ele al. YARGISIZ İNFAZ YASAĞI: Kaynakta olmayan "işgal suçu", "skandal" gibi yargı bildiren ifadeleri KESİNLİKLE kullanma. Başlıklar ton ve kategoriyle %100 uyumlu olmalı. BAŞLIKLARDA SENTENCE CASE (Sadece ilk harf ve özel isimler büyük) KURALINA %100 UY. ARA BAŞLIKLAR TAMAMI BÜYÜK, TEK CÜMLE OLMALI VE TDK NOKTALAMA KURALLARI (?, ", :, !, - vb.) KESİNLİKLE UYGULANMALIDIR. ARA BAŞLIK SONUNDA NOKTA (.) KESİNLİKLE OLMAYACAK. ALINTI VARSA MUTLAKA TIRNAK KULLANILMALIDIR. PARAGRAFLAR VE ARA BAŞLIKLAR ARASINDA ÇİFT SATIR BOŞLUĞU (\\n\\n) BIRAKILMALIDIR. Özel isimlere dikkat et.

YAZIM PRENSİPLERİ (KRİTİK):
- KAÇINILMASI GEREKENLER: "Yürütülen titiz çalışmalarda", "Yapılan kapsamlı incelemelerde", "Gerçekleştirilen detaylı araştırmalar sonucunda", "Yapılan çalışmalar neticesinde/çerçevesinde", "Yürütülen faaliyetler kapsamında", "Büyük panik yaşandı", "Adeta can pazarı yaşandı", "Yürekleri ağza getirdi", "Vatandaşlar isyan etti", "Ortalık savaş alanına döndü" gibi hantal bürokratik kalıpları ve melodramatik klişeleri KULLANMA.
- PRENSİPLER: Kısa ve net yaz, özne kullan (kim yaptı belli olsun), somut bilgi ver, tarafsız kal, tekrarı azalt.`;
};
