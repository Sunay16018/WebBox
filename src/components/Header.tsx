import React, { useState } from 'react';
import { Menu, X, Languages, Globe, ShieldCheck, Heart, Cpu, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Language, TranslationSet, TRANSLATIONS, TOOLS_LIST, ToolCategory, SITE_LANGUAGES } from '../types';

interface HeaderProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  activeToolId: string | null;
  onSelectTool: (id: string | null) => void;
  onInstallClick: () => void;
}

export default function Header({
  currentLanguage,
  onLanguageChange,
  activeToolId,
  onSelectTool,
  onInstallClick
}: HeaderProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const t: TranslationSet = TRANSLATIONS[currentLanguage];

  const categoriesSet: { id: ToolCategory; label: string; icon: string }[] = [
    { id: 'doc', label: t.categoryDocTrans, icon: '📄' },
    { id: 'pdf', label: t.categoryPdf, icon: '📕' },
    { id: 'media', label: t.categoryMedia, icon: '🎵' },
    { id: 'image', label: t.categoryImage, icon: '🖼️' }
  ];

  const handleToolSelect = (id: string | null) => {
    onSelectTool(id);
    setIsSidebarOpen(false);
  };

  const getLanguageFlag = (lang: Language) => {
    return SITE_LANGUAGES.find((l) => l.code === lang)?.flag || '🇺🇸';
  };

  return (
    <>
      {/* Upper Sticky Navbar */}
      <header id="global-header" className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-neutral-100 flex items-center justify-between px-3 sm:px-8 py-3 sm:py-4 transition-all duration-300 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
          <button
            id="btn-sidebar-toggle"
            onClick={() => setIsSidebarOpen(true)}
            className="p-1.5 sm:p-2 -ml-1 sm:-ml-2 rounded-lg hover:bg-neutral-50 active:bg-neutral-100 transition-colors flex-shrink-0"
            title="Open tools list"
          >
            <Menu className="w-5 h-5 text-neutral-800" />
          </button>
          
          <div 
            onClick={() => handleToolSelect(null)} 
            className="flex items-center gap-2 cursor-pointer select-none group min-w-0"
          >
            <img 
              src="/logo.png" 
              alt="WeBox Logo" 
              className="w-10 h-10 rounded-xl object-cover border border-neutral-100 group-hover:scale-105 transition-transform shadow-sm flex-shrink-0"
              referrerPolicy="no-referrer"
            />
            <span className="font-sans font-bold tracking-tight text-base sm:text-lg text-neutral-900 bg-gradient-to-r from-neutral-950 to-neutral-700 bg-clip-text text-transparent truncate">
              {t.brand}
            </span>
          </div>
        </div>

        {/* Dynamic Badges */}
        <div className="hidden md:flex items-center gap-6 text-xs text-neutral-400 font-mono">
          <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            100% OFFLINE SANDBOX
          </span>
          <span className="flex items-center gap-1.5 text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded-full font-medium">
            <Cpu className="w-3.5 h-3.5" />
            0 SERVER / ALL STORAGE LOCAL
          </span>
        </div>

        {/* Language Selection Bar */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onInstallClick}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 hover:scale-[1.02] border border-emerald-700 text-white text-xs font-semibold px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg transition-all shadow-sm shrink-0 font-sans active:scale-95"
            title="Install WeBox Application"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">
              {currentLanguage === 'TR' ? 'Uygulamayı Yükle' : currentLanguage === 'AZ' ? 'Yüklə' : 'Install'}
            </span>
          </button>

          <div className="relative group/lang flex items-center bg-neutral-50 hover:bg-neutral-100/80 border border-neutral-100 px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-lg transition-all">
            <Languages className="w-3.5 h-3.5 text-neutral-500 mr-1 sm:mr-2 hidden sm:inline" />
            <select
              id="select-ui-lang"
              value={currentLanguage}
              onChange={(e) => onLanguageChange(e.target.value as Language)}
              className="bg-transparent font-sans font-medium text-xs text-neutral-700 focus:outline-none cursor-pointer pr-1 w-[32px] sm:w-auto max-w-[130px] overflow-hidden"
            >
              {SITE_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.code} - {l.native}
                </option>
              ))}
            </select>
            <span className="text-xs ml-0.5 sm:ml-1 bg-white border border-neutral-200 px-1 rounded shadow-sm flex-shrink-0">
              {getLanguageFlag(currentLanguage)}
            </span>
          </div>
        </div>
      </header>

      {/* Drawer Overlay & Sidebar Panel */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              id="sidebar-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 z-50 bg-black"
            />

            {/* Sidebar drawer panel */}
            <motion.div
              id="sidebar-drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed inset-y-0 left-0 z-50 w-full max-w-sm bg-white shadow-2xl flex flex-col border-r border-neutral-100"
            >
              {/* Header inside Sidebar */}
              <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
                <div className="flex items-center gap-2">
                  <img 
                    src="/logo.png" 
                    alt="WeBox Logo" 
                    className="w-7 h-7 rounded-lg object-cover border border-neutral-100"
                    referrerPolicy="no-referrer"
                  />
                  <span className="font-bold tracking-tight text-neutral-900 font-sans">
                    {t.brand} Tools
                  </span>
                </div>
                <button
                  id="btn-sidebar-close"
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
                >
                  <X className="w-5 h-5 text-neutral-500" />
                </button>
              </div>

              {/* Sidebar Content (Categorised tools) */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {categoriesSet.map((cat) => {
                  const toolsInCat = TOOLS_LIST.filter(tool => tool.category === cat.id);
                  return (
                    <div key={cat.id} className="space-y-3">
                      <h4 className="text-xs font-mono tracking-wider text-neutral-400 uppercase flex items-center gap-2 pl-1 select-none">
                        <span>{cat.icon}</span>
                        {cat.label}
                      </h4>
                      <div className="space-y-1">
                        {toolsInCat.map((tool) => {
                          const isActive = activeToolId === tool.id;
                          return (
                            <button
                              key={tool.id}
                              id={`sidebar-tool-${tool.id}`}
                              onClick={() => handleToolSelect(tool.id)}
                              className={`w-full text-left p-3 rounded-xl flex flex-col transition-all duration-200 border ${
                                isActive
                                  ? 'bg-neutral-900 border-neutral-900 text-white shadow-sm'
                                  : 'bg-white hover:bg-neutral-50 border-transparent text-neutral-800'
                              }`}
                            >
                              <span className="font-sans font-semibold text-[14px] leading-snug">
                                {TRANSLATIONS[currentLanguage][tool.translationTitleKey]}
                              </span>
                              <span className={`text-[12px] mt-0.5 max-w-xs truncate ${
                                isActive ? 'text-neutral-300' : 'text-neutral-500'
                              }`}>
                                {TRANSLATIONS[currentLanguage][tool.translationDescKey]}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer inside sidebar */}
              <div className="p-6 border-t border-neutral-100 bg-neutral-50/50 flex flex-col gap-3">
                <button
                  onClick={() => {
                    setIsSidebarOpen(false);
                    onInstallClick();
                  }}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 text-xs transition-all shadow-sm hover:scale-[1.01] active:scale-95"
                >
                  <Download className="w-4 h-4 text-emerald-100" />
                  <span>
                    {currentLanguage === 'TR' ? 'WeBox Uygulamasını Yükle' : currentLanguage === 'AZ' ? 'WeBox Proqramını Quraşdır' : 'Install WeBox App'}
                  </span>
                </button>

                <div className="flex items-center justify-between text-xs text-neutral-400 font-mono">
                  <span>SANDBOX COMPLIANT</span>
                  <span>v2.1.0</span>
                </div>
                <div className="text-[11px] text-neutral-400 text-center flex items-center justify-center gap-1 mt-1 font-sans">
                  <span>Always computed 100% on safety level.</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
