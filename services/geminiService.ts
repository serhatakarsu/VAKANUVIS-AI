
import { GoogleGenAI, Type, Chat } from "@google/genai";
import { GeneratedNews, SYSTEM_INSTRUCTION, NewsMode, HeadlineRefinement, SpotRefinement, NewsTone } from "../types";

// Initialize the Gemini client inside functions to pick up latest API key
const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

/**
 * Helper to perform exponential backoff retries for 503/UNAVAILABLE errors.
 */
const withRetry = async <T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> => {
  let delay = 1000;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      const isRetryable = 
        error?.message?.includes('503') || 
        error?.message?.includes('UNAVAILABLE') || 
        error?.status === 503 || 
        error?.code === 503;

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

export const generateNewsContent = async (rawText: string, mode: NewsMode, tone: NewsTone): Promise<GeneratedNews> => {
  const ai = getAiClient();
  
  const callApi = async (modelName: string) => {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: `Seçilen Haber Modu: ${mode}\nSeçilen Ton: ${tone}\n\nHam Metin/Notlar:\n${rawText}`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            headline: { type: Type.STRING },
            spot: { type: Type.STRING },
            body: { type: Type.STRING },
            metaTitle: { type: Type.STRING },
            metaDescription: { type: Type.STRING },
            slug: { type: Type.STRING },
            keywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            qualityAudit: {
              type: Type.OBJECT,
              properties: {
                seoScore: { type: Type.INTEGER },
                originalityScore: { type: Type.INTEGER },
                googleNewsSuitability: { type: Type.STRING },
                trendPotential: { type: Type.STRING },
                trendAnalysis: { type: Type.STRING },
                critique: { type: Type.STRING },
                suggestions: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                alternativeHeadlines: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                headlinePerformance: { type: Type.STRING },
                isWhyReadAnswered: { type: Type.BOOLEAN },
                keywordDensityCheck: { type: Type.STRING },
                readabilityScore: { type: Type.INTEGER },
                competitorAnalysis: { type: Type.STRING },
                strategySuggestions: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: [
                "seoScore", "originalityScore", "googleNewsSuitability", 
                "trendPotential", "trendAnalysis", "critique", "suggestions", 
                "alternativeHeadlines", "headlinePerformance", "isWhyReadAnswered", 
                "keywordDensityCheck", "readabilityScore", "competitorAnalysis", 
                "strategySuggestions"
              ]
            }
          },
          required: ["headline", "spot", "body", "metaTitle", "metaDescription", "slug", "keywords", "qualityAudit"],
        },
      },
    });

    const outputText = response.text;
    if (!outputText) throw new Error("Model boş yanıt döndürdü.");
    
    const result = JSON.parse(outputText) as GeneratedNews;
    if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
      result.groundingChunks = response.candidates[0].groundingMetadata.groundingChunks;
    }
    return result;
  };

  try {
    return await withRetry(() => callApi('gemini-3-flash-preview'));
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const refineHeadline = async (currentHeadline: string, newsBody: string): Promise<HeadlineRefinement> => {
  const ai = getAiClient();
  
  const callApi = async (modelName: string) => {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: `Mevcut Başlık: ${currentHeadline}\n\nHaber İçeriği (Özet): ${newsBody.slice(0, 800)}`,
      config: {
        systemInstruction: `Sen dünyanın en iyi dijital yayın editörlerinden birisin. Görevin, mevcut haberi "tıklanma canavarına" (click-worthy) dönüştürecek 3 farklı alternatif başlık üretmektir. 

Kurallar:
1. Duygusal Tetikleyiciler: Okuyucunun korku, heyecan, mutluluk veya merak duygularına hitap et.
2. Merak Unsuru: Başlıkta her şeyi söyleme, okuyucuyu detayı öğrenmek için habere tıklamaya zorla.
3. SEO Uyumu: Anahtar kelimeyi başlığın başına veya merkezine yerleştir.
4. Toplam 3 alternatif üret.
5. Her başlık için editoryal bir gerekçe (rationale) yaz. Neden bu duyguya odaklandığını açıkla.`,
        ...(modelName === 'gemini-3-pro-preview' ? { thinkingConfig: { thinkingBudget: 32768 } } : {}),
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            alternatives: {
              type: Type.ARRAY,
              minItems: 3,
              maxItems: 3,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING, description: "Önerilen yeni başlık." },
                  type: { type: Type.STRING, description: "Click-Worthy, Emotional, Curiosity vb." },
                  score: { type: Type.INTEGER, description: "Beklenen başarı puanı (0-100)." },
                  rationale: { type: Type.STRING, description: "Bu başlığın neden işe yarayacağına dair psikolojik açıklama." }
                },
                required: ["text", "type", "score", "rationale"]
              }
            },
            analysis: { type: Type.STRING, description: "Genel editoryal strateji notu." }
          },
          required: ["alternatives", "analysis"]
        }
      }
    });
    return JSON.parse(response.text) as HeadlineRefinement;
  };

  try {
    return await withRetry(() => callApi('gemini-3-pro-preview'));
  } catch (error: any) {
    return await withRetry(() => callApi('gemini-3-flash-preview'), 2);
  }
};

export const refineSpot = async (currentSpot: string, newsBody: string): Promise<SpotRefinement> => {
  const ai = getAiClient();
  
  const callApi = async (modelName: string) => {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: `Mevcut Spot: ${currentSpot}\n\nHaber İçeriği: ${newsBody.slice(0, 1000)}`,
      config: {
        systemInstruction: `Sen bir haber kurgu uzmanısın. Mevcut spot metnini (lead) analiz et ve Google News, sosyal medya ve SEO için daha etkileyici, "merak uyandırıcı" 3 farklı alternatif üret. 

Kriterler:
- Okuyucuyu hemen haberin devamına yönlendir.
- Anahtar kelimeyi ilk 10 kelime içine yerleştir.
- Maksimum 2 cümle olsun.
- Merak ve fayda odaklı (WIIFM - What's in it for me) bir dil kullan.`,
        ...(modelName === 'gemini-3-pro-preview' ? { thinkingConfig: { thinkingBudget: 32768 } } : {}),
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            alternatives: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING, description: "Önerilen yeni spot metni." },
                  type: { type: Type.STRING, description: "Kategori (Merak, SEO, Aksiyon vb.)" },
                  score: { type: Type.INTEGER, description: "Beklenen CTR puanı." },
                  rationale: { type: Type.STRING, description: "Psikolojik analiz." }
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
    return JSON.parse(response.text) as SpotRefinement;
  };

  try {
    return await withRetry(() => callApi('gemini-3-pro-preview'));
  } catch (error: any) {
    return await withRetry(() => callApi('gemini-3-flash-preview'), 2);
  }
};

export const createChatSession = (): Chat => {
  const ai = getAiClient();
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: 'Sen profesyonel bir haber merkezi asistanısın. Gazetecilik, etik, SEO ve haber kurgusu konularında uzmansın. Kullanıcı sorularına bu uzmanlıkla, nazik ve yardımcı bir dille cevap ver.',
    },
  });
};
