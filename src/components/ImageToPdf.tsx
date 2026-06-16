import React, { useState } from 'react';
import { Upload, FileDown, Trash2, ArrowUp, ArrowDown, FileImage, AlertCircle, Check, Download } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { Language, TranslationSet, TRANSLATIONS } from '../types';

interface ImageToPdfProps {
  currentLanguage: Language;
}

interface ImageItem {
  id: string;
  file: File;
  previewUrl: string;
}

export default function ImageToPdf({ currentLanguage }: ImageToPdfProps) {
  const t: TranslationSet = TRANSLATIONS[currentLanguage];

  const [imageItems, setImageItems] = useState<ImageItem[]>([]);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [scaleMode, setScaleMode] = useState<'fit' | 'fill'>('fit');
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState<string>('');
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleImagesSelected(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleImagesSelected(Array.from(e.target.files));
    }
  };

  const handleImagesSelected = (files: File[]) => {
    setErrorStatus(null);
    setGeneratedPdfUrl('');

    const validImages = files.filter(f => f.type.startsWith('image/'));
    if (validImages.length === 0) {
      setErrorStatus('Lütfen yalnızca görsel (.jpg, .png, .webp vb.) dökümanları seçin.');
      return;
    }

    const items: ImageItem[] = validImages.map(file => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file,
      previewUrl: URL.createObjectURL(file)
    }));

    setImageItems(prev => [...prev, ...items]);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setImageItems(prev => {
      const items = [...prev];
      const temp = items[index];
      items[index] = items[index - 1];
      items[index - 1] = temp;
      return items;
    });
    setGeneratedPdfUrl('');
  };

  const handleMoveDown = (index: number) => {
    if (index === imageItems.length - 1) return;
    setImageItems(prev => {
      const items = [...prev];
      const temp = items[index];
      items[index] = items[index + 1];
      items[index + 1] = temp;
      return items;
    });
    setGeneratedPdfUrl('');
  };

  const handleRemove = (id: string, url: string) => {
    setImageItems(prev => prev.filter(item => item.id !== id));
    URL.revokeObjectURL(url);
    setGeneratedPdfUrl('');
  };

  // Convert image to standard JPEG bytes via Canvas to ensure absolute pdf-lib compatibility
  const convertImageToJpegBytes = (previewUrl: string): Promise<Uint8Array> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.src = previewUrl;
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas context failure'));
            return;
          }
          ctx.drawImage(img, 0, 0);
          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error('Canvas compilation blob failure'));
              return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
              if (reader.result instanceof ArrayBuffer) {
                resolve(new Uint8Array(reader.result));
              } else {
                reject(new Error('FileReader loading failed'));
              }
            };
            reader.readAsArrayBuffer(blob);
          }, 'image/jpeg', 0.9);
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => reject(new Error('Image loading error'));
    });
  };

  const handleGeneratePdf = async () => {
    if (imageItems.length === 0) return;
    setIsProcessing(true);
    setErrorStatus(null);

    try {
      const pdfDoc = await PDFDocument.create();

      for (const item of imageItems) {
        const jpegBytes = await convertImageToJpegBytes(item.previewUrl);
        const embeddedImage = await pdfDoc.embedJpg(jpegBytes);

        // Standard Page dimensions
        const pageW = orientation === 'portrait' ? 595.27 : 841.89; // A4 standard width
        const pageH = orientation === 'portrait' ? 841.89 : 595.27; // A4 standard height

        const page = pdfDoc.addPage([pageW, pageH]);
        
        // Calculate image placement coordinates
        const imgH = embeddedImage.height;
        const imgW = embeddedImage.width;
        
        let drawW = pageW;
        let drawH = (imgH / imgW) * pageW;

        if (scaleMode === 'fit') {
          if (drawH > pageH) {
            drawH = pageH;
            drawW = (imgW / imgH) * pageH;
          }
        } else {
          // Fill
          if (drawH < pageH) {
            drawH = pageH;
            drawW = (imgW / imgH) * pageH;
          }
        }

        const midX = (pageW - drawW) / 2;
        const midY = (pageH - drawH) / 2;

        page.drawImage(embeddedImage, {
          x: midX,
          y: midY,
          width: drawW,
          height: drawH
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setGeneratedPdfUrl(url);

    } catch (err) {
      setErrorStatus('Döküman PDF haline getirilirken tarayıcı içi derleme hatası oluştu.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!generatedPdfUrl) return;
    const a = document.createElement('a');
    a.href = generatedPdfUrl;
    a.download = `images_combined_${Date.now()}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleReset = () => {
    imageItems.forEach(item => URL.revokeObjectURL(item.previewUrl));
    setImageItems([]);
    setGeneratedPdfUrl('');
    setErrorStatus(null);
    setIsProcessing(false);
  };

  return (
    <div id="image-to-pdf-container" className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      
      {/* Description Header */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm flex items-start gap-4">
        <div className="p-3 bg-neutral-900 rounded-xl text-white">
          <FileDown className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="font-sans font-bold text-lg text-neutral-900">{t.toolImgToPdfTitle}</h2>
          <p className="text-sm text-neutral-500 leading-relaxed">{t.toolImgToPdfDesc}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Configurations block */}
        <div className="md:col-span-1 bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm space-y-6">
          <h3 className="font-sans font-bold text-sm text-neutral-800 uppercase tracking-wider">{t.exploreTools}</h3>

          {/* Orientation selection */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-neutral-500 uppercase">{t.pdfOrientation}</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                id="btn-orientation-portrait"
                onClick={() => { setOrientation('portrait'); setGeneratedPdfUrl(''); }}
                className={`text-xs py-2 px-3 rounded-lg border font-medium transition-all ${
                  orientation === 'portrait'
                    ? 'border-neutral-900 bg-neutral-900 text-white font-semibold'
                    : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                {t.portrait}
              </button>
              <button
                id="btn-orientation-landscape"
                onClick={() => { setOrientation('landscape'); setGeneratedPdfUrl(''); }}
                className={`text-xs py-2 px-3 rounded-lg border font-medium transition-all ${
                  orientation === 'landscape'
                    ? 'border-neutral-900 bg-neutral-900 text-white font-semibold'
                    : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                {t.landscape}
              </button>
            </div>
          </div>

          {/* Fit or Fill Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-neutral-500 uppercase">{t.imgScaleMode}</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                id="btn-scale-fit"
                onClick={() => { setScaleMode('fit'); setGeneratedPdfUrl(''); }}
                className={`text-xs py-2 px-3 rounded-lg border font-medium transition-all ${
                  scaleMode === 'fit'
                    ? 'border-neutral-900 bg-neutral-900 text-white font-semibold'
                    : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                {t.imgScaleFit}
              </button>
              <button
                id="btn-scale-fill"
                onClick={() => { setScaleMode('fill'); setGeneratedPdfUrl(''); }}
                className={`text-xs py-2 px-3 rounded-lg border font-medium transition-all ${
                  scaleMode === 'fill'
                    ? 'border-neutral-900 bg-neutral-900 text-white font-semibold'
                    : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                {t.imgScaleFill}
              </button>
            </div>
          </div>

          {/* Generate trigger */}
          {imageItems.length > 0 && (
            <div className="pt-2 space-y-2">
              <button
                id="btn-compile-imgtopdf"
                onClick={handleGeneratePdf}
                disabled={isProcessing}
                className="w-full bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-200 text-white font-sans font-medium text-sm py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t.statusProcessing}
                  </>
                ) : (
                  <>
                    <FileDown className="w-4 h-4" />
                    {t.generatePdf}
                  </>
                )}
              </button>

              <button
                id="btn-reset-imgtopdf"
                onClick={handleReset}
                className="w-full bg-neutral-50 hover:bg-neutral-100 text-neutral-600 font-sans font-medium text-xs py-2 rounded-lg transition-all"
              >
                {t.resetBtn}
              </button>
            </div>
          )}
        </div>

          {/* Image files drawer queue */}
        <div className="md:col-span-2 space-y-6">
          <div
            id="drop-area-imgtopdf"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="border-2 border-dashed border-neutral-200 bg-white hover:bg-neutral-50/50 hover:border-neutral-400 cursor-pointer p-8 rounded-3xl text-center transition-all duration-200 group flex flex-col items-center justify-center space-y-3"
            onClick={() => document.getElementById('imgtopdf-file-picker')?.click()}
          >
            <input
              id="imgtopdf-file-picker"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileInput}
            />
            <div className="p-3 bg-neutral-50 rounded-xl group-hover:scale-105 transition-transform">
              <Upload className="w-6 h-6 text-neutral-400 group-hover:text-neutral-900" />
            </div>
            <div className="space-y-0.5">
              <p className="font-sans font-semibold text-neutral-800 text-sm">{t.uploadAreaText}</p>
              <p className="text-[11px] text-neutral-400">JPG, PNG, WebP</p>
            </div>
          </div>

          {/* Orderable list box */}
          {imageItems.length > 0 && (
            <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm space-y-4">
              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                {imageItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl border border-neutral-100 group transition-all duration-200 hover:border-neutral-200 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-neutral-100 overflow-hidden border border-neutral-200/50 flex items-center justify-center">
                        <img
                          src={item.previewUrl}
                          alt="Thumbnail"
                          referrerPolicy="no-referrer"
                          className="max-w-full max-h-full object-cover"
                        />
                      </div>
                      <div className="max-w-[200px] sm:max-w-xs truncate">
                        <span className="text-sm font-semibold text-neutral-800 block truncate">{item.file.name}</span>
                        <span className="text-[11px] font-mono text-neutral-400">
                          {(item.file.size / 1024).toFixed(1)} KB
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
                        disabled={index === imageItems.length - 1}
                        onClick={() => handleMoveDown(index)}
                        className="p-1.5 hover:bg-neutral-200/50 rounded text-neutral-600 disabled:opacity-35"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      <button
                        title="Remove"
                        onClick={() => handleRemove(item.id, item.previewUrl)}
                        className="p-1.5 hover:bg-rose-50 rounded text-rose-500 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Warnings and alerts */}
              {errorStatus && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorStatus}</span>
                </div>
              )}

              {/* Completed Assembly Trigger */}
              {generatedPdfUrl && (
                <div className="flex justify-between items-center p-4 bg-emerald-50 border border-emerald-100 rounded-2xl animate-fade-in mt-4">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 font-bold" />
                    <span className="text-xs font-sans font-semibold text-emerald-800">
                      {t.successTitle} {t.toolImgToPdfTitle} {t.statusCompleted}
                    </span>
                  </div>
                  <button
                    id="btn-download-imgtopdf-pdf"
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
