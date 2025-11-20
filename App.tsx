import React, { useState } from 'react';
import { Image as ImageIcon, Layers, Scissors, Globe } from 'lucide-react';
import { IconGenerator } from './IconGenerator';
import { BatchResizer } from './BatchResizer';
import { LanguageProvider, useLanguage } from './LanguageContext';

type Tab = 'icon' | 'batch';

const MainLayout = () => {
  const [activeTab, setActiveTab] = useState<Tab>('icon');
  const { t, language, setLanguage } = useLanguage();

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-700 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-50/80 to-transparent -z-10" />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        {/* Top Bar */}
        <div className="flex justify-end mb-4 md:mb-0">
          <button
            onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200 text-sm font-medium text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm"
          >
            <Globe className="w-4 h-4" />
            <span>{language === 'en' ? '中文' : 'English'}</span>
          </button>
        </div>

        {/* Header */}
        <header className="text-center mb-12 space-y-6 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-xl shadow-indigo-200 mb-2 transform hover:scale-105 transition-transform duration-300">
            <Scissors className="w-10 h-10 text-white" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
              {t.title}
            </h1>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
              {t.subtitle}
            </p>
          </div>
        </header>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-10">
          <div className="bg-white/80 backdrop-blur-md p-1.5 rounded-2xl shadow-sm border border-slate-200/60 inline-flex relative z-10">
            <button
              onClick={() => setActiveTab('icon')}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 ease-out
                ${activeTab === 'icon' 
                  ? 'bg-slate-900 text-white shadow-lg shadow-slate-200 scale-100' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }
              `}
            >
              <ImageIcon className="w-4 h-4" />
              {t.tabs.icon}
            </button>
            <button
              onClick={() => setActiveTab('batch')}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 ease-out
                ${activeTab === 'batch' 
                  ? 'bg-slate-900 text-white shadow-lg shadow-slate-200 scale-100' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }
              `}
            >
              <Layers className="w-4 h-4" />
              {t.tabs.batch}
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="max-w-4xl mx-auto">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-slate-200/50 border border-white/50 p-6 md:p-10 min-h-[400px] transition-all duration-500">
             {activeTab === 'icon' ? <IconGenerator /> : <BatchResizer />}
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-16 text-center">
          <p className="text-sm text-slate-400">© {new Date().getFullYear()} {t.title}</p>
          <p className="text-xs text-slate-400 mt-1 opacity-75">{t.common.footer}</p>
        </footer>
      </div>
      
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
      `}</style>
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