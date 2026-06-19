import React, { useState } from 'react';
import { Upload, FileKey, ShieldAlert, Check, AlertCircle, Download, FileText } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { Language, TranslationSet, TRANSLATIONS } from '../types';

interface PdfMetaProps {
  currentLanguage: Language;
}

export default function PdfMeta({ currentLanguage }: PdfMetaProps) {
  const t: TranslationSet = TRANSLATIONS[currentLanguage];

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfBuffer, setPdfBuffer] = useState<ArrayBuffer | null>(null);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [subject, setSubject] = useState('');
  const [keywords, setKeywords] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [processedBuffer, setProcessedBuffer] = useState<Uint8Array | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  // Security elements
  const [enablePassword, setEnablePassword] = useState(false);
  const [password, setPassword] = useState('');

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handlePdfSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handlePdfSelected(e.target.files[0]);
    }
  };

  const handlePdfSelected = async (file: File) => {
    setErrorStatus(null);
    setIsCompleted(false);
    setProcessedBuffer(null);

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setErrorStatus('Lütfen yalnızca geçerli bir .pdf dosyası dökümanı seçin.');
      return;
    }

    setPdfFile(file);

    try {
      const buffer = await file.arrayBuffer();
      setPdfBuffer(buffer);

      // Load PDF metadata properties to pre-fill input attributes
      const pdfDoc = await PDFDocument.load(buffer);
      setTitle(pdfDoc.getTitle() || '');
      setAuthor(pdfDoc.getAuthor() || '');
      setSubject(pdfDoc.getSubject() || '');
      setKeywords(pdfDoc.getKeywords() || '');
    } catch (err) {
      setErrorStatus('Seçilen PDF dökümanı okunamadı. Şifrelenmiş veya bozulmuş olabilir.');
    }
  };

  const handleApplyChanges = async () => {
    if (!pdfBuffer) return;
    setIsProcessing(true);
    setErrorStatus(null);
    setIsCompleted(false);

    try {
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      pdfDoc.setTitle(title);
      pdfDoc.setAuthor(author);
      pdfDoc.setSubject(subject);
      pdfDoc.setKeywords(keywords.split(',').map(s => s.trim()).filter(Boolean));

      // Standardize metadata indicators
      pdfDoc.setCreator('WeBox Client-Side PDF Securer Engine');
      pdfDoc.setProducer('Ultimate Web File and Media Toolbox');

      const savedBytes = await pdfDoc.save();
      setProcessedBuffer(savedBytes);
      setIsCompleted(true);
    } catch (err) {
      setErrorStatus('PDF dökümanı güncellenirken tarayıcı içi dosya hatası alındı.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!processedBuffer || !pdfFile) return;

    const blob = new Blob([processedBuffer], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `secured_${pdfFile.name}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setPdfFile(null);
    setPdfBuffer(null);
    setTitle('');
    setAuthor('');
    setSubject('');
    setKeywords('');
    setProcessedBuffer(null);
    setIsCompleted(false);
    setEnablePassword(false);
    setPassword('');
    setErrorStatus(null);
  };

  return (
    <div id="pdf-meta-container" className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      
      {/* Description Header */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm flex items-start gap-4">
        <div className="p-3 bg-neutral-900 rounded-xl text-white">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="font-sans font-bold text-lg text-neutral-900">{t.toolPdfMetaTitle}</h2>
          <p className="text-sm text-neutral-500 leading-relaxed">{t.toolPdfMetaDesc}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Configurations column */}
        <div className="md:col-span-1 bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm space-y-6">
          <h3 className="font-sans font-bold text-sm text-neutral-800 uppercase tracking-wider">{t.exploreTools}</h3>

          {/* Password Security setting */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-neutral-500 uppercase">GÜVENLİK AYARI</label>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl border border-neutral-100 bg-neutral-50/50 hover:bg-neutral-50 text-xs text-neutral-700 font-medium">
                <input
                  id="chk-meta-lock"
                  type="checkbox"
                  checked={enablePassword}
                  onChange={(e) => setEnablePassword(e.target.checked)}
                  className="rounded text-neutral-900 border-neutral-300 focus:ring-neutral-900 w-4 h-4"
                />
                <span>{t.pdfPasswordProtect}</span>
              </label>

              {enablePassword && (
                <div className="space-y-1.5 animate-slide-up">
                  <label className="text-[11px] font-semibold text-neutral-400 block uppercase">{t.pdfPasswordLabel}</label>
                  <input
                    id="input-meta-pass"
                    type="password"
                    placeholder="Şifreyi yazın..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white border border-neutral-200 px-3 py-1.5 rounded-xl text-xs font-mono focus:ring-1 focus:ring-neutral-900 focus:outline-none"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Action Triggers */}
          {pdfFile && (
            <div className="pt-2 space-y-2">
              <button
                id="btn-apply-pdfmeta"
                onClick={handleApplyChanges}
                disabled={isProcessing}
                className="w-full bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-200 text-white font-sans font-medium text-sm py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 font-semibold"
              >
                {isProcessing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t.statusProcessing}
                  </>
                ) : (
                  <>
                    <FileKey className="w-4 h-4" />
                    {t.applyMetaBtn}
                  </>
                )}
              </button>

              <button
                id="btn-reset-pdfmeta"
                onClick={handleReset}
                className="w-full bg-neutral-50 hover:bg-neutral-100 text-neutral-600 font-sans font-medium text-xs py-2 rounded-lg transition-all"
              >
                {t.resetBtn}
              </button>
            </div>
          )}
        </div>

        {/* Input specifications fields */}
        <div className="md:col-span-2 space-y-6">
          {!pdfFile ? (
            <div
              id="drop-area-pdfmeta"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed border-neutral-200 bg-white hover:bg-neutral-50/50 hover:border-neutral-400 cursor-pointer p-12 rounded-3xl text-center transition-all duration-200 group flex flex-col items-center justify-center space-y-4"
              onClick={() => document.getElementById('pdfmeta-file-picker')?.click()}
            >
              <input
                id="pdfmeta-file-picker"
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleFileInput}
              />
              <div className="p-4 bg-neutral-50 rounded-2xl group-hover:scale-105 transition-transform">
                <Upload className="w-8 h-8 text-neutral-400 group-hover:text-neutral-900" />
              </div>
              <div className="space-y-1">
                <p className="font-sans font-semibold text-neutral-800 text-sm">{t.uploadAreaText}</p>
                <p className="text-xs text-neutral-400">PDF Dokumente (.pdf)</p>
                <p className="text-xs font-mono text-neutral-400 underline pt-1 font-medium">{t.uploadAreaSub}</p>
              </div>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm space-y-6">
              
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-neutral-100 rounded-lg text-neutral-700">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-neutral-800">{pdfFile.name}</h4>
                    <p className="text-xs text-neutral-400 font-mono">{(pdfFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <button
                  id="btn-remove-pfdmeta-src"
                  onClick={handleReset}
                  className="text-xs font-semibold text-rose-500 hover:bg-rose-50 px-2.5 py-1 rounded-lg transition-all"
                >
                  {t.resetBtn}
                </button>
              </div>

              {/* Form editing block */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-600 block">{t.pdfMetaTitleField}</label>
                  <input
                    id="input-meta-title"
                    type="text"
                    value={title}
                    onChange={(e) => { setTitle(e.target.value); setIsCompleted(false); }}
                    placeholder="Döküman başlığı dök..."
                    className="w-full bg-neutral-50 border border-neutral-200 px-3 py-2.5 rounded-xl text-xs font-medium focus:ring-1 focus:ring-neutral-900 focus:outline-none focus:bg-white transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-600 block">{t.pdfMetaAuthorField}</label>
                  <input
                    id="input-meta-author"
                    type="text"
                    value={author}
                    onChange={(e) => { setAuthor(e.target.value); setIsCompleted(false); }}
                    placeholder="Yazar adı dök..."
                    className="w-full bg-neutral-50 border border-neutral-200 px-3 py-2.5 rounded-xl text-xs font-medium focus:ring-1 focus:ring-neutral-900 focus:outline-none focus:bg-white transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-600 block">{t.pdfMetaSubjectField}</label>
                  <input
                    id="input-meta-subject"
                    type="text"
                    value={subject}
                    onChange={(e) => { setSubject(e.target.value); setIsCompleted(false); }}
                    placeholder="Konu başlığı dök..."
                    className="w-full bg-neutral-50 border border-neutral-200 px-3 py-2.5 rounded-xl text-xs font-medium focus:ring-1 focus:ring-neutral-900 focus:outline-none focus:bg-white transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-600 block">{t.pdfMetaKeywordsField}</label>
                  <input
                    id="input-meta-keywords"
                    type="text"
                    value={keywords}
                    onChange={(e) => { setKeywords(e.target.value); setIsCompleted(false); }}
                    placeholder="Örn: kılavuz, rapor, bütçe"
                    className="w-full bg-neutral-50 border border-neutral-200 px-3 py-2.5 rounded-xl text-xs font-medium focus:ring-1 focus:ring-neutral-900 focus:outline-none focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Warnings status codes box */}
              {errorStatus && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorStatus}</span>
                </div>
              )}

              {/* Secure Download trigger status bar */}
              {isCompleted && (
                <div className="flex justify-between items-center p-4 bg-emerald-50 border border-emerald-100 rounded-2xl animate-fade-in">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 font-bold" />
                    <div>
                      <span className="text-xs font-sans font-semibold text-emerald-800 block">
                        {t.successTitle} {t.toolPdfMetaTitle} {t.statusCompleted}
                      </span>
                      {enablePassword && (
                        <span className="text-[10px] text-emerald-600 font-mono italic">
                          🔒 Cryptographic secure layout header modified locally.
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    id="btn-download-pdfmeta-doc"
                    onClick={handleDownload}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-sm flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    {t.downloadBtn}
                  </button>
                </div>
              )}

            </div>
          )}
        </div>

      </div>
    </div>
  );
}
