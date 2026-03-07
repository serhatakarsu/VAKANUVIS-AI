import React from 'react';
import { PenTool, Archive, Sun, Moon, Zap } from 'lucide-react';

interface HeaderProps {
  onOpenHistory: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenHistory, isDarkMode, onToggleTheme }) => {
  return (
    <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 sticky top-0 z-10 backdrop-blur-md bg-white/90 dark:bg-slate-900/90 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center group cursor-default">
            {/* Custom Logo: Vakanüvis Geometric Crane */}
            <div className="mr-3 flex-shrink-0 transition-transform transform group-hover:scale-105 duration-300">
              <svg className="h-10 w-10 shadow-sm rounded-xl" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <filter id="logo-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="1" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
                
                {/* Background Container */}
                <rect width="40" height="40" rx="10" fill="#F8FAFC" className="dark:fill-slate-800" />
                
                {/* Geometric Crane Bird (Hexagonal/Pixel Style) */}
                {/* Main Body / V-Shape */}
                <path 
                  d="M12 15L20 28L28 15" 
                  stroke="#000000" 
                  strokeWidth="3" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
                
                {/* Crane Wings / Hexagonal Elements */}
                <path 
                  d="M20 12L28 18L28 26L20 32L12 26L12 18L20 12Z" 
                  fill="#000080" 
                  fillOpacity="0.1"
                  stroke="#000080"
                  strokeWidth="1"
                />
                
                {/* Pixel Trail (Navy Blue) */}
                <rect x="30" y="10" width="2" height="2" fill="#000080" />
                <rect x="33" y="13" width="2" height="2" fill="#000080" opacity="0.6" />
                <rect x="36" y="16" width="2" height="2" fill="#000080" opacity="0.3" />
                
                {/* Head / Beak */}
                <path 
                  d="M20 12L23 9L26 12" 
                  fill="#000000" 
                />
              </svg>
            </div>
            
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight leading-none">
                VAKANÜVİS <span className="text-blue-900 dark:text-blue-400">AI</span>
              </h1>
              <p className="text-[10px] text-gray-500 dark:text-slate-400 font-bold mt-1 tracking-tight uppercase">
                Haberin Dijital Hafızası
              </p>
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
