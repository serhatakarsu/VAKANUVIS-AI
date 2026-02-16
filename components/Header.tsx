import React from 'react';
import { PenTool, Archive } from 'lucide-react';

interface HeaderProps {
  onOpenHistory: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenHistory }) => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10 backdrop-blur-md bg-white/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center group cursor-default">
            {/* Custom Logo: AI Nib */}
            <div className="mr-3 flex-shrink-0 transition-transform transform group-hover:scale-105 duration-300">
              <svg className="h-10 w-10 shadow-sm rounded-xl" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="logo-gradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#2563EB" />
                    <stop offset="1" stopColor="#1E40AF" />
                  </linearGradient>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
                
                {/* Background Container */}
                <rect width="40" height="40" rx="10" fill="url(#logo-gradient)" />
                
                {/* Pen Nib Shape (Journalism) */}
                <path 
                  d="M20 33L12.5 17.5C11.8 16 11.5 14.5 12 13C12.5 10 15 8 20 8C25 8 27.5 10 28 13C28.5 14.5 28.2 16 27.5 17.5L20 33Z" 
                  fill="white" 
                />
                
                {/* Ink Channel (Center Split) */}
                <path 
                  d="M20 8V22" 
                  stroke="url(#logo-gradient)" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                />
                
                {/* AI Spark (Intelligence) - Top Right Accent */}
                <path 
                  d="M29 6L30.2 8.5L33 9.5L30.2 10.5L29 13L27.8 10.5L25 9.5L27.8 8.5L29 6Z" 
                  fill="#FCD34D" 
                  filter="url(#glow)"
                />
              </svg>
            </div>
            
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-gray-900 tracking-tight leading-none">
                Haber Yazım <span className="text-blue-600">Asistanı</span>
              </h1>
              <p className="text-xs text-gray-500 font-medium mt-1 tracking-wide">
                AI Destekli Profesyonel Editör
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button 
              onClick={onOpenHistory}
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-all text-sm font-medium border border-transparent hover:border-blue-100"
            >
              <Archive className="w-4 h-4" />
              <span>Arşiv & Geçmiş</span>
            </button>

            <div className="hidden md:flex items-center space-x-2 text-gray-400 text-xs bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
               <PenTool className="w-3 h-3" />
               <span>v1.2</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};