import React, { useState } from 'react';
import { Upload, Grid, Check, AlertCircle, Download, FileImage, Trash2, Sliders } from 'lucide-react';
import JSZip from 'jszip';
import { Language, TranslationSet, TRANSLATIONS } from '../types';

interface BatchResizerProps {
  currentLanguage: Language;
}

interface ImageItem {
  id: string;
  file: File;
  previewUrl: string;
}

export default function BatchResizer({ currentLanguage }: BatchResizerProps) {
  const t: TranslationSet = TRANSLATIONS[currentLanguage];

  const [images, setImages] = useState<ImageItem[]>([]);
  const [width, setWidth] = useState<number>(800);
  const [height, setHeight] = useState<number>(600);
  const [maintainAspect, setMaintainAspect] = useState<boolean>(true);
  const [targetFormat, setTargetFormat] = useState<string>('image/jpeg');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [zipBlobUrl, setZipBlobUrl] = useState<string>('');
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
    setZipBlobUrl('');

    const validImages = files.filter(f => f.type.startsWith('image/'));
    if (validImages.length === 0) {
      setErrorStatus('Lütfen yalnızca geçerli görseller seçin.');
      return;
    }

    const items = validImages.map(file => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file,
      previewUrl: URL.createObjectURL(file)
    }));

    setImages(prev => [...prev, ...items]);
  };

  const handleRemove = (id: string, url: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
    URL.revokeObjectURL(url);
    setZipBlobUrl('');
  };

  const handleReset = () => {
    images.forEach(img => URL.revokeObjectURL(img.previewUrl));
    setImages([]);
    setZipBlobUrl('');
    setProgress(0);
    setErrorStatus(null);
  };

  const resizeSingleImage = (item: ImageItem, w: number, h: number, format: string): Promise<{ name: string; blob: Blob }> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.src = item.previewUrl;
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let targetW = w;
          let targetH = h;

          if (maintainAspect) {
            const aspect = img.naturalWidth / img.naturalHeight;
            if (targetW / aspect <= h) {
              targetH = Math.round(targetW / aspect);
            } else {
              targetW = Math.round(targetH * aspect);
            }
          }

          canvas.width = targetW;
          canvas.height = targetH;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas context failure'));
            return;
          }

          ctx.drawImage(img, 0, 0, targetW, targetH);
          canvas.toBlob((blob) => {
            if (blob) {
              const originalName = item.file.name;
              const dotNum = originalName.lastIndexOf('.');
              const baseName = dotNum !== -1 ? originalName.substring(0, dotNum) : originalName;
              const cleanExt = format.split('/')[1];
              resolve({
                name: `${baseName}_resized_${targetW}x${targetH}.${cleanExt}`,
                blob
              });
            } else {
              reject(new Error('Resize blob failure'));
            }
          }, format, 0.85);

        } catch (err) {
          reject(err);
        }
      };

      img.onerror = () => reject(new Error('Image failed to load'));
    });
  };

  const handleBatchResize = async () => {
    if (images.length === 0) return;
    setIsProcessing(true);
    setProgress(5);
    setErrorStatus(null);
    setZipBlobUrl('');

    try {
      const zip = new JSZip();
      let completedCount = 0;

      for (const item of images) {
        const { name, blob } = await resizeSingleImage(item, width, height, targetFormat);
        zip.file(name, blob);
        
        completedCount++;
        const ratio = Math.round((completedCount / images.length) * 90);
        setProgress(Math.max(10, ratio));
      }

      const generatedZipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(generatedZipBlob);
      setZipBlobUrl(url);
      setProgress(100);

    } catch (err) {
      setErrorStatus('Toplu boyutlandırma işlemi sırasında hata oluştu.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadZip = () => {
    if (!zipBlobUrl) return;
    const a = document.createElement('a');
    a.href = zipBlobUrl;
    a.download = `resized_images_${Date.now()}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div id="batch-resizer-container" className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      
      {/* Description Header */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm flex items-start gap-4">
        <div className="p-3 bg-neutral-900 rounded-xl text-white">
          <Grid className="w-6 h-6 animate-pulse-slow" />
        </div>
        <div className="space-y-1">
          <h2 className="font-sans font-bold text-lg text-neutral-900">{t.toolBatchResizeTitle}</h2>
          <p className="text-sm text-neutral-500 leading-relaxed">{t.toolBatchResizeDesc}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Configuration tools sidebar column */}
        <div className="md:col-span-1 bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm space-y-6">
          <h3 className="font-sans font-bold text-sm text-neutral-800 uppercase tracking-wider">{t.exploreTools}</h3>

          {/* Width & Height Dimensions box settings */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-neutral-500 uppercase">{t.width}</label>
              <input
                id="input-resize-width"
                type="number"
                min="50"
                max="8000"
                value={width}
                onChange={(e) => { setWidth(parseInt(e.target.value) || 100); setZipBlobUrl(''); }}
                className="w-full bg-neutral-50 border border-neutral-200 px-3 py-2 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-neutral-900 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5 font-sans">
              <label className="text-[11px] font-semibold text-neutral-500 uppercase">{t.height}</label>
              <input
                id="input-resize-height"
                type="number"
                min="50"
                max="8000"
                value={height}
                onChange={(e) => { setHeight(parseInt(e.target.value) || 100); setZipBlobUrl(''); }}
                className="w-full bg-neutral-50 border border-neutral-200 px-3 py-2 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-neutral-900 focus:outline-none"
              />
            </div>
          </div>

          {/* Aspect ratios & configuration formats */}
          <div className="space-y-4 font-sans">
            <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-neutral-50/50 text-xs font-semibold text-neutral-600">
              <input
                id="chk-resize-ratio"
                type="checkbox"
                checked={maintainAspect}
                onChange={(e) => { setMaintainAspect(e.target.checked); setZipBlobUrl(''); }}
                className="rounded text-neutral-900 border-neutral-300 focus:ring-neutral-900 w-4 h-4"
              />
              <span>{t.maintainAspectRatio}</span>
            </label>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-neutral-500 uppercase block">{t.outputFormat}</label>
              <select
                id="select-resize-format"
                value={targetFormat}
                onChange={(e) => { setTargetFormat(e.target.value); setZipBlobUrl(''); }}
                className="w-full bg-neutral-50 border border-neutral-200 px-3 py-2 rounded-xl text-sm font-medium focus:ring-1 focus:ring-neutral-900 focus:outline-none"
              >
                <option value="image/jpeg">JPEG (.jpg)</option>
                <option value="image/png">PNG (.png)</option>
                <option value="image/webp">WebP (.webp)</option>
              </select>
            </div>
          </div>

          {/* Core resizing launcher */}
          {images.length > 0 && (
            <div className="pt-2 space-y-2">
              <button
                id="btn-process-batchresize"
                onClick={handleBatchResize}
                disabled={isProcessing}
                className="w-full bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-200 text-white font-sans font-medium text-sm py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 font-semibold"
              >
                {isProcessing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {progress}%
                  </>
                ) : (
                  <>
                    <Grid className="w-4 h-4" />
                    {t.processBtn}
                  </>
                )}
              </button>

              <button
                id="btn-reset-batchresize"
                onClick={handleReset}
                className="w-full bg-neutral-50 hover:bg-neutral-100 text-neutral-600 font-sans font-medium text-xs py-2 rounded-lg transition-all"
              >
                {t.resetBtn}
              </button>
            </div>
          )}
        </div>

        {/* Multi uploader queue space */}
        <div className="md:col-span-2 space-y-6">
          <div
            id="drop-area-batchresizer"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="border-2 border-dashed border-neutral-200 bg-white hover:bg-neutral-50/50 hover:border-neutral-400 cursor-pointer p-8 rounded-3xl text-center transition-all duration-200 group flex flex-col items-center justify-center space-y-3"
            onClick={() => document.getElementById('batchresizer-file-picker')?.click()}
          >
            <input
              id="batchresizer-file-picker"
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
              <p className="text-[11px] text-neutral-400">JPG, PNG, WebP, GIF, SVG</p>
            </div>
          </div>

          {images.length > 0 && (
            <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm space-y-4">
              
              {/* Batch items listing block */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto pr-1">
                {images.map((img) => (
                  <div
                    key={img.id}
                    className="relative rounded-xl border border-neutral-200/50 overflow-hidden bg-neutral-50 p-2 text-center group flex flex-col items-center justify-between gap-1 shadow-sm"
                  >
                    <div className="aspect-square w-16 h-16 bg-white border border-neutral-200/20 rounded-lg flex items-center justify-center overflow-hidden">
                      <img
                        src={img.previewUrl}
                        alt="Preview text"
                        referrerPolicy="no-referrer"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <span className="text-[10px] text-neutral-500 truncate max-w-[100px] font-mono leading-tight">{img.file.name}</span>
                    <button
                      id={`btn-remove-${img.id}`}
                      onClick={() => handleRemove(img.id, img.previewUrl)}
                      className="absolute top-1 right-1 p-1 bg-white hover:bg-rose-50 text-rose-500 border border-neutral-100 rounded-lg opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Progress visual indicator bar */}
              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-neutral-400 font-mono">
                    <span>Compressing image chunks...</span>
                    <span>% {progress}</span>
                  </div>
                  <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-neutral-900 h-full transition-all duration-300 rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Error logs box */}
              {errorStatus && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorStatus}</span>
                </div>
              )}

              {/* ZIP Archive complete item download */}
              {zipBlobUrl && (
                <div className="flex justify-between items-center p-4 bg-emerald-50 border border-emerald-100 rounded-2xl animate-fade-in mt-4">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 font-bold" />
                    <span className="text-xs font-sans font-semibold text-emerald-800">
                      {t.successTitle} {t.toolBatchResizeTitle} {t.statusCompleted}
                    </span>
                  </div>
                  <button
                    id="btn-download-batchresizer-zip"
                    onClick={handleDownloadZip}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-sm flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    {t.downloadZipBtn}
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
