import { NewsMode, NewsTone, SYSTEM_INSTRUCTION } from "../types";

export const buildSystemPrompt = (): string => SYSTEM_INSTRUCTION;

export const buildCategoryPrompt = (mode: NewsMode): string => `Seçilen Haber Modu: ${mode}`;

export const buildTonePrompt = (tone: NewsTone): string => `Seçilen Ton: ${tone}`;

export const buildNewsGenerationPrompt = (
  mode: NewsMode,
  tone: NewsTone,
  extraInstructions: string,
  rawText: string
): string => {
  const activeFeatures = extraInstructions || "\nYok (Sadece haber metni üret)";

  return `${buildCategoryPrompt(mode)}\n${buildTonePrompt(tone)}\n\nAKTİF GELİŞMİŞ ÖZELLİKLER:${activeFeatures}\n\nHam Metin/Notlar:\n${rawText}`;
};
