import React, { useState } from 'react';
import { Languages, ArrowRight, Trash2, Copy, Volume2, Sparkles, RefreshCw } from 'lucide-react';
import { Language, TranslationSet, TRANSLATIONS } from '../types';

interface TextTranslationProps {
  currentLanguage: Language;
}

export default function TextTranslation({ currentLanguage }: TextTranslationProps) {
  const t: TranslationSet = TRANSLATIONS[currentLanguage];
  const [textInput, setTextInput] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [targetLang, setTargetLang] = useState<Language>('EN');
  const [sourceLang, setSourceLang] = useState<Language>('TR');

  const handleTranslate = async () => {
    if (!textInput.trim()) return;
    setIsTranslating(true);
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang.toLowerCase()}&tl=${targetLang.toLowerCase()}&dt=t&q=${encodeURIComponent(textInput)}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data && data[0]) {
        setTranslatedText(data[0].map((item: any) => item[0] || '').join(''));
      }
    } catch (e) {
      console.error('Translation failed', e);
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-10 px-4">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-extrabold text-neutral-900 tracking-tight">
          {t.toolTextTransTitle || (currentLanguage === 'TR' ? 'Metin Çevirisi' : 'Text Translator')}
        </h2>
        <p className="text-neutral-500 font-medium">
          {t.toolTextTransDesc || (currentLanguage === 'TR' ? 'Hızlı ve doğru çeviri' : 'Fast and accurate translation')}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
            {currentLanguage === 'TR' ? 'Giriş' : 'Input'}
          </label>
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder={currentLanguage === 'TR' ? 'Çevrilecek metin...' : 'Text to translate...'}
            className="w-full h-72 p-6 rounded-3xl bg-neutral-50 border border-neutral-200 focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 transition-all resize-none"
          />
        </div>
        <div className="space-y-3">
          <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
            {currentLanguage === 'TR' ? 'Çeviri' : 'Translation'}
          </label>
          <div className="w-full h-72 p-6 rounded-3xl bg-neutral-900 text-neutral-100 overflow-y-auto">
            {translatedText || (isTranslating ? <div className='animate-pulse'>...</div> : <span className="text-neutral-500">{currentLanguage === 'TR' ? 'Çeviri burada görünecek' : 'Output appears here'}</span>)}
          </div>
        </div>
      </div>

      <button 
        onClick={handleTranslate} 
        disabled={!textInput || isTranslating}
        className="w-full py-5 bg-neutral-900 text-white rounded-3xl font-extrabold text-lg hover:bg-neutral-800 transition-all shadow-lg active:scale-[0.98]"
      >
        {isTranslating ? (currentLanguage === 'TR' ? 'Çeviriliyor...' : 'Translating...') : t.translateBtn}
      </button>
    </div>
  );
}
