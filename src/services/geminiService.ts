
import { GoogleGenAI, Type, Chat, ThinkingLevel } from "@google/genai";
import { GeneratedNews, NewsMode, HeadlineRefinement, SpotRefinement, NewsTone, AdvancedFeatures } from "../types";
import { buildPrompt } from "../prompts/promptBuilder";

// Initialize the Gemini client inside functions to pick up latest API key
const getAiClient = (forceFree = false) => {
  // In AI Studio Build, GEMINI_API_KEY is the standard for the user's project
  // We check for both but prefer GEMINI_API_KEY as primary.
  const apiKey = (process.env.GEMINI_API_KEY || process.env.API_KEY || '');
  return new GoogleGenAI({ apiKey });
};

/**
 * Helper to perform exponential backoff retries for 503/UNAVAILABLE errors.
 */
const withRetry = async <T>(fn: (forceFree?: boolean) => Promise<T>, maxRetries = 2): Promise<T> => {
  let delay = 500;
  let forceFree = false;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn(forceFree);
    } catch (error: any) {
      const errorMessage = error?.message || String(error);
      const isRetryable = 
        errorMessage.includes('503') || 
        errorMessage.includes('UNAVAILABLE') || 
        errorMessage.includes('500') ||
        errorMessage.includes('Internal Server Error') ||
        error?.status === 503 || 
        error?.code === 503 ||
        error?.status === 500 ||
        error?.code === 500;

      const isSpendingCap = errorMessage.includes('spending cap') || errorMessage.includes('RESOURCE_EXHAUSTED');

      if (isSpendingCap && !forceFree && process.env.GEMINI_API_KEY) {
        console.warn("Spending cap exceeded on primary key. Attempting fallback to platform free key...");
        forceFree = true;
        i--; // Don't count this as a retry attempt
        continue;
      }

      if (isRetryable && i < maxRetries - 1) {
        console.warn(`Gemini API error detected. Retrying in ${delay}ms... (Attempt ${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 1.5; // Faster exponential backoff
        continue;
      }
      throw error;
    }
  }
  throw new Error("Maksimum deneme sayısına ulaşıldı. Sunucu şu an çok meşgul.");
};

const extractJson = (text: string) => {
  try {
    // Try direct parse first
    return JSON.parse(text);
  } catch (e) {
    // Try to find JSON block in markdown
    const match = text.match(/```json\n?([\s\S]*?)\n?```/);
    if (match && match[1]) {
      try {
        return JSON.parse(match[1].trim());
      } catch (e2) {
        // Fallback to finding first { and last }
        const start = text.indexOf('{');
        const end = text.lastIndexOf('}');
        if (start !== -1 && end !== -1) {
          try {
            return JSON.parse(text.substring(start, end + 1));
          } catch (e3) {
            throw new Error("Geçersiz JSON formatı.");
          }
        }
        throw new Error("JSON bloğu bulunamadı.");
      }
    }
    // Try finding first { and last } even without markdown
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end !== -1) {
      try {
        return JSON.parse(text.substring(start, end + 1));
      } catch (e3) {
        throw new Error("Geçersiz JSON formatı.");
      }
    }
    throw new Error("Yanıt JSON formatında değil.");
  }
};

export const generateNewsContent = async (rawText: string, mode: NewsMode, tone: NewsTone, features: AdvancedFeatures): Promise<GeneratedNews> => {
  const callApi = async (modelName: string, forceFree = false, disableSearch = false) => {
    const ai = getAiClient(forceFree);
    
    const properties: any = {
      headline: { 
        type: Type.STRING, 
        description: "Haber Başlığı. KRİTİK: Sadece ilk harf ve özel isimler büyük yazılmalı (Sentence case). Kategori ve tonla %100 uyumlu, SEO odaklı, çarpıcı. Ulusal Medya tonunda CLICKBAIT ve SEO olarak güçlendirilmiş olmalı." 
      },
      spot: { 
        type: Type.STRING, 
        description: "Haber Spotu (Lead). 1-2 cümlelik, haberi özetleyen, anahtar kelime zengini ve başlığı destekleyen vurucu metin. Ulusal Medya tonunda CLICKBAIT ve SEO olarak güçlendirilmiş olmalı." 
      },
      body: { 
        type: Type.STRING,
        description: "Haber Metni. KRİTİK: En az 2-4 adet ARA BAŞLIK içermeli. Ara başlıklar TAMAMI BÜYÜK HARF ve TEK CÜMLE olmalı. TDK noktalama kuralları TAMAMEN uygulanmalı ancak ara başlık sonunda KESİNLİKLE NOKTA (.) kullanılmamalıdır. Her ara başlıktan önce ve sonra ve her paragraf arasında mutlaka ÇİFT SATIR BOŞLUĞU (\\n\\n) bırakılmalıdır. Sadece doğrudan alıntı varsa tırnak içinde (\" \") yazılmalı, aksi halde tırnak kullanılmamalı. Ulusal Medya tonunda ara başlıklar CLICKBAIT ve SEO olarak güçlendirilmiş olmalı."
      },
      metaTitle: { type: Type.STRING, description: "SEO Meta Title (max 60 kar)." },
      metaDescription: { type: Type.STRING, description: "SEO Meta Desc (max 160 kar)." },
      slug: { type: Type.STRING, description: "SEO URL slug." },
      expandedKeywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Ek anahtar kelimeler." },
      keywordAnalysis: { 
        type: Type.ARRAY, 
        items: { 
          type: Type.OBJECT, 
          properties: {
            word: { type: Type.STRING },
            count: { type: Type.NUMBER },
            density: { type: Type.STRING }
          },
          required: ["word", "count", "density"]
        },
        description: "Kelime yoğunluğu analizi."
      }
    };
    const required = ["headline", "spot", "body", "metaTitle", "metaDescription", "slug", "expandedKeywords", "keywordAnalysis"];

    let extraInstructions = "";

    if (features.trendDiscovery) {
      properties.trendDiscovery = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            keywords: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["title", "description", "keywords"]
        }
      };
      required.push("trendDiscovery");
      extraInstructions += "\n- TREND HABER KEŞİF MOTORU AKTİF: Google Trends ve sosyal medya analizine dayalı 3 adet trend haber önerisi üret.";
    }

    if (features.performancePrediction) {
      properties.performancePrediction = {
        type: Type.OBJECT,
        properties: {
          ctr: { type: Type.STRING },
          discoverSuitability: { type: Type.STRING },
          trendPotential: { type: Type.STRING },
          readEstimate: { type: Type.STRING },
          targetAudience: { type: Type.STRING },
          whyRead: { type: Type.STRING }
        },
        required: ["ctr", "discoverSuitability", "trendPotential", "readEstimate", "targetAudience", "whyRead"]
      };
      required.push("performancePrediction");
      extraInstructions += "\n- HABER PERFORMANS TAHMİNİ AKTİF: CTR, Discover uyumu, trend potansiyeli, hedef kitle ve 'Neden Okunmalı?' analizi yap.";
    }

    if (features.internalLinks) {
      properties.internalLinks = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            slug: { type: Type.STRING },
            anchorText: { type: Type.STRING }
          },
          required: ["title", "slug", "anchorText"]
        }
      };
      required.push("internalLinks");
      extraInstructions += "\n- İÇ BAĞLANTI ÖNERİSİ AKTİF: Habere uygun 3 adet iç bağlantı (internal link) önerisi üret.";
    }

    if (features.videoScript) {
      properties.videoScript = {
        type: Type.OBJECT,
        properties: {
          intro: { type: Type.STRING },
          body: { type: Type.STRING },
          outro: { type: Type.STRING },
          visualCues: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["intro", "body", "outro", "visualCues"]
      };
      required.push("videoScript");
      extraInstructions += "\n- VIDEO / SHORTS SCRIPT AKTİF: Haber için 30-45 saniyelik kısa video metni ve görsel ipuçları hazırla.";
    }

    if (features.imageSuggestions) {
      properties.imageSuggestions = {
        type: Type.OBJECT,
        properties: {
          newsImage: { type: Type.STRING },
          socialImage: { type: Type.STRING },
          thumbnail: { type: Type.STRING },
          altText: { type: Type.STRING }
        },
        required: ["newsImage", "socialImage", "thumbnail", "altText"]
      };
      required.push("imageSuggestions");
      extraInstructions += "\n- HABER GÖRSELİ ÖNERİSİ AKTİF: Haber görseli, sosyal medya görseli, thumbnail fikirleri ve SEO uyumlu alt metinler üret.";
    }

    if (features.aiEditorAudit) {
      properties.aiEditorAudit = {
        type: Type.OBJECT,
        properties: {
          repeatedWords: { type: Type.ARRAY, items: { type: Type.STRING } },
          weakSentences: { type: Type.ARRAY, items: { type: Type.STRING } },
          agencyClichés: { type: Type.ARRAY, items: { type: Type.STRING } },
          longSentences: { type: Type.ARRAY, items: { type: Type.STRING } },
          toneCheck: { type: Type.STRING }
        },
        required: ["repeatedWords", "weakSentences", "agencyClichés", "longSentences", "toneCheck"]
      };
      required.push("aiEditorAudit");
      extraInstructions += "\n- AI EDİTÖR KONTROLÜ AKTİF: Metni tekrar eden kelimeler, zayıf cümleler, ajans kalıpları ve ton tutarlılığı açısından denetle.";
      
      // Also include comparison if editor audit is on
      properties.comparison = {
        type: Type.OBJECT,
        properties: {
          originalSnippet: { type: Type.STRING },
          correctedSnippet: { type: Type.STRING },
          editorNote: { type: Type.STRING }
        },
        required: ["originalSnippet", "correctedSnippet", "editorNote"]
      };
      required.push("comparison");
    }

    if (features.versionAnalysis) {
      properties.versionAnalysis = {
        type: Type.OBJECT,
        properties: {
          altIntro: { type: Type.STRING },
          altParagraph: { type: Type.STRING },
          altHeadline: { type: Type.STRING, description: "Alternatif haber başlığı. Özel isimlerin yazılışına dikkat edilmelidir." },
          bulletPoints: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["altIntro", "altParagraph", "altHeadline", "bulletPoints"]
      };
      required.push("versionAnalysis");
      extraInstructions += "\n- HABER SÜRÜM ANALİZİ AKTİF: Alternatif giriş, paragraf, başlık ve 'Özetle' maddeleri sun.";
    }

    if (features.archiveAnalysis) {
      properties.archiveAnalysis = {
        type: Type.OBJECT,
        properties: {
          similarNews: { type: Type.ARRAY, items: { type: Type.STRING } },
          pastContent: { type: Type.ARRAY, items: { type: Type.STRING } },
          futureTopics: { type: Type.ARRAY, items: { type: Type.STRING } },
          historicalContext: { type: Type.STRING }
        },
        required: ["similarNews", "pastContent", "futureTopics", "historicalContext"]
      };
      required.push("archiveAnalysis");
      extraInstructions += "\n- HABER ARŞİVİ ANALİZİ AKTİF: Benzer haberleri, geçmiş içerikleri ve tarihsel bağlamı analiz et.";
    }

    if (features.discoverOptimization) {
      properties.metaTitle = { type: Type.STRING };
      properties.metaDescription = { type: Type.STRING };
      properties.slug = { type: Type.STRING };
      properties.keywords = { type: Type.ARRAY, items: { type: Type.STRING } };
      properties.tags = { type: Type.ARRAY, items: { type: Type.STRING } };
      properties.additionalSeoTags = { type: Type.ARRAY, items: { type: Type.STRING } };
      properties.suggestedCategories = { type: Type.ARRAY, items: { type: Type.STRING } };
      properties.expandedKeywords = { type: Type.ARRAY, items: { type: Type.STRING } };
      properties.seoClickPanel = {
        type: Type.OBJECT,
        properties: {
          clickHeadline: { type: Type.STRING, description: "Tıklanma odaklı alternatif başlık. Özel isimlerin yazılışına dikkat edilmelidir." },
          clickSpot: { type: Type.STRING },
          seoSubheadingSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["clickHeadline", "clickSpot", "seoSubheadingSuggestions"]
      };
      properties.discoverOptimization = {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Discover için optimize edilmiş başlık. Özel isimlerin yazılışına dikkat edilmelidir." },
          spot: { type: Type.STRING },
          analysis: { type: Type.STRING },
          highResImageIdea: { type: Type.STRING }
        },
        required: ["title", "spot", "analysis", "highResImageIdea"]
      };
      required.push("metaTitle", "metaDescription", "slug", "keywords", "tags", "additionalSeoTags", "suggestedCategories", "expandedKeywords", "seoClickPanel", "discoverOptimization");
      extraInstructions += "\n- GOOGLE DISCOVER OPTİMİZASYONU AKTİF: Meta veriler, Discover başlıkları, SEO analizleri ve yüksek çözünürlüklü görsel fikirleri üret.";
    }

    if (features.editorialCalendar) {
      properties.editorialCalendar = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            reason: { type: Type.STRING },
            keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            publishTime: { type: Type.STRING }
          },
          required: ["title", "reason", "keywords", "publishTime"]
        }
      };
      required.push("editorialCalendar");
      extraInstructions += "\n- EDİTORYAL TAKVİM AKTİF: Bugün yazılabilecek 3 adet haber konusu ve ideal yayın saati önerisi üret.";
    }

    if (features.factCheck) {
      properties.factCheck = {
        type: Type.OBJECT,
        properties: {
          unverifiedClaims: { type: Type.ARRAY, items: { type: Type.STRING } },
          missingData: { type: Type.ARRAY, items: { type: Type.STRING } },
          potentialErrors: { type: Type.ARRAY, items: { type: Type.STRING } },
          sourceReliability: { type: Type.STRING }
        },
        required: ["unverifiedClaims", "missingData", "potentialErrors", "sourceReliability"]
      };
      required.push("factCheck");
      extraInstructions += "\n- FACT CHECK (DOĞRULAMA) AKTİF: Doğrulanmamış iddiaları, potansiyel hataları ve kaynak güvenilirliğini tespit et.";
    }

    if (features.distributionContent) {
      properties.socialPreview = {
        type: Type.OBJECT,
        properties: {
          twitter: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              hashtags: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["title", "description", "hashtags"]
          },
          facebook: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING }
            },
            required: ["title", "description"]
          }
        },
        required: ["twitter", "facebook"]
      };
      properties.distributionContent = {
        type: Type.OBJECT,
        properties: {
          xPost: { type: Type.STRING },
          facebookPost: { type: Type.STRING },
          pushNotification: { type: Type.STRING },
          shortVersion: { type: Type.STRING },
          linkedinPost: { type: Type.STRING },
          instagramCaption: { type: Type.STRING }
        },
        required: ["xPost", "facebookPost", "pushNotification", "shortVersion", "linkedinPost", "instagramCaption"]
      };
      required.push("socialPreview", "distributionContent");
      extraInstructions += "\n- OTOMATİK DAĞITIM İÇERİĞİ AKTİF: X, Facebook, LinkedIn, Instagram paylaşımları ve push bildirim metinleri üret.";
    }

    // Quality Audit is now always included but optimized for speed
    properties.qualityAudit = {
      type: Type.OBJECT,
      properties: {
        seoScore: { type: Type.INTEGER },
        seoExplanation: { type: Type.STRING },
        originalityScore: { type: Type.INTEGER },
        originalityExplanation: { type: Type.STRING },
        readabilityScore: { type: Type.INTEGER },
        readabilityExplanation: { type: Type.STRING },
        googleNewsSuitability: { type: Type.STRING },
        trendPotential: { type: Type.STRING },
        suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
        alternativeHeadlines: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Alternatif başlıklar. Özel isimlerin yazılışına dikkat edilmelidir." },
      },
      required: [
        "seoScore", "seoExplanation", "originalityScore", "originalityExplanation",
        "readabilityScore", "readabilityExplanation", "googleNewsSuitability", 
        "trendPotential", "suggestions", "alternativeHeadlines"
      ]
    };
    required.push("qualityAudit");

    // Only include extra analytical fields if specifically requested or in a high-analysis mode
    if (features.performancePrediction || features.discoverOptimization || features.aiEditorAudit) {
      Object.assign(properties.qualityAudit.properties, {
        trendAnalysis: { type: Type.STRING },
        critique: { type: Type.STRING },
        headlinePerformance: { type: Type.STRING },
        isWhyReadAnswered: { type: Type.BOOLEAN },
        keywordDensityCheck: { type: Type.STRING },
        readabilityAnalysis: { type: Type.STRING },
        jargonRemovalLog: { type: Type.ARRAY, items: { type: Type.STRING } },
        competitorAnalysis: { type: Type.STRING },
        strategySuggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
      });
    }

    if (features.dataToNews) {
      extraInstructions += "\n- VERİ -> HABER ÜRETİMİ AKTİF: Girdi metnindeki tablo, veri ve istatistikleri öncelikli olarak analiz et ve haberi bu veriler üzerine kur.";
    }

    const config: any = {
      systemInstruction: buildPrompt(mode, tone, extraInstructions),
      responseMimeType: "application/json",
      maxOutputTokens: 8192,
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      responseSchema: {
        type: Type.OBJECT,
        properties,
        required,
      },
    };

    if (!disableSearch) {
      config.tools = [{ googleSearch: {} }];
      // Enable server side tool invocations for tool hybrid mode (required for some Gemini 3 configs)
      config.includeServerSideToolInvocations = true;
    }

    const response = await ai.models.generateContent({
      model: modelName,
      contents: `Seçilen Haber Modu: ${mode}\nSeçilen Ton: ${tone}\n\nAKTİF GELİŞMİŞ ÖZELLİKLER:${extraInstructions || "\nYok (Sadece haber metni üret)"}\n\nHam Metin/Notlar:\n${rawText}`,
      config,
    });

    // Enhanced response checking
    const outputText = response.text;
    
    if (!outputText) {
      const candidate = response.candidates?.[0];
      const finishReason = candidate?.finishReason;
      
      if (finishReason === 'SAFETY') {
        throw new Error("İçerik güvenlik filtrelerine takıldı. Lütfen metni gözden geçirip tekrar deneyin.");
      }
      
      if (finishReason === 'RECITATION') {
        throw new Error("İçerik telif hakkı korumalı bir metne çok benziyor. Lütfen farklı bir şekilde ifade edin.");
      }

      throw new Error(`Model yanıt üretemedi (Sebep: ${finishReason || 'Bilinmiyor'}). Lütfen kısa bir süre sonra tekrar deneyin.`);
    }
    
    const result = extractJson(outputText) as GeneratedNews;
    
    // Post-process to remove Markdown as requested by user
    const stripMarkdown = (text: string) => {
      if (!text) return text;
      return text
        .replace(/\*\*/g, '') // Bold
        .replace(/\*/g, '')   // Italic
        .replace(/__/g, '')   // Underline/Bold
        .replace(/_/g, '')    // Italic
        .replace(/~~/g, '')   // Strikethrough
        .replace(/#/g, '')    // Headers
        .replace(/`/g, '');   // Code
    };

    if (result.headline) result.headline = stripMarkdown(result.headline);
    if (result.spot) result.spot = stripMarkdown(result.spot);
    if (result.body) result.body = stripMarkdown(result.body);
    
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (groundingChunks) {
      result.groundingChunks = groundingChunks;
    }
    return result;
  };

  const mainCall = async (forceFree = false, disableSearch = false) => {
    // We use gemini-flash-latest and gemini-pro-latest as stable aliases
    const flashModel = 'gemini-3-flash-preview';
    const proModel = 'gemini-3.1-pro-preview';

    try {
      // Primary attempt with Flash model
      return await withRetry((ff) => callApi(flashModel, ff || forceFree, disableSearch), 2);
    } catch (error: any) {
      const errorMessage = error?.message || String(error);
      
      // If we hit a tool-related 500 or search_grounding issue, retry once without search
      if (!disableSearch && (errorMessage.includes('search_grounding') || errorMessage.includes('500') || errorMessage.includes('Internal Server Error'))) {
        console.warn("Retrying without search grounding due to API error...");
        return await mainCall(forceFree, true);
      }

      // If flash fails with non-quota error, or we want to try a more capable model
      console.warn("Primary model failed, attempting Pro model fallback...", error);
      try {
        return await withRetry((ff) => callApi(proModel, ff || forceFree, disableSearch), 1);
      } catch (proError: any) {
        console.error("Critical failure in Pro model fallback:", proError);
        throw proError;
      }
    }
  };

  return await mainCall();
};

export const refineHeadline = async (currentHeadline: string, newsBody: string, tone: NewsTone): Promise<HeadlineRefinement> => {
  const callApi = async (modelName: string, forceFree = false) => {
    const ai = getAiClient(forceFree);
    const response = await ai.models.generateContent({
      model: modelName,
      contents: `Mevcut Başlık: ${currentHeadline}\n\nHaber İçeriği (Özet): ${newsBody.slice(0, 800)}`,
      config: {
        systemInstruction: `Sen profesyonel bir haber editörüsün. Görevin, mevcut başlığı ${tone} moduna uygun 5 farklı alternatif başlığa dönüştürmektir. 

Kurallar (${tone} Modu):
1. BAŞLIK MÜHENDİSLİĞİ: Başlık ulusal medyadaki gibi güçlü, çarpıcı, bilgilendirici ama sıkıcı değil; kapsayıcı ve otoriter olmalı.
2. FORMAT (KRİTİK): Başlıklarda yalnızca özel isimler ve cümlenin ilk kelimesi büyük harfle başlamalıdır. Diğer tüm kelimeler küçük harfle yazılmalıdır. (Sentence case + özel isimler).
3. ANAHTAR KELİME: Anahtar kelimeyi mutlaka başlığın başına yerleştir.
4. YORUM VE KELİME SEÇİMİ: Cümlelere aşırı yorumsal veya sıkıntılı kelimeler ekleme. Yapılan yorumlar/çıkarımlar kesinlikle haber formatında olmalıdır.
${tone === 'SEO Uyumlu Özgün Haber' ? `
5. NESNELLİK: Duygusal sıfatlardan, yorumlardan, "bağın gücünü gösterdi" gibi klişelerden ve "süslü" kelimelerden tamamen kaçın. Kaynak metinde olmayan yorumlayıcı çıkarımları ekleme.
6. GAZETE/PORTAL STİLİ: Başlıklar ulusal medyadaki SEO haberleri gibi güçlü, doğrudan haberi veren, ciddi, nesnel ve bilgilendirici olmalıdır. "Son dakika", "kritik açıklama" gibi tıklama tuzaklarından KESİNLİKLE uzak dur. Sadece cümlenin ilk harfi ve özel isimler büyük yazılmalıdır. Haberin özünü en net, yalın ve otoriter haliyle yansıt.
  - Örnek 1: "Atatürk’ün Mersin’e gelişinin 103’üncü yıl dönümü törenle kutlandı"
  - Örnek 2: "Yüreğir Belediyesi'nden ibadethanelerde bayram temizliği"
  - Örnek 3: "Prof. Dr. Çelik: 'Onkofertilite kanser tedavisi alan hastaya gelecekteki ebeveynlik şansını koruma imkanı sunar'"
  - Örnek 4: "Trendyol Süper Lig'de 27. haftanın hakemleri belli oldu"
  - Örnek 5: "İran'dan ABD'nin 'Destansı Öfke' söylemine İngilizce yanıt: 'Bu savaş destansı öfke değil destansı korku'"
7. DİL: Nesnel ama akıcı ve editoryal yapı.
` : `
5. ULUSAL MEDYA STİLİ: Tıklama odaklı (CLICKBAIT), merak uyandıran ve SEO anahtar kelimeleriyle CLICKBAIT olarak güçlendirilmiş başlıklar üret.
6. SORU ODAKLI: "Saat kaçta?", "Ne zaman?", "Belli oldu mu?" gibi okuyucunun arama motorlarında sorduğu soruları başlığa taşı.
7. GİZEM VE DİNAMİZM: Haberin sonucunu başlıkta verme, okuyucuyu tıklamaya zorla (CLICKBAIT).
`}`,
        ...(modelName === 'gemini-3.1-pro-preview' ? { thinkingConfig: { thinkingBudget: 2048 } } : {}),
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            alternatives: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING },
                  type: { type: Type.STRING },
                  score: { type: Type.INTEGER },
                  rationale: { type: Type.STRING }
                },
                required: ["text", "type", "score", "rationale"]
              }
            },
            analysis: { type: Type.STRING }
          },
          required: ["alternatives", "analysis"]
        }
      }
    });
    const outputText = response.text;
    if (!outputText) {
      const finishReason = response.candidates?.[0]?.finishReason;
      throw new Error(`Model başlık üretemedi (Sebep: ${finishReason || 'Bilinmiyor'}).`);
    }
    const result = extractJson(outputText) as HeadlineRefinement;
    if (result.alternatives) {
      result.alternatives = result.alternatives.map(alt => ({
        ...alt,
        text: alt.text.replace(/\*\*/g, '')
      }));
    }
    return result;
  };

  const mainCall = async (forceFree = false) => {
    try {
      return await withRetry((ff) => callApi('gemini-3-flash-preview', ff || forceFree));
    } catch (error: any) {
      return await withRetry((ff) => callApi('gemini-3.1-pro-preview', ff || forceFree), 2);
    }
  };

  return await mainCall();
};

export const refineSpot = async (currentSpot: string, newsBody: string, tone: NewsTone): Promise<SpotRefinement> => {
  const callApi = async (modelName: string, forceFree = false) => {
    const ai = getAiClient(forceFree);
    const isOfficial = tone === 'SEO Uyumlu Özgün Haber';
    const response = await ai.models.generateContent({
      model: modelName,
      contents: `Mevcut Spot: ${currentSpot}\n\nHaber İçeriği: ${newsBody.slice(0, 1000)}`,
      config: {
        systemInstruction: `Sen bir haber ajansı kurgu uzmanısın. Mevcut spot metnini (lead) analiz et ve ${tone} moduna uygun 3 farklı alternatif üret. 

Haberin spot kısmı (özet/lead); başlıkla metin arasında yer alan, habere dair en çarpıcı, önemli veya ilginç bilgiyi sunan özet cümlesidir. Okuyucunun ilgisini çekerek metnin devamını okumaya ikna etmeyi amaçlayan spotlar; kısa, net, tarafsız, merak uyandırıcı ve temel 5N1K unsurlarını içermelidir.

Kriterler (${tone} Modu):
1. VURUCU GİRİŞ: Haberi ulusal medya ciddiyetinde, en kapsayıcı ve otoriter şekilde özetle.
2. YORUM VE KELİME SEÇİMİ: Cümlelere aşırı yorumsal, duygusal veya "bağın gücünü gösterdi", "dikkatleri üzerine çekti" gibi klişe ifadeler ekleme. Yapılan yorumlar/çıkarımlar kesinlikle haber formatında olmalıdır.
${isOfficial ? `
3. 5N1K: Spot, en önemli bilgiyi (Kim, Ne, Nerede, Ne Zaman) içermelidir.
4. NESNELLİK: Duygusal yorumlardan ve klişelerden kaçın, sadece gerçekleşen eylemi yalın bir dille yaz.
5. TERS PİRAMİT: En can alıcı bilgiyi ilk cümlede ver.
` : `
3. ULUSAL MEDYA STİLİ: Ulusal medyadaki gibi merak uyandırıcı, bilgiyi en çarpıcı haliyle sunan ama detay için içeri çeken CLICKBAIT kurgu. 5N1K unsurlarını merak tetikleyicileriyle harmanla. SEO olarak güçlendir.
4. GİZEM: Haberin sonucunu veya can alıcı detayını söylemeyen, okuyucuyu içeri çekmeye zorlayan gizemli CLICKBAIT özet (Teaser).
5. DİNAMİZM: Discover odaklı, merak uyandırıcı CLICKBAIT kurgu. "Peki, o detaylar neler?", "İşte yaşananlar..." gibi merak tetikleyicileri kullan.
`}`,
        ...(modelName === 'gemini-3.1-pro-preview' ? { thinkingConfig: { thinkingBudget: 2048 } } : {}),
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            alternatives: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING },
                  type: { type: Type.STRING },
                  score: { type: Type.INTEGER },
                  rationale: { type: Type.STRING }
                },
                required: ["text", "type", "score", "rationale"]
              }
            },
            analysis: { type: Type.STRING }
          },
          required: ["alternatives", "analysis"]
        }
      }
    });
    const outputText = response.text;
    if (!outputText) {
      const finishReason = response.candidates?.[0]?.finishReason;
      throw new Error(`Model spot üretemedi (Sebep: ${finishReason || 'Bilinmiyor'}).`);
    }
    const result = extractJson(outputText) as SpotRefinement;
    if (result.alternatives) {
      result.alternatives = result.alternatives.map(alt => ({
        ...alt,
        text: alt.text.replace(/\*\*/g, '')
      }));
    }
    return result;
  };

  const mainCall = async (forceFree = false) => {
    try {
      return await withRetry((ff) => callApi('gemini-3-flash-preview', ff || forceFree));
    } catch (error: any) {
      return await withRetry((ff) => callApi('gemini-3.1-pro-preview', ff || forceFree), 2);
    }
  };

  return await mainCall();
};

export const refineSubheadings = async (newsBody: string, tone: NewsTone): Promise<string> => {
  const callApi = async (modelName: string, forceFree = false) => {
    const ai = getAiClient(forceFree);
    const response = await ai.models.generateContent({
      model: modelName,
      contents: `Mevcut Haber Metni:\n${newsBody}`,
      config: {
        systemInstruction: `Sen bir haber kurgu uzmanı ve SEO stratejistisin. Görevin, sana verilen haber metnindeki TÜM ARA BAŞLIKLARI (Subheadings) yeniden yazmaktır. 
        
        Kurallar:
        1. METNİ KORU: Haber metnindeki paragraflara dokunma, sadece ara başlıkları değiştir.
        2. FORMAT: Ara başlıkların TAMAMI BÜYÜK HARF olmalıdır.
        3. SEO & BAĞLAM (KRİTİK): Ara başlıklar SEO uyumlu olmalı ve takip eden paragrafın içeriğiyle %100 uyumlu olmalıdır.
        4. NOKTALAMA VE TDK (HAYATİ): Ara başlıklarda TDK noktalama kuralları TAMAMEN uygulanmalıdır. Soru işareti (?), tırnak işareti ("), iki nokta (:), ünlem (!) ve çizgi (-) gibi işaretleri mutlaka kullan. Özellikle bir kişinin sözü veya merak uyandıran bir soru varsa bunu noktalama ile vurgula. Ara başlık sonunda KESİNLİKLE NOKTA (.) kullanılmamalıdır.
        5. TONA ÖZEL KURALLAR:
           - "SEO Uyumlu Özgün Haber" Modu: Ara başlıklar haber paragraflarıyla doğrudan bağlantılı, bilgilendirici ve ciddi olmalıdır. Büyük haber portallarındaki gibi SEO odaklı anahtar kelime öbekleri kullanılabilir.
           - "Ulusal Medya Tipi Tık Odaklı" Modu: Ara başlıklar merak uyandırıcı, dinamik ve CLICKBAIT etkisi yaratan yapıda olmalıdır. Soru odaklı, heyecan verici ve anahtar kelime zengini (SEO güçlendirilmiş) olmalıdır.
        6. ÜSLUP: ${tone === 'SEO Uyumlu Özgün Haber' ? 'Resmi, otoriter ve net.' : 'Dinamik, merak uyandırıcı ve ilgi çekici.'}
        7. ÇIKTI: Sadece güncellenmiş haber metnini (body) döndür.`,
      }
    });
    const outputText = response.text;
    if (!outputText) {
      const finishReason = response.candidates?.[0]?.finishReason;
      throw new Error(`Model ara başlık üretemedi (Sebep: ${finishReason || 'Bilinmiyor'}).`);
    }
    return outputText.replace(/\*\*/g, '');
  };

  const mainCall = async (forceFree = false) => {
    try {
      return await withRetry((ff) => callApi('gemini-3-flash-preview', ff || forceFree));
    } catch (error: any) {
      console.error("Refine Subheadings Error:", error);
      try {
        return await withRetry((ff) => callApi('gemini-3.1-pro-preview', ff || forceFree), 2);
      } catch (proError: any) {
        throw proError;
      }
    }
  };

  return await mainCall();
};

export const createChatSession = (): Chat => {
  const ai = getAiClient();
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: 'Sen Vakanüvis AI adında, soğukkanlı, nesnel ve profesyonel bir haber ajansı editörüsün. "Haberin Dijital Hafızası, Geleceğin Kalemi" sloganıyla hareket ediyorsun. Gazetecilik etiği, ajans dili, SEO ve haber kurgusu konularında uzmansın. Cümlelere aşırı yorumsal veya sıkıntılı kelimeler eklemezsin. Yapılan yorumların/çıkarımların her zaman haber formatında olmasına dikkat edersin. Kullanıcı sorularına bu ciddiyetle ve uzmanlıkla cevap ver.',
    },
  });
};
