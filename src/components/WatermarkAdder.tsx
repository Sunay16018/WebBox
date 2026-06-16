import React, { useState, useRef, useEffect } from 'react';
import { Upload, FilePen, Check, AlertCircle, Download, FileImage, Sliders } from 'lucide-react';
import { Language, TranslationSet, TRANSLATIONS } from '../types';

interface WatermarkAdderProps {
  currentLanguage: Language;
}

export default function WatermarkAdder({ currentLanguage }: WatermarkAdderProps) {
  const t: TranslationSet = TRANSLATIONS[currentLanguage];

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [watermarkText, setWatermarkText] = useState<string>('CONFIDENTIAL');
  const [color, setColor] = useState<string>('#ffffff');
  const [opacity, setOpacity] = useState<number>(0.4);
  const [fontSize, setFontSize] = useState<number>(32);
  const [rotation, setRotation] = useState<number>(-30);
  const [position, setPosition] = useState<string>('center');
  const [isProcessing, setIsProcessing] = useState(false);
  const [readyUrl, setReadyUrl] = useState<string>('');
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Auto compile and redraw canvas whenever values change! Live Preview!
  useEffect(() => {
    if (previewUrl) {
      applyWatermark();
    }
  }, [previewUrl, watermarkText, color, opacity, fontSize, rotation, position]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleImageSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleImageSelected(e.target.files[0]);
    }
  };

  const handleImageSelected = (file: File) => {
    setErrorStatus(null);
    setReadyUrl('');

    if (!file.type.startsWith('image/')) {
      setErrorStatus('Lütfen geçerli bir görsel dosyası seçin.');
      return;
    }

    setImageFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const applyWatermark = () => {
    if (!previewUrl) return;
    setIsProcessing(true);

    const img = new window.Image();
    img.src = previewUrl;
    img.onload = () => {
      try {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Draw original background image
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        // Watermark properties setups
        ctx.save();
        ctx.font = `bold ${fontSize}px Inter, sans-serif`;
        
        // RGBA Color calculation with opacity slider
        const hex = color.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16) || 0;
        const g = parseInt(hex.substring(2, 4), 16) || 0;
        const b = parseInt(hex.substring(4, 6), 16) || 0;
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';

        const metrics = ctx.measureText(watermarkText);
        const textWidth = metrics.width;

        const rotateRad = (rotation * Math.PI) / 180;

        if (position === 'tile') {
          // Draw tiled watermarks across the whole canvas space
          const gapX = textWidth + 120;
          const gapY = fontSize + 150;

          for (let x = -200; x < canvas.width + 200; x += gapX) {
            for (let y = -200; y < canvas.height + 200; y += gapY) {
              ctx.save();
              ctx.translate(x, y);
              ctx.rotate(rotateRad);
              ctx.fillText(watermarkText, 0, 0);
              ctx.restore();
            }
          }
        } else {
          // Position variables calculation
          let targetX = canvas.width / 2;
          let targetY = canvas.height / 2;

          const padding = 30 + fontSize;

          if (position === 'top-left') {
            targetX = padding + textWidth / 2;
            targetY = padding;
          } else if (position === 'top-right') {
            targetX = canvas.width - (padding + textWidth / 2);
            targetY = padding;
          } else if (position === 'bottom-left') {
            targetX = padding + textWidth / 2;
            targetY = canvas.height - padding;
          } else if (position === 'bottom-right') {
            targetX = canvas.width - (padding + textWidth / 2);
            targetY = canvas.height - padding;
          }

          // Single centered/positioned watermark translation
          ctx.translate(targetX, targetY);
          ctx.rotate(rotateRad);
          ctx.fillText(watermarkText, 0, 0);
        }

        ctx.restore();

        // Export data
        const dataUrl = canvas.toDataURL(imageFile?.type || 'image/png', 0.9);
        setReadyUrl(dataUrl);

      } catch (err) {
        setErrorStatus('Filigran çizilirken hata oluştu.');
      } finally {
        setIsProcessing(false);
      }
    };
  };

  const handleDownload = () => {
    if (!readyUrl || !imageFile) return;

    const base = imageFile.name.substring(0, imageFile.name.lastIndexOf('.')) || imageFile.name;
    const ext = imageFile.name.substring(imageFile.name.lastIndexOf('.'));

    const a = document.createElement('a');
    a.href = readyUrl;
    a.download = `${base}_watermarked${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleReset = () => {
    setImageFile(null);
    setPreviewUrl('');
    setReadyUrl('');
    setErrorStatus(null);
  };

  return (
    <div id="watermark-adder-container" className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <canvas ref={canvasRef} className="hidden" />

      {/* Description Header */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm flex items-start gap-4">
        <div className="p-3 bg-neutral-900 rounded-xl text-white">
          <FilePen className="w-6 h-6 animate-pulse" />
        </div>
        <div className="space-y-1">
          <h2 className="font-sans font-bold text-lg text-neutral-900">{t.toolWatermarkTitle}</h2>
          <p className="text-sm text-neutral-500 leading-relaxed">{t.toolWatermarkDesc}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Configurations drawer */}
        <div className="md:col-span-1 bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm space-y-6">
          <h3 className="font-sans font-bold text-sm text-neutral-800 uppercase tracking-wider">{t.exploreTools}</h3>

          {/* Text Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-500 uppercase block">{t.watermarkText}</label>
            <input
              id="input-watermark-text"
              type="text"
              value={watermarkText}
              onChange={(e) => setWatermarkText(e.target.value)}
              className="w-full bg-neutral-50 border border-neutral-200 px-3 py-2 rounded-xl text-xs font-bold font-sans focus:ring-1 focus:ring-neutral-900 focus:outline-none"
            />
          </div>

          {/* Color & Opacity Slider */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-500 uppercase block">{t.watermarkColor}</label>
              <div className="flex items-center gap-1.5 bg-neutral-50 border border-neutral-200 p-1.5 rounded-xl">
                <input
                  id="color-watermark"
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer border-0 p-0 overflow-hidden bg-transparent"
                />
                <span className="font-mono text-xs font-bold text-neutral-700">{color.toUpperCase()}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-neutral-500 uppercase">{t.watermarkOpacity}</label>
                <span className="font-mono text-xs font-bold text-neutral-700">{Math.round(opacity * 100)}%</span>
              </div>
              <input
                id="range-watermark-opacity"
                type="range"
                min="0.05"
                max="1.0"
                step="0.05"
                value={opacity}
                onChange={(e) => setOpacity(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-neutral-100 rounded-lg appearance-none cursor-pointer mt-3"
              />
            </div>
          </div>

          {/* Font settings & Rotation degree slider */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-500 uppercase">{t.watermarkSize} (px)</label>
              <input
                id="input-watermark-size"
                type="number"
                min="10"
                max="250"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value) || 12)}
                className="w-full bg-neutral-50 border border-neutral-200 px-3 py-2 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-neutral-900 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5 font-sans">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-neutral-500 uppercase">{t.watermarkRotation}</label>
                <span className="font-mono text-xs font-bold text-neutral-700">{rotation}°</span>
              </div>
              <input
                id="range-watermark-rotation"
                type="range"
                min="-180"
                max="180"
                step="5"
                value={rotation}
                onChange={(e) => setRotation(parseInt(e.target.value))}
                className="w-full h-1.5 bg-neutral-100 rounded-lg appearance-none cursor-pointer mt-3.5"
              />
            </div>
          </div>

          {/* Position Layout Selection dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-500 uppercase block">{t.watermarkPosition}</label>
            <select
              id="select-watermark-position"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="w-full bg-neutral-50 border border-neutral-200 px-3 py-2 rounded-xl text-sm font-medium focus:ring-1 focus:ring-neutral-900 focus:outline-none"
            >
              <option value="center">{t.positionCenter}</option>
              <option value="top-left">{t.positionTopLeft}</option>
              <option value="top-right">{t.positionTopRight}</option>
              <option value="bottom-left">{t.positionBottomLeft}</option>
              <option value="bottom-right">{t.positionBottomRight}</option>
              <option value="tile">{t.positionTile}</option>
            </select>
          </div>

          {imageFile && (
            <button
              id="btn-reset-watermark"
              onClick={handleReset}
              className="w-full bg-neutral-55 hover:bg-neutral-100 text-neutral-600 font-sans font-medium text-xs py-2 rounded-lg transition-all border border-neutral-200"
            >
              {t.resetBtn}
            </button>
          )}
        </div>

        {/* Workspace preview element */}
        <div className="md:col-span-2 space-y-6">
          {!imageFile ? (
            <div
              id="drop-area-watermark"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed border-neutral-200 bg-white hover:bg-neutral-50/50 hover:border-neutral-400 cursor-pointer p-12 rounded-3xl text-center transition-all duration-200 group flex flex-col items-center justify-center space-y-4"
              onClick={() => document.getElementById('watermark-file-picker')?.click()}
            >
              <input
                id="watermark-file-picker"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileInput}
              />
              <div className="p-4 bg-neutral-50 rounded-2xl group-hover:scale-105 transition-transform">
                <Upload className="w-8 h-8 text-neutral-400 group-hover:text-neutral-900" />
              </div>
              <div className="space-y-1">
                <p className="font-sans font-semibold text-neutral-800 text-sm">{t.uploadAreaText}</p>
                <p className="text-xs text-neutral-400">PNG, JPG, WebP</p>
                <p className="text-xs font-mono text-neutral-400 underline pt-1 font-medium">{t.uploadAreaSub}</p>
              </div>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm space-y-6 animate-fade-in">
              
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-neutral-100 rounded-lg text-neutral-700">
                    <FileImage className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-neutral-800">{imageFile.name}</h4>
                    <p className="text-xs text-neutral-400 font-mono">{(imageFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <button
                  id="btn-remove-watermark-src"
                  onClick={handleReset}
                  className="text-xs font-semibold text-rose-500 hover:bg-rose-50 px-2.5 py-1 rounded-lg transition-all"
                >
                  {t.resetBtn}
                </button>
              </div>

              {/* Dynamic canvas live preview window */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-mono tracking-wider uppercase text-neutral-400 block">{t.previewText} (Live Canvas Render)</span>
                <div className="aspect-video bg-neutral-50 rounded-2xl border border-neutral-200 overflow-hidden flex items-center justify-center p-2">
                  {readyUrl ? (
                    <img
                      src={readyUrl}
                      alt="Watermarked Preview"
                      referrerPolicy="no-referrer"
                      className="max-h-full max-w-full object-contain rounded-lg shadow"
                    />
                  ) : (
                    <div className="text-xs text-neutral-400 font-sans p-4">{t.statusProcessing}</div>
                  )}
                </div>
              </div>

              {/* Error warning boxes */}
              {errorStatus && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorStatus}</span>
                </div>
              )}

              {/* Secure Download trigger and status report */}
              {readyUrl && (
                <div className="pt-2 flex items-center justify-between bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 animate-fade-in">
                  <span className="text-xs font-sans font-semibold text-emerald-800">{t.successTitle} {t.toolWatermarkTitle} {t.statusCompleted}</span>
                  <button
                    id="btn-download-watermarked"
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
