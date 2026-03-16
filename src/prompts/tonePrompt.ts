
import { NewsTone } from '../../types';

export const getTonePrompt = (tone: NewsTone): string => {
  const tones: Record<NewsTone, string> = {
    'SEO Uyumlu Özgün Haber': `
TON: NESNEL, CİDDİ, SEO ODAKLI, YORUMSUZ.
- Bilgilendirici ve otoriter dil kullan.
- SÜSLÜ CÜMLE YASAĞI: Edebi sanatlar, süslü sıfatlar ve duygusal betimlemelerden tamamen kaçın. Cümleler doğrudan bilgi vermeye odaklı olmalıdır.
- BAŞLIK: Büyük haber portalları ve gazetelerin (Hürriyet, Yenişafak, Medyascope, Dünya vb.) standartlarında; anahtar kelime başta, profesyonel, ilgi çekici ve bilgilendirici. Haberdeki en vurucu beyanı tırnak içinde (" ") başlığa taşı. Ajans dilinden uzak, daha editoryal ve akıcı bir üslup kullan.
  - Örnek: "Bakan Şimşek'ten enflasyon mesajı: 'Hedefimiz tek hane'", "Küresel piyasalarda 'resesyon' endişesi: Dev bankadan korkutan tahmin"
- SPOT: Haberin özü.
- NESNELLİK (KRİTİK): Kaynak metinde açıkça belirtilmediği sürece asla yorum, analiz veya "değerlendiriliyor", "görülüyor", "bekleniyor" gibi yoruma açık ifadeler ekleme. 
- ÖRNEK YASAKLI YAPI: "Bu durum, diplomatik bir ayrışma olarak değerlendiriliyor" gibi çıkarımlar haberde yoksa kesinlikle kullanılmamalıdır.
- ARA BAŞLIKLAR: Bilgilendirici, nesnel ve anahtar kelime odaklı. Bölümün içeriğini net bir şekilde yansıtan ifadeler seç. Önemli beyanları tırnak içinde (" ") ara başlıklara taşıyarak vurgula.
- CÜMLE YAPISI: Metin genelinde cümle yapılarını çeşitlendir; sadece "özne + yüklem" şeklinde değil, devrik veya bağlaçlı cümlelerle akıcılığı sağla.
`,
    'Ulusal Medya Tipi Tık Odaklı': `
TON: YÜKSEK ETKİLEŞİMLİ, MERAK UYANDIRAN, SEO VE SORU ODAKLI.
- BAŞLIK: Tıklama odaklı (CTR), anahtar kelime başta, çift başlıklı (|| kullanarak), soru cümleleri içeren ve kapsamlı.
  - Örnek: "Adana sahur vakti ve iftar saati ve imsakiye 2026 || Bugün Adana'da sahur ne zaman, iftar saat kaçta? Adana imsak ve iftar vakti saatleri 2026 Diyanet İmsakiyesi"
- SPOT: Merak uyandırıcı, bilgiyi kısmen veren ama detay için içeri çeken kurgu. Mutlaka bir soru ile bitirilebilir.
- ARA BAŞLIKLAR: Tıklama oranını (CTR) artıracak, merak uyandıran, genellikle soru kalıbında (Örn: "X SAAT KAÇTA?", "X BELLİ OLDU MU?") veya heyecan verici anahtar kelime öbekleri.
- HABER METNİ (BODY):
  - SEO SORULARI: Metin içerisinde okuyucunun arama motorlarında sorduğu soruları (Örn: "Peki, LGS'ye kaç gün kaldı, başvuru tarihleri belli oldu mu?") doğal bir akışla kullan.
  - ANAHTAR KELİME TEKRARI: Anahtar kelimeleri (şehir ismi, sınav adı, yıl vb.) metin boyunca farklı varyasyonlarla sıkça geçir.
  - KURGU: Bilgiyi hemen verme, "merak boşluğu" yarat. "Peki, ...?", "İşte detaylar!", "Belli oldu mu?" gibi tetikleyicileri paragraf girişlerinde veya sonlarında kullan.
- CÜMLE YAPISI: Tekdüze cümlelerden kaçın. Soru cümleleri, ünlemler ve kısa-vurucu ifadelerle metni hareketlendir. Kaynak metindeki anlatım sırasını tamamen değiştir.
  - ÖRNEK AKIŞ: "X vakti belli oldu. Mübarek ayda milyonlarca kişi oruç tutuyor. Peki, X saat kaçta, ezana ne kadar kaldı? İşte Diyanet tarafından yayımlanan takvim haberimizde..."
`
  };

  return `\nSEÇİLEN TON: ${tone}\nTON TALİMATLARI: ${tones[tone]}`;
};
