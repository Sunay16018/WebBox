import fs from 'fs';
import https from 'https';
import path from 'path';
import { Jimp } from 'jimp';

const logoUrl = 'https://i.hizliresim.com/l4ili1n.png';

const options = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  },
  timeout: 10000 // 10 seconds timeout
};

function downloadImage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, options, (res) => {
      // Handle redirect
      if (res.statusCode === 301 || res.statusCode === 302) {
        const redirectUrl = res.headers.location;
        console.log(`[Asset Downloader] Following redirect to: ${redirectUrl}`);
        downloadImage(redirectUrl).then(resolve).catch(reject);
        return;
      }

      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download image. Status: ${res.statusCode}`));
        return;
      }

      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function run() {
  const publicDir = path.resolve('public');

  console.log(`[Asset Downloader] Fetching dynamic theme assets from: ${logoUrl}...`);
  try {
    const rawBuffer = await downloadImage(logoUrl);
    
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    console.log(`[Asset Downloader] Parsing raw image (${rawBuffer.length} bytes)...`);
    const jimpImage = await Jimp.read(rawBuffer);

    // Save 512x512 PNG
    const p512 = jimpImage.clone().resize({ w: 512, h: 512 });
    const buffer512png = await p512.getBuffer('image/png');
    fs.writeFileSync(path.join(publicDir, 'logo.png'), buffer512png);
    fs.writeFileSync(path.join(publicDir, 'icon-512.png'), buffer512png);
    console.log(`[Asset Downloader] Saved logo.png & icon-512.png: 512x512 PNG (${buffer512png.length} bytes)`);

    // Save 512x512 JPG
    const buffer512jpg = await p512.getBuffer('image/jpeg');
    fs.writeFileSync(path.join(publicDir, 'logo.jpg'), buffer512jpg);
    console.log(`[Asset Downloader] Saved logo.jpg: 512x512 JPEG (${buffer512jpg.length} bytes)`);

    // Save 192x192 PNG
    const p192 = jimpImage.clone().resize({ w: 192, h: 192 });
    const buffer192png = await p192.getBuffer('image/png');
    fs.writeFileSync(path.join(publicDir, 'icon-192.png'), buffer192png);
    console.log(`[Asset Downloader] Saved icon-192.png: 192x192 PNG (${buffer192png.length} bytes)`);

    // Save 32x32 Favicon PNG (saved as favicon.ico so it serves properly)
    const p32 = jimpImage.clone().resize({ w: 32, h: 32 });
    const buffer32png = await p32.getBuffer('image/png');
    fs.writeFileSync(path.join(publicDir, 'favicon.ico'), buffer32png);
    console.log(`[Asset Downloader] Saved favicon.ico: 32x32 PNG-ICO (${buffer32png.length} bytes)`);
    
    console.log('[Asset Downloader] All dynamic assets optimized and generated successfully!');
  } catch (error) {
    console.warn(`[Asset Downloader] Warning: Could not download and optimize the remote logo. (${error.message})`);
    console.warn('[Asset Downloader] Using existing/fallback assets if available.');
  }
}

run();
