import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;

// Middleware to parse payloads
app.use(express.json());

// Persistent client-safe usage DB for device-level limit (5 per day)
const USAGE_DB_PATH = path.join(process.cwd(), "ai_pdf_usage.json");

function getUsageDb() {
  if (!fs.existsSync(USAGE_DB_PATH)) {
    try {
      fs.writeFileSync(USAGE_DB_PATH, JSON.stringify({}), "utf8");
    } catch (e) {
      console.error("Error creating usage DB file:", e);
    }
    return {};
  }
  try {
    const data = fs.readFileSync(USAGE_DB_PATH, "utf8");
    return JSON.parse(data);
  } catch (e) {
    return {};
  }
}

function saveUsageDb(db: any) {
  try {
    fs.writeFileSync(USAGE_DB_PATH, JSON.stringify(db, null, 2), "utf8");
  } catch (e) {
    console.error("Error saving usage DB:", e);
  }
}

function getTodayString() {
  return new Date().toISOString().split("T")[0]; // YYYY-MM-DD
}

function getRemainingLimit(fingerprint: string) {
  const db = getUsageDb();
  const today = getTodayString();
  const userRecord = db[fingerprint];
  const maxLimit = userRecord && typeof userRecord.customLimit === "number" ? userRecord.customLimit : 5;
  if (!userRecord) return maxLimit;
  if (userRecord.lastResetDate !== today) return maxLimit;
  return Math.max(0, maxLimit - userRecord.count);
}

function incrementUsage(fingerprint: string): { allowed: boolean; remaining: number } {
  const db = getUsageDb();
  const today = getTodayString();
  
  if (!db[fingerprint]) {
    db[fingerprint] = { count: 0, lastResetDate: today };
  }
  
  const userRecord = db[fingerprint];
  const maxLimit = typeof userRecord.customLimit === "number" ? userRecord.customLimit : 5;

  if (userRecord.lastResetDate !== today) {
    userRecord.count = 0;
    userRecord.lastResetDate = today;
  }
  
  if (userRecord.count >= maxLimit) {
    return { allowed: false, remaining: 0 };
  }
  
  userRecord.count += 1;
  saveUsageDb(db);
  return { allowed: true, remaining: maxLimit - userRecord.count };
}

function trackDeviceHistory(fingerprint: string, req: any, bodyData: any = {}) {
  const db = getUsageDb();
  const today = getTodayString();
  
  if (!db[fingerprint]) {
    db[fingerprint] = { count: 0, lastResetDate: today };
  }
  
  const record = db[fingerprint];
  const rawIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";
  const cleanIp = typeof rawIp === "string" ? rawIp.split(",")[0].trim().replace(/^::ffff:/, "") : "127.0.0.1";
  
  record.ip = cleanIp;
  record.userAgent = req.headers["user-agent"] || record.userAgent || "Unknown";
  record.lastActive = new Date().toISOString();
  
  if (bodyData.screen) record.screen = bodyData.screen;
  if (bodyData.tz) record.tz = bodyData.tz;
  if (bodyData.cores) record.cores = String(bodyData.cores);
  if (bodyData.gpu) record.gpu = bodyData.gpu;
  
  saveUsageDb(db);
}

function toSafePdfText(text: string): string {
  if (!text) return "";
  const charMap: Record<string, string> = {
    'ə': 'e', 'Ə': 'E',
    'ı': 'i', 'I': 'I', 'İ': 'I',
    'ş': 's', 'Ş': 'S',
    'ğ': 'g', 'Ğ': 'G',
    'ç': 'c', 'Ç': 'C',
    'ö': 'o', 'Ö': 'O',
    'ü': 'u', 'Ü': 'U',
    'â': 'a', 'Â': 'A',
    'î': 'i', 'Î': 'I',
    'û': 'u', 'Û': 'U',
    '“': '"', '”': '"',
    '‘': "'", '’': "'",
    '–': '-', '—': '-',
  };

  const cyrillicToLatin: Record<string, string> = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh',
    'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
    'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts',
    'ч': 'ch', 'ш': 'sh', 'щ': 'shch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu',
    'я': 'ya',
    'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo', 'Ж': 'Zh',
    'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O',
    'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F', 'Х': 'Kh', 'Ц': 'Ts',
    'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Shch', 'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu',
    'Я': 'Ya'
  };

  return text.split('').map(char => {
    if (charMap[char]) return charMap[char];
    if (cyrillicToLatin[char]) return cyrillicToLatin[char];
    
    const code = char.charCodeAt(0);
    if (code > 127) {
      const norm = char.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (norm !== char && norm.charCodeAt(0) <= 127) {
        return norm;
      }
      if (code >= 192 && code <= 255) {
        return char;
      }
      return "?";
    }
    return char;
  }).join('');
}

// Text wrapping utility for pdf-lib text drawing
function wrapText(text: string, maxWidth: number, font: any, fontSize: number): string[] {
  const safeText = toSafePdfText(text || "");
  const words = safeText.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine ? currentLine + " " + word : word;
    const testWidth = font.widthOfTextAtSize(testLine, fontSize);
    
    if (testWidth > maxWidth) {
      if (currentLine) {
        lines.push(currentLine);
      }
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

// Local Curated Fallback High-Quality Stock Images
const CATEGORY_STOCK_IMAGES: Record<string, string> = {
  space: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80",
  tech: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
  nature: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
  health: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&q=80",
  history: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=800&q=80",
  business: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
  education: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80",
  art: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80",
  general: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80"
};

// Search high-quality Wikipedia Commons image depending on query
async function searchImageFromInternet(query: string): Promise<string | null> {
  try {
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&generator=search&gsrsearch=${encodeURIComponent(query)}&piprop=thumbnail&pithumbsize=1000&gsrlimit=3`;
    const response = await fetch(searchUrl, { signal: AbortSignal.timeout(4000) });
    if (!response.ok) return null;
    const data = await response.json();
    
    if (data.query && data.query.pages) {
      const pages = Object.values(data.query.pages) as any[];
      for (const p of pages) {
        if (p.thumbnail && p.thumbnail.source && p.thumbnail.source.startsWith("http")) {
          return p.thumbnail.source;
        }
      }
    }
  } catch (e) {
    console.error("Wikipedia image search error, falling back:", e);
  }
  
  // Custom keyword categorization fallback
  const lowerQuery = query.toLowerCase();
  if (lowerQuery.includes("space") || lowerQuery.includes("uzay") || lowerQuery.includes("mars") || lowerQuery.includes("star") || lowerQuery.includes("gezegen")) {
    return CATEGORY_STOCK_IMAGES.space;
  }
  if (lowerQuery.includes("tech") || lowerQuery.includes("kod") || lowerQuery.includes("computer") || lowerQuery.includes("bilgisayar") || lowerQuery.includes("robot")) {
    return CATEGORY_STOCK_IMAGES.tech;
  }
  if (lowerQuery.includes("nature") || lowerQuery.includes("orman") || lowerQuery.includes("doğa") || lowerQuery.includes("deniz") || lowerQuery.includes("hayvan")) {
    return CATEGORY_STOCK_IMAGES.nature;
  }
  if (lowerQuery.includes("health") || lowerQuery.includes("sağlık") || lowerQuery.includes("spor") || lowerQuery.includes("diet") || lowerQuery.includes("beslenme")) {
    return CATEGORY_STOCK_IMAGES.health;
  }
  if (lowerQuery.includes("history") || lowerQuery.includes("tarih") || lowerQuery.includes("ancient") || lowerQuery.includes("savaş") || lowerQuery.includes("ataturk")) {
    return CATEGORY_STOCK_IMAGES.history;
  }
  if (lowerQuery.includes("business") || lowerQuery.includes("iş") || lowerQuery.includes("para") || lowerQuery.includes("money") || lowerQuery.includes("marketing")) {
    return CATEGORY_STOCK_IMAGES.business;
  }
  if (lowerQuery.includes("art") || lowerQuery.includes("sanat") || lowerQuery.includes("resim") || lowerQuery.includes("muzik") || lowerQuery.includes("music")) {
    return CATEGORY_STOCK_IMAGES.art;
  }
  
  // Return random unplash background query term representatively
  return `https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80`;
}

// Fetch image buffer securely
async function fetchImageBuffer(imageUrl: string): Promise<{ bytes: ArrayBuffer; isPng: boolean } | null> {
  try {
    const res = await fetch(imageUrl, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return null;
    const contentType = res.headers.get("content-type") || "";
    const isPng = contentType.includes("png") || imageUrl.endsWith(".png");
    const bytes = await res.arrayBuffer();
    return { bytes, isPng };
  } catch (err) {
    console.error("Error fetching image buffer from:", imageUrl, err);
    return null;
  }
}

// 1. Get remaining limits endpoint
app.post("/api/ai-pdf-limit", (req: any, res: any) => {
  const { fingerprint } = req.body;
  if (!fingerprint) {
    return res.status(400).json({ error: "Eksik cihaz bilgisi." });
  }
  trackDeviceHistory(fingerprint, req, req.body);
  const remaining = getRemainingLimit(fingerprint);
  return res.json({ remaining });
});

// 1.5. Passive visit tracking endpoint
app.post("/api/track-visit", (req: any, res: any) => {
  const { fingerprint } = req.body;
  if (fingerprint) {
    trackDeviceHistory(fingerprint, req, req.body);
  }
  return res.json({ success: true });
});

// Admin panel analytics dashboard data endpoint
app.post("/api/admin/stats", (req: any, res: any) => {
  const { password } = req.body;
  const adminPass = process.env.ADMIN_PASSWORD || "webox2026";
  if (!password || password !== adminPass) {
    return res.status(401).json({ error: "Yetkisiz Erişim! Belirtilen şifre yanlış veya sunucuda tanımlı değil." });
  }

  const db = getUsageDb();
  const list = Object.keys(db).map((key) => {
    const item = db[key];
    return {
      fingerprint: key,
      count: typeof item.count === 'number' ? item.count : 0,
      lastResetDate: item.lastResetDate,
      customLimit: typeof item.customLimit === 'number' ? item.customLimit : 5,
      ip: item.ip || "127.0.0.1",
      userAgent: item.userAgent || "Bilinmiyor",
      screen: item.screen || "Yüklenecek...",
      tz: item.tz || "UTC",
      cores: item.cores || "1",
      gpu: item.gpu || "Bilinmiyor",
      lastActive: item.lastActive || new Date().toISOString()
    };
  });

  list.sort((a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime());
  return res.json({ list });
});

// Admin panel dynamic limits & dynamic usage count override endpoint
app.post("/api/admin/update-limit", (req: any, res: any) => {
  const { password, fingerprint, customLimit, count } = req.body;
  const adminPass = process.env.ADMIN_PASSWORD || "webox2026";
  if (!password || password !== adminPass) {
    return res.status(401).json({ error: "Yetkisiz Erişim" });
  }

  if (!fingerprint) {
    return res.status(400).json({ error: "Cihaz kimliği (fingerprint) eksik." });
  }

  const db = getUsageDb();
  if (!db[fingerprint]) {
    db[fingerprint] = { count: 0, lastResetDate: getTodayString() };
  }

  if (typeof customLimit === "number") {
    db[fingerprint].customLimit = customLimit;
  }
  if (typeof count === "number") {
    db[fingerprint].count = count;
  }

  saveUsageDb(db);
  return res.json({ success: true });
});

// Helper to extract the first complete JSON object by tracking brace depth
function extractFirstJsonObject(text: string): string {
  const firstBrace = text.indexOf('{');
  if (firstBrace === -1) {
    throw new Error("Could not find any opening brace '{' in the response.");
  }

  let braceCount = 0;
  let inString = false;
  let escape = false;

  for (let i = firstBrace; i < text.length; i++) {
    const char = text[i];

    if (escape) {
      escape = false;
      continue;
    }

    if (char === '\\') {
      escape = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (!inString) {
      if (char === '{') {
        braceCount++;
      } else if (char === '}') {
        braceCount--;
        if (braceCount === 0) {
          return text.substring(firstBrace, i + 1);
        }
      }
    }
  }

  // Fallback to last index of '}' if matching brace isn't found or brace count is off
  const lastBrace = text.lastIndexOf('}');
  if (lastBrace !== -1 && lastBrace > firstBrace) {
    return text.substring(firstBrace, lastBrace + 1);
  }

  throw new Error("Could not find matching closing brace '}' in the response.");
}

function cleanJsonString(jsonStr: string): string {
  return jsonStr
    // Remove trailing commas before closing braces/brackets
    .replace(/,\s*([}\]])/g, '$1')
    // Remove non-printable control characters
    .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F-\u009F]/g, "");
}

// Robust JSON parser helper
function parseRobustJson(text: string): any {
  let cleaned = text.trim();

  // Try parsing directly first
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    // Keep going
  }

  // Look for markdown json block
  const jsonBlockRegex = /```json\s*([\s\S]*?)\s*```/;
  const matchJson = cleaned.match(jsonBlockRegex);
  if (matchJson && matchJson[1]) {
    try {
      return JSON.parse(matchJson[1].trim());
    } catch (e) {
      // Keep going
    }
  }

  // Look for general markdown block
  const blockRegex = /```\s*([\s\S]*?)\s*```/;
  const matchBlock = cleaned.match(blockRegex);
  if (matchBlock && matchBlock[1]) {
    try {
      return JSON.parse(matchBlock[1].trim());
    } catch (e) {
      // Keep going
    }
  }

  try {
    const extracted = extractFirstJsonObject(cleaned);
    try {
      return JSON.parse(extracted);
    } catch (e) {
      const cleanedCandidate = cleanJsonString(extracted);
      return JSON.parse(cleanedCandidate);
    }
  } catch (e: any) {
    throw new Error(`JSON parsing failed. Attempted robust clean parse error: ${e.message || e}`);
  }
}

// 2. Cerebras-powered dynamic PDF generation endpoint
app.post("/api/generate-ai-pdf", async (req: any, res: any) => {
  const { prompt, language, pageCount, fingerprint } = req.body;

  if (!prompt || !language || !pageCount || !fingerprint) {
    return res.status(400).json({ error: "Lütfen tüm döküman ayarlarını ve prompt bilgisini girdikten sonra tekrar deneyiniz." });
  }

  // Enforce global rate limiting checks
  const { allowed, remaining } = incrementUsage(fingerprint);
  if (!allowed) {
    return res.status(429).json({
      error: "Günlük PDF oluşturma limitiniz doldu!",
      cooldown: true
    });
  }

  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey) {
    return res.status(500).json({
      error: "Sunucuda GEMINI_API_KEY ayarlanmamış. Lütfen yetkiliyle iletişime geçin.",
      remaining
    });
  }

  const pages = Math.min(5, Math.max(1, parseInt(pageCount)));
  const pdfLanguage = language || "Turkish";

  // Instruction prompt crafted beautifully to ensure flawless JSON responses from GPT/Gemini family
  const systemInstruction = `You are an elite academic editor, professional author, and visual PDF layout planner.
Format your output as a 100% compliant, parsed RAW JSON string matching the exact schema below.

IMPORTANT LANGUAGE & GRAMMAR DIRECTIVES:
- You MUST write the booklet content strictly in the requested language: "${pdfLanguage}".
- Use flawless academic grammar, perfect spelling, proper capitalization, correct native syntax, and pristine punctuation.
- Strictly make NO spelling errors, grammatical mistakes, or typos.
- In Turkish and Azerbaijani, use the exact native letters (such as ş, ç, ğ, ı, ö, ü, ə, Ş, Ç, Ğ, İ, Ö, Ü, Ə) with proper modern orthography.
- Avoid repeating details between pages; each page must form an engaging, sequential, logical chapter that builds upon the previous pages.
- Provide exhaustive, rich details: write fully fleshed-out paragraphs (80-120 words per paragraph) full of valuable expert insights. Avoid brief summaries or generic bullet points.
- Tone should be highly professional, authoritative, engaging, extremely informative, and comprehensive.

The booklet must contain exactly ${pages} distinct, sequential page blocks.

Schema:
{
  "title": "Main compelling title of the booklet",
  "subtitle": "Short structured sub-headline",
  "pages": [
    {
      "pageNumber": 1,
      "header": "Section header for this page",
      "paragraphs": [
        "A highly informative editorial paragraph (80-120 words) with professional details...",
        "A second supporting detailed paragraph (60-100 words)..."
      ],
      "bulletPoints": [
        "Key insight or descriptive finding 1",
        "Key insight or descriptive finding 2",
        "Key insight or descriptive finding 3"
      ],
      "imageSearchQuery": "A concise English noun phrase suitable for searching high-fidelity photos or scientific illustrations (e.g., 'solar system mars', 'dna double helix', 'blockchain ledger')"
    }
  ]
}

Ensure your response contains ONLY the raw JSON string inside and no chat preamble. Any markdown blocks can be formatted inside \`\`\`json ... \`\`\`. Do not include any text before or after the JSON payload.`;

  try {
    const ai = new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const modelsToTry = [
      "gemini-3.5-flash",
      "gemini-3.1-pro-preview",
      "gemini-flash-latest",
      "gemini-3.1-flash-lite"
    ];

    let response;
    let lastError: any = null;

    for (const model of modelsToTry) {
      try {
        response = await ai.models.generateContent({
          model,
          contents: `Please write a highly detailed professional booklet about: "${prompt}". Make sure it is completely tailored for language: "${pdfLanguage}" with exactly ${pages} pages.`,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            temperature: 0.3
          }
        });
        if (response && response.text) {
          break; // successfully got a response
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${model} failed or was busy. Error:`, err.message || err);
      }
    }

    if (!response || !response.text) {
      throw new Error(`All Gemini models failed or were busy. Last error: ${lastError?.message || lastError}`);
    }

    const rawContent = response.text || "";
    const plannedBooklet = parseRobustJson(rawContent);

    // Now, let's assemble the gorgeous PDF using pdf-lib on behalf of WeBox AI
    const pdfDoc = await PDFDocument.create();
    const fontStandard = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    // Standard A4 sizes: Width 595, Height 842 points
    const A4_WIDTH = 595;
    const A4_HEIGHT = 842;
    const LEFT_MARGIN = 50;
    const CONTENT_WIDTH = A4_WIDTH - (LEFT_MARGIN * 2);

    // 1. Cover Page Assembly (Swiss minimalist elegant design)
    const coverPage = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);
    
    // Subtle border design
    coverPage.drawRectangle({
      x: 35,
      y: 35,
      width: A4_WIDTH - 70,
      height: A4_HEIGHT - 70,
      borderColor: rgb(0.12, 0.15, 0.2),
      borderWidth: 1.5,
    });

    // Dark color highlight block near top
    coverPage.drawRectangle({
      x: 50,
      y: A4_HEIGHT - 120,
      width: CONTENT_WIDTH,
      height: 12,
      color: rgb(0.06, 0.09, 0.16),
    });

    let coverY = A4_HEIGHT - 180;
    
    // booklet title (wrap long titles gracefully on the cover!)
    const coverTitleLines = wrapText(plannedBooklet.title || prompt, CONTENT_WIDTH, fontBold, 22);
    for (const line of coverTitleLines) {
      coverPage.drawText(line, {
        x: LEFT_MARGIN,
        y: coverY,
        size: 22,
        font: fontBold,
        color: rgb(0.06, 0.09, 0.16),
      });
      coverY -= 28;
    }

    coverY -= 8;

    // booklet subtitle
    const coverSubLines = wrapText(plannedBooklet.subtitle || "Yapay Zeka Çalışma Kitapçığı", CONTENT_WIDTH, fontStandard, 11);
    for (const line of coverSubLines) {
      coverPage.drawText(line, {
        x: LEFT_MARGIN,
        y: coverY,
        size: 11,
        font: fontStandard,
        color: rgb(0.3, 0.35, 0.45),
      });
      coverY -= 16;
    }

    // Cover Page Picture (Cover Image) download & rendering pipeline
    coverY -= 15;
    const coverQuery = plannedBooklet.title || prompt;
    const coverImageUrl = await searchImageFromInternet(coverQuery);
    let coverImgSuccess = false;

    if (coverImageUrl) {
      const imgObj = await fetchImageBuffer(coverImageUrl);
      if (imgObj) {
        try {
          let embeddedImage;
          if (imgObj.isPng) {
            embeddedImage = await pdfDoc.embedPng(imgObj.bytes);
          } else {
            embeddedImage = await pdfDoc.embedJpg(imgObj.bytes);
          }

          const scaleDims = embeddedImage.scaleToFit(CONTENT_WIDTH, 220);
          const drawX = LEFT_MARGIN + (CONTENT_WIDTH - scaleDims.width) / 2;
          const drawY = coverY - scaleDims.height;

          coverPage.drawImage(embeddedImage, {
            x: drawX,
            y: drawY,
            width: scaleDims.width,
            height: scaleDims.height,
          });

          coverY = drawY - 26;
          coverImgSuccess = true;
        } catch (embedErr) {
          console.error("Embedding cover image error on pdf-lib:", embedErr);
        }
      }
    }

    // If no cover image found, draw a minimalist separator
    if (!coverImgSuccess) {
      coverY -= 10;
      coverPage.drawLine({
        start: { x: LEFT_MARGIN, y: coverY },
        end: { x: A4_WIDTH - LEFT_MARGIN, y: coverY },
        color: rgb(0.85, 0.88, 0.92),
        thickness: 1.5,
      });
      coverY -= 30;
    }

    // Booklet general topic details
    coverPage.drawText(toSafePdfText("Açıklama / Description:"), {
      x: LEFT_MARGIN,
      y: coverY,
      size: 10,
      font: fontBold,
      color: rgb(0.4, 0.4, 0.4),
    });

    const bodyWrapLines = wrapText(prompt, CONTENT_WIDTH, fontStandard, 10);
    let tempY = coverY - 18;
    for (const ln of bodyWrapLines) {
      if (tempY < 120) break;
      coverPage.drawText(ln, {
        x: LEFT_MARGIN,
        y: tempY,
        size: 10,
        font: fontStandard,
        color: rgb(0.1, 0.1, 0.1),
      });
      tempY -= 15;
    }

    // Cover Page Footer info - Academic and professional without branding keywords
    coverPage.drawText(toSafePdfText("Yayın Tarihi / Date of Publication:"), {
      x: LEFT_MARGIN,
      y: 90,
      size: 8.5,
      font: fontBold,
      color: rgb(0.45, 0.5, 0.55),
    });
    
    coverPage.drawText(toSafePdfText(new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })), {
      x: LEFT_MARGIN,
      y: 74,
      size: 10,
      font: fontStandard,
      color: rgb(0.15, 0.18, 0.24),
    });

    coverPage.drawText(toSafePdfText("BELGE TÜRÜ: ÖZEL ÇALIŞMA RAPORU / SPECIAL REPORT"), {
      x: LEFT_MARGIN,
      y: 52,
      size: 8,
      font: fontBold,
      color: rgb(0.35, 0.4, 0.45),
    });

    // 2. Build Inner Content Pages
    const innerPages = plannedBooklet.pages || [];
    const totalPdfPages = innerPages.length + 1; // +1 includes cover

    for (let pIdx = 0; pIdx < innerPages.length; pIdx++) {
      const sPage = innerPages[pIdx];
      const pdfPage = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);
      
      // Page frame boundaries
      pdfPage.drawRectangle({
        x: 30,
        y: 30,
        width: A4_WIDTH - 60,
        height: A4_HEIGHT - 60,
        borderColor: rgb(0.92, 0.92, 0.92),
        borderWidth: 1,
      });

      // Header title
      pdfPage.drawText(toSafePdfText(sPage.header || `Sayfa ${pIdx + 1}`), {
        x: LEFT_MARGIN,
        y: A4_HEIGHT - 60,
        size: 16,
        font: fontBold,
        color: rgb(0.06, 0.09, 0.16),
      });

      pdfPage.drawLine({
        start: { x: LEFT_MARGIN, y: A4_HEIGHT - 68 },
        end: { x: A4_WIDTH - LEFT_MARGIN, y: A4_HEIGHT - 68 },
        color: rgb(0.9, 0.9, 0.9),
        thickness: 0.8,
      });

      let currentY = A4_HEIGHT - 90;

      // Image downloading & rendering pipeline on Sandbox
      const queryStr = sPage.imageSearchQuery || prompt;
      const imageUrl = await searchImageFromInternet(queryStr);
      let imgSuccess = false;

      if (imageUrl) {
        sPage.imageUrl = imageUrl;
        const imgObj = await fetchImageBuffer(imageUrl);
        if (imgObj) {
          try {
            let embeddedImage;
            if (imgObj.isPng) {
              embeddedImage = await pdfDoc.embedPng(imgObj.bytes);
            } else {
              embeddedImage = await pdfDoc.embedJpg(imgObj.bytes);
            }

            const scaleDims = embeddedImage.scaleToFit(CONTENT_WIDTH, 180);
            const drawX = LEFT_MARGIN + (CONTENT_WIDTH - scaleDims.width) / 2;
            const drawY = currentY - scaleDims.height;

            pdfPage.drawImage(embeddedImage, {
              x: drawX,
              y: drawY,
              width: scaleDims.width,
              height: scaleDims.height,
            });

            // Draw caption under photo
            pdfPage.drawText(toSafePdfText(`Görsel: ${queryStr}`), {
              x: LEFT_MARGIN,
              y: drawY - 12,
              size: 7.5,
              font: fontOblique,
              color: rgb(0.5, 0.5, 0.5),
            });

            currentY = drawY - 26;
            imgSuccess = true;
          } catch (embedErr) {
            console.error("Embedding image error on pdf-lib (file corrupt or format issue):", embedErr);
          }
        }
      }

      // If no image was loaded/embedded, draw a beautiful minimalist abstract placeholder card
      if (!imgSuccess) {
        const placeholderHeight = 110;
        const playoutY = currentY - placeholderHeight;
        
        pdfPage.drawRectangle({
          x: LEFT_MARGIN,
          y: playoutY,
          width: CONTENT_WIDTH,
          height: placeholderHeight,
          color: rgb(0.96, 0.97, 0.98),
          borderColor: rgb(0.88, 0.9, 0.92),
          borderWidth: 1,
        });

        // Add visual text centered inside the frame
        const pLabel = toSafePdfText(`[Önizleme / Visual Material: ${queryStr}]`);
        const labelWidth = fontOblique.widthOfTextAtSize(pLabel, 9);
        
        pdfPage.drawText(pLabel, {
          x: LEFT_MARGIN + (CONTENT_WIDTH - labelWidth) / 2,
          y: playoutY + (placeholderHeight / 2) - 4,
          size: 9,
          font: fontOblique,
          color: rgb(0.4, 0.45, 0.5),
        });

        currentY = playoutY - 20;
      }

      // Write paragraphs
      const paragraphs = sPage.paragraphs || [];
      for (const para of paragraphs) {
        const wrappedLines = wrapText(para, CONTENT_WIDTH, fontStandard, 10);
        for (const line of wrappedLines) {
          // If content height overflows, stop safely to avoid blank margins
          if (currentY < 120) break;

          pdfPage.drawText(line, {
            x: LEFT_MARGIN,
            y: currentY,
            size: 10,
            font: fontStandard,
            color: rgb(0.18, 0.22, 0.28),
          });
          currentY -= 15;
        }
        currentY -= 10;
      }

      // Write bullet points
      const bullets = sPage.bulletPoints || [];
      if (bullets.length > 0 && currentY > 140) {
        currentY -= 5;
        for (const bullet of bullets) {
          if (currentY < 100) break;
          
          // Draw list bullet dot
          pdfPage.drawCircle({
            x: LEFT_MARGIN + 6,
            y: currentY + 3,
            size: 2.5,
            color: rgb(0.06, 0.5, 0.3),
          });

          const wrappedBullet = wrapText(bullet, CONTENT_WIDTH - 20, fontStandard, 9.5);
          for (let bL = 0; bL < wrappedBullet.length; bL++) {
            pdfPage.drawText(wrappedBullet[bL], {
              x: LEFT_MARGIN + 18,
              y: currentY,
              size: 9.5,
              font: fontStandard,
              color: rgb(0.15, 0.15, 0.15),
            });
            currentY -= 14;
          }
          currentY -= 4;
        }
      }

      // Inner Page Footer
      pdfPage.drawLine({
        start: { x: LEFT_MARGIN, y: 55 },
        end: { x: A4_WIDTH - LEFT_MARGIN, y: 55 },
        color: rgb(0.93, 0.93, 0.93),
        thickness: 0.5,
      });

      const footerLabel = plannedBooklet.title ? toSafePdfText(plannedBooklet.title) : "Doküman";
      const truncatedFooter = footerLabel.length > 55 ? footerLabel.substring(0, 52) + "..." : footerLabel;
      pdfPage.drawText(truncatedFooter, {
        x: LEFT_MARGIN,
        y: 42,
        size: 8,
        font: fontOblique,
        color: rgb(0.5, 0.55, 0.6),
      });

      const pageNumberStr = `${pIdx + 2} / ${totalPdfPages}`;
      const pageNumWidth = fontStandard.widthOfTextAtSize(pageNumberStr, 8);
      pdfPage.drawText(pageNumberStr, {
        x: A4_WIDTH - LEFT_MARGIN - pageNumWidth,
        y: 42,
        size: 8,
        font: fontStandard,
        color: rgb(0.4, 0.4, 0.4),
      });
    }

    // Save PDF to static base64
    const pdfBytes = await pdfDoc.save();
    const base64Pdf = Buffer.from(pdfBytes).toString("base64");

    return res.json({
      success: true,
      fileBase64: base64Pdf,
      remaining,
      contentStructure: plannedBooklet
    });

  } catch (error: any) {
    console.error("AI PDF compiled engine error:", error);
    return res.status(500).json({
      error: `Kitapçık oluşturulamadı. (Hata: ${error.message || "Bilinmeyen ağ hatası"}). Lütfen sunucu ayarlarını kontrol ediniz.`,
      remaining
    });
  }
});


// API endpoint for contact/support requests (kept as robust fallback)
app.post("/api/contact", async (req: any, res: any) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Lütfen ad, e-posta ve mesaj alanlarını eksiksiz doldurunuz." });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: "Sistemde RESEND_API_KEY kurulu değil. Destek talebinizi direkt webox.info@proton.me adresine e-posta olarak gönderebilirsiniz."
    });
  }

  try {
    const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
    const toEmail = process.env.RESEND_TO_EMAIL || "webox.info@proton.me";

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        reply_to: email,
        subject: `WeBox Destek: ${subject || "Yeni Destek Talebi"}`,
        html: `<div style="font-family: sans-serif; padding: 20px;"><h3>Yeni Mesaj</h3><p><b>Gönderen:</b> ${name} (${email})</p><p><b>Mesaj:</b></p><pre>${message}</pre></div>`
      })
    });

    if (response.ok) {
      return res.json({ success: true });
    } else {
      const errorData = await response.json();
      return res.status(502).json({ error: errorData.message || "Resend error occurred." });
    }
  } catch (e: any) {
    return res.status(500).json({ error: "Sunucu hatası." });
  }
});

// Vite middleware for development and startup wrapper
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: any, res: any) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
