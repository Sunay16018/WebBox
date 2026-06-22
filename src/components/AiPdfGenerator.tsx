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
  const [contentStructure, setContentStructure] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [clientFingerprint, setClientFingerprint] = useState('');

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
        const data = await response.json();
        setRemainingLimit(data.remaining);
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
      "gpt-oss-120b döküman içeriğini planlıyor...",
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

      const resData = await response.json();

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
      subtitle: { TR: 'gpt-oss-120b en hızlı yapay zeka ve internet görselleriyle anında dikey PDF albümü tasarlayın.', EN: 'Instantly design professional custom booklets using gpt-oss-120b and thematic web images.', AZ: 'gpt-oss-120b ən sürətli süni zəkası və internet şəkilləriylə saniyələr içində PDF sənəd hazırlayın.' },
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
    if (!generatedPdfBase64) return;
    const byteCharacters = atob(generatedPdfBase64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });
    
    const fileUrl = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = fileUrl;
    // Slugify title for filesave
    const titleSlug = (contentStructure?.title || prompt || 'webox-ai-booklet')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .substring(0, 40);
    downloadLink.download = `webox-ai-${titleSlug || 'document'}.pdf`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(fileUrl);
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

          {/* Interactive visual booklet card chapter map */}
          {contentStructure?.pages && (
            <div className="bg-neutral-50 border border-neutral-100 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
                <Layers className="w-4 h-4 text-indigo-600" />
                <h4 className="text-sm font-bold text-neutral-900 tracking-tight">
                  {getUiString('structureTitle')}
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contentStructure.pages.map((p: any, idx: number) => (
                  <div key={idx} className="bg-white p-4 rounded-xl border border-neutral-200/50 space-y-2 relative shadow-sm hover:border-neutral-300 transition-colors">
                    <span className="absolute top-3 right-3 text-[10px] font-mono font-bold text-neutral-400 bg-neutral-100 border border-neutral-100/50 px-2 py-0.5 rounded-full">
                      Page {idx + 2}
                    </span>
                    <h5 className="font-bold text-sm text-neutral-900 max-w-[85%] leading-tight">
                      {p.header || `Sayfa Bölümü ${idx + 1}`}
                    </h5>
                    {p.paragraphs?.[0] && (
                      <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed font-sans">
                        {p.paragraphs[0]}
                      </p>
                    )}
                    {p.imageSearchQuery && (
                      <div className="pt-2 border-t border-neutral-50 text-[10px] font-semibold text-neutral-400 flex items-center gap-1 italic">
                        <span>Görsel Kelimesi:</span>
                        <span className="font-mono text-neutral-600 not-italic">"{p.imageSearchQuery}"</span>
                      </div>
                    )}
                  </div>
                ))}
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
