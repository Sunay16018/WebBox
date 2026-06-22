import fs from 'fs';
import path from 'path';

const routes = [
  // Tool paths
  'metin-cevirici',
  'text-translation',
  'belge-cevirici',
  'document-translation',
  'doc-translator',
  'format-donusturucu',
  'format-converter',
  'pdf-birlestir',
  'pdf-merge',
  'resim-pdf',
  'image-to-pdf',
  'pdf-metadata',
  'pdf-meta',
  'video-ses-cikar',
  'video-audio',
  'medya-kesici',
  'media-cutter',
  'toplu-resim-boyutlandir',
  'batch-resizer',
  'resim-filigran',
  'image-watermark',

  // Info paths
  'hakkimizda',
  'iletisim',
  'gizlilik-politikasi',
  'kullanim-sartlari',
  'cerez-politikasi',
  'sss',
  'topluluk-kurallari',
  'site-haritasi'
];

const distDir = path.resolve('dist');
const sourceHtml = path.join(distDir, 'index.html');

if (!fs.existsSync(sourceHtml)) {
  console.error('Source index.html not found! Build might have failed.');
  process.exit(1);
}

console.log('Generating physical paths for clean SEO and perfect routing on Vercel...');

routes.forEach((route) => {
  const targetDir = path.join(distDir, route);
  
  // Ensure the directory exists
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  // Copy index.html as index.html in the subdirectory
  const targetHtml = path.join(targetDir, 'index.html');
  fs.copyFileSync(sourceHtml, targetHtml);
  console.log(`Created physical route: ${targetHtml} (Copied from root index.html)`);
});

console.log('Successfully generated post-build static routes!');
