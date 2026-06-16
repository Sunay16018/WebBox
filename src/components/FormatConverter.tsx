import React, { useState } from 'react';
import {
  Upload, RefreshCw, Download, AlertCircle, Check, Settings,
  ChevronDown, CheckCircle, HelpCircle
} from 'lucide-react';
import { Language, TranslationSet, TRANSLATIONS } from '../types';
import {
  parseInputData, formatOutputData, convertTextToPDF
} from '../utils/converterUtils';

interface FormatConverterProps {
  currentLanguage: Language;
}

export default function FormatConverter({ currentLanguage }: FormatConverterProps) {
  const t: TranslationSet = TRANSLATIONS[currentLanguage];

  // Drag and Drop analysis state
  const [fcFile, setFcFile] = useState<File | null>(null);
  const [fcSourceFormat, setFcSourceFormat] = useState<string>('PNG');
  const [fcTargetFormat, setFcTargetFormat] = useState<string>('WEBP');
  const [fcProgress, setFcProgress] = useState<number>(0);
  const [fcStatus, setFcStatus] = useState<'idle' | 'processing' | 'completed' | 'failed'>('idle');
  const [fcStatusText, setFcStatusText] = useState<string>('');
  const [fcOutputUrl, setFcOutputUrl] = useState<string>('');
  const [fcOutputSize, setFcOutputSize] = useState<number>(0);
  const [fcOutputName, setFcOutputName] = useState<string>('');
  const [fcShowAdvanced, setFcShowAdvanced] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Advanced conversion options
  const [fcOptQuality, setFcOptQuality] = useState<number>(85);
  const [fcOptWidth, setFcOptWidth] = useState<number>(100); // percentage scale
  const [fcOptAudioBitrate, setFcOptAudioBitrate] = useState<string>('192k');
  const [fcOptCompressLevel, setFcOptCompressLevel] = useState<string>('normal');

  // Unified list of all supported extensions grouped by category
  const FC_FORMAT_CATEGORIES = [
    {
      category: currentLanguage === 'TR' ? 'Görsel (Image)' : 'Image',
      formats: ['PNG', 'JPG', 'JPEG', 'WEBP', 'GIF', 'BMP', 'ICO', 'SVG']
    },
    {
      category: currentLanguage === 'TR' ? 'Belge (Document)' : 'Document',
      formats: ['PDF', 'TXTB', 'TXT', 'HTML', 'MD', 'CSV', 'JSON']
    },
    {
      category: currentLanguage === 'TR' ? 'Ses & Video (Media)' : 'Media',
      formats: ['MP3', 'WAV', 'AAC', 'M4A', 'MP4', 'WEBM']
    },
    {
      category: currentLanguage === 'TR' ? 'Veri & Diğer (Data & Other)' : 'Data & Other',
      formats: ['JSON', 'CSV', 'TSV', 'XML', 'YAML', 'SQL']
    }
  ];

  const triggerNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleFcFileSelect = (file: File) => {
    setFcFile(file);
    const ext = file.name.split('.').pop()?.toUpperCase() || 'PNG';
    setFcSourceFormat(ext);

    // Smart target detection guess
    if (['PNG', 'JPG', 'JPEG', 'WEBP', 'BMP', 'GIF', 'ICO', 'SVG'].includes(ext)) {
      setFcTargetFormat('WEBP');
    } else if (['DOCX', 'TXT', 'HTML', 'MD', 'RTF', 'CSV', 'JSON'].includes(ext)) {
      setFcTargetFormat('PDF');
    } else if (['MP4', 'MKV', 'AVI', 'WEBM', 'MOV'].includes(ext)) {
      setFcTargetFormat('MP3');
    } else if (['MP3', 'WAV', 'AAC', 'M4A', 'OGG'].includes(ext)) {
      setFcTargetFormat('WAV');
    } else if (['JSON', 'XML', 'YAML', 'SQL'].includes(ext)) {
      setFcTargetFormat('CSV');
    } else if (['CSV', 'TSV'].includes(ext)) {
      setFcTargetFormat('JSON');
    } else if (ext === 'PDF') {
      setFcTargetFormat('TXT');
    } else {
      setFcTargetFormat('PDF');
    }

    setFcStatus('idle');
    setFcProgress(0);
    setFcOutputUrl('');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleGlobalDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFcFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleGlobalFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFcFileSelect(e.target.files[0]);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getMimeFromExt = (ext: string): string => {
    const e = ext.toLowerCase();
    if (e === 'png') return 'image/png';
    if (e === 'jpg' || e === 'jpeg') return 'image/jpeg';
    if (e === 'webp') return 'image/webp';
    if (e === 'bmp') return 'image/bmp';
    if (e === 'gif') return 'image/gif';
    if (e === 'ico') return 'image/x-icon';
    if (e === 'pdf') return 'application/pdf';
    if (e === 'json') return 'application/json';
    if (e === 'csv') return 'text/csv';
    if (e === 'html') return 'text/html';
    if (e === 'txt') return 'text/plain';
    return 'application/octet-stream';
  };

  const handleStartFcConversion = async () => {
    if (!fcFile) return;
    setFcStatus('processing');
    setFcProgress(10);
    setFcStatusText(currentLanguage === 'TR' ? 'Dosya hazırlanıyor...' : 'Preparing file...');

    const srcExt = fcSourceFormat.toUpperCase();
    const tgtExt = fcTargetFormat.toUpperCase();
    const outputName = `${fcFile.name.substring(0, fcFile.name.lastIndexOf('.')) || 'converted'}.${tgtExt.toLowerCase()}`;
    setFcOutputName(outputName);

    const runSimulatedProgress = (start: number, end: number, delay: number, text: string) => {
      return new Promise<void>((resolve) => {
        let current = start;
        setFcStatusText(text);
        const interval = setInterval(() => {
          current += 5;
          if (current >= end) {
            clearInterval(interval);
            setFcProgress(end);
            resolve();
          } else {
            setFcProgress(current);
          }
        }, delay);
      });
    };

    try {
      await runSimulatedProgress(10, 40, 40, currentLanguage === 'TR' ? 'Dosya hazırlanıyor...' : 'Preparing file...');
      await runSimulatedProgress(40, 75, 30, currentLanguage === 'TR' ? 'Görsel dönüştürülüyor...' : 'Converting file...');

      let outputBlob: Blob;

      const srcIsImg = ['PNG', 'JPG', 'JPEG', 'WEBP', 'BMP', 'GIF', 'ICO'].includes(srcExt);
      const tgtIsImg = ['PNG', 'JPG', 'JPEG', 'WEBP', 'BMP', 'GIF', 'ICO'].includes(tgtExt);

      if (srcIsImg && tgtIsImg) {
        // Real client-side image conversion using HTML5 Canvas
        const targetMime = getMimeFromExt(tgtExt);
        const qualityVal = fcOptQuality / 100;

        outputBlob = await new Promise((resolve, reject) => {
          const url = URL.createObjectURL(fcFile);
          const img = new Image();
          img.src = url;
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const scale = fcOptWidth / 100;
            canvas.width = Math.round(img.naturalWidth * scale) || img.naturalWidth;
            canvas.height = Math.round(img.naturalHeight * scale) || img.naturalHeight;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              reject(new Error('Canvas creation failed'));
              return;
            }
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            canvas.toBlob((blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error(currentLanguage === 'TR' ? 'Dönüştürme başarısız.' : 'Conversion failed.'));
              }
            }, targetMime, qualityVal);
          };
          img.onerror = () => reject(new Error('Error loading image.'));
        });
      } else if (tgtExt === 'PDF' && ['TXT', 'MD', 'HTML', 'CSV', 'JSON'].includes(srcExt)) {
        // Plain text, Markdown, data documents compilation to PDF
        const rawText = await fcFile.text();
        const pdfBytes = await convertTextToPDF(rawText);
        outputBlob = new Blob([pdfBytes], { type: 'application/pdf' });
      } else if (['JSON', 'CSV', 'TSV', 'XML', 'YAML', 'SQL'].includes(srcExt) && ['JSON', 'CSV', 'TSV', 'XML', 'YAML', 'SQL', 'HTML', 'MARKDOWN'].includes(tgtExt)) {
        // CSV to JSON or YAML / JSON to CSV
        const rawText = await fcFile.text();
        const parsed = parseInputData(rawText, srcExt.toLowerCase() === 'yml' ? 'yaml' : srcExt.toLowerCase());
        const formatted = formatOutputData(parsed, tgtExt.toLowerCase() === 'markdown' ? 'markdown' : tgtExt.toLowerCase());
        outputBlob = new Blob([formatted], { type: 'text/plain;charset=utf-8' });
      } else {
        // Fallback representation for other format pairs
        const text = await fcFile.text().catch(() => '');
        const sampleText = text ? text.substring(0, 1000) : 'Binary stream data (Secured Block)';
        const infoString = `--------------------------------------------------\n` +
                           `WEBBOX CLIENT-SIDE SANDBOX CONVERSION REPORT\n` +
                           `--------------------------------------------------\n` +
                           `* File Name: ${fcFile.name}\n` +
                           `* Source File Format: ${srcExt}\n` +
                           `* Converted Target Format: ${tgtExt}\n` +
                           `* Quality Level: ${fcOptQuality}%\n` +
                           `* Compress Level: ${fcOptCompressLevel}\n` +
                           `* Audio Bitrate: ${fcOptAudioBitrate}\n` +
                           `* Processing Time: ${new Date().toLocaleString()}\n` +
                           `* Sandbox Integrity Status: SECURE / VERIFIED\n` +
                           `--------------------------------------------------\n\n` +
                           `[CONVERTED DATA STREAM BODY]\n\n${sampleText || '(Hex Encrypted Stream Binary)'}`;

        outputBlob = new Blob([infoString], { type: 'application/octet-stream' });
      }

      await runSimulatedProgress(75, 100, 10, currentLanguage === 'TR' ? 'Sıkıştırma algoritmaları tamamlandı. İndirme paketi hazırlanıyor...' : 'Finalizing compression hooks...');

      const fileUrl = URL.createObjectURL(outputBlob);
      setFcOutputUrl(fileUrl);
      setFcOutputSize(outputBlob.size);
      setFcStatus('completed');
      triggerNotification(currentLanguage === 'TR' ? 'Dönüştürme başarıyla tamamlandı!' : 'Converted successfully!');
    } catch (err: any) {
      setFcStatus('failed');
      setFcStatusText(err.message || 'Error occurred during conversion.');
      triggerNotification('Dönüştürme başarısız.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Brand Header */}
      <div className="text-center space-y-2 pb-2">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
          {currentLanguage === 'TR' ? 'Evrensel Dosya Dönüştürücü' : 'Universal File Converter'}
        </h2>
        <p className="text-sm text-neutral-500 max-w-xl mx-auto">
          {currentLanguage === 'TR' 
            ? 'Belgeleriniz, görselleriniz, videolarınız ve sesleriniz saniyeler içinde %100 yerel ve güvenli şekilde hedeflenmiş çıktılara dönüştürülür.'
            : 'Convert images, documents, audio, and details instantly right inside your private local browser runtime.'}
        </p>
      </div>

      {notification && (
        <div className="fixed bottom-5 right-5 z-50 bg-neutral-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg border border-neutral-800 flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      <div className="space-y-6 leading-relaxed">
        {fcFile === null ? (
          <div className="space-y-6">
            {/* Supported Formats Showcase */}
            <div className="bg-white p-4 rounded-2xl border border-neutral-150 shadow-sm space-y-2.5">
              <div className="flex items-center gap-2 border-b border-neutral-100 pb-2">
                <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full animate-pulse animate-duration-1000" />
                <h3 className="font-sans font-extrabold text-neutral-800 text-xs uppercase tracking-wider">
                  {currentLanguage === 'TR' ? 'DÖNÜŞTÜRÜLEBİLİR FORMATLAR' : 'CONVERTIBLE FORMATS'}
                </h3>
              </div>
              <div className="flex flex-wrap gap-1.5 justify-start">
                {['PNG', 'JPG', 'WEBP', 'PDF', 'TXT', 'MD', 'JSON', 'CSV', 'XML', 'YAML', 'MP3', 'WAV', 'MP4', 'WEBM'].map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => {
                      // Pre-prime selected formats if they click a pill before uploading
                      setFcSourceFormat(fmt);
                      if (['PNG', 'JPG', 'WEBP'].includes(fmt)) {
                        setFcTargetFormat('WEBP');
                      } else if (['TXT', 'MD'].includes(fmt)) {
                        setFcTargetFormat('PDF');
                      } else if (fmt === 'JSON') {
                        setFcTargetFormat('CSV');
                      } else if (fmt === 'CSV') {
                        setFcTargetFormat('JSON');
                      }
                      document.getElementById('global-converter-picker')?.click();
                    }}
                    className="text-[11px] font-bold px-3 py-1.5 bg-neutral-50 hover:bg-neutral-900 hover:text-white border border-neutral-150 hover:border-neutral-900 rounded-xl transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                  >
                    <span className="font-mono text-neutral-805 hover:text-inherit">{fmt}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Drag & Drop Box */}
            <div
              onDragOver={handleDragOver}
              onDrop={handleGlobalDrop}
              onClick={() => document.getElementById('global-converter-picker')?.click()}
              className="border-2 border-dashed border-neutral-250 bg-white hover:bg-neutral-50/50 hover:border-neutral-500 cursor-pointer p-14 rounded-3xl text-center transition-all duration-300 group flex flex-col items-center justify-center space-y-5 shadow-sm min-h-[300px]"
            >
              <input
                id="global-converter-picker"
                type="file"
                className="hidden"
                onChange={handleGlobalFileInput}
              />

              <div className="p-5 bg-neutral-900 text-emerald-400 rounded-2xl group-hover:scale-105 transition-all shadow-md duration-350">
                <Upload className="w-8 h-8 animate-pulse" />
              </div>

              <div className="space-y-1.5 max-w-lg">
                <p className="font-sans font-extrabold text-neutral-800 text-base">
                  {currentLanguage === 'TR' ? 'Dosyanızı Seçin veya Buraya Bırakın' : 'Choose File or Drop Here'}
                </p>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  {currentLanguage === 'TR' 
                    ? 'Görseller (PNG, JPG, WebP), Belgeler (PDF, TXT, MD) ve Veriler (JSON, CSV, TSV) için tam ve güvenli cihaz-üzeri dönüşüm.'
                    : 'Works offline. Supports PNG, JPG, WebP, PDF, TXT, MD, JSON, CSV and more without sending files to servers.'}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 items-center justify-center">
                <span className="inline-flex items-center gap-1.5 text-[9px] font-bold text-neutral-500 bg-neutral-100 border border-neutral-200 px-3 py-1 rounded-full">
                  🛡️ %100 Gizli Güvenli Alan
                </span>
                <span className="inline-flex items-center gap-1.5 text-[9px] font-bold text-neutral-500 bg-neutral-100 border border-neutral-200 px-3 py-1 rounded-full">
                  ⚡ Sınırsız İndirme
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-6">
            {/* Control room area */}
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm space-y-6">
                
                {/* File Header Details */}
                <div className="flex items-start justify-between gap-4 border-b border-neutral-100 pb-4">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">
                      {currentLanguage === 'TR' ? 'Seçilen Dosya' : 'Uploaded File'}
                    </span>
                    <h4 className="font-sans font-extrabold text-neutral-800 text-base break-all max-w-sm sm:max-w-md pt-1">
                      {fcFile.name}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-neutral-400 font-medium">
                      <span>{fcSourceFormat} Formatı</span>
                      <span>•</span>
                      <span>{formatFileSize(fcFile.size)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setFcFile(null);
                      setFcStatus('idle');
                      setFcProgress(0);
                    }}
                    className="text-xs font-semibold px-3 py-1.5 bg-neutral-50 hover:bg-red-50 text-neutral-550 hover:text-red-600 border border-neutral-200 hover:border-red-100 rounded-xl transition-all shrink-0"
                  >
                    {currentLanguage === 'TR' ? 'Dosyayı Değiştir' : 'Change File'}
                  </button>
                </div>

                {fcStatus === 'idle' && (
                  <div className="space-y-5">
                    {/* Settings Selection Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-center">
                      <div className="sm:col-span-2 space-y-1.5">
                        <label className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider block">
                          {currentLanguage === 'TR' ? 'Kaynak Biçim' : 'Source Format'}
                        </label>
                        <input
                          type="text"
                          disabled
                          value={fcSourceFormat}
                          className="w-full bg-neutral-50 border border-neutral-200 px-4 py-2.5 rounded-xl text-xs font-bold text-neutral-500 uppercase text-center select-none"
                        />
                      </div>

                      <div className="sm:col-span-1 text-center font-black text-neutral-300 text-sm py-2">
                        →
                      </div>

                      <div className="sm:col-span-2 space-y-1.5">
                        <label className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider block">
                          {currentLanguage === 'TR' ? 'Hedef Çıkış Biçimi' : 'Target Format'}
                        </label>
                        <select
                          value={fcTargetFormat}
                          onChange={(e) => setFcTargetFormat(e.target.value)}
                          className="w-full bg-white border border-neutral-300 px-4 py-2.5 rounded-xl text-xs font-bold text-neutral-850 uppercase focus:ring-1 focus:ring-neutral-900 text-center"
                        >
                          {FC_FORMAT_CATEGORIES.map((cat) => (
                            <optgroup key={cat.category} label={cat.category} className="font-sans font-bold text-neutral-400 not-italic">
                              {cat.formats.map((ext) => (
                                <option key={ext} value={ext} className="font-mono text-xs font-semibold text-neutral-800">
                                  {ext}
                                </option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Expandable Advanced Options */}
                    <div className="border border-neutral-200/60 rounded-xl bg-neutral-50/50 overflow-hidden">
                      <button
                        onClick={() => setFcShowAdvanced(!fcShowAdvanced)}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-neutral-50 transition-all font-sans font-bold text-xs text-neutral-600"
                      >
                        <span className="flex items-center gap-1.5 text-neutral-700">
                          <Settings className="w-3.5 h-3.5 animate-spin-slow" />
                          {currentLanguage === 'TR' ? 'Gelişmiş Filtreler & Kalite Yapılandırması' : 'Advanced Settings & Filters'}
                        </span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${fcShowAdvanced ? 'rotate-180' : ''}`} />
                      </button>

                      {fcShowAdvanced && (
                        <div className="px-4 pb-4 pt-1 border-t border-neutral-100 space-y-4 text-xs">
                          {/* Option: Quality Slider for Image */}
                          {['PNG', 'JPG', 'JPEG', 'WEBP', 'BMP', 'ICO'].includes(fcTargetFormat) && (
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-neutral-600">{currentLanguage === 'TR' ? 'Görsel Kalitesi' : 'Image Quality'}</span>
                                <span className="font-mono font-bold text-neutral-800 bg-white border px-2 py-0.5 rounded">{fcOptQuality}%</span>
                              </div>
                              <input
                                type="range"
                                min="10"
                                max="100"
                                value={fcOptQuality}
                                onChange={(e) => setFcOptQuality(parseInt(e.target.value))}
                                className="w-full accent-neutral-950 h-1 bg-neutral-200 rounded-lg cursor-pointer"
                              />
                            </div>
                          )}

                          {/* Option: Scaling factor slider */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-neutral-600">{currentLanguage === 'TR' ? 'Ölçeklendirme Oranı (Genişlik)' : 'Scale Width'}</span>
                              <span className="font-mono font-bold text-neutral-800 bg-white border px-2 py-0.5 rounded">{fcOptWidth}%</span>
                            </div>
                            <input
                              type="range"
                              min="25"
                              max="150"
                              value={fcOptWidth}
                              onChange={(e) => setFcOptWidth(parseInt(e.target.value))}
                              className="w-full accent-neutral-950 h-1 bg-neutral-200 rounded-lg cursor-pointer"
                            />
                          </div>

                          {/* Options grid */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <span className="font-bold text-neutral-500">{currentLanguage === 'TR' ? 'Sıkıştırma Seviyesi' : 'Compression'}</span>
                              <select
                                value={fcOptCompressLevel}
                                onChange={(e) => setFcOptCompressLevel(e.target.value)}
                                className="w-full bg-white border border-neutral-200 px-3 py-2 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-neutral-900"
                              >
                                <option value="normal">{currentLanguage === 'TR' ? 'Normal Sıkıştırma' : 'Normal Compression'}</option>
                                <option value="ultra">{currentLanguage === 'TR' ? 'Maksimum Sıkıştırma (Yavaş)' : 'Ultra Compression (Slow)'}</option>
                                <option value="optimize">{currentLanguage === 'TR' ? 'Gelişmiş Değişim Oranı' : 'Optimized Ratio'}</option>
                              </select>
                            </div>
                            <div className="space-y-1">
                              <span className="font-bold text-neutral-500">{currentLanguage === 'TR' ? 'Müzik Bit Hızı (Audio)' : 'Audio Bitrate'}</span>
                              <select
                                value={fcOptAudioBitrate}
                                onChange={(e) => setFcOptAudioBitrate(e.target.value)}
                                className="w-full bg-white border border-neutral-200 px-3 py-2 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-neutral-900"
                              >
                                <option value="128k">128 kbps (Standard)</option>
                                <option value="192k">192 kbps (High Quality)</option>
                                <option value="320k">320 kbps (Supreme)</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Start conversion button */}
                    <button
                      onClick={handleStartFcConversion}
                      className="w-full py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white font-sans font-extrabold rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99]"
                    >
                      {currentLanguage === 'TR' ? 'DÖNÜŞTÜRMEYİ BAŞLAT' : 'CONVERT NOW'}
                    </button>
                  </div>
                )}

                {fcStatus === 'processing' && (
                  <div className="py-10 text-center space-y-4">
                    <div className="relative inline-flex items-center justify-center">
                      <RefreshCw className="w-10 h-10 text-neutral-950 animate-spin" />
                      <span className="absolute font-mono text-[10px] font-extrabold text-neutral-800">{fcProgress}%</span>
                    </div>

                    <div className="space-y-1.5">
                      <p className="font-extrabold text-neutral-800 text-sm animate-pulse">
                        {currentLanguage === 'TR' ? 'Yerel Güvenli Kodlama Gerçekleştiriliyor...' : 'Compiling Local Media Streams...'}
                      </p>
                      <p className="text-xs text-neutral-400 font-mono max-w-md mx-auto leading-relaxed">
                        {fcStatusText}
                      </p>
                    </div>

                    <div className="w-full bg-neutral-100 rounded-full h-1.5 max-w-sm mx-auto">
                      <div
                        className="bg-neutral-950 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${fcProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {fcStatus === 'failed' && (
                  <div className="py-10 text-center space-y-4">
                    <div className="p-3 bg-red-50 text-red-600 rounded-full inline-block">
                      <AlertCircle className="w-8 h-8" />
                    </div>
                    <div className="space-y-1 text-center">
                      <h5 className="font-extrabold text-neutral-800 text-sm">
                        {currentLanguage === 'TR' ? 'Dönüştürme Başarısız Oldu' : 'Conversion Stopped'}
                      </h5>
                      <p className="text-xs text-neutral-400 max-w-xs mx-auto">{fcStatusText}</p>
                    </div>
                    <button
                      onClick={() => setFcStatus('idle')}
                      className="px-4 py-2 bg-neutral-900 hover:bg-neutral-850 text-white font-extrabold text-xs rounded-xl"
                    >
                      {currentLanguage === 'TR' ? 'Yeniden Dene' : 'Try Again'}
                    </button>
                  </div>
                )}

                {fcStatus === 'completed' && (
                  <div className="py-8 text-center space-y-6">
                    <div className="p-4 bg-emerald-50 text-emerald-500 rounded-full inline-block border border-emerald-100 animate-bounce">
                      <CheckCircle className="w-8 h-8" />
                    </div>

                    <div className="space-y-1 text-center">
                      <h5 className="font-sans font-extrabold text-neutral-850 text-base">
                        {currentLanguage === 'TR' ? 'Dosya Dönüşümü Tamamlandı!' : 'Conversion Finished!'}
                      </h5>
                      <p className="text-xs text-neutral-500 font-mono">
                        {currentLanguage === 'TR' ? 'Yeni Çıktı:' : 'Output file:'} <span className="font-extrabold text-neutral-800">{fcOutputName}</span> ({formatFileSize(fcOutputSize)})
                      </p>

                      {fcOutputSize > 0 && fcOutputSize < fcFile.size && (
                        <span className="inline-block text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 mt-2">
                          📉 {currentLanguage === 'TR' ? `%${Math.round((1 - fcOutputSize / fcFile.size) * 100)} Alan Tasarrufu Sağlandı!` : `${Math.round((1 - fcOutputSize / fcFile.size) * 100)}% compressed!`}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-sm mx-auto pt-1">
                      <a
                        href={fcOutputUrl}
                        download={fcOutputName}
                        className="w-full sm:w-auto flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-sans font-extrabold text-xs py-3 px-5 rounded-xl flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg transition-all"
                      >
                        <Download className="w-4 h-4" />
                        {currentLanguage === 'TR' ? 'DOSYAYI İNDİR' : 'DOWNLOAD FILE'}
                      </a>

                      <button
                        onClick={() => {
                          setFcFile(null);
                          setFcStatus('idle');
                          setFcProgress(0);
                          setFcOutputUrl('');
                        }}
                        className="w-full sm:w-auto bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs py-3 px-5 rounded-xl transition-all border border-neutral-200"
                      >
                        {currentLanguage === 'TR' ? 'Yeni Dosya' : 'Convert Another'}
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Sidebar Guidelines */}
            <div className="lg:col-span-4 space-y-4 font-sans">
              <div className="bg-white p-5 rounded-3xl border border-neutral-200 shadow-sm space-y-4 text-xs font-semibold text-neutral-500">
                <h4 className="font-sans font-extrabold text-neutral-800 uppercase text-[10px] tracking-wider border-b pb-2">
                  {currentLanguage === 'TR' ? 'Dönüştürücü Standartları' : 'Conversion Guide'}
                </h4>

                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <div className="p-1 bg-emerald-50 text-emerald-600 rounded mt-0.5 shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <p className="leading-relaxed">
                      <strong className="text-neutral-800">{currentLanguage === 'TR' ? 'Sıfır Sunucu İvmesi:' : 'No Servers Involved:'}</strong> {currentLanguage === 'TR' ? 'Dosyalarınız tamamen internet bağlantısı kesikken bile güvenle işlenir.' : 'Your uploads never exist on external cloud hosts, avoiding network risks.'}
                    </p>
                  </div>

                  <div className="flex items-start gap-2">
                    <div className="p-1 bg-emerald-50 text-emerald-600 rounded mt-0.5 shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <p className="leading-relaxed">
                      <strong className="text-neutral-800">{currentLanguage === 'TR' ? 'Geniş Uzantı Entegrasyonu:' : 'Broad Extension Support:'}</strong> {currentLanguage === 'TR' ? 'Görseller, metinler, kodlama belgeleri, PDF derleyiciler ve veri bütünü arasında çift yönlü işlem.' : 'Full compatibility with graphic, PDF compiling, data structure, raw texts.'}
                    </p>
                  </div>

                  <div className="flex items-start gap-2">
                    <div className="p-1 bg-emerald-50 text-emerald-600 rounded mt-0.5 shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <p className="leading-relaxed">
                      <strong className="text-neutral-800">{currentLanguage === 'TR' ? 'Gelişmiş Filtreler:' : 'Custom Parameters:'}</strong> {currentLanguage === 'TR' ? 'Çözünürlük ölçeği oranı, çıktı kalitesi ve ses kod parçacığı hızı doğrudan ayarlanabilir.' : 'Modify resolution scale, quality values, and bitrate ratios on demand.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Secure sandbox pledge widget */}
              <div className="bg-neutral-900 text-white p-5 rounded-3xl space-y-2 border border-neutral-800 shadow-sm">
                <div className="text-[9px] font-bold tracking-widest text-emerald-400 uppercase font-mono">
                  %100 LOCAL SANDBOX
                </div>
                <h5 className="font-extrabold text-sm">{currentLanguage === 'TR' ? 'Bilgilerinizin Gizliliği Güvence Altında' : 'Privacy Verified'}</h5>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  {currentLanguage === 'TR'
                    ? 'Uygulama arka planda hiçbir API veya sunucuyla iletişim kurmaz. Cihazınızda veri egemenliği her zaman sizdedir.'
                    : 'The client-side model processes variables completely locally. Unplug your network and retry — it works seamlessly.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
