import React, { useState } from 'react';
import { Upload, FileText, Sparkles, RefreshCw, Download, Trash2 } from 'lucide-react';
import { Language, TranslationSet, TRANSLATIONS } from '../types';

interface DocumentTranslationProps {
  currentLanguage: Language;
}

export default function DocumentTranslation({ currentLanguage }: DocumentTranslationProps) {
  const t: TranslationSet = TRANSLATIONS[currentLanguage];
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [targetLang, setTargetLang] = useState<Language>('EN');
  const [sourceLang, setSourceLang] = useState<Language>('TR');

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleTranslateDoc = async () => {
    if (!file) return;
    setIsProcessing(true);
    // Simulation or actual implementation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessing(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-10 px-4">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-extrabold text-neutral-900 tracking-tight">
          {t.toolDocTransTitle || (currentLanguage === 'TR' ? 'Belge Çevirisi' : 'Document Translator')}
        </h2>
        <p className="text-neutral-500 font-medium">
          {t.toolDocTransDesc || (currentLanguage === 'TR' ? 'Dosyalarınızı hızlıca çevirin' : 'Translate your files quickly')}
        </p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
        <label className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-neutral-200 rounded-3xl cursor-pointer hover:bg-neutral-50 transition-all hover:border-neutral-300">
            <Upload className="w-12 h-12 text-neutral-300 mb-4" />
            <span className="text-sm text-neutral-500 font-semibold">{file ? file.name : (currentLanguage === 'TR' ? 'Dosya seçin veya sürükleyin' : 'Select or drop file')}</span>
            <input type="file" className="hidden" onChange={handleFileSelected} />
        </label>
        
        <button 
          onClick={handleTranslateDoc}
          disabled={!file || isProcessing}
          className="w-full mt-8 py-5 bg-neutral-900 text-white rounded-3xl font-extrabold text-lg hover:bg-neutral-800 transition-all shadow-lg active:scale-[0.98] disabled:opacity-50"
        >
          {isProcessing ? (currentLanguage === 'TR' ? 'Çevriliyor...' : 'Translating...') : t.translateBtn}
        </button>
      </div>
    </div>
  );
}
