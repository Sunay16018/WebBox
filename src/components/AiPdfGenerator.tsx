import React, { useState, useEffect } from 'react';
import { Sparkles, FileText, Download, Languages, AlertCircle, RefreshCw, Layers, CheckCircle, HelpCircle, ArrowRight } from 'lucide-react';
import { Language, TranslationSet, TRANSLATIONS } from '../types';

interface AiPdfGeneratorProps {
  currentLanguage: Language;
}

// Visual prompt templates to inspire users and make testing incredibly easy and fluid
const SUGGESTIONS = [
  { tr: "Mars Keşfi ve Geleceği", en: "Mars Exploration and Future", az: "Mars Kəşfi və Gələcəyi" },
  { tr: "Yapay Zeka ve Eğitim", en: "AI in Modern Education", az: "Süni İntellekt və Təhsil" },
  { tr: "Kuantum Fiziğine Giriş", en: "Introduction to Quantum Physics", az: "Kvant Fizikasına Giriş" },
  { tr: "Sağlıklı Akdeniz Diyeti", en: "Healthy Mediterranean Diet", az: "Sağlam Aralıq Dənizi Pəhrizi" },
];

export default function AiPdfGenerator({ currentLanguage }: AiPdfGeneratorProps) {
  const t: TranslationSet = TRANSLATIONS[currentLanguage];

  // Component local states
  const [prompt, setPrompt] = useState('');
  const [pdfLang, setPdfLang] = useState('Turkish');
  const [pageCount, setPageCount] = useState(3);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [remainingLimit, setRemainingLimit] = useState(5);
  const [generatedPdfBase64, setGeneratedPdfBase64] = useState('');
  const [pdfBlobUrl, setPdfBlobUrl] = useState('');
  const [contentStructure, setContentStructure] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [clientFingerprint, setClientFingerprint] = useState('');
  const [activePreviewPageIdx, setActivePreviewPageIdx] = useState<number>(0);

  // Auto trigger download and blob formulation on base64 change
  useEffect(() => {
    if (generatedPdfBase64) {
      try {
        setActivePreviewPageIdx(0); // Reset page visualizer to cover page
        const byteCharacters = atob(generatedPdfBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setPdfBlobUrl(url);

        // Immediate automatic download trigger
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        const titleSlug = (contentStructure?.title || prompt || 'webox-ai-booklet')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .substring(0, 40);
        downloadLink.download = `webox-ai-${titleSlug || 'document'}.pdf`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      } catch (err) {
        console.error('Failed to auto-download PDF:', err);
      }
    } else {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
      setPdfBlobUrl('');
    }
  }, [generatedPdfBase64]);

  // 1. Compute Browser Fingerprint on Mount and load user limits quota
  useEffect(() => {
    // Generate persistent UUID for storage
    let userUuid = localStorage.getItem('webox_client_uuid');
    if (!userUuid) {
      userUuid = 'wuid-' + Math.random().toString(36).substring(2, 15) + '-' + Date.now();
      localStorage.setItem('webox_client_uuid', userUuid);
    }

    // Build unique hardware/browser fingerprint combination details
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl');
    const screenStr = `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`;
    const renderer = gl ? (gl.getParameter(gl.RENDERER) || '') : '';
    const tzStr = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const coreStr = navigator.hardwareConcurrency ? String(navigator.hardwareConcurrency) : '1';
    
    // Joint client identifier hash key
    const rawFingerprint = `uuid:${userUuid}-scr:${screenStr}-gl:${renderer}-tz:${tzStr}-cores:${coreStr}`;
    setClientFingerprint(rawFingerprint);

    // Dynamic initial load fetch count
    checkLimitQuota(rawFingerprint);
  }, []);

  // Fetch current remainings from database on server
  const checkLimitQuota = async (fingerprint: string) => {
    try {
      const response = await fetch('/api/ai-pdf-limit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fingerprint })
      });
      if (response.ok) {
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await response.json();
          setRemainingLimit(data.remaining);
        }
      }
    } catch (e) {
      console.error('Error fetching rate limits:', e);
    }
  };

  // 2. Click submit generator function
  const handleGeneratePdf = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setErrorMessage(null);
    setGeneratedPdfBase64('');
    setContentStructure(null);

    // Animate through logical assembly steps to keep user engaged dynamically
    const steps = [
      "WeBox AI sistemi hazırlanıyor...",
      "Gemini yapay zekası döküman içeriğini planlıyor...",
      "Sayfa başlıkları ve akademik fihrist oluşturuluyor...",
      "İnternetten telifsiz en göze hitap eden görseller sorgulanıyor...",
      "Vikipedi Commons ve stok kütüphanesinden döküman görselleri indiriliyor...",
      "Görseller işlenip pikseller PDF katmanlarına gömülüyor...",
      "Sayfa numaraları, başlıklar ve Swiss dizayn marjları çiziliyor...",
      "PDF dökümanı son kontrollerden geçirilip paketleniyor..."
    ];

    let currentStepIdx = 0;
    setProgressMsg(steps[0]);

    const statusInterval = setInterval(() => {
      if (currentStepIdx < steps.length - 1) {
        currentStepIdx++;
        setProgressMsg(steps[currentStepIdx]);
      }
    }, 4000);

    try {
      const response = await fetch('/api/generate-ai-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          language: pdfLang,
          pageCount: pageCount,
          fingerprint: clientFingerprint
        })
      });

      clearInterval(statusInterval);

      const contentType = response.headers.get('content-type') || '';
      let resData: any = {};
      if (contentType.includes('application/json')) {
        resData = await response.json();
      } else {
        throw new Error(
          currentLanguage === 'TR'
            ? 'Sunucudan beklenmeyen bir yanıt alındı. Sunucu şu an güncelleniyor veya yeniden başlatılıyor olabilir. Lütfen 5-10 saniye bekleyip tekrar deneyiniz.'
            : currentLanguage === 'AZ'
              ? 'Serverdən gözlənilməz cavab alındı. Server hazırda yenidən başladılır ola bilər. Zəhmət olmasa 5-10 saniyə gözləyib yenidən cəhd edin.'
              : 'Unexpected response from the server. The server might be restarting or updating. Please wait 5-10 seconds and try again.'
        );
      }

      if (response.ok) {
        setGeneratedPdfBase64(resData.fileBase64);
        setContentStructure(resData.contentStructure);
        setRemainingLimit(resData.remaining);
        setProgressMsg('Tamamlandı!');
      } else {
        throw new Error(resData.error || 'Döküman derlenirken bir sunucu hatası oluşdu.');
      }
    } catch (err: any) {
      clearInterval(statusInterval);
      setErrorMessage(err.message || 'Bir ağ bağlantı hatası oluştu. Lütfen sunucu ayarlarını ve internet bağlantınızı kontrol edin.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Custom visual language helper strings
  const getUiString = (key: string) => {
    const isTr = currentLanguage === 'TR';
    const isAz = currentLanguage === 'AZ';

    const UI_TRANSLATIONS: Record<string, any> = {
      title: { TR: 'AI ile PDF Oluştur', EN: 'Generate PDF with AI', AZ: 'AI ilə PDF Yarat' },
      subtitle: { TR: 'Gelişmiş yapay zeka ve internet görselleriyle anında dikey PDF albümü tasarlayın.', EN: 'Instantly design professional custom booklets using advanced AI and thematic web images.', AZ: 'Ən son süni zəkası və internet şəkilləriylə saniyələr içində PDF sənəd hazırlayın.' },
      promptLabel: { TR: 'PDF Konusu veya Detaylı Açıklama', EN: 'PDF Subject or Detailed Prompt Description', AZ: 'PDF Mövzusu və ya Ətraflı Təsvir' },
      placeholder: { TR: 'Örneğin: "Yenilenebilir Enerji Kaynakları", "Osmanlı İmparatorluğu Tarihi", "Kripto Paralar ve Geleceği"', EN: 'E.g., "History of Space Travel", "Introduction to Cyber Security", "Organic Farming Guide"', AZ: 'Məsələn: "Azərbaycanın Tarixi Abidələri" və ya "Süni İntellekt və Gələcək"' },
      langLabel: { TR: 'PDF Yazım Dili', EN: 'PDF Document Language', AZ: 'PDF Yazı Dili' },
      pagesLabel: { TR: 'Sayfa Sayısı (Kapak Hariç)', EN: 'Number of Pages (Excl. Cover)', AZ: 'Səhifə Sayı (Qapaq Xaric)' },
      generateBtn: { TR: 'Yapay Zeka PDF Oluştur', EN: 'Generate AI PDF Booklet', AZ: 'Süni İntellektli PDF Yarat' },
      limitLabel: { TR: 'Günlük Kalan Hak:', EN: 'Usage Remaining Today:', AZ: 'Günlük Qalan Limit:' },
      cooldownTitle: { TR: 'Günlük PDF Limitiniz Doldu', EN: 'Daily PDF Limit Reached', AZ: 'Günlük PDF Limitiniz Bitdi' },
      cooldownDesc: { TR: 'WeBox sisteminde her cihaz günde en fazla 5 adet yapay zeka dökümanı üretebilir. Aynı WiFi ağı üzerindeki farklı bir bilgisayardan veya cep telefonundan hemen yeni dökümanlarınızı üretmeye devam edebilirsiniz.', EN: 'To maintain high speed performance, each device has a limit of 5 PDFs/day. You can instantly create more PDFs using another device on your same Wi-Fi connection.', AZ: 'Sürətli performansı qorumaq üçün hər cihaz gündə 5 PDF sənədi yarada bilər. Eyni WiFi şəbəkəsindəki başqa mobil telefondan dərhal yeni sənədlər hazırlaya bilərsiniz.' },
      suqqHeadline: { TR: 'Hızlı İlham Alın:', EN: 'Get Inspired Instantly:', AZ: 'Sürətli Mövzular:' },
      creationTitle: { TR: 'Döküman Başarıyla Üretildi! 🎉', EN: 'Document Beautifully Generated! 🎉', AZ: 'Sənəd Müvəffəqiyyətlə Yaradıldı! 🎉' },
      structureTitle: { TR: 'Kitapçık Fihrist Özeti:', EN: 'Booklet Chapter Index Details:', AZ: 'Kitabça Səhifə Xülasəsi:' },
      downloadBtn: { TR: 'Dökümanı Bilgisayara İndir (.pdf)', EN: 'Download PDF Document (.pdf)', AZ: 'Sənədi Kompüterə Yüklə (.pdf)' },
      resetBtn: { TR: 'Yeni PDF Tasarla', EN: 'Create Another Booklet', AZ: 'Yeni PDF Dizayn Et' }
    };

    return UI_TRANSLATIONS[key]?.[currentLanguage] || UI_TRANSLATIONS[key]?.['EN'] || '';
  };

  // Download logic for compiled PDF bytes array
  const handleDownloadPdfFile = () => {
    if (!pdfBlobUrl) return;
    const downloadLink = document.createElement('a');
    downloadLink.href = pdfBlobUrl;
    // Slugify title for filesave
    const titleSlug = (contentStructure?.title || prompt || 'webox-ai-booklet')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .substring(0, 40);
    downloadLink.download = `webox-ai-${titleSlug || 'document'}.pdf`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  // Supported PDF languages for generation (OpenAI/Cerebras can write in any of these natively)
  const OPTION_LANGUAGES = [
    { value: 'Turkish', title: 'Türkçe (Turkish)' },
    { value: 'Azerbaijani', title: 'Azərbaycanca (Azerbaijani)' },
    { value: 'English', title: 'English (English)' },
    { value: 'Spanish', title: 'Español (Spanish)' },
    { value: 'German', title: 'Deutsch (German)' },
    { value: 'French', title: 'Français (French)' },
    { value: 'Russian', title: 'Русский (Russian)' },
    { value: 'Arabic', title: 'العربية (Arabic)' }
  ];

  return (
    <div className="bg-white rounded-2xl border border-neutral-100 p-6 sm:p-8 shadow-[0_1px_3px_rgb(0,0,0,0.02)] max-w-4xl mx-auto space-y-8 animate-fade-in" id="webox-ai-pdf-generator-area">
      {/* Dynamic badge section headers */}
      <div className="space-y-2 border-b border-neutral-100 pb-5">
        <div className="flex flex-wrap items-center gap-2 select-none">
          <span className="text-[10px] font-extrabold uppercase bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full font-mono tracking-wider flex items-center gap-1 border border-indigo-100">
            <Sparkles className="w-3 h-3 text-indigo-600 animate-pulse animate-duration-1000" />
            CEREBRAS INFERENCE ENGINE
          </span>
          <span className="text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-mono tracking-wider border border-emerald-100">
            SWISS PDF FORMAT
          </span>
        </div>
        <h2 className="text-2xl font-black text-neutral-900 tracking-tight">{getUiString('title')}</h2>
        <p className="text-sm text-neutral-500 max-w-2xl leading-relaxed">{getUiString('subtitle')}</p>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-xs font-semibold text-red-800 flex items-start gap-3 shadow-sm font-sans">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Bir Sorun Oluştu / Warning</p>
            <p className="font-medium leading-relaxed">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* RENDER SUCCESS VIEW */}
      {generatedPdfBase64 ? (
        <div className="space-y-6 animate-scale-up" id="pdf-generation-success-workspace">
          <div className="p-6 bg-neutral-900 text-white rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-md border border-neutral-800">
            <div className="space-y-2">
              <h3 className="text-lg font-bold tracking-tight">{getUiString('creationTitle')}</h3>
              <p className="text-neutral-400 text-xs font-medium uppercase font-mono tracking-wide leading-relaxed">
                {contentStructure?.title || 'WEBOX GENERATED PDF'}
              </p>
              {contentStructure?.subtitle && (
                <p className="text-neutral-300 text-xs italic font-serif">
                  "{contentStructure.subtitle}"
                </p>
              )}
            </div>

            <button
              onClick={handleDownloadPdfFile}
              className="w-full md:w-auto px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 font-bold text-sm tracking-tight text-white rounded-xl shadow-lg shadow-emerald-900/10 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              {getUiString('downloadBtn')}
            </button>
          </div>

          {/* WeBox AI Live Document Book Simulator (Mobile-friendly Flawless Previewer) */}
          {contentStructure?.pages && (
            <div className="space-y-4 border border-neutral-200/60 p-5 sm:p-6 rounded-2xl bg-white shadow-sm" id="webox-live-document-book-simulator">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-neutral-100 pb-4">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                    <FileText className="w-5 h-5 animate-pulse" />
                  </span>
                  <div className="text-left">
                    <h4 className="text-sm font-black text-neutral-850 tracking-tight font-sans">
                      {currentLanguage === 'TR' ? '📖 Canlı Yapay Zeka Belge Okuyucu & Simülatör' : currentLanguage === 'AZ' ? '📖 Canlı Süni İntellekt Sənəd Oxuyucusu' : '📖 Live AI Document Reader & Book Simulator'}
                    </h4>
                    <p className="text-[10px] sm:text-xs text-neutral-400 font-sans">
                      {currentLanguage === 'TR' ? 'Yapay zekanın çıkardığı orijinal dökümanı sayfa sayfa visual olarak inceleyin:' : currentLanguage === 'AZ' ? 'Süni intellektin hazırladığı orijinal sənədi səhifə-səhifə oxuyun:' : 'Explore the full booklet page-by-page as designed:'}
                    </p>
                  </div>
                </div>

                {/* Page Selector Tabs */}
                <div className="flex flex-wrap gap-1 bg-neutral-100 p-1 rounded-xl">
                  <button
                    onClick={() => setActivePreviewPageIdx(0)}
                    className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                      activePreviewPageIdx === 0
                        ? 'bg-neutral-900 text-white shadow-sm'
                        : 'text-neutral-500 hover:text-neutral-800'
                    }`}
                  >
                    {currentLanguage === 'TR' ? 'Kapak' : currentLanguage === 'AZ' ? 'Qapaq' : 'Cover'}
                  </button>
                  {contentStructure.pages.map((_: any, pIdx: number) => (
                    <button
                      key={pIdx}
                      onClick={() => setActivePreviewPageIdx(pIdx + 1)}
                      className={`px-2.5 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                        activePreviewPageIdx === pIdx + 1
                          ? 'bg-neutral-900 text-white shadow-sm'
                          : 'text-neutral-500 hover:text-neutral-800'
                      }`}
                    >
                      {pIdx + 1}
                    </button>
                  ))}
                </div>
              </div>

              {/* Physical Document Book Canvas */}
              <div className="bg-neutral-50 border border-neutral-200/50 rounded-2xl p-4 sm:p-8 min-h-[440px] flex flex-col justify-between shadow-inner relative overflow-hidden text-left">
                
                {/* Visual binder spiral line for notebook aesthetics */}
                <div className="absolute top-0 bottom-0 left-[20px] sm:left-[35px] w-0.5 border-r border-neutral-200/60 border-dashed z-10" />

                <div className="pl-6 sm:pl-12 space-y-5">
                  {activePreviewPageIdx === 0 ? (
                    /* RENDER COVER PAGE */
                    <div className="space-y-6 py-4 font-sans animate-fade-in text-center">
                      <div className="border border-neutral-300 rounded-xl p-6 sm:p-10 space-y-8 bg-white min-h-[340px] flex flex-col justify-between shadow-sm relative overflow-hidden leading-tight">
                        
                        {/* Elegant minimalist corners */}
                        <div className="absolute top-3 left-3 w-4 h-4 border-t border-l border-neutral-200" />
                        <div className="absolute top-3 right-3 w-4 h-4 border-t border-r border-neutral-200" />
                        <div className="absolute bottom-3 left-3 w-4 h-4 border-b border-l border-neutral-200" />
                        <div className="absolute bottom-3 right-3 w-4 h-4 border-b border-r border-neutral-200" />

                        <div className="space-y-4 pt-4">
                          <span className="text-[9px] font-mono font-bold tracking-widest text-neutral-400 uppercase bg-neutral-50 px-2.5 py-0.5 border border-neutral-100 rounded">
                            WEBOX ORIGINAL DOCUMENT
                          </span>
                          <h3 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight leading-tight uppercase max-w-md mx-auto">
                            {contentStructure.title || 'WEBOX GENERATED PDF'}
                          </h3>
                          <div className="w-12 h-1 bg-neutral-900 mx-auto rounded" />
                          {contentStructure.subtitle && (
                            <p className="text-xs sm:text-sm text-neutral-500 font-medium italic max-w-sm mx-auto leading-relaxed">
                              "{contentStructure.subtitle}"
                            </p>
                          )}
                        </div>

                        <div className="border-t border-neutral-100 pt-6 space-y-2 text-center">
                          <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest font-mono">
                            {currentLanguage === 'TR' ? 'ÖZEL AKADEMİK ÇALIŞMA RAPORU' : currentLanguage === 'AZ' ? 'XÜSUSİ AKADEMİK SƏNƏD' : 'OFFICIAL ACADEMIC REPORT'}
                          </p>
                          <div className="text-[10px] text-neutral-400 font-semibold space-y-0.5">
                            <p className="font-mono">{new Date().toLocaleDateString(currentLanguage === 'TR' ? 'tr-TR' : currentLanguage === 'AZ' ? 'az-AZ' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* RENDER INNER PAGES */
                    <div className="space-y-5 animate-fade-in text-left font-sans">
                      {(() => {
                        const sPage = contentStructure.pages[activePreviewPageIdx - 1];
                        if (!sPage) return null;
                        return (
                          <div className="space-y-4">
                            {/* Page header title with number */}
                            <div className="flex items-center justify-between border-b border-neutral-200/80 pb-2">
                              <h4 className="text-sm sm:text-base font-black text-neutral-800 tracking-tight uppercase">
                                {sPage.header || `Bölüm ${activePreviewPageIdx}`}
                              </h4>
                              <span className="text-[10px] font-mono font-bold text-neutral-400 shrink-0">
                                {currentLanguage === 'TR' ? `SAYFA ${activePreviewPageIdx + 1}` : currentLanguage === 'AZ' ? `SƏHİFƏ ${activePreviewPageIdx + 1}` : `PAGE ${activePreviewPageIdx + 1}`}
                              </span>
                            </div>

                            {/* Render download-source image elegantly if exists */}
                            {sPage.imageUrl ? (
                              <div className="relative border border-neutral-200 rounded-xl overflow-hidden bg-neutral-100 shadow-sm max-h-[220px]">
                                <img
                                  src={sPage.imageUrl}
                                  alt={sPage.imageSearchQuery || 'Page graphic'}
                                  className="w-full object-cover max-h-[210px] block"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-sm px-2.5 py-0.5 rounded text-[9px] font-medium text-white/90 italic">
                                  {currentLanguage === 'TR' ? 'Arşiv Görseli:' : currentLanguage === 'AZ' ? 'Sənəd Şəkli:' : 'Document Image:'} "{sPage.imageSearchQuery || prompt}"
                                </div>
                              </div>
                            ) : sPage.imageSearchQuery ? (
                              <div className="border border-dashed border-neutral-200 rounded-xl p-4 bg-white text-center flex flex-col items-center justify-center space-y-1">
                                <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider font-mono">
                                  {currentLanguage === 'TR' ? 'GÖRSEL ARANIYOR' : 'IMAGE QUERIED'}
                                </span>
                                <span className="text-xs text-neutral-500 italic">"{sPage.imageSearchQuery}"</span>
                              </div>
                            ) : null}

                            {/* Booklet Prose paragraphs */}
                            <div className="space-y-3 pt-1">
                              {sPage.paragraphs && sPage.paragraphs.map((para: string, pIdx: number) => (
                                <p key={pIdx} className="text-xs sm:text-sm text-neutral-600 leading-relaxed text-justify">
                                  {para}
                                </p>
                              ))}
                            </div>

                            {/* Clean Bullet metrics checkmarks list */}
                            {sPage.bulletPoints && sPage.bulletPoints.length > 0 && (
                              <div className="space-y-2 pt-2 border-t border-neutral-100 max-w-xl">
                                {sPage.bulletPoints.map((bullet: string, bIdx: number) => (
                                  <div key={bIdx} className="flex items-start gap-2 text-xs text-neutral-700 font-medium">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                    <p className="leading-normal font-sans text-neutral-600">{bullet}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>

                {/* Flip control action pagination bar */}
                <div className="pl-6 sm:pl-12 pt-6 border-t border-neutral-200/50 mt-6 flex justify-between items-center select-none font-sans">
                  <button
                    type="button"
                    disabled={activePreviewPageIdx === 0}
                    onClick={() => setActivePreviewPageIdx(prev => prev - 1)}
                    className="px-3.5 py-1.5 bg-white hover:bg-neutral-100 disabled:opacity-40 border border-neutral-200 text-neutral-600 rounded-lg text-xs font-bold transition-all flex items-center gap-1 active:scale-95"
                  >
                    ← {currentLanguage === 'TR' ? 'Önceki' : currentLanguage === 'AZ' ? 'Əvvəlki' : 'Prev'}
                  </button>

                  <span className="text-[10px] font-mono font-bold text-neutral-400">
                    {activePreviewPageIdx + 1} / {contentStructure.pages.length + 1}
                  </span>

                  <button
                    type="button"
                    disabled={activePreviewPageIdx === contentStructure.pages.length}
                    onClick={() => setActivePreviewPageIdx(prev => prev + 1)}
                    className="px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 active:scale-95 shadow-sm"
                  >
                    {currentLanguage === 'TR' ? 'Sonraki' : currentLanguage === 'AZ' ? 'Növbəti' : 'Next'} →
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* Direct Live PDF Preview Frame Viewer */}
          {pdfBlobUrl && (
            <div className="space-y-3" id="live-pdf-canvas-preview-container">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs font-bold text-neutral-550 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-500" />
                  {currentLanguage === 'TR' ? 'Masaüstü Canlı PDF Önizleme' : currentLanguage === 'AZ' ? 'Masaüstü Canlı PDF Önizləməsi' : 'Desktop Live PDF Viewer'}
                </span>
                <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-bold uppercase font-mono border border-emerald-100 animate-pulse inline-block self-start sm:self-auto">
                  {currentLanguage === 'TR' ? 'OTOMATİK İNDİRİLDİ' : currentLanguage === 'AZ' ? 'AVTOMATİK YÜKLƏNDİ' : 'AUTO-DOWNLOADED'}
                </span>
              </div>

              {/* Responsive Iframe Notice for Phones */}
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-[11px] text-amber-850 font-sans leading-relaxed text-left">
                <strong>💡 {currentLanguage === 'TR' ? 'Mobil Cihaz Bildirimi:' : currentLanguage === 'AZ' ? 'Mobil Cihaz Bildirişi:' : 'Mobile Device Notice:'}</strong>{' '}
                {currentLanguage === 'TR' 
                  ? 'Mobil tarayıcılarda (Android Chrome / iOS Safari) PDF dosyalarının iframe içinde gösterilmesi kısıtlanmıştır (bu yüzden tarayıcınız yukarıdaki "Aç" butonuyla boş kalabilir). Belgeniz telefonunuza otomatik indirilmiştir. Kaydedilen PDF dökümanını cep telefonunuzun yerleşik dosya yöneticisinden dilediğiniz an açıp okuyabilirsiniz!'
                  : currentLanguage === 'AZ'
                    ? 'Mobil brauzerlərdə (Android Chrome / iOS Safari) PDF sənədlərinin iframe daxilində göstərilməsi məhdudlaşdırılır (buna görə cihazınızda "Aç" düyməsi ilə boş görünə bilər). Sənədiniz artıq telefonunuza avtomatik yüklənib! Yüklənmiş PDF sənədini telefonunuzun fayl menecerindən istənilən vaxt açıb oxuya bilərsiniz.'
                    : 'Mobile browsers restrict direct PDF rendering inside iframes. Your physical booklet has been auto-saved to your device. You can open and read the actual downloaded PDF instantly using any document viewer in your phone!'}
              </div>

              <div className="hidden lg:block border border-neutral-200/80 rounded-2xl overflow-hidden bg-neutral-50 p-2 shadow-sm">
                <iframe
                  src={`${pdfBlobUrl}#toolbar=0&navpanes=0`}
                  title="WeBox Live PDF Preview Sheet"
                  className="w-full h-[600px] rounded-xl bg-white border-0 shadow-inner"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              onClick={() => {
                setGeneratedPdfBase64('');
                setContentStructure(null);
                setPrompt('');
              }}
              className="px-5 py-2.5 bg-white hover:bg-neutral-50 border border-neutral-200 text-xs font-bold font-sans text-neutral-700 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {getUiString('resetBtn')}
            </button>
          </div>
        </div>
      ) : (
        /* RENDER GENERATOR FORM INPUT SHELVES */
        <form onSubmit={handleGeneratePdf} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider font-mono">
              {getUiString('promptLabel')}
            </label>
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isGenerating || remainingLimit <= 0}
                placeholder={getUiString('placeholder')}
                rows={4}
                maxLength={400}
                className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 placeholder-neutral-400 p-4 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/30 focus:border-indigo-500 focus:bg-white transition-all resize-none shadow-inner"
              />
              <span className="absolute bottom-3 right-3 text-[10px] font-mono text-neutral-400/80">
                {prompt.length}/400
              </span>
            </div>

            {/* Prompt Inspiration Visual Pillboard Suggestions */}
            {prompt.length === 0 && !isGenerating && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold text-neutral-500 flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5 text-neutral-400" />
                  {getUiString('suqqHeadline')}
                </span>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map((sug, sIdx) => {
                    const txt = currentLanguage === 'TR' ? sug.tr : currentLanguage === 'AZ' ? sug.az : sug.en;
                    return (
                      <button
                        key={sIdx}
                        type="button"
                        onClick={() => setPrompt(txt)}
                        className="text-xs bg-neutral-100 hover:bg-neutral-200/80 hover:border-neutral-300 text-neutral-700 font-sans font-medium px-3.5 py-1.5 rounded-full border border-neutral-100 transition-all cursor-pointer flex items-center gap-0.5 shadow-sm"
                      >
                        {txt}
                        <ArrowRight className="w-2.5 h-2.5 text-neutral-400" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Languages className="w-3.5 h-3.5 text-neutral-400" />
                {getUiString('langLabel')}
              </label>
              <select
                value={pdfLang}
                onChange={(e) => setPdfLang(e.target.value)}
                disabled={isGenerating || remainingLimit <= 0}
                className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all cursor-pointer"
              >
                {OPTION_LANGUAGES.map((lang, lIdx) => (
                  <option key={lIdx} value={lang.value}>
                    {lang.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2 select-none">
              <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider font-mono flex justify-between">
                <span>{getUiString('pagesLabel')}</span>
                <span className="text-neutral-900 font-black">{pageCount} Səhifə / Pages</span>
              </label>
              <div className="flex items-center gap-4 bg-neutral-50 border border-neutral-200 p-2.5 rounded-xl">
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={pageCount}
                  onChange={(e) => setPageCount(parseInt(e.target.value))}
                  disabled={isGenerating || remainingLimit <= 0}
                  className="w-full h-1.5 bg-neutral-200 rounded-md cursor-pointer accent-indigo-600 focus:outline-none"
                />
                <div className="w-10 text-center font-bold text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 py-1.5 rounded-lg">
                  {pageCount}P
                </div>
              </div>
            </div>
          </div>

          {remainingLimit <= 0 ? (
            /* COOLDOWN / LIMIT COMPLETED BLOCK */
            <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl flex gap-4 text-xs font-semibold leading-relaxed text-amber-900 shadow-sm font-sans">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
              <div className="space-y-1.5">
                <p className="font-bold text-sm text-neutral-900">{getUiString('cooldownTitle')}</p>
                <p className="font-medium text-neutral-700 leading-relaxed">{getUiString('cooldownDesc')}</p>
              </div>
            </div>
          ) : (
            /* SUBMIT SHELF BUTTON ENGINE */
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-neutral-100">
              <div className="flex items-center gap-2 text-xs text-neutral-500 font-semibold font-sans">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>{getUiString('limitLabel')}</span>
                <span className="font-mono bg-neutral-100 px-2 py-0.5 rounded text-neutral-800 font-bold border border-neutral-150">
                  {remainingLimit} / 5
                </span>
              </div>

              <button
                type="submit"
                disabled={isGenerating || !prompt.trim()}
                className={`w-full sm:w-auto px-6 py-3.5 font-bold text-sm tracking-tight text-white rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isGenerating 
                    ? 'bg-neutral-800 shadow-neutral-900/10 cursor-not-allowed' 
                    : !prompt.trim()
                      ? 'bg-neutral-200 text-neutral-400 shadow-none cursor-not-allowed border border-neutral-100'
                      : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/10'
                }`}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span className="font-mono animate-pulse">{progressMsg}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    {getUiString('generateBtn')}
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
