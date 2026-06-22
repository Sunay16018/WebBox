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
  FolderOpen,
  X,
  Sparkles
} from 'lucide-react';

import { Language, TranslationSet, TRANSLATIONS, TOOLS_LIST } from './types';
import Header from './components/Header';
import TextTranslation from './components/TextTranslation';
import DocumentTranslation from './components/DocumentTranslation';
import FormatConverter from './components/FormatConverter';
import PdfMerge from './components/PdfMerge';
import ImageToPdf from './components/ImageToPdf';
import PdfMeta from './components/PdfMeta';
import AudioExtractor from './components/AudioExtractor';
import MediaCutter from './components/MediaCutter';
import BatchResizer from './components/BatchResizer';
import WatermarkAdder from './components/WatermarkAdder';
import InfoPages from './components/InfoPages';
import AiPdfGenerator from './components/AiPdfGenerator';

const PATH_TO_TOOL_MAP: Record<string, string> = {
  '/metin-cevirici': 'text-translation',
  '/text-translation': 'text-translation',
  '/belge-cevirici': 'document-translation',
  '/document-translation': 'document-translation',
  '/doc-translator': 'document-translation',
  '/format-donusturucu': 'format-converter',
  '/format-converter': 'format-converter',
  '/pdf-birlestir': 'pdf-merge',
  '/pdf-merge': 'pdf-merge',
  '/resim-pdf': 'image-to-pdf',
  '/image-to-pdf': 'image-to-pdf',
  '/pdf-metadata': 'pdf-meta',
  '/pdf-meta': 'pdf-meta',
  '/video-ses-cikar': 'video-audio',
  '/video-audio': 'video-audio',
  '/medya-kesici': 'media-cutter',
  '/media-cutter': 'media-cutter',
  '/toplu-resim-boyutlandir': 'batch-resizer',
  '/batch-resizer': 'batch-resizer',
  '/resim-filigran': 'image-watermark',
  '/image-watermark': 'image-watermark',
  '/yapay-zeka-pdf': 'ai-pdf-generator',
  '/ai-pdf-generator': 'ai-pdf-generator',
  '/ai-pdf': 'ai-pdf-generator',
};

const TOOL_TO_PATH_MAP: Record<string, string> = {
  'text-translation': '/metin-cevirici',
  'document-translation': '/belge-cevirici',
  'format-converter': '/format-donusturucu',
  'pdf-merge': '/pdf-birlestir',
  'image-to-pdf': '/resim-pdf',
  'pdf-meta': '/pdf-metadata',
  'video-audio': '/video-ses-cikar',
  'media-cutter': '/medya-kesici',
  'batch-resizer': '/toplu-resim-boyutlandir',
  'image-watermark': '/resim-filigran',
  'ai-pdf-generator': '/yapay-zeka-pdf',
};

export default function App() {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('webox_lang') || localStorage.getItem('webbox_lang');
    return (saved as Language) || 'TR';
  });

  const [activeToolId, setActiveToolId] = useState<string | null>(() => {
    let p = window.location.pathname;
    
    // Parse query params or hash fallbacks for seamless URL redirection to avoid 404s
    const params = new URLSearchParams(window.location.search);
    const queryP = params.get('p') || params.get('path');
    const hash = window.location.hash;
    
    if (queryP) {
      p = queryP;
    } else if (hash && hash.startsWith('#/')) {
      p = hash.substring(1);
    } else if (hash && hash.startsWith('#') && !hash.includes('/')) {
      p = '/' + hash.substring(1);
    }

    if (PATH_TO_TOOL_MAP[p]) {
      if (window.location.pathname !== p) {
        window.history.replaceState({}, '', p);
      }
      return PATH_TO_TOOL_MAP[p];
    }
    
    const queryTool = params.get('tool');
    if (queryTool) {
      const toolId = queryTool === 'doc-translator' ? 'document-translation' : queryTool;
      const targetPath = TOOL_TO_PATH_MAP[toolId];
      if (targetPath && window.location.pathname !== targetPath) {
        window.history.replaceState({}, '', targetPath);
      }
      return toolId;
    }
    return null;
  });

  const [activePath, setActivePath] = useState<string | null>(() => {
    let p = window.location.pathname;
    
    // Parse query params or hash fallbacks for seamless URL redirection to avoid 404s
    const params = new URLSearchParams(window.location.search);
    const queryP = params.get('p') || params.get('path');
    const hash = window.location.hash;
    
    if (queryP) {
      p = queryP;
    } else if (hash && hash.startsWith('#/')) {
      p = hash.substring(1);
    } else if (hash && hash.startsWith('#') && !hash.includes('/')) {
      p = '/' + hash.substring(1);
    }

    const infoPaths = ['/hakkimizda', '/iletisim', '/gizlilik-politikasi', '/kullanim-sartlari', '/cerez-politikasi', '/sss', '/topluluk-kurallari', '/site-haritasi'];
    if (infoPaths.includes(p)) {
      if (window.location.pathname !== p) {
        window.history.replaceState({}, '', p);
      }
      return p;
    }
    return null;
  });
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // PWA Installation states & hooks
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPwaHelpModal, setShowPwaHelpModal] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      console.log('beforeinstallprompt registered inside WeBox core engine.');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallAppClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      try {
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User prompt outcome: ${outcome}`);
      } catch (err) {
        console.error('Error triggered during user Choice:', err);
      }
      setDeferredPrompt(null);
    } else {
      // Prompt not supported natively (e.g. iOS or cached state) -> Show awesome helpful detailed modal
      setShowPwaHelpModal(true);
    }
  };

  // Dynamic Title and SEO Meta Description management for Google Indexing & AdSense Approval
  useEffect(() => {
    let title = "WeBox - Tamamen Tarayıcıda Çevrimdışı Dosya & Medya Araç Kutusu";
    let desc = "WeBox ile PDF birleştirme, belge çeviri, format dönüştürme ve görsel boyutlandırma gibi tüm işlemlerinizi dosyalarınızı sunucuya yüklemeden %100 güvenli yapın.";

    if (activePath) {
      switch (activePath) {
        case '/hakkimizda':
          title = "WeBox Hakkımızda | Güvenli ve Çevrimdışı Dosya Çözümleri";
          desc = "WeBox nedir, geliştirilme amacı nedir? Dosyalarınızı uzak bir sunucuya göndermeden tamamen tarayıcı üzerinde nasıl işlediğimizi keşfedin.";
          break;
        case '/iletisim':
          title = "WeBox İletişim | Sorularınız ve Destek Talepleri";
          desc = "WeBox geliştirici ekibi ve kurucusu ile iletişime geçin. webox.info@proton.me aktif e-posta adresi ve güvenli iletişim formumuz.";
          break;
        case '/gizlilik-politikasi':
          title = "Gizlilik Politikası (Privacy Policy) | WeBox Resmi Sözleşmesi";
          desc = "Google AdSense ve KVKK uyumlu gizlilik politikamız. Tamamen client-side işlem yapılan sitemizde hangi çerezlerin ve logların tutulduğunu öğrenin.";
          break;
        case '/kullanim-sartlari':
          title = "Kullanım Şartları (Terms of Service) | WeBox Kullanım Sözleşmesi";
          desc = "WeBox ücretsiz çevrimdışı dosya araçları ve lisans kullanım şartları. Sorumluluk reddi ve telif ihlalleri hakkında bilgilendirme.";
          break;
        case '/cerez-politikasi':
          title = "Çerez Politikası (Cookie Policy) | WeBox AdSense Çerez Bildirimi";
          desc = "WeBox sitesinde kullanılan reklam, Google Analytics ve dil çerezleri hakkında detaylı bilgi. Çerez engelleme ve ayar detayları.";
          break;
        case '/sss':
          title = "Sıkça Sorulan Sorular | S.S.S. | WeBox Hakkında Bilgiler";
          desc = "WeBox güvenilir mi? Ücretsiz mi? Dosya boyutu sınırı var mı? WeBox hakkında en çok sorulan tüm soruların detaylı yanıtları.";
          break;
        case '/topluluk-kurallari':
          title = "Topluluk Kuralları | WeBox Etik ve Saygı Standartları";
          desc = "WeBox platformu üzerinde geçerli olan küfür, hile ve haksız kullanım yasaklarını içeren etik kurallar bildirgesi.";
          break;
        case '/site-haritasi':
          title = "Site Haritası (Sitemap) | WeBox Tüm Araçlar ve Sayfalar";
          desc = "WeBox platformundaki tüm ücretsiz PDF, belge, video ve resim araçlarının, ayrıca yasal sayfaların hiyerarşik dizini.";
          break;
      }
    } else if (activeToolId) {
      switch (activeToolId) {
        case 'text-translation':
          title = "Metin Çevirici | WeBox Güvenli ve Çevrimdışı Metin Çevirisi";
          desc = "Hızlı ve doğru metin çevirici ile yazılarınızı saniyeler içinde farklı dillere güvenle ve tamamen çevrimdışı (offline) çevirin.";
          break;
        case 'document-translation':
        case 'doc-translator':
          title = "Belge Dil Çevirici | WeBox Yerel PDF ve Belge Çevirisi";
          desc = "Tarayıcı tabanlı güvenli belge çevirici ile PDF, HTML, JSON ve metin dosyalarınızı saniyeler içinde farklı dillere tamamen çevrimdışı çevirin.";
          break;
        case 'format-converter':
          title = "Evrensel Format Dönüştürücü | WeBox Ses, Görsel & PDF Dönüştür";
          desc = "Resimlerinizi (PNG, JPG, WebP), ses dosyalarınızı ve belgelerinizi sunucuya yüklemeden dilediğiniz formata güvenle dönüştürün.";
          break;
        case 'pdf-merge':
          title = "PDF Birleştirici | WeBox Çoklu PDF Dosyası Birleştirme";
          desc = "İki veya daha fazla PDF belgesini tamamen yerel tarayıcı belleğinde bir araya getirin. En güvenli, sınırsız ve hızlı PDF birleştirme aracı.";
          break;
        case 'image-to-pdf':
          title = "Resimden PDF Yapıcı | WeBox PNG/JPG Dosyalarını PDF'e Çevir";
          desc = "Toplu resimleri sürükleyip bırakarak şık bir PDF albümü oluşturun. Görsellerinizi tarayıcınızda anında PDF belgesine dönüştürün.";
          break;
        case 'pdf-meta':
          title = "PDF Metadata Düzenleyici | WeBox PDF Bilgilerini Güncelle";
          desc = "PDF dosyalarınızın yazar, başlık, anahtar kelime, şifreleme ve güvenlik ayarlarını tamamen çevrimdışı olarak düzenleyin.";
          break;
        case 'video-audio':
          title = "Videodan Ses Çıkarıcı | WeBox MP4'ten MP3 Yapıcı";
          desc = "Herhangi bir videonun arkasındaki müzik veya ses kaydını yüksek kalitede MP3/AAC olarak yerel olarak ayrıştırın ve indirin.";
          break;
        case 'media-cutter':
          title = "Ses ve Video Kırpıcı | WeBox Hassas Medya Kesici";
          desc = "Büyük video ve ses dosyalarınızdan dilediğiniz saniye aralığını tamamen sunucusuz ve son derece hızlı bir şekilde kesip kaydedin.";
          break;
        case 'batch-resizer':
          title = "Toplu Resim Yeniden Boyutlandırıcı | WeBox Görsel Küçültücü";
          desc = "Birden fazla görseli piksel veya yüzde bazında toplu olarak yeniden boyutlandırın, kalitesini ayarlayın ve ZIP olarak yerel indirin.";
          break;
        case 'image-watermark':
          title = "Resime Filigran Ekleme | WeBox Görsel Koruma & Resim Logo";
          desc = "Görsellerinizin üzerine metin veya logo şeklinde filigran ekleyerek telif hakkınızı koruyun. Tamamen tarayıcı üzerinde yüksek hızlı işlem.";
          break;
      }
    }

    document.title = title;
    
    // Dynamically update or create meta description for Google indexers
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', desc);
  }, [activePath, activeToolId]);

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
      } else if (PATH_TO_TOOL_MAP[p]) {
        setActivePath(null);
        setActiveToolId(PATH_TO_TOOL_MAP[p]);
      } else {
        setActivePath(null);
        const params = new URLSearchParams(window.location.search);
        let tool = params.get('tool');
        if (tool === 'doc-translator') tool = 'document-translation';
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
      const targetPath = TOOL_TO_PATH_MAP[path];
      if (targetPath) {
        window.history.pushState({}, '', targetPath);
      } else {
        window.history.pushState({}, '', `/?tool=${path}`);
      }
      setActivePath(null);
      setActiveToolId(path === 'doc-translator' ? 'document-translation' : path);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectTool = (id: string | null) => {
    handleNavigate(id);
  };

  // Maps custom tool ID back to respective React component
  const renderSelectedTool = () => {
    switch (activeToolId) {
      case 'ai-pdf-generator':
        return <AiPdfGenerator currentLanguage={currentLanguage} />;
      case 'text-translation':
        return <TextTranslation currentLanguage={currentLanguage} />;
      case 'document-translation':
        return <DocumentTranslation currentLanguage={currentLanguage} />;
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
      case 'Sparkles': return <Sparkles {...props} className="w-5 h-5 text-purple-600 animate-pulse" />;
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

  const getToolTitleForCard = (tool: any, lang: Language) => {
    if (tool.id === 'ai-pdf-generator') {
      switch (lang) {
        case 'TR': return 'AI ile PDF Oluştur';
        case 'AZ': return 'AI ilə PDF Yarat';
        default: return 'Generate PDF with AI';
      }
    }
    return TRANSLATIONS[lang]?.[tool.translationTitleKey as any] || '';
  };

  const getToolDescForCard = (tool: any, lang: Language) => {
    if (tool.id === 'ai-pdf-generator') {
      switch (lang) {
        case 'TR': return 'gpt-oss-120b en hızlı yapay zeka ve görseller ile profesyonel PDF kitapçıkları hazırlayın.';
        case 'AZ': return 'gpt-oss-120b sürətli süni zəkası və internet şəkilləri ilə peşəkar PDF sənədlər hazırlayın.';
        default: return 'Generate custom, visual multi-page PDFs using super-fast gpt-oss-120b and web images.';
      }
    }
    return TRANSLATIONS[lang]?.[tool.translationDescKey as any] || '';
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans transition-colors duration-300">
      
      {/* Sticky Top Header, Drawer sidebar list, and language switcher */}
      <Header
        currentLanguage={currentLanguage}
        onLanguageChange={handleLanguageChange}
        activeToolId={activeToolId}
        onSelectTool={handleSelectTool}
        onInstallClick={handleInstallAppClick}
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
                      handleSelectTool('document-translation');
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
                      className="bg-white hover:bg-neutral-50/50 p-6 rounded-2xl border border-neutral-100 shadow-[0_1px_3px_0_rgba(0,0,0,0.01)] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between gap-5 group animate-fade-in"
                    >
                      <div className="space-y-3">
                        <div className="p-3 bg-neutral-50 border border-neutral-100 rounded-xl inline-block group-hover:scale-105 transition-transform flex items-center justify-center">
                          {getToolIcon(tool.iconName)}
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-sans font-bold text-base text-neutral-900 leading-tight">
                            {getToolTitleForCard(tool, currentLanguage)}
                          </h4>
                          <p className="text-xs text-neutral-500 leading-relaxed">
                            {getToolDescForCard(tool, currentLanguage)}
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

      {/* PWA Fallback Instruction Modal */}
      <AnimatePresence>
        {showPwaHelpModal && (
          <motion.div
            id="pwa-help-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white border border-neutral-100 max-w-md w-full rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
                <div>
                  <h3 className="font-sans font-bold text-lg text-neutral-900">
                    {currentLanguage === 'TR' ? '📱 weBox Ana Ekrana Ekle' : currentLanguage === 'AZ' ? '📱 weBox Əsas Ekrana Əlavə Et' : '📱 Install weBox'}
                  </h3>
                  <p className="text-xs text-neutral-500 font-sans mt-1">
                    {currentLanguage === 'TR' ? 'Her zaman aktif, çevrimdışı ve uygulama gibi çalışır!' : currentLanguage === 'AZ' ? 'Həmişə aktiv, oflayn və proqram kimi işləyir!' : 'Always active, offline & works just like a native app!'}
                  </p>
                </div>
                <button
                  onClick={() => setShowPwaHelpModal(false)}
                  className="p-1.5 hover:bg-neutral-50 active:bg-neutral-100 rounded-lg transition-colors border border-transparent hover:border-neutral-200"
                >
                  <X className="w-4 h-4 text-neutral-500" />
                </button>
              </div>

              <div className="p-6 space-y-6 font-sans text-sm text-neutral-700 max-h-[70vh] overflow-y-auto">
                {/* iOS Instructions */}
                <div className="space-y-3">
                  <h4 className="font-bold text-neutral-900 flex items-center gap-2">
                    🍎 Apple iOS (iPhone/iPad)
                  </h4>
                  <ul className="space-y-2 text-xs text-neutral-600 pl-4 list-decimal leading-relaxed">
                    <li>
                      {currentLanguage === 'TR' 
                        ? 'Safari tarayıcısında ekranın altındaki Paylaş butonuna dokunun.' 
                        : currentLanguage === 'AZ' 
                          ? 'Safari brauzerində ekranın aşağısındakı Paylaş düyməsinə toxunun.' 
                          : 'Tap the Share button at the bottom of the screen in Safari.'}
                    </li>
                    <li>
                      {currentLanguage === 'TR' 
                        ? 'Açılan seçeneklerden aşağı kaydırıp Ana Ekrana Ekle seçeneğini bulun.' 
                        : currentLanguage === 'AZ' 
                          ? 'Açılan seçimlərdən aşağı düşərək Əsas Ekrana Əlavə Et seçimini tapın.' 
                          : 'Scroll down and select Add to Home Screen.'}
                    </li>
                    <li>
                      {currentLanguage === 'TR'
                        ? 'Ekle butonuna basarak weBox uygulamasını telefonunuza kurun.'
                        : currentLanguage === 'AZ'
                          ? 'Əlavə Et düyməsinə klikləyərək weBox proqramını quraşdırın.'
                          : 'Confirm by pressing Add to install weBox to your device.'}
                    </li>
                  </ul>
                </div>

                {/* Android & Desktop Chrome */}
                <div className="space-y-3 border-t border-neutral-100 pt-5">
                  <h4 className="font-bold text-neutral-900 flex items-center gap-2">
                    🤖 Android & Desktop (Chrome / Edge)
                  </h4>
                  <ul className="space-y-2 text-xs text-neutral-600 pl-4 list-decimal leading-relaxed">
                    <li>
                      {currentLanguage === 'TR'
                        ? 'Adres çubuğu veya tarayıcınızın sağ üstündeki 3 noktaya (...) dokunun.'
                        : currentLanguage === 'AZ'
                          ? 'Ünvan sətri və ya brauzerinizin sağ üstündəki 3 nöqtəyə (...) toxunun.'
                          : 'Tap the three-dots menu (...) in Chrome or Edge.'}
                    </li>
                    <li>
                      {currentLanguage === 'TR'
                        ? '"Uygulamayı yükle" ya da "Ana ekrana ekle" seçeneğini seçin.'
                        : currentLanguage === 'AZ'
                          ? '"Proqramı quraşdır" və ya "Əsas ekrana əlavə et" seçimini edin.'
                          : 'Select "Install app" or "Add to Home Screen".'}
                    </li>
                    <li>
                      {currentLanguage === 'TR'
                        ? 'Çıkan pencerede onaylayarak yüklemeyi tamamlayın.'
                        : currentLanguage === 'AZ'
                          ? 'Ekrana çıxan pəncərədə təsdiqləyərək quraşdırmanı tamamlayın.'
                          : 'Confirm the installation in the pop-up.'}
                    </li>
                  </ul>
                </div>
              </div>

              <div className="p-4 bg-neutral-50 border-t border-neutral-100 flex items-center justify-end">
                <button
                  onClick={() => setShowPwaHelpModal(false)}
                  className="px-4 py-2 bg-neutral-900 text-white hover:bg-neutral-800 text-xs font-semibold rounded-lg transition-colors"
                >
                  {currentLanguage === 'TR' ? 'Tamam' : currentLanguage === 'AZ' ? 'Anladım' : 'Got it'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
