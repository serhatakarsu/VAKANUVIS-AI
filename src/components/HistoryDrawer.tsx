import React, { useState } from 'react';
import { X, Archive, Trash2, RotateCcw, Clock, ArrowUpDown, FileText, ChevronRight } from 'lucide-react';
import { SavedItem } from '../types';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: SavedItem[];
  onRestore: (item: SavedItem) => void;
  onDeleteForever: (id: string) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({ 
  isOpen, 
  onClose, 
  items, 
  onRestore, 
  onDeleteForever 
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'archived' | 'trashed'>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  const filteredItems = items
    .filter(item => {
      if (activeTab === 'all') return item.status !== 'trashed';
      return item.status === activeTab;
    })
    .sort((a, b) => {
      return sortOrder === 'newest' ? b.timestamp - a.timestamp : a.timestamp - b.timestamp;
    });

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('tr-TR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(timestamp));
  };

  const toggleSort = () => {
    setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest');
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-[55] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-full max-w-[450px] bg-white dark:bg-zinc-900 shadow-2xl z-[60] transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between bg-white dark:bg-zinc-900 sticky top-0 z-10">
          <div className="flex items-center">
            <Clock className="w-5 h-5 mr-2 text-zinc-800 dark:text-zinc-200" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Vakanüvis Hafızası</h2>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={toggleSort}
              className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg text-gray-500 dark:text-zinc-400 transition-colors flex items-center text-xs font-bold"
              title="Sırala"
            >
              <ArrowUpDown className="w-4 h-4 mr-1" />
              {sortOrder === 'newest' ? 'Yeni' : 'Eski'}
            </button>
            <button 
              type="button"
              onClick={onClose}
              className="relative z-50 p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5 pointer-events-none" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 dark:border-zinc-800 px-2 bg-gray-50/50 dark:bg-zinc-800/30">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
              activeTab === 'all' ? 'border-zinc-800 dark:border-indigo-500 text-zinc-800 dark:text-indigo-500' : 'border-transparent text-gray-400 dark:text-zinc-500'
            }`}
          >
            Tüm Kayıtlar
          </button>
          <button
            onClick={() => setActiveTab('archived')}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
              activeTab === 'archived' ? 'border-zinc-800 dark:border-indigo-500 text-zinc-800 dark:text-indigo-500' : 'border-transparent text-gray-400 dark:text-zinc-500'
            }`}
          >
            Arşiv
          </button>
          <button
            onClick={() => setActiveTab('trashed')}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
              activeTab === 'trashed' ? 'border-red-500 text-red-600' : 'border-transparent text-gray-400 dark:text-zinc-500'
            }`}
          >
            Çöp
          </button>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-gray-50/20 dark:bg-zinc-900/50">
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-zinc-600 py-12">
              <FileText className="w-12 h-12 mb-3 opacity-20" />
              <p className="text-sm font-medium">Bu kategoride içerik bulunamadı.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredItems.map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => onRestore(item)}
                  className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-gray-200 dark:border-zinc-700 shadow-sm hover:border-zinc-400 dark:hover:border-zinc-500 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-1.5">
                    <div className="flex items-center space-x-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black bg-zinc-800 dark:bg-indigo-600 text-white uppercase tracking-widest">
                        {item.mode}
                      </span>
                      {item.tone && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300">
                          {item.tone.split(' ')[0]} {/* Sadece ilk kelimeyi alarak çok yer kaplamasını engelle */}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-mono">
                      {formatDate(item.timestamp)}
                    </span>
                  </div>
                  
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {item.output?.headline || item.input.slice(0, 70) + '...'}
                  </h3>
                  
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center text-[10px] text-gray-400 dark:text-zinc-500 italic">
                      {item.output ? 'Haber Tamamlandı' : 'Sadece Girdi Notları'}
                    </div>
                    {activeTab === 'trashed' ? (
                      <button
                        onClick={(e) => { e.stopPropagation(); onDeleteForever(item.id); }}
                        className="text-[10px] text-red-500 hover:text-red-700 font-bold uppercase tracking-tighter"
                      >
                        Kalıcı Sil
                      </button>
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-300 dark:text-zinc-600 group-hover:translate-x-1 transition-transform" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};