
import { NewsMode, NewsTone } from '../../types';
import { SYSTEM_PROMPT } from './systemPrompt';
import { getModePrompt } from './modePrompt';
import { getTonePrompt } from './tonePrompt';

export const buildPrompt = (mode: NewsMode, tone: NewsTone, extraInstructions: string = ''): string => {
  return `
${SYSTEM_PROMPT}
${getModePrompt(mode)}
${getTonePrompt(tone)}
${extraInstructions}

ÇIKTI: JSON formatında; headline, spot, body ve talep edilen gelişmiş analiz alanlarını döndür.
`;
};
