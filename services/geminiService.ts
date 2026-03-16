
import { GoogleGenAI, Type, Chat, ThinkingLevel } from "@google/genai";
import { GeneratedNews, NewsMode, HeadlineRefinement, SpotRefinement, NewsTone, AdvancedFeatures } from "../types";
import { buildPrompt } from "../src/prompts/promptBuilder";

// Initialize the Gemini client inside functions to pick up latest API key
const getAiClient = (forceFree = false) => {
  const apiKey = forceFree 
    ? (process.env.GEMINI_API_KEY || process.env.API_KEY || '') 
    : (process.env.API_KEY || process.env.GEMINI_API_KEY || '');
  return new GoogleGenAI({ apiKey });
};

/**
 * Helper to perform exponential backoff retries for 503/UNAVAILABLE errors.
 */
const withRetry = async <T>(fn: (forceFree?: boolean) => Promise<T>, maxRetries = 3): Promise<T> => {
  let delay = 1000;
  let forceFree = false;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn(forceFree);
    } catch (error: any) {
      const errorMessage = error?.message || String(error);
      const isRetryable = 
        errorMessage.includes('503') || 
        errorMessage.includes('UNAVAILABLE') || 
        error?.status === 503 || 
        error?.code === 503;

      const isSpendingCap = errorMessage.includes('spending cap') || errorMessage.includes('RESOURCE_EXHAUSTED');

      if (isSpendingCap && !forceFree && process.env.GEMINI_API_KEY) {
        console.warn("Spending cap exceeded on primary key. Attempting fallback to platform free key...");
        forceFree = true;
        i--; // Don't count this as a retry attempt
        continue;
      }

      if (isRetryable && i < maxRetries - 1) {
        console.warn(`Gemini API 503 detected. Retrying in ${delay}ms... (Attempt ${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
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
  const callApi = async (modelName: string, forceFree = false) => {
    const ai = getAiClient(forceFree);
    
    const properties: any = {
      headline: { type: Type.STRING },
      spot: { type: Type.STRING },
      body: { type: Type.STRING },
    };
    const required = ["headline", "spot", "body"];

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
          altHeadline: { type: Type.STRING },
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
          clickHeadline: { type: Type.STRING },
          clickSpot: { type: Type.STRING },
          seoSubheadingSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["clickHeadline", "clickSpot", "seoSubheadingSuggestions"]
      };
      properties.discoverOptimization = {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
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
        alternativeHeadlines: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: [
        "seoScore", "seoExplanation", "originalityScore", "originalityExplanation",
        "readabilityScore", "readabilityExplanation", "googleNewsSuitability", 
        "trendPotential", "suggestions", "alternativeHeadlines"
      ]
    };
    required.push("qualityAudit");

    if (features.performancePrediction || features.discoverOptimization || features.aiEditorAudit) {
      // Add extra analytical fields only if requested to save tokens/time
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

    const response = await ai.models.generateContent({
      model: modelName,
      contents: `Seçilen Haber Modu: ${mode}\nSeçilen Ton: ${tone}\n\nAKTİF GELİŞMİŞ ÖZELLİKLER:${extraInstructions || "\nYok (Sadece haber metni üret)"}\n\nHam Metin/Notlar:\n${rawText}`,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        systemInstruction: buildPrompt(mode, tone, extraInstructions),
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        maxOutputTokens: 8192,
        responseSchema: {
          type: Type.OBJECT,
          properties,
          required,
        },
      },
    });

    // Enhanced response checking
    const outputText = response.text;
    
    if (!outputText) {
      const candidate = response.candidates?.[0];
      const finishReason = candidate?.finishReason;
      const safetyRatings = candidate?.safetyRatings;
      
      console.error("Gemini Empty Response Debug:", {
        finishReason,
        safetyRatings,
        response: JSON.stringify(response).slice(0, 500)
      });

      if (finishReason === 'SAFETY') {
        throw new Error("İçerik güvenlik filtrelerine takıldı. Lütfen metni gözden geçirip tekrar deneyin.");
      }
      
      if (finishReason === 'RECITATION') {
        throw new Error("İçerik telif hakkı korumalı bir metne çok benziyor. Lütfen farklı bir şekilde ifade edin.");
      }

      if (finishReason === 'OTHER' || !finishReason) {
        throw new Error("API kotası aşılmış olabilir veya istek zaman aşımına uğradı. Lütfen bir süre sonra tekrar deneyin.");
      }

      throw new Error(`Model yanıt üretemedi (Sebep: ${finishReason || 'Bilinmiyor'}). Lütfen kısa bir süre sonra tekrar deneyin.`);
    }
    
    const result = extractJson(outputText) as GeneratedNews;
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (groundingChunks) {
      result.groundingChunks = groundingChunks;
    }
    return result;
  };

  const mainCall = async (forceFree = false) => {
    try {
      return await withRetry((ff) => callApi('gemini-3-flash-preview', ff || forceFree));
    } catch (error: any) {
      const errorMessage = error?.message || String(error);
      if (errorMessage.includes('spending cap') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
        throw error;
      }
      
      console.warn("Flash model failed, falling back to Pro model...", error);
      try {
        return await withRetry((ff) => callApi('gemini-3-pro-preview', ff || forceFree), 2);
      } catch (proError: any) {
        console.error("Gemini API Final Error:", proError);
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
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        systemInstruction: `Sen profesyonel bir haber editörüsün. Görevin, mevcut başlığı ${tone} moduna uygun 5 farklı alternatif başlığa dönüştürmektir. 

Kurallar (${tone} Modu):
1. BAŞLIK MÜHENDİSLİĞİ: Başlık net, bilgilendirici ama sıkıcı değil; kapsayıcı ve otoriter olmalı.
2. FORMAT (KRİTİK): Başlıklarda yalnızca özel isimler ve cümlenin ilk kelimesi büyük harfle başlamalıdır. Diğer tüm kelimeler küçük harfle yazılmalıdır. (Sentence case + özel isimler).
3. ANAHTAR KELİME: Anahtar kelimeyi mutlaka başlığın başına yerleştir.
${tone === 'SEO Uyumlu Özgün Haber' ? `
5. NESNELLİK: Duygusal sıfatlardan, yorumlardan ve "süslü" kelimelerden tamamen kaçın. Kaynak metinde olmayan yorumlayıcı çıkarımları (örn: "...olarak değerlendiriliyor") ekleme.
6. GAZETE/PORTAL STİLİ: Büyük haber portalları ve gazetelerin (Hürriyet, Yenişafak, Medyascope, Dünya vb.) standartlarında; profesyonel, ilgi çekici ve bilgilendirici başlıklar üret. Haberdeki en vurucu beyanı veya tırnak içindeki ifadeyi tırnak içinde (" ") başlığa taşıyarak vurgula. Ajans dilinden (AA, İHA vb.) kaçın.
7. DİL: Nesnel ama akıcı ve editoryal yapı.
` : `
5. ULUSAL MEDYA STİLİ: Tıklama odaklı (Clickbait), merak uyandıran ve SEO anahtar kelimeleriyle zenginleştirilmiş başlıklar üret.
6. SORU ODAKLI: "Saat kaçta?", "Ne zaman?", "Belli oldu mu?" gibi okuyucunun arama motorlarında sorduğu soruları başlığa taşı.
7. GİZEM VE DİNAMİZM: Haberin sonucunu başlıkta verme, okuyucuyu tıklamaya zorla.
`}`,
        ...(modelName === 'gemini-3-pro-preview' ? { thinkingConfig: { thinkingBudget: 2048 } } : {}),
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
    return extractJson(outputText) as HeadlineRefinement;
  };

  const mainCall = async (forceFree = false) => {
    try {
      return await withRetry((ff) => callApi('gemini-3-flash-preview', ff || forceFree));
    } catch (error: any) {
      return await withRetry((ff) => callApi('gemini-3-pro-preview', ff || forceFree), 2);
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

Kriterler (${tone} Modu):
1. VURUCU GİRİŞ: Haberi en kapsayıcı ve otoriter şekilde özetle.
${isOfficial ? `
3. 5N1K: Spot, en önemli bilgiyi (Kim, Ne, Nerede, Ne Zaman) içermelidir.
4. NESNELLİK: Duygusal yorumlardan kaçın, sadece gerçekleşen eylemi yalın bir dille yaz. Kaynakta yoksa yorumlayıcı çıkarım ekleme.
5. TERS PİRAMİT: En can alıcı bilgiyi ilk cümlede ver.
` : `
3. ULUSAL MEDYA STİLİ: Tıklama odaklı (CTR), merak uyandıran ve SEO anahtar kelimeleriyle zenginleştirilmiş spotlar üret.
4. GİZEM: Haberin sonucunu veya can alıcı detayını söylemeyen, okuyucuyu içeri çekmeye zorlayan gizemli özet (Teaser).
5. DİNAMİZM: Discover odaklı, merak uyandırıcı kurgu. "Peki, o detaylar neler?", "İşte yaşananlar..." gibi merak tetikleyicileri kullan.
`}`,
        ...(modelName === 'gemini-3-pro-preview' ? { thinkingConfig: { thinkingBudget: 2048 } } : {}),
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
    return extractJson(outputText) as SpotRefinement;
  };

  const mainCall = async (forceFree = false) => {
    try {
      return await withRetry((ff) => callApi('gemini-3-flash-preview', ff || forceFree));
    } catch (error: any) {
      return await withRetry((ff) => callApi('gemini-3-pro-preview', ff || forceFree), 2);
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
        3. SEO & BAĞLAM: Ara başlıklar SEO uyumlu olmalı ve okuyucuyu bir sonraki paragrafa çekecek yapıda olmalıdır.
        4. TONA ÖZEL KURALLAR:
           - "SEO Uyumlu Özgün Haber" Modu: Ara başlıklar haber paragraflarıyla doğrudan bağlantılı, bilgilendirici ve ciddi olmalıdır. Büyük haber portallarındaki gibi SEO odaklı anahtar kelime öbekleri veya doğrudan bilgi veren soru kalıpları kullanılabilir. Haberdeki önemli beyanları tırnak içinde (" ") ara başlıklara taşıyarak vurgula.
           - "Ulusal Medya Tipi Tık Odaklı" Modu: Ara başlıklar merak uyandırıcı, dinamik ve "cliffhanger" etkisi yaratan yapıda olmalıdır. Soru odaklı, heyecan verici ve anahtar kelime zengini olmalıdır.
        5. ÜSLUP: ${tone === 'SEO Uyumlu Özgün Haber' ? 'Resmi, otoriter ve net.' : 'Dinamik, merak uyandırıcı ve ilgi çekici.'}
        6. ÇIKTI: Sadece güncellenmiş haber metnini (body) döndür.`,
      }
    });
    const outputText = response.text;
    if (!outputText) {
      const finishReason = response.candidates?.[0]?.finishReason;
      throw new Error(`Model ara başlık üretemedi (Sebep: ${finishReason || 'Bilinmiyor'}).`);
    }
    return outputText;
  };

  const mainCall = async (forceFree = false) => {
    try {
      return await withRetry((ff) => callApi('gemini-3-flash-preview', ff || forceFree));
    } catch (error: any) {
      console.error("Refine Subheadings Error:", error);
      try {
        return await withRetry((ff) => callApi('gemini-3-pro-preview', ff || forceFree), 2);
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
      systemInstruction: 'Sen Vakanüvis AI adında, soğukkanlı, nesnel ve profesyonel bir haber ajansı editörüsün. "Haberin Dijital Hafızası, Geleceğin Kalemi" sloganıyla hareket ediyorsun. Gazetecilik etiği, ajans dili, SEO ve haber kurgusu konularında uzmansın. Kullanıcı sorularına bu ciddiyetle ve uzmanlıkla cevap ver.',
    },
  });
};
