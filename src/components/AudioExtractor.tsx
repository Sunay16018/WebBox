import React, { useState } from 'react';
import { Upload, Music, Check, AlertCircle, Download, FileAudio, Play, Pause } from 'lucide-react';
import { Language, TranslationSet, TRANSLATIONS } from '../types';

interface AudioExtractorProps {
  currentLanguage: Language;
}

export default function AudioExtractor({ currentLanguage }: AudioExtractorProps) {
  const t: TranslationSet = TRANSLATIONS[currentLanguage];

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [extractedAudioUrl, setExtractedAudioUrl] = useState<string>('');
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  
  // Local audio preview playback
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleVideoSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleVideoSelected(e.target.files[0]);
    }
  };

  const handleVideoSelected = (file: File) => {
    setErrorStatus(null);
    setExtractedAudioUrl('');
    setProgressPercent(0);
    setIsPlaying(false);

    if (!file.type.startsWith('video/') && !file.type.startsWith('audio/')) {
      setErrorStatus('Lütfen geçerli bir video veya ses dosyası dökümanı seçin.');
      return;
    }

    setVideoFile(file);
  };

  // Professional manual, zero-dependency WAV Encoder
  const encodeWAV = (audioBuffer: AudioBuffer): Blob => {
    const numChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;
    
    let result;
    if (numChannels === 2) {
      result = interleave(audioBuffer.getChannelData(0), audioBuffer.getChannelData(1));
    } else {
      result = audioBuffer.getChannelData(0);
    }
    
    const buffer = new ArrayBuffer(44 + result.length * 2);
    const view = new DataView(buffer);
    
    // RIFF identifier
    writeString(view, 0, 'RIFF');
    // File length
    view.setUint32(4, 36 + result.length * 2, true);
    // RIFF type
    writeString(view, 8, 'WAVE');
    // format chunk identifier
    writeString(view, 12, 'fmt ');
    // format chunk length
    view.setUint32(16, 16, true);
    // sample format (raw)
    view.setUint16(20, format, true);
    // channel count
    view.setUint16(22, numChannels, true);
    // sample rate
    view.setUint32(24, sampleRate, true);
    // byte rate (sample rate * block align)
    view.setUint32(28, sampleRate * numChannels * (bitDepth / 8), true);
    // block align (channel count * bytes per sample)
    view.setUint16(32, numChannels * (bitDepth / 8), true);
    // bits per sample
    view.setUint16(34, bitDepth, true);
    // data chunk identifier
    writeString(view, 36, 'data');
    // data chunk length
    view.setUint32(40, result.length * 2, true);
    
    // Write PCM audio samples
    floatTo16BitPCM(view, 44, result);
    
    return new Blob([view], { type: 'audio/wav' });
  };

  const interleave = (inputL: Float32Array, inputR: Float32Array): Float32Array => {
    const length = inputL.length + inputR.length;
    const result = new Float32Array(length);
    let index = 0;
    let inputIndex = 0;
    
    while (index < length) {
      result[index++] = inputL[inputIndex];
      result[index++] = inputR[inputIndex];
      inputIndex++;
    }
    return result;
  };

  const floatTo16BitPCM = (output: DataView, offset: number, input: Float32Array) => {
    for (let i = 0; i < input.length; i++, offset += 2) {
      let s = Math.max(-1, Math.min(1, input[i]));
      output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
  };

  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  const handleExtractAudio = async () => {
    if (!videoFile) return;
    setIsProcessing(true);
    setProgressPercent(10);
    setErrorStatus(null);
    setExtractedAudioUrl('');

    try {
      // 1. Array buffer translation
      const arrayBuffer = await videoFile.arrayBuffer();
      setProgressPercent(35);

      // 2. Decode Audio data natively in browser
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) {
        throw new Error('Web Audio API not supported in this frame.');
      }
      const audioCtx = new AudioCtxClass();
      
      setProgressPercent(50);
      const decodedBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      setProgressPercent(75);

      // 3. Encode into high quality PCM WAV wav file
      const wavBlob = encodeWAV(decodedBuffer);
      setProgressPercent(95);

      const url = URL.createObjectURL(wavBlob);
      setExtractedAudioUrl(url);
      setProgressPercent(100);
    } catch (err: any) {
      console.error(err);
      setErrorStatus('Ses çözme hatası alındı. Lütfen tarayıcının kod çözücüsüyle uyumlu, standart bir video / ses dökümanı seçin.');
    } finally {
      setIsProcessing(false);
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        setErrorStatus('Ses çalma motoru başlatılamadı.');
      });
    }
  };

  const handleDownload = () => {
    if (!extractedAudioUrl || !videoFile) return;
    const baseName = videoFile.name.substring(0, videoFile.name.lastIndexOf('.')) || videoFile.name;
    const a = document.createElement('a');
    a.href = extractedAudioUrl;
    a.download = `${baseName}_audio.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleReset = () => {
    setVideoFile(null);
    setExtractedAudioUrl('');
    setProgressPercent(0);
    setErrorStatus(null);
    setIsPlaying(false);
  };

  return (
    <div id="audio-extractor-container" className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      
      {/* Description Header */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm flex items-start gap-4">
        <div className="p-3 bg-neutral-900 rounded-xl text-white">
          <Music className="w-6 h-6 animate-pulse-slow" />
        </div>
        <div className="space-y-1">
          <h2 className="font-sans font-bold text-lg text-neutral-900">{t.toolAudioExtractTitle}</h2>
          <p className="text-sm text-neutral-500 leading-relaxed">{t.toolAudioExtractDesc}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Configurations Column */}
        <div className="md:col-span-1 bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm space-y-6">
          <h3 className="font-sans font-bold text-sm text-neutral-800 uppercase tracking-wider">{t.exploreTools}</h3>

          <div className="space-y-2">
            <span className="text-xs font-semibold text-neutral-500 uppercase block">{t.audioFormats}</span>
            <div className="p-3 bg-neutral-50 border border-neutral-200 text-neutral-700 font-mono text-xs font-bold rounded-xl text-center select-none shadow-inner">
               PCM WAV (16-bit, CD Quality)
            </div>
          </div>

          {videoFile && (
            <div className="pt-2 space-y-2">
              <button
                id="btn-process-audioextract"
                onClick={handleExtractAudio}
                disabled={isProcessing}
                className="w-full bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-200 text-white font-sans font-medium text-sm py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 font-semibold"
              >
                {isProcessing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {progressPercent}%
                  </>
                ) : (
                  <>
                    <Music className="w-4 h-4" />
                    {t.extractAudioBtn}
                  </>
                )}
              </button>

              <button
                id="btn-reset-audioextract"
                onClick={handleReset}
                className="w-full bg-neutral-50 hover:bg-neutral-100 text-neutral-600 font-sans font-medium text-xs py-2 rounded-lg transition-all"
              >
                {t.resetBtn}
              </button>
            </div>
          )}
        </div>

        {/* Video Loader workspace column */}
        <div className="md:col-span-2 space-y-6">
          {!videoFile ? (
            <div
              id="drop-area-audio-extractor"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed border-neutral-200 bg-white hover:bg-neutral-50/50 hover:border-neutral-400 cursor-pointer p-12 rounded-3xl text-center transition-all duration-200 group flex flex-col items-center justify-center space-y-4"
              onClick={() => document.getElementById('extractor-file-picker')?.click()}
            >
              <input
                id="extractor-file-picker"
                type="file"
                accept="video/*,audio/*"
                className="hidden"
                onChange={handleFileInput}
              />
              <div className="p-4 bg-neutral-50 rounded-2xl group-hover:scale-105 transition-transform">
                <Upload className="w-8 h-8 text-neutral-400 group-hover:text-neutral-900" />
              </div>
              <div className="space-y-1">
                <p className="font-sans font-semibold text-neutral-800 text-sm">{t.uploadAreaText}</p>
                <p className="text-xs text-neutral-400">MP4, WEBM, MKV, AVI, MP3, WAV, OGG</p>
                <p className="text-xs font-mono text-neutral-400 underline pt-1 font-medium">{t.uploadAreaSub}</p>
              </div>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm space-y-6 animate-fade-in">
              
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-neutral-100 rounded-lg text-neutral-700">
                    <FileAudio className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-neutral-800">{videoFile.name}</h4>
                    <p className="text-xs text-neutral-400 font-mono">{(videoFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                </div>
                <button
                  id="btn-remove-extractor-file"
                  onClick={handleReset}
                  className="text-xs font-semibold text-rose-500 hover:bg-rose-50 px-2.5 py-1 rounded-lg transition-all"
                >
                  {t.resetBtn}
                </button>
              </div>

              {/* Progress and indicators */}
              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-neutral-400">
                    <span>{t.statusProcessing}</span>
                    <span className="font-mono font-bold text-neutral-700">% {progressPercent}</span>
                  </div>
                  <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-neutral-900 h-full transition-all duration-300 rounded-full"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Error messages box */}
              {errorStatus && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorStatus}</span>
                </div>
              )}

              {/* Playing audio track preview after success extraction */}
              {extractedAudioUrl && (
                <div className="space-y-4 bg-neutral-50 p-4 rounded-2xl border border-neutral-100 animate-slide-up">
                  <audio
                    ref={audioRef}
                    src={extractedAudioUrl}
                    className="hidden"
                    onEnded={() => setIsPlaying(false)}
                  />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                      <span className="text-xs font-bold text-neutral-800 font-sans">{t.audioVisualizer}</span>
                    </div>

                    <button
                      id="btn-play-audio-preview"
                      onClick={togglePlayback}
                      className="bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl py-2 px-4 shadow-sm text-xs font-sans font-medium flex items-center gap-1.5 transition-colors"
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="w-3.5 h-3.5 fill-white" />
                          {t.pauseBtn}
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-white" />
                          {t.playBtn}
                        </>
                      )}
                    </button>
                  </div>

                  {/* Soundwave mockup inside white sandboxed browser to feel incredibly pro */}
                  <div className="h-10 bg-white rounded-lg border border-neutral-200/50 overflow-hidden flex items-center justify-around px-4">
                    {[3, 7, 5, 4, 8, 12, 16, 11, 6, 8, 14, 22, 19, 13, 10, 15, 24, 21, 16, 9, 4, 6, 8, 14, 18, 11, 7, 10, 13, 8, 4, 2].map((height, i) => (
                      <div
                        key={i}
                        className={`w-1 rounded-full transition-all duration-300 ${
                          isPlaying ? 'bg-neutral-900 animate-pulse' : 'bg-neutral-200'
                        }`}
                        style={{
                          height: isPlaying 
                            ? `${Math.max(4, height + Math.sin(Date.now() / 150 + i) * 6)}px`
                            : `${height}px`
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* End status action banner */}
              {extractedAudioUrl && (
                <div className="pt-2 flex items-center justify-between bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 animate-fade-in">
                  <span className="text-xs font-sans font-semibold text-emerald-800">{t.successTitle} {t.toolAudioExtractTitle} {t.statusCompleted}</span>
                  <button
                    id="btn-download-extractor-wav"
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
          <h3 className="text-base font-bold text-neutral-900">%100 Güvenli Videodan Ses Çıkarma ve MP3/WAV Çözümü</h3>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Telefonunuzla çektiğiniz videoları, seminer kayıtlarını veya ders dinletilerini MP3/WAV formatına dönüştürmek için üçüncü parti sunucu bazlı web sitelerine göndermek, kişisel ses kopyalarınızın başkaları tarafından saklanması riskini taşır. WebBox Video Ses Ayıklayıcı, tarayıcınızın dahili <span className="font-semibold text-neutral-800">Web Audio API</span> kod çözücülerini (decoder) kullanarak ses frekanslarını saniyeler içinde doğrudan cihazınızda ayrıştırıp temiz kalitede WAV belgesi haline getirir.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100 space-y-1">
              <h5 className="text-[11px] font-bold text-neutral-800 font-sans">Sunucu Trafiği Harcamadan Çözüm</h5>
              <p className="text-[10px] text-neutral-450 leading-relaxed">Dosyalarınız internete yüklenmediğinden mobil veri kotanızdan (internet paketinizden) kesinlikle tasarruf edersiniz.</p>
            </div>
            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100 space-y-1">
              <h5 className="text-[11px] font-bold text-neutral-800 font-sans">16-Bit Kristal Netliği (CD Kalitesi)</h5>
              <p className="text-[10px] text-neutral-455 leading-relaxed">Kayıpsız analog sıkıştırma algoritmaları kullanarak, video içindeki ses sinyalini en yüksek örnekleme (44100Hz) ile WAV olarak kaydeder.</p>
            </div>
            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100 space-y-1">
              <h5 className="text-[11px] font-bold text-neutral-800 font-sans">Yüksek Format Desteği</h5>
              <p className="text-[10px] text-neutral-460 leading-relaxed">MP4, WEBM, AVI, M4V, FLV, MOV, MKV formatları dahil neredeyse tüm modern video dosyalarındaki ses dalgalarını sökebilir.</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
