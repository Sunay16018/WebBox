import fs from 'fs';
import https from 'https';
import path from 'path';

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
  const filesToSave = [
    'logo.png',
    'logo.jpg',
    'favicon.ico',
    'icon-192.png',
    'icon-512.png'
  ];

  // Check if we already have the files and can skip downloading (only in development)
  const allFilesExist = filesToSave.every(file => fs.existsSync(path.join(publicDir, file)));
  if (allFilesExist && process.env.NODE_ENV !== 'production' && !process.env.FORCE_DOWNLOAD) {
    console.log('[Asset Downloader] All dynamic logo and favicon assets exist locally. Skipping download.');
    return;
  }

  console.log(`[Asset Downloader] Fetching dynamic theme assets from: ${logoUrl}...`);
  try {
    const buffer = await downloadImage(logoUrl);
    
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    filesToSave.forEach((file) => {
      const targetPath = path.join(publicDir, file);
      fs.writeFileSync(targetPath, buffer);
      console.log(`[Asset Downloader] Saved perfect binary: ${file} (${buffer.length} bytes)`);
    });
    
    console.log('[Asset Downloader] All dynamic assets generated successfully!');
  } catch (error) {
    console.warn(`[Asset Downloader] Warning: Could not download the remote logo. (${error.message})`);
    console.warn('[Asset Downloader] Using existing/fallback assets if available.');
  }
}

run();
