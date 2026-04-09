
import { NewsMode, NewsTone } from '../types';
import { SYSTEM_PROMPT } from './systemPrompt';
import { getModePrompt } from './modePrompt';
import { getTonePrompt } from './tonePrompt';

export const buildPrompt = (mode: NewsMode, tone: NewsTone, extraInstructions: string = ''): string => {
  const now = new Date();
  const dateStr = now.toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

  return `
GÜNCEL TARİH VE SAAT: ${dateStr}, ${timeStr}

${SYSTEM_PROMPT}
${getModePrompt(mode)}
${getTonePrompt(tone)}
${extraInstructions}

ÇIKTI: JSON formatında; headline, spot, body ve talep edilen gelişmiş analiz alanlarını döndür.
`;
};
