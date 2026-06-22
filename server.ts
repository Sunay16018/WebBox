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
    fs.writeFileSync(USAGE_DB_PATH, JSON.stringify({}), "utf8");
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
  if (!userRecord) return 5;
  if (userRecord.lastResetDate !== today) return 5;
  return Math.max(0, 5 - userRecord.count);
}

function incrementUsage(fingerprint: string): { allowed: boolean; remaining: number } {
  const db = getUsageDb();
  const today = getTodayString();
  
  if (!db[fingerprint]) {
    db[fingerprint] = { count: 0, lastResetDate: today };
  }
  
  const userRecord = db[fingerprint];
  if (userRecord.lastResetDate !== today) {
    userRecord.count = 0;
    userRecord.lastResetDate = today;
  }
  
  if (userRecord.count >= 5) {
    return { allowed: false, remaining: 0 };
  }
  
  userRecord.count += 1;
  saveUsageDb(db);
  return { allowed: true, remaining: 5 - userRecord.count };
}

// Text wrapping utility for pdf-lib text drawing
function wrapText(text: string, maxWidth: number, font: any, fontSize: number): string[] {
  const words = text.split(" ");
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
  const remaining = getRemainingLimit(fingerprint);
  return res.json({ remaining });
});

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
  const systemInstruction = `You are an elite academic editor and visual PDF layout planner.
Format your output as a 100% compliant, parsed RAW JSON string matching the exact schema below.
IMPORTANT: You MUST write the booklet content strictly in the requested language: "${pdfLanguage}".
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
      "imageSearchQuery": "A concise English noun phrase suitable for searching high-fidelity photos or scientific illustrations (e.g., 'solar system mars', 'dna double helix', 'blockchain ledger ledger')"
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

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Please write a highly detailed professional booklet about: "${prompt}". Make sure it is completely tailored for language: "${pdfLanguage}" with exactly ${pages} pages.`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.3
      }
    });

    let rawContent = response.text || "";
    
    // Clean JSON tags from output
    if (rawContent.includes("```json")) {
      rawContent = rawContent.split("```json")[1].split("```")[0];
    } else if (rawContent.includes("```")) {
      rawContent = rawContent.split("```")[1].split("```")[0];
    }
    rawContent = rawContent.trim();

    const plannedBooklet = JSON.parse(rawContent);

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
      x: 30,
      y: 30,
      width: A4_WIDTH - 60,
      height: A4_HEIGHT - 60,
      borderColor: rgb(0.1, 0.1, 0.1),
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
    const coverTitleLines = wrapText(plannedBooklet.title || prompt, CONTENT_WIDTH, fontBold, 26);
    for (const line of coverTitleLines) {
      coverPage.drawText(line, {
        x: LEFT_MARGIN,
        y: coverY,
        size: 26,
        font: fontBold,
        color: rgb(0.06, 0.09, 0.16),
      });
      coverY -= 36;
    }

    coverY -= 10;

    // booklet subtitle
    const coverSubLines = wrapText(plannedBooklet.subtitle || "Yapay Zeka Çalışma Kitapçığı", CONTENT_WIDTH, fontStandard, 13);
    for (const line of coverSubLines) {
      coverPage.drawText(line, {
        x: LEFT_MARGIN,
        y: coverY,
        size: 13,
        font: fontStandard,
        color: rgb(0.3, 0.35, 0.45),
      });
      coverY -= 18;
    }

    // Centered aesthetic separator line
    coverPage.drawLine({
      start: { x: LEFT_MARGIN, y: coverY - 12 },
      end: { x: A4_WIDTH - LEFT_MARGIN, y: coverY - 12 },
      color: rgb(0.9, 0.9, 0.9),
      thickness: 1,
    });

    coverY -= 80;

    // Booklet general topic details or prompt visual context
    coverPage.drawText("Konu / Subject:", {
      x: LEFT_MARGIN,
      y: coverY,
      size: 10,
      font: fontBold,
      color: rgb(0.4, 0.4, 0.4),
    });

    const bodyWrapLines = wrapText(prompt, CONTENT_WIDTH, fontStandard, 11);
    let tempY = coverY - 18;
    for (const ln of bodyWrapLines) {
      coverPage.drawText(ln, {
        x: LEFT_MARGIN,
        y: tempY,
        size: 11,
        font: fontStandard,
        color: rgb(0.1, 0.1, 0.1),
      });
      tempY -= 16;
    }

    // Cover Page Footer info
    coverPage.drawText("Hazırlayan / Generator:", {
      x: LEFT_MARGIN,
      y: 120,
      size: 9,
      font: fontBold,
      color: rgb(0.4, 0.4, 0.4),
    });
    
    coverPage.drawText("WeBox AI Toolkit Engine • WeBox GPT-Core", {
      x: LEFT_MARGIN,
      y: 104,
      size: 10,
      font: fontStandard,
      color: rgb(0.1, 0.1, 0.1),
    });

    coverPage.drawText(`Tarih / Date: ${new Date().toLocaleDateString()}`, {
      x: LEFT_MARGIN,
      y: 88,
      size: 9,
      font: fontStandard,
      color: rgb(0.5, 0.5, 0.5),
    });

    coverPage.drawText("GÜVENLİ VE ŞEFFAF SANDBOX SİSTEMİ", {
      x: LEFT_MARGIN,
      y: 55,
      size: 8,
      font: fontBold,
      color: rgb(0.05, 0.5, 0.3),
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
      pdfPage.drawText(sPage.header || `Sayfa ${pIdx + 1}`, {
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
            pdfPage.drawText(`Görsel: ${queryStr}`, {
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
        const pLabel = `[Önizleme / Visual Material: ${queryStr}]`;
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

      const footerLabel = `WeBox AI • WeBox GPT-Core`;
      pdfPage.drawText(footerLabel, {
        x: LEFT_MARGIN,
        y: 42,
        size: 7.5,
        font: fontStandard,
        color: rgb(0.6, 0.6, 0.6),
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
