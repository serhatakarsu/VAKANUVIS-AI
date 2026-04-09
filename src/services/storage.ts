import { SavedItem } from '../types';

const STORAGE_KEY = 'news_assistant_history_v2_0';

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
  // Remove existing item with same id if it exists
  const filteredHistory = history.filter(h => h.id !== item.id);
  // Add to beginning
  let newHistory = [item, ...filteredHistory];
  
  // Limit history size to prevent overflow, but NEVER delete archived items
  if (newHistory.length > 100) {
    const archived = newHistory.filter(h => h.status === 'archived');
    const others = newHistory.filter(h => h.status !== 'archived').slice(0, 100);
    newHistory = [...archived, ...others].sort((a, b) => b.timestamp - a.timestamp);
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
