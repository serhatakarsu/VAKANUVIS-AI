
import { GoogleGenAI, Type, Chat, ThinkingLevel } from "@google/genai";
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
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
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
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            socialPreview: {
              type: Type.OBJECT,
              properties: {
                twitter: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    hashtags: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    }
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
            },
            qualityAudit: {
              type: Type.OBJECT,
              properties: {
                seoScore: { type: Type.INTEGER },
                seoExplanation: { type: Type.STRING },
                originalityScore: { type: Type.INTEGER },
                originalityExplanation: { type: Type.STRING },
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
                readabilityExplanation: { type: Type.STRING },
                readabilityAnalysis: { type: Type.STRING },
                jargonRemovalLog: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                competitorAnalysis: { type: Type.STRING },
                strategySuggestions: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: [
                "seoScore", "seoExplanation", "originalityScore", "originalityExplanation",
                "googleNewsSuitability", "trendPotential", "trendAnalysis", "critique", 
                "suggestions", "alternativeHeadlines", "headlinePerformance", 
                "isWhyReadAnswered", "keywordDensityCheck", "readabilityScore", 
                "readabilityExplanation", "readabilityAnalysis", "jargonRemovalLog", 
                "competitorAnalysis", "strategySuggestions"
              ]
            }
          },
          required: ["headline", "spot", "body", "metaTitle", "metaDescription", "slug", "keywords", "tags", "socialPreview", "qualityAudit"],
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
        systemInstruction: `Sen dünyanın en iyi dijital yayın editörlerinden birisin. Görevin, mevcut haberi hem SEO uyumlu hem de son derece mantıklı ve okunabilir 3 farklı alternatif başlığa dönüştürmektir. 

Kurallar:
1. FORMAT: Başlıklar ASLA "TAMAMI BÜYÜK" harfle yazılmamalı. İlk kelime ve özel isimler dışında küçük harf kuralına (Sentence Case) uyulmalıdır.
2. Mantık ve Okunabilirlik: Başlıklar mantıklı bir bütünlük arz etmeli, okuyucuyu aldatmamalı (clickbait değil, click-worthy olmalı) ve akıcı olmalıdır.
3. Merak Unsuru: Başlıkta her şeyi söyleme, okuyucuyu detayı öğrenmek için habere tıklamaya zorla.
4. SEO Uyumu: Anahtar kelimeyi başlığın başına veya merkezine yerleştir.`,
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
    return JSON.parse(response.text) as HeadlineRefinement;
  };

  try {
    return await withRetry(() => callApi('gemini-3-flash-preview'));
  } catch (error: any) {
    return await withRetry(() => callApi('gemini-3-pro-preview'), 2);
  }
};

export const refineSpot = async (currentSpot: string, newsBody: string): Promise<SpotRefinement> => {
  const ai = getAiClient();
  
  const callApi = async (modelName: string) => {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: `Mevcut Spot: ${currentSpot}\n\nHaber İçeriği: ${newsBody.slice(0, 1000)}`,
      config: {
        systemInstruction: `Sen bir haber kurgu uzmanısın. Mevcut spot metnini (lead) analiz et ve Google News, sosyal medya ve SEO için daha etkileyici 3 farklı alternatif üret. 

Kriterler:
1. "Merak Boşluğu" (Curiosity Gap) tekniğini kullan. Okuyucuya "ne olmuş?" sorusunu sordurt.
2. Anahtar kelimeyi akıcı bir şekilde ilk cümleye yedir.`,
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
    return JSON.parse(response.text) as SpotRefinement;
  };

  try {
    return await withRetry(() => callApi('gemini-3-flash-preview'));
  } catch (error: any) {
    return await withRetry(() => callApi('gemini-3-pro-preview'), 2);
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
