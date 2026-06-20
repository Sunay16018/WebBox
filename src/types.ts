export type Language = 
  | 'TR' | 'EN' | 'AZ' | 'ES' | 'DE' | 'FR' | 'IT' | 'RU' | 'ZH' | 'JA'
  | 'AR' | 'PT' | 'KO' | 'HI' | 'NL' | 'SV' | 'PL' | 'UK' | 'EL' | 'RO'
  | 'BG' | 'CS' | 'DA' | 'FI' | 'NO' | 'FA' | 'HE' | 'UR';

export interface LanguageOption {
  code: Language;
  name: string;
  native: string;
  flag: string;
}

export const SITE_LANGUAGES: LanguageOption[] = [
  { code: 'TR', name: 'Turkish', native: 'Türkçe', flag: '🇹🇷' },
  { code: 'EN', name: 'English', native: 'English', flag: '🇺🇸' },
  { code: 'AZ', name: 'Azerbaijani', native: 'Azərbaycan dili', flag: '🇦🇿' },
  { code: 'ES', name: 'Spanish', native: 'Español', flag: '🇪🇸' },
  { code: 'DE', name: 'German', native: 'Deutsch', flag: '🇩🇪' },
  { code: 'FR', name: 'French', native: 'Français', flag: '🇫🇷' },
  { code: 'IT', name: 'Italian', native: 'Italiano', flag: '🇮🇹' },
  { code: 'RU', name: 'Russian', native: 'Русский', flag: '🇷🇺' },
  { code: 'ZH', name: 'Chinese', native: '中文', flag: '🇨🇳' },
  { code: 'JA', name: 'Japanese', native: '日本語', flag: '🇯🇵' },
  { code: 'AR', name: 'Arabic', native: 'العربية', flag: '🇸🇦' },
  { code: 'PT', name: 'Portuguese', native: 'Português', flag: '🇵🇹' },
  { code: 'KO', name: 'Korean', native: '한국어', flag: '🇰🇷' },
  { code: 'HI', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  { code: 'NL', name: 'Dutch', native: 'Nederlands', flag: '🇳🇱' },
  { code: 'SV', name: 'Swedish', native: 'Svenska', flag: '🇸🇪' },
  { code: 'PL', name: 'Polish', native: 'Polski', flag: '🇵🇱' },
  { code: 'UK', name: 'Ukrainian', native: 'Українська', flag: '🇺🇦' },
  { code: 'EL', name: 'Greek', native: 'Eλληνικά', flag: '🇬🇷' },
  { code: 'RO', name: 'Romanian', native: 'Română', flag: '🇷🇴' },
  { code: 'BG', name: 'Bulgarian', native: 'Български', flag: '🇧🇬' },
  { code: 'CS', name: 'Czech', native: 'Čeština', flag: '🇨🇿' },
  { code: 'DA', name: 'Danish', native: 'Dansk', flag: '🇩🇰' },
  { code: 'FI', name: 'Finnish', native: 'Suomi', flag: '🇫🇮' },
  { code: 'NO', name: 'Norwegian', native: 'Norsk', flag: '🇳🇴' },
  { code: 'FA', name: 'Persian', native: 'فارسى', flag: '🇮🇷' },
  { code: 'HE', name: 'Hebrew', native: 'עברית', flag: '🇮🇱' },
  { code: 'UR', name: 'Urdu', native: 'اردو', flag: '🇵🇰' }
];

export interface TranslationSet {
  brand: string;
  heroTitle: string;
  heroSubtitle: string;
  privacyBadge: string;
  privacyTitle: string;
  privacyDesc: string;
  howItWorksTitle: string;
  howItWorksDesc: string;
  clientProcessingBadge: string;
  
  // Sidebar & Navigation
  exploreTools: string;
  categoryDocTrans: string;
  categoryPdf: string;
  categoryMedia: string;
  categoryImage: string;
  
  // Common Buttons & Words
  uploadAreaText: string;
  uploadAreaSub: string;
  downloadBtn: string;
  processBtn: string;
  resetBtn: string;
  statusProcessing: string;
  statusCompleted: string;
  statusFailed: string;
  successTitle: string;
  errorTitle: string;
  filesSelected: string;
  fileSelected: string;

  // Tool Titles & Descriptions
  toolDocTransTitle: string;
  toolDocTransDesc: string;
  toolTextTransTitle?: string;
  toolTextTransDesc?: string;
  toolFormatConvTitle: string;
  toolFormatConvDesc: string;
  toolPdfMergeTitle: string;
  toolPdfMergeDesc: string;
  toolImgToPdfTitle: string;
  toolImgToPdfDesc: string;
  toolPdfMetaTitle: string;
  toolPdfMetaDesc: string;
  toolAudioExtractTitle: string;
  toolAudioExtractDesc: string;
  toolMediaCutterTitle: string;
  toolMediaCutterDesc: string;
  toolBatchResizeTitle: string;
  toolBatchResizeDesc: string;
  toolWatermarkTitle: string;
  toolWatermarkDesc: string;

  // Modul Specific labels
  targetLang: string;
  sourceLang: string;
  detectedLang: string;
  translateBtn: string;
  previewText: string;
  originalText: string;
  translatedText: string;
  
  // Format Converter
  selectFormat: string;
  quality: string;
  convertBtn: string;
  originalSize: string;
  newSize: string;
  
  // PDF Merge
  addMorePdfs: string;
  dragToReorder: string;
  mergeBtn: string;
  pageCount: string;
  
  // Image to PDF
  imgScaleMode: string;
  imgScaleFit: string;
  imgScaleFill: string;
  pdfOrientation: string;
  portrait: string;
  landscape: string;
  generatePdf: string;
  
  // PDF Meta
  pdfMetaTitleField: string;
  pdfMetaAuthorField: string;
  pdfMetaSubjectField: string;
  pdfMetaKeywordsField: string;
  pdfNoPassword: string;
  pdfPasswordProtect: string;
  pdfPasswordLabel: string;
  applyMetaBtn: string;

  // Audio Extractor
  audioExtractLabel: string;
  audioFormats: string;
  extractAudioBtn: string;
  
  // Media Cutter
  startTime: string;
  endTime: string;
  playBtn: string;
  pauseBtn: string;
  cutBtn: string;
  audioVisualizer: string;
  
  // Batch Resizer
  width: string;
  height: string;
  maintainAspectRatio: string;
  outputFormat: string;
  downloadZipBtn: string;
  
  // Watermark
  watermarkText: string;
  watermarkColor: string;
  watermarkOpacity: string;
  watermarkSize: string;
  watermarkPosition: string;
  positionCenter: string;
  positionTopLeft: string;
  positionTopRight: string;
  positionBottomLeft: string;
  positionBottomRight: string;
  positionTile: string;
  watermarkRotation: string;
  applyWatermarkBtn: string;
  
  // Landing cards info
  zeroServerDesc: string;
  superSpeedTitle: string;
  superSpeedDesc: string;
  privacyGuaranteeTitle: string;
  privacyGuaranteeDesc: string;
}

import { getTranslationsForLanguage } from './translations';

export const TRANSLATIONS: Record<Language, TranslationSet> = {} as Record<Language, TranslationSet>;

SITE_LANGUAGES.forEach((l) => {
  TRANSLATIONS[l.code] = getTranslationsForLanguage(l.code);
});

export type ToolCategory = 'doc' | 'pdf' | 'media' | 'image';

export interface ToolMetadata {
  id: string;
  category: ToolCategory;
  translationTitleKey: keyof TranslationSet;
  translationDescKey: keyof TranslationSet;
  iconName: string;
}

export const TOOLS_LIST: ToolMetadata[] = [
  // Document Translation
  {
    id: 'text-translation',
    category: 'doc',
    translationTitleKey: 'toolTextTransTitle',
    translationDescKey: 'toolTextTransDesc',
    iconName: 'Languages'
  },
  {
    id: 'document-translation',
    category: 'doc',
    translationTitleKey: 'toolDocTransTitle',
    translationDescKey: 'toolDocTransDesc',
    iconName: 'FileText'
  },
  // Format Converter
  {
    id: 'format-converter',
    category: 'doc',
    translationTitleKey: 'toolFormatConvTitle',
    translationDescKey: 'toolFormatConvDesc',
    iconName: 'RefreshCw'
  },
  // PDF Merge
  {
    id: 'pdf-merge',
    category: 'pdf',
    translationTitleKey: 'toolPdfMergeTitle',
    translationDescKey: 'toolPdfMergeDesc',
    iconName: 'FileStack'
  },
  // Image to PDF
  {
    id: 'image-to-pdf',
    category: 'pdf',
    translationTitleKey: 'toolImgToPdfTitle',
    translationDescKey: 'toolImgToPdfDesc',
    iconName: 'ImageUp'
  },
  // PDF Metadata & Lock
  {
    id: 'pdf-meta',
    category: 'pdf',
    translationTitleKey: 'toolPdfMetaTitle',
    translationDescKey: 'toolPdfMetaDesc',
    iconName: 'ShieldAlert'
  },
  // Video Audio Extract
  {
    id: 'video-audio',
    category: 'media',
    translationTitleKey: 'toolAudioExtractTitle',
    translationDescKey: 'toolAudioExtractDesc',
    iconName: 'ScissorsSquareDashedCard' // will be mapped nicely
  },
  // Media Cutter
  {
    id: 'media-cutter',
    category: 'media',
    translationTitleKey: 'toolMediaCutterTitle',
    translationDescKey: 'toolMediaCutterDesc',
    iconName: 'Sliders'
  },
  // Batch Image Resizer
  {
    id: 'batch-resizer',
    category: 'image',
    translationTitleKey: 'toolBatchResizeTitle',
    translationDescKey: 'toolBatchResizeDesc',
    iconName: 'Grid'
  },
  // Image Watermark
  {
    id: 'image-watermark',
    category: 'image',
    translationTitleKey: 'toolWatermarkTitle',
    translationDescKey: 'toolWatermarkDesc',
    iconName: 'FilePen'
  }
];
