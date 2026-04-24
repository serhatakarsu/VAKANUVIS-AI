import React from 'react';
import { PenTool, Archive, Sun, Moon, Zap, Feather } from 'lucide-react';

interface HeaderProps {
  onOpenHistory: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenHistory, isDarkMode, onToggleTheme }) => {
  return (
    <header className="bg-[var(--paper)]/80 border-b border-[var(--border)] sticky top-0 z-50 backdrop-blur-2xl transition-all duration-300">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center group cursor-default">
            {/* Custom Logo: Vakanüvis Geometric Crane */}
            <div className="mr-5 flex-shrink-0 transition-transform transform group-hover:scale-105 duration-300">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl rotate-3 group-hover:rotate-0 transition-all shadow-indigo-500/30">
                <Feather className="w-6 h-6 text-white" />
              </div>
            </div>
            
            <div className="flex flex-col">
              <h1 className="text-2xl font-black text-[var(--ink)] tracking-tighter leading-none flex items-center">
                VAKANÜVİS <span className="ml-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">AI</span>
              </h1>
              <div className="flex items-center space-x-2 mt-1.5">
                <span className="h-px w-6 bg-zinc-200 dark:bg-zinc-700"></span>
                <p className="text-[9px] text-zinc-400 dark:text-zinc-500 font-black tracking-[0.2em] uppercase">
                  Dijital Haber Hafızası
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative">
              <button 
                onClick={onToggleTheme}
                className="p-2.5 rounded-xl text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700"
                title={isDarkMode ? "Aydınlık Mod" : "Karanlık Mod"}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>

            <button 
              onClick={onOpenHistory}
              className="flex items-center gap-2.5 text-zinc-600 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 px-5 py-2.5 rounded-xl transition-all text-sm font-semibold border border-zinc-200 dark:border-zinc-800 hover:border-indigo-100 dark:hover:border-indigo-900/50"
            >
              <Archive className="w-4 h-4" />
              <span className="hidden sm:inline">Arşiv</span>
            </button>
 
            <div className="hidden md:flex items-center gap-2 text-indigo-700 dark:text-indigo-300 text-[10px] font-black bg-indigo-50 dark:bg-indigo-900/40 px-4 py-2 rounded-full border border-indigo-100 dark:border-indigo-800/50 shadow-inner">
               <Zap className="w-3 h-3" />
               <span>v3.0 PRO</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
