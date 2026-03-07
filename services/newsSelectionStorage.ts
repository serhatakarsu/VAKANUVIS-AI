import { NEWS_MODES, NEWS_TONES, NewsSelectionState } from '../types';

const NEWS_SELECTION_STORAGE_KEY = 'news_selection_state_v1';

export const DEFAULT_NEWS_SELECTION: NewsSelectionState = {
  mode: NEWS_MODES[0],
  tone: NEWS_TONES[0],
};

export const getNewsSelectionState = (): NewsSelectionState => {
  try {
    const rawValue = localStorage.getItem(NEWS_SELECTION_STORAGE_KEY);
    if (!rawValue) return DEFAULT_NEWS_SELECTION;

    const parsedValue = JSON.parse(rawValue) as Partial<NewsSelectionState>;
    const mode = parsedValue.mode && NEWS_MODES.includes(parsedValue.mode) ? parsedValue.mode : DEFAULT_NEWS_SELECTION.mode;
    const tone = parsedValue.tone && NEWS_TONES.includes(parsedValue.tone) ? parsedValue.tone : DEFAULT_NEWS_SELECTION.tone;

    return { mode, tone };
  } catch (error) {
    console.error('Failed to load news selection state', error);
    return DEFAULT_NEWS_SELECTION;
  }
};

export const saveNewsSelectionState = (selectionState: NewsSelectionState) => {
  try {
    localStorage.setItem(NEWS_SELECTION_STORAGE_KEY, JSON.stringify(selectionState));
  } catch (error) {
    console.error('Failed to save news selection state', error);
  }
};
