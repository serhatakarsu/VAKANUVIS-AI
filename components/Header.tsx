import React from 'react';
import { PenTool, Archive, Sun, Moon, Zap, Feather } from 'lucide-react';

interface HeaderProps {
  onOpenHistory: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenHistory, isDarkMode, onToggleTheme }) => {
  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 backdrop-blur-md bg-white/95 dark:bg-slate-900/95 transition-colors">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center group cursor-default">
            {/* Custom Logo: Vakanüvis Geometric Crane */}
            <div className="mr-4 flex-shrink-0 transition-transform transform group-hover:scale-105 duration-300">
              <div className="w-12 h-12 bg-slate-900 dark:bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl rotate-3 group-hover:rotate-0 transition-all">
                <Feather className="w-6 h-6 text-white" />
              </div>
            </div>
            
            <div className="flex flex-col">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter leading-none flex items-center">
                VAKANÜVİS <span className="ml-2 text-blue-600 dark:text-blue-400">AI</span>
              </h1>
              <div className="flex items-center space-x-2 mt-1">
                <span className="h-px w-4 bg-slate-300 dark:bg-slate-700"></span>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-black tracking-[0.2em] uppercase">
                  Haberin Dijital Hafızası
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="relative">
              <button 
                onClick={onToggleTheme}
                className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                title={isDarkMode ? "Aydınlık Mod" : "Karanlık Mod"}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
            </div>

            <button 
              onClick={onOpenHistory}
              className="flex items-center space-x-2 text-gray-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 px-3 py-2 rounded-lg transition-all text-sm font-medium border border-transparent hover:border-blue-100 dark:hover:border-blue-900/50"
            >
              <Archive className="w-4 h-4" />
              <span className="hidden sm:inline">Arşiv & Geçmiş</span>
            </button>
 
            <div className="hidden md:flex items-center space-x-2 text-blue-600 dark:text-blue-400 text-[10px] font-black bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-full border border-blue-100 dark:border-blue-900/50 animate-pulse">
               <Zap className="w-3 h-3" />
               <span>v2.0 PRO</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
