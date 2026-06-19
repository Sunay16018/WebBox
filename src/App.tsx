import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Cpu, 
  ArrowRight, 
  Languages, 
  RefreshCw, 
  FileStack, 
  ImageUp, 
  ShieldAlert, 
  Music, 
  Sliders, 
  Grid, 
  FilePen, 
  Zap, 
  CheckCircle,
  HelpCircle,
  FolderOpen
} from 'lucide-react';

import { Language, TranslationSet, TRANSLATIONS, TOOLS_LIST } from './types';
import Header from './components/Header';
import DocTranslator from './components/DocTranslator';
import FormatConverter from './components/FormatConverter';
import PdfMerge from './components/PdfMerge';
import ImageToPdf from './components/ImageToPdf';
import PdfMeta from './components/PdfMeta';
import AudioExtractor from './components/AudioExtractor';
import MediaCutter from './components/MediaCutter';
import BatchResizer from './components/BatchResizer';
import WatermarkAdder from './components/WatermarkAdder';
import InfoPages from './components/InfoPages';

export default function App() {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('webox_lang') || localStorage.getItem('webbox_lang');
    return (saved as Language) || 'TR';
  });

  const [activeToolId, setActiveToolId] = useState<string | null>(null);
  const [activePath, setActivePath] = useState<string | null>(() => {
    const p = window.location.pathname;
    const infoPaths = ['/hakkimizda', '/iletisim', '/gizlilik-politikasi', '/kullanim-sartlari', '/cerez-politikasi', '/sss', '/topluluk-kurallari', '/site-haritasi'];
    return infoPaths.includes(p) ? p : null;
  });
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  useEffect(() => {
    localStorage.setItem('webox_lang', currentLanguage);
  }, [currentLanguage]);

  useEffect(() => {
    const handlePopState = () => {
      const p = window.location.pathname;
      const infoPaths = ['/hakkimizda', '/iletisim', '/gizlilik-politikasi', '/kullanim-sartlari', '/cerez-politikasi', '/sss', '/topluluk-kurallari', '/site-haritasi'];
      if (infoPaths.includes(p)) {
        setActivePath(p);
        setActiveToolId(null);
      } else {
        setActivePath(null);
        const params = new URLSearchParams(window.location.search);
        const tool = params.get('tool');
        setActiveToolId(tool);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const t: TranslationSet = TRANSLATIONS[currentLanguage];

  const handleLanguageChange = (lang: Language) => {
    setCurrentLanguage(lang);
  };

  const handleNavigate = (path: string | null) => {
    if (path === null) {
      window.history.pushState({}, '', '/');
      setActivePath(null);
      setActiveToolId(null);
    } else if (path.startsWith('/')) {
      window.history.pushState({}, '', path);
      setActivePath(path);
      setActiveToolId(null);
    } else {
      window.history.pushState({}, '', `/?tool=${path}`);
      setActivePath(null);
      setActiveToolId(path);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectTool = (id: string | null) => {
    handleNavigate(id);
  };

  // Maps custom tool ID back to respective React component
  const renderSelectedTool = () => {
    switch (activeToolId) {
      case 'doc-translator':
        return <DocTranslator currentLanguage={currentLanguage} />;
      case 'format-converter':
        return <FormatConverter currentLanguage={currentLanguage} />;
      case 'pdf-merge':
        return <PdfMerge currentLanguage={currentLanguage} />;
      case 'image-to-pdf':
        return <ImageToPdf currentLanguage={currentLanguage} />;
      case 'pdf-meta':
        return <PdfMeta currentLanguage={currentLanguage} />;
      case 'video-audio':
        return <AudioExtractor currentLanguage={currentLanguage} />;
      case 'media-cutter':
        return <MediaCutter currentLanguage={currentLanguage} />;
      case 'batch-resizer':
        return <BatchResizer currentLanguage={currentLanguage} />;
      case 'image-watermark':
        return <WatermarkAdder currentLanguage={currentLanguage} />;
      default:
        return null;
    }
  };

  const getToolIcon = (iconName: string) => {
    const props = { className: "w-5 h-5 text-neutral-800" };
    switch (iconName) {
      case 'Languages': return <Languages {...props} />;
      case 'RefreshCw': return <RefreshCw {...props} />;
      case 'FileStack': return <FileStack {...props} />;
      case 'ImageUp': return <ImageUp {...props} />;
      case 'ShieldAlert': return <ShieldAlert {...props} />;
      case 'ScissorsSquareDashedCard': return <Music {...props} />;
      case 'Sliders': return <Sliders {...props} />;
      case 'Grid': return <Grid {...props} />;
      case 'FilePen': return <FilePen {...props} />;
      default: return <FolderOpen {...props} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans transition-colors duration-300">
      
      {/* Sticky Top Header, Drawer sidebar list, and language switcher */}
      <Header
        currentLanguage={currentLanguage}
        onLanguageChange={handleLanguageChange}
        activeToolId={activeToolId}
        onSelectTool={handleSelectTool}
      />

      {/* Main Container Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-10">
        <AnimatePresence mode="wait">
          {activePath !== null ? (
            <motion.div
              key={activePath}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <InfoPages 
                pagePath={activePath} 
                onNavigate={handleNavigate} 
                currentLanguage={currentLanguage} 
              />
            </motion.div>
          ) : activeToolId === null ? (
            
            /* LANDING PAGE VIEW */
            <motion.div
              key="landing-page"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="space-y-20"
            >
              
              {/* Modern elegant Hero Segment */}
              <section id="hero-section" className="text-center max-w-3xl mx-auto space-y-6 pt-6 sm:pt-12">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-900 text-white rounded-full text-[11px] font-semibold tracking-wider font-mono shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {t.privacyBadge}
                </span>

                <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-neutral-900 leading-[1.1] font-sans">
                  {t.heroTitle}
                </h1>
                
                <p className="text-base sm:text-lg text-neutral-500 leading-relaxed max-w-2xl mx-auto">
                  {t.heroSubtitle}
                </p>

                <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                  <button
                    id="btn-hero-explore"
                    onClick={() => {
                      // Automatically triggers Drawer opens by guiding user. Let's open the first category tool!
                      handleSelectTool('doc-translator');
                    }}
                    className="bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all shadow flex items-center gap-2 group"
                  >
                    {t.exploreTools}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <a
                    href="#why-serverless"
                    className="border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 font-semibold text-sm px-6 py-3 rounded-xl transition-all flex items-center gap-1.5"
                  >
                    <HelpCircle className="w-4 h-4 text-neutral-400" />
                    {t.privacyTitle}
                  </a>
                </div>
              </section>

              {/* Informational Zero Server sandbox explanation segment */}
              <section id="why-serverless" className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-white p-8 sm:p-12 rounded-3xl border border-neutral-100 shadow-sm leading-relaxed scroll-mt-28">
                <div className="space-y-3 md:col-span-1 pr-0 md:pr-4">
                  <span className="text-xs font-bold text-neutral-400 font-mono tracking-wider uppercase">{t.brand} PHILOSOPHY</span>
                  <h3 className="text-2xl font-bold tracking-tight text-neutral-900">{t.privacyTitle}</h3>
                  <p className="text-sm text-neutral-500">{t.privacyDesc}</p>
                </div>

                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6 pl-0 md:pl-8 border-t md:border-t-0 md:border-l border-neutral-100 pt-8 md:pt-0">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-center text-neutral-800 shadow-sm font-semibold text-sm">
                      ⚡
                    </div>
                    <h4 className="text-base font-bold text-neutral-900 font-sans">{t.superSpeedTitle}</h4>
                    <p className="text-xs text-neutral-500 leading-relaxed">{t.superSpeedDesc}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-center text-neutral-800 shadow-sm font-semibold text-sm">
                      🔒
                    </div>
                    <h4 className="text-base font-bold text-neutral-900 font-sans">{t.privacyGuaranteeTitle}</h4>
                    <p className="text-xs text-neutral-500 leading-relaxed">{t.privacyGuaranteeDesc}</p>
                  </div>
                </div>
              </section>

              {/* Features interactive grid panel */}
              <section className="space-y-8">
                <div className="space-y-1 select-none">
                  <h3 className="text-xl font-bold text-neutral-900 tracking-tight">{t.exploreTools}</h3>
                  <p className="text-xs font-medium text-neutral-400 uppercase font-mono tracking-wider">İşlem yapmak istediğiniz aracı seçin</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {TOOLS_LIST.map((tool) => (
                    <div
                      key={tool.id}
                      id={`landing-tool-card-${tool.id}`}
                      onClick={() => handleSelectTool(tool.id)}
                      className="bg-white hover:bg-neutral-50/50 p-6 rounded-2xl border border-neutral-100 shadow-[0_1px_3px_0_rgba(0,0,0,0.01)] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between gap-5 group"
                    >
                      <div className="space-y-3">
                        <div className="p-3 bg-neutral-50 border border-neutral-100 rounded-xl inline-block group-hover:scale-105 transition-transform">
                          {getToolIcon(tool.iconName)}
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-sans font-bold text-base text-neutral-900 leading-tight">
                            {TRANSLATIONS[currentLanguage][tool.translationTitleKey]}
                          </h4>
                          <p className="text-xs text-neutral-500 leading-relaxed">
                            {TRANSLATIONS[currentLanguage][tool.translationDescKey]}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-neutral-50 text-[11px] font-semibold text-neutral-400 group-hover:text-neutral-900 transition-colors">
                        <span className="font-mono uppercase tracking-wider">{tool.category} utility</span>
                        <span className="flex items-center gap-1 font-sans">
                          {t.exploreTools.split(' ')[0]}
                          <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

            </motion.div>
          ) : (
            
            /* ACTIVE TOOL WORKSPACE VIEW WITH ANIMATED WRAPPERS */
            <motion.div
              key={activeToolId}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="space-y-6"
            >
              {/* Back to list dashboard navigator */}
              <div className="flex items-center justify-between select-none pb-2">
                <button
                  id="btn-back-to-landing"
                  onClick={() => handleSelectTool(null)}
                  className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 bg-white border border-neutral-200 hover:border-neutral-300 px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1 shadow-sm"
                >
                  ← {t.brand} Dashboard
                </button>

                <div className="flex items-center gap-1.5 text-[11px] font-mono font-medium text-emerald-600 bg-emerald-50 border border-emerald-100/50 px-3 py-1 rounded-full">
                  <CheckCircle className="w-3.5 h-3.5" />
                  {t.clientProcessingBadge.toUpperCase()}
                </div>
              </div>

              {/* Renders active sandbox tool */}
              {renderSelectedTool()}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Global minimal footer with clean lines and AdSense-compliant pages */}
      <footer className="bg-white border-t border-neutral-100 py-12 mt-20 select-none">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-8 space-y-8">
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-neutral-100 pb-8 text-neutral-500">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                W
              </div>
              <div>
                <span className="font-extrabold text-neutral-900 tracking-tight font-sans text-sm block">
                  {t.brand} Tools
                </span>
                <span className="text-[10px] text-neutral-400 font-mono tracking-wide uppercase">
                  Browser-Based File Utilities
                </span>
              </div>
            </div>

            {/* AdSense compliance pages list */}
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition-colors">
              <button 
                onClick={() => handleNavigate('/hakkimizda')} 
                className="hover:text-black hover:underline cursor-pointer transition-all"
              >
                Hakkımızda
              </button>
              <button 
                onClick={() => handleNavigate('/iletisim')} 
                className="hover:text-black hover:underline cursor-pointer transition-all"
              >
                İleletişim
              </button>
              <button 
                onClick={() => handleNavigate('/gizlilik-politikasi')} 
                className="hover:text-black hover:underline cursor-pointer transition-all font-bold text-neutral-900"
              >
                Gizlilik Politikası
              </button>
              <button 
                onClick={() => handleNavigate('/kullanim-sartlari')} 
                className="hover:text-black hover:underline cursor-pointer transition-all"
              >
                Kullanım Şartları
              </button>
              <button 
                onClick={() => handleNavigate('/cerez-politikasi')} 
                className="hover:text-black hover:underline cursor-pointer transition-all"
              >
                Çerez Politikası
              </button>
              <button 
                onClick={() => handleNavigate('/sss')} 
                className="hover:text-black hover:underline cursor-pointer transition-all"
              >
                S.S.S.
              </button>
              <button 
                onClick={() => handleNavigate('/topluluk-kurallari')} 
                className="hover:text-black hover:underline cursor-pointer transition-all"
              >
                Topluluk Kuralları
              </button>
              <button 
                onClick={() => handleNavigate('/site-haritasi')} 
                className="hover:text-black hover:underline cursor-pointer transition-all"
              >
                Site Haritası
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-neutral-400 font-sans">
            <div className="flex flex-wrap justify-center sm:justify-start gap-4 md:gap-6 font-medium text-neutral-400">
              <span className="hover:text-neutral-700 transition-colors">100% Client-Side Computing</span>
              <span className="hover:text-neutral-700 transition-colors">Zero Server Storage</span>
              <span className="hover:text-neutral-700 transition-colors">KVKK / GDPR Protection Compliant</span>
            </div>

            <div className="font-mono text-neutral-400 text-center sm:text-right">
              © 2026. Security Standard Compliant. Tüm hakları saklıdır.
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
