import React, { useState } from 'react';
import { Image as ImageIcon, Layers, Scissors, Globe, Sparkles } from 'lucide-react';
import { IconGenerator } from './IconGenerator';
import { BatchResizer } from './BatchResizer';
import { LanguageProvider, useLanguage } from './LanguageContext';

type Tab = 'icon' | 'batch';

const MainLayout = () => {
  const [activeTab, setActiveTab] = useState<Tab>('icon');
  const { t, language, setLanguage } = useLanguage();

  return (
    <div className="min-h-screen relative overflow-hidden selection:bg-indigo-500/30 text-slate-800">
      {/* Dynamic Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-200/40 rounded-full blur-[100px] animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-indigo-200/40 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] bg-blue-200/40 rounded-full blur-[100px] animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {/* Navbar */}
        <nav className="flex justify-between items-center mb-16 animate-fade-in-up">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 text-white">
              <Scissors className="w-6 h-6" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900 hidden sm:block">Resizer<span className="text-indigo-600">Pro</span></span>
          </div>
          <button
            onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
            className="glass-card px-4 py-2 rounded-full hover:bg-white transition-all duration-300 shadow-sm hover:shadow-md flex items-center gap-2 group cursor-pointer"
          >
            <Globe className="w-4 h-4 text-slate-500 group-hover:text-indigo-600 transition-colors" />
            <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-900">{language === 'en' ? '中文' : 'English'}</span>
          </button>
        </nav>

        {/* Hero Section */}
        <header className="text-center mb-12 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6">
            {t.title}
          </h1>
          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
            {t.subtitle}
          </p>
        </header>

        {/* Main Content Container */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          {/* Tab Switcher */}
          <div className="flex justify-center mb-8">
            <div className="glass-card p-1.5 rounded-2xl inline-flex relative shadow-xl shadow-indigo-500/5">
              <button
                onClick={() => setActiveTab('icon')}
                className={`
                  relative flex items-center gap-2.5 px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ease-out
                  ${activeTab === 'icon' 
                    ? 'bg-white text-indigo-600 shadow-lg shadow-slate-200/50 ring-1 ring-black/5 scale-100' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-white/30'
                  }
                `}
              >
                <ImageIcon className={`w-4 h-4 ${activeTab === 'icon' ? 'fill-current' : ''}`} />
                {t.tabs.icon}
              </button>
              <button
                onClick={() => setActiveTab('batch')}
                className={`
                  relative flex items-center gap-2.5 px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ease-out
                  ${activeTab === 'batch' 
                    ? 'bg-white text-indigo-600 shadow-lg shadow-slate-200/50 ring-1 ring-black/5 scale-100' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-white/30'
                  }
                `}
              >
                <Layers className={`w-4 h-4 ${activeTab === 'batch' ? 'fill-current' : ''}`} />
                {t.tabs.batch}
              </button>
            </div>
          </div>

          {/* Tool Area */}
          <div className="glass-panel rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 p-6 md:p-10 min-h-[500px] relative">
             {/* Content */}
             <div className="relative z-10">
                {activeTab === 'icon' ? <IconGenerator /> : <BatchResizer />}
             </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 pb-8 text-center animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="inline-flex items-center justify-center gap-2 text-slate-400 text-sm font-medium bg-white/30 px-4 py-2 rounded-full backdrop-blur-sm">
             <Sparkles className="w-3 h-3 text-yellow-500" />
             <span>{t.common.footer}</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

function App() {
  return (
    <LanguageProvider>
      <MainLayout />
    </LanguageProvider>
  );
}

export default App;