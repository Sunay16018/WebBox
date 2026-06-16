import React, { useState } from 'react';
import { Upload, FileText, ArrowUp, ArrowDown, Trash2, FileStack, AlertCircle, Check, Download } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { Language, TranslationSet, TRANSLATIONS } from '../types';

interface PdfMergeProps {
  currentLanguage: Language;
}

interface PdfItem {
  id: string;
  file: File;
  pageCount: number;
  arrayBuffer: ArrayBuffer;
}

export default function PdfMerge({ currentLanguage }: PdfMergeProps) {
  const t: TranslationSet = TRANSLATIONS[currentLanguage];

  const [pdfItems, setPdfItems] = useState<PdfItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mergedPdfUrl, setMergedPdfUrl] = useState<string>('');
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelected(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFilesSelected(Array.from(e.target.files));
    }
  };

  const handleFilesSelected = async (files: File[]) => {
    setErrorStatus(null);
    setMergedPdfUrl('');

    const newItems: PdfItem[] = [];
    const validPdfs = files.filter(f => f.name.toLowerCase().endsWith('.pdf'));

    if (validPdfs.length === 0) {
      setErrorStatus('Lütfen yalnızca .pdf uzantılı dosyalar yükleyin.');
      return;
    }

    setIsProcessing(true);

    try {
      for (const file of validPdfs) {
        const arrayBuffer = await file.arrayBuffer();
        // Load with pdf-lib to get page count and verify integrity
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const pageCount = pdfDoc.getPageCount();

        newItems.push({
          id: `${file.name}-${Date.now()}-${Math.random()}`,
          file,
          pageCount,
          arrayBuffer
        });
      }

      setPdfItems(prev => [...prev, ...newItems]);
    } catch (err) {
      setErrorStatus('Bazı şifreli veya bozuk PDF dökümanları okunamadı. Lütfen kontrol edip tekrar yükleyin.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setPdfItems(prev => {
      const items = [...prev];
      const temp = items[index];
      items[index] = items[index - 1];
      items[index - 1] = temp;
      return items;
    });
    setMergedPdfUrl('');
  };

  const handleMoveDown = (index: number) => {
    if (index === pdfItems.length - 1) return;
    setPdfItems(prev => {
      const items = [...prev];
      const temp = items[index];
      items[index] = items[index + 1];
      items[index + 1] = temp;
      return items;
    });
    setMergedPdfUrl('');
  };

  const handleRemove = (id: string) => {
    setPdfItems(prev => prev.filter(item => item.id !== id));
    setMergedPdfUrl('');
  };

  const handleMerge = async () => {
    if (pdfItems.length < 2) {
      setErrorStatus('Birleştirme işlemi için en az 2 PDF dökümanı eklemelisiniz.');
      return;
    }

    setIsProcessing(true);
    setErrorStatus(null);

    try {
      const mergedPdf = await PDFDocument.create();

      for (const item of pdfItems) {
        const srcPdf = await PDFDocument.load(item.arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(srcPdf, srcPdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setMergedPdfUrl(url);
    } catch (err) {
      setErrorStatus('PDF dökümanları birleştirilirken sistem içi hata oluştu.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!mergedPdfUrl) return;
    const a = document.createElement('a');
    a.href = mergedPdfUrl;
    a.download = `merged_${Date.now()}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleReset = () => {
    setPdfItems([]);
    setMergedPdfUrl('');
    setErrorStatus(null);
    setIsProcessing(false);
  };

  return (
    <div id="pdf-merge-container" className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      
      {/* Description Header */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm flex items-start gap-4">
        <div className="p-3 bg-neutral-900 rounded-xl text-white">
          <FileStack className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="font-sans font-bold text-lg text-neutral-900">{t.toolPdfMergeTitle}</h2>
          <p className="text-sm text-neutral-500 leading-relaxed">{t.toolPdfMergeDesc}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Sidebar controller */}
        <div className="md:col-span-1 bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm space-y-6">
          <h3 className="font-sans font-bold text-sm text-neutral-800 uppercase tracking-wider">{t.exploreTools}</h3>
          
          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100 space-y-2">
            <span className="text-xs font-semibold text-neutral-500 uppercase block">{t.filesSelected}</span>
            <div className="text-2xl font-mono font-bold text-neutral-800">{pdfItems.length}</div>
            <p className="text-[11px] text-neutral-400 font-sans leading-tight">{t.dragToReorder}</p>
          </div>

          <div className="space-y-2">
            <button
              id="btn-trigger-pdf-merge"
              onClick={handleMerge}
              disabled={pdfItems.length < 2 || isProcessing}
              className="w-full bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-200 text-white font-sans font-medium text-sm py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 font-semibold"
            >
              {isProcessing ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t.statusProcessing}
                </>
              ) : (
                <>
                  <FileStack className="w-4 h-4" />
                  {t.mergeBtn}
                </>
              )}
            </button>

            {pdfItems.length > 0 && (
              <button
                id="btn-reset-pdf-merge"
                onClick={handleReset}
                className="w-full bg-neutral-50 hover:bg-neutral-100 text-neutral-600 font-sans font-medium text-xs py-2 rounded-lg transition-all"
              >
                {t.resetBtn}
              </button>
            )}
          </div>
        </div>

        {/* List & Reorder interface */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Main loader */}
          <div
            id="drop-area-pdf-merge"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="border-2 border-dashed border-neutral-200 bg-white hover:bg-neutral-50/50 hover:border-neutral-400 cursor-pointer p-8 rounded-3xl text-center transition-all duration-200 group flex flex-col items-center justify-center space-y-3"
            onClick={() => document.getElementById('pdf-merge-file-picker')?.click()}
          >
            <input
              id="pdf-merge-file-picker"
              type="file"
              accept=".pdf"
              multiple
              className="hidden"
              onChange={handleFileInput}
            />
            <div className="p-3 bg-neutral-50 rounded-xl group-hover:scale-105 transition-transform">
              <Upload className="w-6 h-6 text-neutral-400 group-hover:text-neutral-900" />
            </div>
            <div className="space-y-0.5">
              <p className="font-sans font-semibold text-neutral-800 text-sm">{t.uploadAreaText}</p>
              <p className="text-[11px] text-neutral-400">{t.addMorePdfs}</p>
            </div>
          </div>

          {/* List panel */}
          {pdfItems.length > 0 && (
            <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm space-y-4">
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {pdfItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3.5 bg-neutral-50 rounded-xl border border-neutral-100 group transition-all duration-200 hover:border-neutral-200 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 font-mono text-xs font-bold font-sans">
                        PDF
                      </div>
                      <div className="max-w-[220px] sm:max-w-xs truncate">
                        <span className="text-sm font-semibold text-neutral-800 block truncate">{item.file.name}</span>
                        <span className="text-[11px] font-mono text-neutral-400">
                          {item.pageCount} {t.pageCount} • {(item.file.size / (1024 * 1024)).toFixed(2)} MB
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        title="Move Up"
                        disabled={index === 0}
                        onClick={() => handleMoveUp(index)}
                        className="p-1.5 hover:bg-neutral-200/50 rounded text-neutral-600 disabled:opacity-35"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        title="Move Down"
                        disabled={index === pdfItems.length - 1}
                        onClick={() => handleMoveDown(index)}
                        className="p-1.5 hover:bg-neutral-200/50 rounded text-neutral-600 disabled:opacity-35"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      <button
                        title="Remove"
                        onClick={() => handleRemove(item.id)}
                        className="p-1.5 hover:bg-rose-50 rounded text-rose-500 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Status messages info */}
              {errorStatus && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorStatus}</span>
                </div>
              )}

              {/* Merged Outcome Download banner */}
              {mergedPdfUrl && (
                <div className="flex justify-between items-center p-4 bg-emerald-50 border border-emerald-100 rounded-2xl animate-fade-in mt-4">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 font-bold" />
                    <span className="text-xs font-sans font-semibold text-emerald-800">
                      {t.successTitle} {t.toolPdfMergeTitle} {t.statusCompleted}
                    </span>
                  </div>
                  <button
                    id="btn-download-merged-pdf"
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

      {/* SEO KNOWLEDGE SECTION */}
      <section className="bg-white border border-neutral-100 rounded-3xl p-6 sm:p-10 shadow-sm space-y-6 select-none font-sans mt-8">
        <div className="space-y-4">
          <h3 className="text-base font-bold text-neutral-900">%100 Güvenli PDF Birleştirme ve Manipülasyon Rehberi</h3>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Şirket içi bütçeler, vergi beyannameleri, nüfus cüzdanı dökümleri ve hassas ticari anlaşmalar gibi gizlilik ihtiva eden PDF belgelerini sıradan online araçlara yüklemek büyük bir güvenlik tehdididir. WebBox PDF Birleştirici, PDF sayfalarının binary akışlarını tarayıcınız içindeki <span className="font-semibold text-neutral-850">pdf-lib</span> sanal motoruyla çözümleyerek tamamen cihazınızın RAM’inde bir araya getirir.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100 space-y-1">
              <h5 className="text-[11px] font-bold text-neutral-800">Hiçbir Sunucu Kaydı Yok</h5>
              <p className="text-[10px] text-neutral-450 leading-relaxed">Çevrimiçi PDF sitelerindeki gibi dosyalarınız uzak sunucularda saklanmaz, silinmeyi beklemez. Gizlilik %100 güvence altındadır.</p>
            </div>
            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100 space-y-1">
              <h5 className="text-[11px] font-bold text-neutral-800">Hassas Sayfa Sıralama</h5>
              <p className="text-[10px] text-neutral-455 leading-relaxed">Merdiven hiyerarşisine sahip pratik sürükle-bırak butonları sayesinde birleştirmek istediğiniz dökümanların sayfa sıralamasını tam dilediğiniz gibi düzenleyin.</p>
            </div>
            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100 space-y-1">
              <h5 className="text-[11px] font-bold text-neutral-800 font-sans">Sınırsız Dosya Boyutu</h5>
              <p className="text-[10px] text-neutral-460 leading-relaxed">Cihazınızın donanım performansına bağlı şekilde gigabaytlarca PDF belgesini tek bir döküm halinde saniyeler içinde bütünleştirebilirsiniz.</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
