import { SavedItem } from '../types';

const STORAGE_KEY = 'news_assistant_history_v1';

export const getHistory = (): SavedItem[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to load history", e);
    return [];
  }
};

export const saveHistory = (items: SavedItem[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error("Failed to save history", e);
  }
};

export const addItemToHistory = (item: SavedItem) => {
  const history = getHistory();
  // Add to beginning
  const newHistory = [item, ...history];
  // Limit history size to prevent overflow (e.g. 50 items)
  if (newHistory.length > 50) {
    newHistory.length = 50;
  }
  saveHistory(newHistory);
  return newHistory;
};

export const deleteItemFromHistory = (id: string) => {
  const history = getHistory();
  const newHistory = history.filter(item => item.id !== id);
  saveHistory(newHistory);
  return newHistory;
};

export const updateItemStatus = (id: string, status: 'archived' | 'trashed') => {
  const history = getHistory();
  const newHistory = history.map(item => 
    item.id === id ? { ...item, status } : item
  );
  saveHistory(newHistory);
  return newHistory;
};
