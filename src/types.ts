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

const BASE_TRANSLATIONS: Record<'TR' | 'EN' | 'ES' | 'DE', TranslationSet> = {
  TR: {
    brand: "WebBox",
    heroTitle: "Araç Kutunuz Tarayıcınızda.",
    heroSubtitle: "%100 Güvenli, tamamen beleş. Tüm dosyalarınız sadece cihazınızda işlenir, uçtan uca gizlilik korunur.",
    privacyBadge: "%100 GÜVENLİ",
    privacyTitle: "Neden Sunucusuz?",
    privacyDesc: "Dosyalarınız hiçbir uzak sunucuya yüklenmez. Tüm sıkıştırma, birleştirme, kesme ve çeviri işlemleri doğrudan tarayıcınızın belleğinde (Client-Side) gerçekleşir. Bilgileriniz asla internete sızmaz.",
    howItWorksTitle: "Nasıl Çalışır?",
    howItWorksDesc: "Hızlı, bağımsız ve gizlilik odaklı. FFmpeg, Web Audio ve Canvas gibi gelişmiş teknolojiler kullanarak dosya işlemleri bilgisayarınızın gücüyle saniyeler içinde tamamlanır.",
    clientProcessingBadge: "Cihazınızda Çalışıyor",
    exploreTools: "Araçları Keşfedin",
    categoryDocTrans: "Belge & Çeviri",
    categoryPdf: "PDF Araçları",
    categoryMedia: "Medya & Ses",
    categoryImage: "Görsel İşlemleri",
    uploadAreaText: "Dosyaları sürükleyip bırakın veya tıklayarak seçin",
    uploadAreaSub: "Dosyalarınız cihazınızdan asla ayrılmaz",
    downloadBtn: "İndir",
    processBtn: "İşlemi Başlat",
    resetBtn: "Temizle",
    statusProcessing: "İşleniyor...",
    statusCompleted: "Tamamlandı",
    statusFailed: "Başarısız Oldu",
    successTitle: "Başarılı!",
    errorTitle: "Hata oluştu",
    filesSelected: "dosya seçildi",
    fileSelected: "dosya seçildi",
    
    toolDocTransTitle: "Evrensel Belge Çevirici",
    toolDocTransDesc: "HTML, JSON, CSV, SRT veya TXT belgelerinizi yapısını ve formatını bozmadan yerel tarayıcı motoruyla hedef dile çevirin.",
    toolFormatConvTitle: "Evrensel Dosya Dönüştürücü",
    toolFormatConvDesc: "Belgeleri (PDF, DOCX, TXT, HTML, Markdown), Görselleri (PNG, JPG, WebP, SVG, GIF, BMP, ICO), Sesleri (MP3, WAV, AAC, M4A, OGG) ve Videoları (MP4, MKV, AVI, WEBM) her formattan her formata %100 güvenli ve reklamsız şekilde doğrudan tarayıcınızda dönüştürün.",
    toolPdfMergeTitle: "PDF Birleştirici",
    toolPdfMergeDesc: "Birden fazla PDF dosyasını seçin, sıraya koyun ve tek bir PDF belgesi halinde anında birleştirin.",
    toolImgToPdfTitle: "Görselden PDF'e",
    toolImgToPdfDesc: "JPG, PNG veya WebP görsellerinizi standart ölçekli, tek bir PDF belgesine dönüştürün.",
    toolPdfMetaTitle: "PDF Güvenceleme & Meta",
    toolPdfMetaDesc: "PDF belgenizin başlık, yazar meta verilerini düzenleyin ve isterseniz şifreleyerek güvence altına alın.",
    toolAudioExtractTitle: "Videodan Ses Ayıklayıcı",
    toolAudioExtractDesc: "Video dosyalarınızın ses parçalarını tarayıcıda çözüp MP3/WAV formatında mükemmel kalitede ayıklayın.",
    toolMediaCutterTitle: "Hassas Ses/Video Kesici",
    toolMediaCutterDesc: "Medyalarınızdan istediğiniz aralığı seçin, anında oynatıp kesin ve bilgisayarınıza indirin.",
    toolBatchResizeTitle: "Toplu Görsel Boyutlandırıcı",
    toolBatchResizeDesc: "Birden çok görseli aynı anda yükleyip boyutlandırın ve zip formatında tek tıklamayla indirin.",
    toolWatermarkTitle: "Filigran Ekleme",
    toolWatermarkDesc: "Görsellerinize şeffaflık, dönüş açısı ve konum ayarlı özel yazı filigranları uygulayarak telifinizi koruyun.",
    
    targetLang: "Hedef Dil",
    sourceLang: "Kaynak Dil",
    detectedLang: "Algılanan Dil",
    translateBtn: "Yerel Çeviriyi Başlat",
    previewText: "İşlem Önizlemesi",
    originalText: "Orijinal İçerik",
    translatedText: "Çevrilmiş İçerik",
    
    selectFormat: "Çıkış Formatı",
    quality: "Kalite Seviyesi",
    convertBtn: "Dönüştür",
    originalSize: "Orijinal Boyut",
    newSize: "Dönüştürülen Boyut",
    
    addMorePdfs: "Başka PDF Ekle",
    dragToReorder: "Dosyaları sürükleyerek veya butonlarla sıralayın",
    mergeBtn: "PDF'leri Birleştir",
    pageCount: "Sayfa",
    
    imgScaleMode: "Ölçekleme Ayarı",
    imgScaleFit: "Sığdır (Esnetme Yok)",
    imgScaleFill: "Doldur (Kırp ve Sığdır)",
    pdfOrientation: "Yönlendirme",
    portrait: "Dikey (Portrait)",
    landscape: "Yatay (Landscape)",
    generatePdf: "PDF Belgesi Oluştur",
    
    pdfMetaTitleField: "Başlık (Title)",
    pdfMetaAuthorField: "Yazar (Author)",
    pdfMetaSubjectField: "Konu (Subject)",
    pdfMetaKeywordsField: "Anahtar Kelimeler (Keywords)",
    pdfNoPassword: "Şifre Koruma Yok",
    pdfPasswordProtect: "Açılış Şifresi Koy",
    pdfPasswordLabel: "Güvenlik Şifresi",
    applyMetaBtn: "Meta & Şifreyi Uygula",
    
    audioExtractLabel: "Ses Kodlama Kalitesi",
    audioFormats: "Ses Formatı",
    extractAudioBtn: "Sesi Ayıkla",
    
    startTime: "Başlangıç Süresi (sn)",
    endTime: "Bitiş Süresi (sn)",
    playBtn: "Oynat",
    pauseBtn: "Durdur",
    cutBtn: "Seçilen Aralığı Kes",
    audioVisualizer: "İnteraktif Dalga Önizlemesi",
    
    width: "Genişlik (px)",
    height: "Yükseklik (px)",
    maintainAspectRatio: "En/Boy Oranını Koru",
    outputFormat: "Çıkış Formatı",
    downloadZipBtn: "Boyutlandırılmış ZIP İndir",
    
    watermarkText: "Filigran Metni",
    watermarkColor: "Renk",
    watermarkOpacity: "Şeffaflık (Opacity)",
    watermarkSize: "Metin Boyutu",
    watermarkPosition: "Konum",
    positionCenter: "Merkez",
    positionTopLeft: "Sol Üst",
    positionTopRight: "Sağ Üst",
    positionBottomLeft: "Sol Alt",
    positionBottomRight: "Sağ Alt",
    positionTile: "Döşeme (Tekrarlayan)",
    watermarkRotation: "Dönüş Derecesi (°)",
    applyWatermarkBtn: "Filigran Uygula ve İndir",
    
    zeroServerDesc: "Dosyalarınız hiçbir yere gitmez, internet bağlantısı gerektirmeden çalışabilir.",
    superSpeedTitle: "Maksimum Cihaz Hızı",
    superSpeedDesc: "Sıra beklemeden, sunucu darboğazı olmadan, doğrudan kendi işlemcinizin gücünü kullanın.",
    privacyGuaranteeTitle: "Gizlilik Garantisi",
    privacyGuaranteeDesc: "Şirket verileri, şahsi fotoğraflar, finansal dökümanlar için en güvenli çalışma yöntemi."
  },
  EN: {
    brand: "WebBox",
    heroTitle: "Your Toolbox inside Your Browser.",
    heroSubtitle: "100% Secure, Zero Server. All your files are processed directly on your device, ensuring total privacy.",
    privacyBadge: "100% SECURE",
    privacyTitle: "Why Serverless?",
    privacyDesc: "Your files never touch any remote server. All compression, merging, cutting, and translation are completed directly in your browser's memory (Client-Side). Your data never leaks.",
    howItWorksTitle: "How It Works?",
    howItWorksDesc: "Fast, independent, and privacy-oriented. Using advanced browser engines like FFmpeg, Web Audio, and Canvas, your files represent seconds of computational power right on your CPU.",
    clientProcessingBadge: "Running on your device",
    exploreTools: "Explore Tools",
    categoryDocTrans: "Doc & Translation",
    categoryPdf: "PDF Utilities",
    categoryMedia: "Media & Audio",
    categoryImage: "Image Tools",
    uploadAreaText: "Drag and drop files here, or click to select",
    uploadAreaSub: "Your files never leave your device",
    downloadBtn: "Download",
    processBtn: "Start Processing",
    resetBtn: "Clear",
    statusProcessing: "Processing...",
    statusCompleted: "Completed",
    statusFailed: "Failed",
    successTitle: "Success!",
    errorTitle: "Error occurred",
    filesSelected: "files selected",
    fileSelected: "file selected",
    
    toolDocTransTitle: "Universal Document Translator",
    toolDocTransDesc: "Translate HTML, JSON, CSV, SRT, or TXT documents using our lightweight offline browser model while preserving layout formats.",
    toolFormatConvTitle: "Universal File Converter",
    toolFormatConvDesc: "Convert Documents (PDF, DOCX, TXT, HTML, MD), Images (PNG, JPG, WebP, SVG, GIF, BMP, ICO), Audio (MP3, WAV, AAC, M4A), and Video (MP4, MKV, AVI, WEBM) between any format 100% securely right inside your browser.",
    toolPdfMergeTitle: "PDF Merger",
    toolPdfMergeDesc: "Select multiple PDF files, order them, and combine them into a single PDF document in seconds.",
    toolImgToPdfTitle: "Images to PDF Binder",
    toolImgToPdfDesc: "Transform JPG, PNG, or WebP images into a single standard-scaled, elegant PDF document.",
    toolPdfMetaTitle: "PDF Securer & Metadata",
    toolPdfMetaDesc: "Edit metadata like title and author or cryptographically protect your PDF with an opening password.",
    toolAudioExtractTitle: "Audio Extractor from Video",
    toolAudioExtractDesc: "Decode and rip crystal clear audio tracks from your video files into MP3 or WAV formats locally.",
    toolMediaCutterTitle: "Precision Media Cutter",
    toolMediaCutterDesc: "Select any timestamp range on your media files, play & check instantly, crop, and download fully offline.",
    toolBatchResizeTitle: "Batch Image Resizer",
    toolBatchResizeDesc: "Upload several images at once, apply identical sizes, and download all compressed inside a cozy ZIP folder.",
    toolWatermarkTitle: "Watermark Designer",
    toolWatermarkDesc: "Protect your artwork copyright by embedding custom overlays with variable opacity, angles, and alignments.",
    
    targetLang: "Target Language",
    sourceLang: "Source Language",
    detectedLang: "Detected Language",
    translateBtn: "Start Local Translation",
    previewText: "Process Preview",
    originalText: "Original Content",
    translatedText: "Translated Content",
    
    selectFormat: "Output Format",
    quality: "Quality Level",
    convertBtn: "Convert Now",
    originalSize: "Original Size",
    newSize: "Converted Size",
    
    addMorePdfs: "Add More PDFs",
    dragToReorder: "Reorder list items using drag handles or button controls",
    mergeBtn: "Merge PDFs",
    pageCount: "Page",
    
    imgScaleMode: "Scaling Fit",
    imgScaleFit: "Fit (No Stretch)",
    imgScaleFill: "Fill (Crop & Stretch)",
    pdfOrientation: "Page Orientation",
    portrait: "Portrait",
    landscape: "Landscape",
    generatePdf: "Assemble PDF",
    
    pdfMetaTitleField: "Title",
    pdfMetaAuthorField: "Author",
    pdfMetaSubjectField: "Subject",
    pdfMetaKeywordsField: "Keywords",
    pdfNoPassword: "No Password Security",
    pdfPasswordProtect: "Require Password to Open",
    pdfPasswordLabel: "Security Password",
    applyMetaBtn: "Apply Meta & Password",
    
    audioExtractLabel: "Audio Quality Option",
    audioFormats: "Audio Output",
    extractAudioBtn: "Extract Audio",
    
    startTime: "Start Time (sec)",
    endTime: "End Time (sec)",
    playBtn: "Play",
    pauseBtn: "Pause",
    cutBtn: "Trim Selected Output",
    audioVisualizer: "Interactive Wave Preview",
    
    width: "Width (px)",
    height: "Height (px)",
    maintainAspectRatio: "Maintain Aspect Ratio",
    outputFormat: "Output Format",
    downloadZipBtn: "Download Resized ZIP",
    
    watermarkText: "Watermark Text Overlay",
    watermarkColor: "Color Picker",
    watermarkOpacity: "Opacity Preset",
    watermarkSize: "Text Size",
    watermarkPosition: "Alignment Position",
    positionCenter: "Center",
    positionTopLeft: "Top Left",
    positionTopRight: "Top Right",
    positionBottomLeft: "Bottom Left",
    positionBottomRight: "Bottom Right",
    positionTile: "Tile Pattern (Repeating)",
    watermarkRotation: "Rotation Degree (°)",
    applyWatermarkBtn: "Apply & Download Image",
    
    zeroServerDesc: "Your files never leave your space, ensuring total independence from internet statuses.",
    superSpeedTitle: "Supreme Machine Speeds",
    superSpeedDesc: "No queue delay, no server bandwidth choked, leveraging local hardware components.",
    privacyGuaranteeTitle: "Privacy Assured",
    privacyGuaranteeDesc: "The ultimate secure sandbox for confidential items, blueprints, journals, or assets."
  },
  ES: {
    brand: "WebBox",
    heroTitle: "Tu Caja de Herramientas en tu Navegador.",
    heroSubtitle: "100% Seguro, Sin Servidor. Todos tus archivos se procesan localmente en tu computadora para garantizar total privacidad.",
    privacyBadge: "100% SEGURO",
    privacyTitle: "¿Por qué sin servidor?",
    privacyDesc: "Tus archivos nunca tocan ningún servidor remoto. Toda la compresión, fusión, corte y traducción se realizan directamente en tu navegador (Client-Side). Tus datos nunca se filtran.",
    howItWorksTitle: "¿Cómo funciona?",
    howItWorksDesc: "Rápido, independiente y centrado en la privacidad. Utilizando APIs nativas como Web Audio y Canvas, los procesos se completan con la CPU de tu dispositivo.",
    clientProcessingBadge: "Procesado en tu dispositivo",
    exploreTools: "Explorar Herramientas",
    categoryDocTrans: "Doc & Traducción",
    categoryPdf: "Herramientas PDF",
    categoryMedia: "Multimedia",
    categoryImage: "Imágenes",
    uploadAreaText: "Arrastra y suelta tus archivos aquí, o haz clic para seleccionar",
    uploadAreaSub: "Tus archivos nunca saldrán de tu dispositivo",
    downloadBtn: "Descargar",
    processBtn: "Iniciar Proceso",
    resetBtn: "Limpiar",
    statusProcessing: "Procesando...",
    statusCompleted: "Completado",
    statusFailed: "Error",
    successTitle: "¡Éxito!",
    errorTitle: "Ocurrió un error",
    filesSelected: "archivos seleccionados",
    fileSelected: "archivo seleccionado",
    
    toolDocTransTitle: "Traductor de Documentos Universal",
    toolDocTransDesc: "Traduce documentos HTML, JSON, CSV, SRT o TXT con nuestro analizador local preservando la maquetación original.",
    toolFormatConvTitle: "Convertidor de Archivos Universal",
    toolFormatConvDesc: "Convierta documentos (PDF, DOCX, TXT), imágenes (PNG, JPG, WebP, SVG, GIF), audio (MP3, WAV) y video (MP4, MKV) entre cualquier formato de forma 100% segura en su navegador.",
    toolPdfMergeTitle: "Fusión de PDF",
    toolPdfMergeDesc: "Selecciona múltiples archivos PDF, ordénalos de la forma deseada y combínalos en un solo archivo.",
    toolImgToPdfTitle: "Imágenes a PDF",
    toolImgToPdfDesc: "Transforma imágenes JPG, PNG o WebP en un documento PDF consolidado con tamaños normalizados.",
    toolPdfMetaTitle: "Seguridad y Meta de PDF",
    toolPdfMetaDesc: "Agrega autores, títulos de metadatos o restringe la lectura agregando una contraseña de apertura.",
    toolAudioExtractTitle: "Extractor de Audio",
    toolAudioExtractDesc: "Extrae excelentes audios de tus videos y descárgalos localmente en formato MP3/WAV.",
    toolMediaCutterTitle: "Cortador de Precisión",
    toolMediaCutterDesc: "Selecciona un rango en tus archivos multimedia, reprodúcelo para verificar y descárgalo recortado.",
    toolBatchResizeTitle: "Redimensionador de Lote",
    toolBatchResizeDesc: "Sube varias imágenes a la vez, cámbialas de tamaño y descárgalas en un práctico archivo ZIP.",
    toolWatermarkTitle: "Diseñador de Marcas de Agua",
    toolWatermarkDesc: "Protege tus fotos agregando textos de marca de agua con opacidades, ubicaciones y ángulos custom.",
    
    targetLang: "Idioma de Destino",
    sourceLang: "Idioma de Origen",
    detectedLang: "Idioma Detectado",
    translateBtn: "Iniciar Traducción Local",
    previewText: "Vista Previa de Acción",
    originalText: "Texto Original",
    translatedText: "Texto Traducido",
    
    selectFormat: "Formato de Salida",
    quality: "Calidad de Imagen",
    convertBtn: "Convertir Ahora",
    originalSize: "Tamaño Original",
    newSize: "Nuevo Tamaño",
    
    addMorePdfs: "Agregar más PDFs",
    dragToReorder: "Organiza las páginas arrastrando los elementos de la lista",
    mergeBtn: "Fusionar PDFs",
    pageCount: "Páginas",
    
    imgScaleMode: "Ajuste de Escala",
    imgScaleFit: "Ajustar (Sin Estirar)",
    imgScaleFill: "Rellenar (Recortar)",
    pdfOrientation: "Orientación de Página",
    portrait: "Vertical (Retrato)",
    landscape: "Horizontal (Paisaje)",
    generatePdf: "Compilar PDF",
    
    pdfMetaTitleField: "Título",
    pdfMetaAuthorField: "Autor",
    pdfMetaSubjectField: "Asunto",
    pdfMetaKeywordsField: "Palabras Clave",
    pdfNoPassword: "Sin Contraseña",
    pdfPasswordProtect: "Requerir Contraseña",
    pdfPasswordLabel: "Contraseña",
    applyMetaBtn: "Guardar Meta y Password",
    
    audioExtractLabel: "Configuración de Calidad",
    audioFormats: "Formato de Audio",
    extractAudioBtn: "Extraer Audio",
    
    startTime: "Tiempo de Inicio (seg)",
    endTime: "Tiempo de Fin (seg)",
    playBtn: "Reproducir",
    pauseBtn: "Pausar",
    cutBtn: "Recortar Selección",
    audioVisualizer: "Visualizador de Onda",
    
    width: "Ancho (px)",
    height: "Alto (px)",
    maintainAspectRatio: "Mantener Proporción",
    outputFormat: "Formato de Salida",
    downloadZipBtn: "Descargar ZIP Modificados",
    
    watermarkText: "Metáfora del Texto",
    watermarkColor: "Selector de Color",
    watermarkOpacity: "Grado de Opacidad",
    watermarkSize: "Tamaño de Fuente",
    watermarkPosition: "Posición",
    positionCenter: "Centro",
    positionTopLeft: "Sup-Izq",
    positionTopRight: "Sup-Der",
    positionBottomLeft: "Inf-Izq",
    positionBottomRight: "Inf-Der",
    positionTile: "Patrón de Mosaico",
    watermarkRotation: "Ángulo de Rotación (°)",
    applyWatermarkBtn: "Aplicar y Descargar",
    
    zeroServerDesc: "Tus datos nunca salen de la computadora, sin importar el estado del internet.",
    superSpeedTitle: "Velocidades Instantáneas",
    superSpeedDesc: "Sin esperas ni colas. Trabajamos directo sobre la RAM local para entregar la máxima velocidad.",
    privacyGuaranteeTitle: "Garantía de Privacidad",
    privacyGuaranteeDesc: "La manera idónea para hojas de contabilidad, tesis confidenciales o material privado."
  },
  DE: {
    brand: "WebBox",
    heroTitle: "Ihre Werkzeugkiste direkt im Browser.",
    heroSubtitle: "100% sicher, kein Server. Alle Ihre Dokumente und Medien werden offline lokal auf Ihrem Rechner verarbeitet.",
    privacyBadge: "100% SICHER",
    privacyTitle: "Warum Serverlos?",
    privacyDesc: "Ihre Dateien werden auf keinen externen Cloud-Server geladen. Das Packen, Teilen, Schneiden und Übersetzen erfolgt ausschließlich lokal in Sandbox-Sitzungen.",
    howItWorksTitle: "Funktionsweise",
    howItWorksDesc: "Schnell, diskret und ressourcenschonend. Genießen Sie superschnelles Rendern per Canvas API und Web Audio direkt auf Ihrem lokalen Prozessor.",
    clientProcessingBadge: "Auf Ihrem PC berechnet",
    exploreTools: "Tools durchsuchen",
    categoryDocTrans: "Doc & Übersetzung",
    categoryPdf: "PDF-Dienste",
    categoryMedia: "Medien & Audio",
    categoryImage: "Kreativtools",
    uploadAreaText: "Dateien hierher ziehen oder anklicken, um sie auszuwählen",
    uploadAreaSub: "Ihre Dateien verlassen Ihr System zu keinem Zeitpunkt",
    downloadBtn: "Herunterladen",
    processBtn: "Verarbeitung starten",
    resetBtn: "Zurücksetzen",
    statusProcessing: "In Arbeit...",
    statusCompleted: "Fertiggestellt",
    statusFailed: "Fehlgeschlagen",
    successTitle: "Erfolgreich!",
    errorTitle: "Fehler aufgetreten",
    filesSelected: "Dateien ausgewählt",
    fileSelected: "Datei ausgewählt",
    
    toolDocTransTitle: "Dokumenten-Übersetzer",
    toolDocTransDesc: "Übersetzen Sie strukturierte HTML-, JSON-, CSV-, SRT- oder TXT-Dateien im Handumdrehen direkt im Browser ohne Formatsverlust.",
    toolFormatConvTitle: "Universeller Dateikonverter",
    toolFormatConvDesc: "Konvertieren Sie Dokumente (PDF, DOCX, TXT), Bilder (PNG, JPG, WebP, SVG, GIF), Audio (MP3, WAV) und Video (MP4, MKV) 100% sicher und direkt im Browser.",
    toolPdfMergeTitle: "PDF Zusammenfügen",
    toolPdfMergeDesc: "Fügen Sie mehrere PDF-Dateien übersichtlich in gewünschter Reihenfolge zu einem einzigen PDF zusammen.",
    toolImgToPdfTitle: "Bilder zu PDF",
    toolImgToPdfDesc: "Konvertieren Sie JPEG/PNG Grafiken in ein ordentlich formatiertes PDF-Dokument mit einheitlicher Skalierung.",
    toolPdfMetaTitle: "PDF Sicherheit & Meta",
    toolPdfMetaDesc: "Aktualisieren Sie Datei-Eigenschaften (Autor, Titel) und sichern Sie das Dokument durch ein Masterpasswort ab.",
    toolAudioExtractTitle: "Audio-Extraktor",
    toolAudioExtractDesc: "Trennen Sie Tonspuren akkurat von Videodateien und laden Sie sie als klangreines MP3 oder WAV herunter.",
    toolMediaCutterTitle: "Präziser Audio/Video Cutter",
    toolMediaCutterDesc: "Wählen Sie markante Stellen in Audio oder Video, testen Sie sie im Player und laden Sie den beschnittenen Teil herunter.",
    toolBatchResizeTitle: "Stapel-Bildgrößenänderer",
    toolBatchResizeDesc: "Verarbeiten Sie Hunderte von Fotos in einem Durchgang, skalieren Sie sie und laden Sie die Ergebnisse als ZIP herunter.",
    toolWatermarkTitle: "Wasserzeichen-Designer",
    toolWatermarkDesc: "Brandmarken Sie Ihre Aufnahmen mit frei steuerbaren Overlays bezüglich Opazität, Grad und Ausrichtung.",
    
    targetLang: "Zielsprache",
    sourceLang: "Ausgangssprache",
    detectedLang: "Erkannte Sprache",
    translateBtn: "Lokale Übersetzung starten",
    previewText: "Aktions-Vorschau",
    originalText: "Originaler Text",
    translatedText: "Übersetzter Text",
    
    selectFormat: "Format wählen",
    quality: "Qualitätsstufe",
    convertBtn: "Jetzt Konvertieren",
    originalSize: "Originale Größe",
    newSize: "Neue Größe",
    
    addMorePdfs: "Weitere PDFs hinzufügen",
    dragToReorder: "Ziehen Sie Listenelemente, um die Reihenfolge abzuändern",
    mergeBtn: "PDFs verbinden",
    pageCount: "Seiten",
    
    imgScaleMode: "Bildanpassung",
    imgScaleFit: "Einpassen (Keine Verzerrung)",
    imgScaleFill: "Auffüllen (Zuschneiden)",
    pdfOrientation: "Seitenformat",
    portrait: "Hochformat (Portrait)",
    landscape: "Querformat (Landscape)",
    generatePdf: "PDF erstellen",
    
    pdfMetaTitleField: "Titel",
    pdfMetaAuthorField: "Autor",
    pdfMetaSubjectField: "Thema",
    pdfMetaKeywordsField: "Schlüsselwörter",
    pdfNoPassword: "Keine Passwort-Verschlüsselung",
    pdfPasswordProtect: "Passwortdatei erstellen",
    pdfPasswordLabel: "Passwortschutz",
    applyMetaBtn: "Meta & Kennwort anwenden",
    
    audioExtractLabel: "Audio-Bitrate",
    audioFormats: "Audio-Format",
    extractAudioBtn: "Ton extrahieren",
    
    startTime: "Startzeit (Sek)",
    endTime: "Endzeit (Sek)",
    playBtn: "Abspielen",
    pauseBtn: "Pause",
    cutBtn: "Auswahl beschneiden",
    audioVisualizer: "Interaktives Frequenzbild",
    
    width: "Breite (px)",
    height: "Höhe (px)",
    maintainAspectRatio: "Seitenverhältnis beibehalten",
    outputFormat: "Ausgabe-Format",
    downloadZipBtn: "ZIP-Paket herunterladen",
    
    watermarkText: "Wasserzeichen Inhalt",
    watermarkColor: "Farbe",
    watermarkOpacity: "Opazität (Deckkraft)",
    watermarkSize: "Schriftgröße",
    watermarkPosition: "Ausrichtung",
    positionCenter: "Mitte",
    positionTopLeft: "Oben links",
    positionTopRight: "Oben rechts",
    positionBottomLeft: "Unten links",
    positionBottomRight: "Unten rechts",
    positionTile: "Ziegelmuster (Kachel)",
    watermarkRotation: "Drehwinkel (°)",
    applyWatermarkBtn: "Wasserzeichen binden",
    
    zeroServerDesc: "Ihre Dokumente werden nicht übertragen. Der gesamte Rechenprozess bleibt in Ihrem Browser.",
    superSpeedTitle: "Ultraschnelle Auslastung",
    superSpeedDesc: "Keine Warteschlangen, direktes Rendern über CPU/RAM für unbegrenztes Komfort.",
    privacyGuaranteeTitle: "Datenschutz-Zusicherung",
    privacyGuaranteeDesc: "Die optimale Arbeitsmethode für Buchhaltungsdaten, sensible Skripte oder Portfolios."
  }
};

export const TRANSLATIONS: Record<Language, TranslationSet> = {} as Record<Language, TranslationSet>;

SITE_LANGUAGES.forEach((l) => {
  const code = l.code;
  if (code === 'TR' || code === 'EN' || code === 'ES' || code === 'DE') {
    TRANSLATIONS[code] = BASE_TRANSLATIONS[code];
  } else if (code === 'AZ') {
    const az = { ...BASE_TRANSLATIONS.TR };
    az.brand = "WebBox";
    az.heroTitle = "Alət Qutunuz Brauzerinizdə.";
    az.heroSubtitle = "%100 Təhlükəsiz, Sıfır Server. Bütün fayllarınız birbaşa cihazınızda emal olunur, tam gizlilik qorunur.";
    az.privacyBadge = "%100 TƏHLÜKƏSİZ";
    az.privacyTitle = "Niyə ServerSiz?";
    az.privacyDesc = "Fayllarınız heç bir uzaq serverə yüklənmir. Bütün sıxılma, birləşdirmə, kəsmə və tərcümə işləri birbaşa brauzerinizin yaddaşında baş verir. Məlumatlarınız heç vaxt internetə sızmır.";
    az.howItWorksTitle = "Necə İşləyir?";
    az.howItWorksDesc = "Sürətli, müstəqil və gizlilik yönümlü. Fayl əməliyyatları kompüterinizin gücü ilə saniyələr içində tamamlanır.";
    az.exploreTools = "Alətləri Kəşf Edin";
    az.categoryDocTrans = "Sənəd və Tərcümə";
    az.categoryPdf = "PDF Alətləri";
    az.categoryMedia = "Media və Səs";
    az.categoryImage = "Şəkil Əməliyyatları";
    az.uploadAreaText = "Faylları sürükləyib buraxın və ya seçmək üçün klikləyin";
    az.uploadAreaSub = "Fayllarınız heç vaxt cihazınızdan ayrılmır";
    az.downloadBtn = "Yüklə";
    az.statusProcessing = "Emal olunur...";
    az.statusCompleted = "Tamamlandı";
    az.statusFailed = "Uğursuz Oldu";
    az.successTitle = "Uğurlu!";
    az.errorTitle = "Xəta baş verdi";
    az.toolDocTransTitle = "Universal Sənəd Tərcüməçisi";
    az.toolFormatConvTitle = "Universal Fayl Çevirici";
    TRANSLATIONS[code] = az;
  } else {
    TRANSLATIONS[code] = BASE_TRANSLATIONS.EN;
  }
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
    id: 'doc-translator',
    category: 'doc',
    translationTitleKey: 'toolDocTransTitle',
    translationDescKey: 'toolDocTransDesc',
    iconName: 'Languages'
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
