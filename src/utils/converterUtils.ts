// Offline Converter Core Algorithms & Helpers
import { PDFDocument, StandardFonts } from 'pdf-lib';

// -------------------------------------------------------------
// 1. Morse Code Definitions & Audio Generator
// -------------------------------------------------------------
export const MORSE_MAP: Record<string, string> = {
  'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
  'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
  'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
  'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
  'Y': '-.--', 'Z': '--..', '1': '.----', '2': '..---', '3': '...--',
  '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..',
  '9': '----.', '0': '-----', ' ': '/'
};

export function textToMorse(text: string): string {
  return text.toUpperCase().split('').map(char => MORSE_MAP[char] || '').join(' ');
}

export function generateMorseWavBlob(text: string): Blob {
  const code = textToMorse(text);
  const sampleRate = 8000;
  const dotDuration = 0.08; // 80ms
  
  let totalSamples = 0;
  for (let i = 0; i < code.length; i++) {
    const symbol = code[i];
    if (symbol === '.') totalSamples += Math.floor(sampleRate * dotDuration * 2);
    else if (symbol === '-') totalSamples += Math.floor(sampleRate * dotDuration * 4);
    else if (symbol === ' ') totalSamples += Math.floor(sampleRate * dotDuration * 4);
    else if (symbol === '/') totalSamples += Math.floor(sampleRate * dotDuration * 7);
  }
  
  if (totalSamples === 0) totalSamples = sampleRate;

  const buffer = new ArrayBuffer(44 + totalSamples * 2);
  const view = new DataView(buffer);

  // WAV header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + totalSamples * 2, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, totalSamples * 2, true);

  let offset = 44;
  const writeTone = (duration: number, volume: number) => {
    const samples = Math.floor(sampleRate * duration);
    for (let s = 0; s < samples; s++) {
      if (offset >= buffer.byteLength) break;
      const t = s / sampleRate;
      const sample = volume * Math.sin(2 * Math.PI * 750 * t);
      view.setInt16(offset, Math.max(-1, Math.min(1, sample)) * 0x7FFF, true);
      offset += 2;
    }
  };

  const writeSilence = (duration: number) => {
    const samples = Math.floor(sampleRate * duration);
    for (let s = 0; s < samples; s++) {
      if (offset >= buffer.byteLength) break;
      view.setInt16(offset, 0, true);
      offset += 2;
    }
  };

  for (let i = 0; i < code.length; i++) {
    const symbol = code[i];
    if (symbol === '.') {
      writeTone(dotDuration, 0.4);
      writeSilence(dotDuration);
    } else if (symbol === '-') {
      writeTone(dotDuration * 3, 0.4);
      writeSilence(dotDuration);
    } else if (symbol === ' ') {
      writeSilence(dotDuration * 3);
    } else if (symbol === '/') {
      writeSilence(dotDuration * 6);
    }
  }

  while (offset < buffer.byteLength) {
    view.setInt16(offset, 0, true);
    offset += 2;
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

// -------------------------------------------------------------
// 2. Synthesizer Wave Generator
// -------------------------------------------------------------
export function generateToneWavBlob(frequency: number, duration: number, type: 'sine' | 'square' | 'sawtooth' | 'triangle'): Blob {
  const sampleRate = 16000;
  const numSamples = Math.floor(sampleRate * duration);
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, numSamples * 2, true);

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let sample = 0;
    
    if (type === 'sine') {
      sample = Math.sin(2 * Math.PI * frequency * t);
    } else if (type === 'square') {
      sample = Math.sin(2 * Math.PI * frequency * t) >= 0 ? 1 : -1;
    } else if (type === 'sawtooth') {
      sample = 2 * (t * frequency - Math.floor(0.5 + t * frequency));
    } else if (type === 'triangle') {
      sample = Math.abs(6.28 * frequency * t % 6.28 - 3.14) / 1.57 - 1;
    }

    view.setInt16(offset, Math.max(-1, Math.min(1, sample * 0.5)) * 0x7FFF, true);
    offset += 2;
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

// -------------------------------------------------------------
// 3. Structured Data Bidirectional Engines
// -------------------------------------------------------------
export function parseInputData(text: string, format: string): Record<string, any>[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  try {
    switch (format) {
      case 'json': {
        const parsed = JSON.parse(trimmed);
        return Array.isArray(parsed) ? parsed : [parsed];
      }
      case 'csv':
        return parseDelimitedText(trimmed, ',');
      case 'tsv':
        return parseDelimitedText(trimmed, '\t');
      case 'xml':
        return parseCustomXML(trimmed);
      case 'yaml':
        return parseCustomYAML(trimmed);
      case 'sql':
        return parseSQLInserts(trimmed);
      case 'js': {
        // Safe evaluation of standard literal JS array/objects
        const sanatized = trimmed.replace(/^\s*(const|let|var)\s+\w+\s*=\s*/, '');
        // eslint-disable-next-line no-eval
        const temp = eval(`(${sanatized})`);
        return Array.isArray(temp) ? temp : [temp];
      }
      default:
        return [{ text: trimmed }];
    }
  } catch (err) {
    return [{ error: 'Veri formatı çözümlenemedi.', raw: trimmed }];
  }
}

function parseDelimitedText(text: string, delim: string): Record<string, any>[] {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length === 0) return [];

  const headers = lines[0].split(delim).map(h => h.replace(/^["']|["']$/g, '').trim());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].split(delim).map(c => c.replace(/^["']|["']$/g, '').trim());
    const obj: Record<string, any> = {};
    headers.forEach((h, idx) => {
      obj[h || `column_${idx + 1}`] = cells[idx] !== undefined ? cells[idx] : '';
    });
    rows.push(obj);
  }
  return rows;
}

function parseCustomXML(text: string): Record<string, any>[] {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(text, 'text/xml');
  const rows = xmlDoc.getElementsByTagName('row');
  
  if (rows.length === 0) {
    const children = xmlDoc.documentElement ? xmlDoc.documentElement.children : [];
    if (children.length > 0) {
      const single: Record<string, any> = {};
      for (let i = 0; i < children.length; i++) {
        single[children[i].tagName] = children[i].textContent || '';
      }
      return [single];
    }
    return [{ error: 'XML is empty or lacks <row> nodes' }];
  }

  const list: Record<string, any>[] = [];
  for (let i = 0; i < rows.length; i++) {
    const item: Record<string, any> = {};
    const cells = rows[i].children;
    for (let j = 0; j < cells.length; j++) {
      item[cells[j].tagName] = cells[j].textContent || '';
    }
    list.push(item);
  }
  return list;
}

function parseCustomYAML(text: string): Record<string, any>[] {
  const lines = text.split('\n');
  const result: Record<string, any> = {};
  lines.forEach(line => {
    const t = line.trim();
    if (!t || t.startsWith('#') || t.startsWith('-')) return;
    const parts = t.split(':');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join(':').trim();
      result[key] = val.replace(/^["']|["']$/g, '');
    }
  });
  return [result];
}

function parseSQLInserts(text: string): Record<string, any>[] {
  const regex = /VALUES\s*\(([^)]+)\)/gi;
  const list: Record<string, any>[] = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    const cells = match[1].split(',').map(c => c.trim().replace(/^['"]|['"]$/g, ''));
    const obj: Record<string, any> = {};
    cells.forEach((v, idx) => {
      obj[`column_${idx + 1}`] = v;
    });
    list.push(obj);
  }
  return list.length > 0 ? list : [{ raw_text: text }];
}

export function formatOutputData(data: Record<string, any>[], format: string): string {
  if (!data || data.length === 0) return '';

  switch (format) {
    case 'json':
      return JSON.stringify(data, null, 2);
    case 'csv':
      return arrayToDelimited(data, ',');
    case 'tsv':
      return arrayToDelimited(data, '\t');
    case 'xml': {
      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<root>\n';
      data.forEach(row => {
        xml += '  <row>\n';
        Object.entries(row).forEach(([k, v]) => {
          const cleanK = k.replace(/[^a-zA-Z0-9_]/g, '_');
          xml += `    <${cleanK}>${escapeXml(String(v))}</${cleanK}>\n`;
        });
        xml += '  </row>\n';
      });
      xml += '</root>';
      return xml;
    }
    case 'yaml': {
      let yaml = '';
      data.forEach((row, i) => {
        yaml += `- row_${i + 1}:\n`;
        Object.entries(row).forEach(([k, v]) => {
          yaml += `  ${k}: "${String(v).replace(/"/g, '\\"')}"\n`;
        });
      });
      return yaml;
    }
    case 'sql': {
      const keys = Object.keys(data[0]);
      const cols = keys.map(k => `\`${k}\``).join(', ');
      const rows = data.map(row => {
        const vals = keys.map(k => {
          const v = row[k];
          if (typeof v === 'number') return v;
          return `'${String(v).replace(/'/g, "''")}'`;
        }).join(', ');
        return `INSERT INTO \`converted_table\` (${cols}) VALUES (${vals});`;
      });
      return rows.join('\n');
    }
    case 'html': {
      const keys = Object.keys(data[0]);
      let html = '<table class="min-w-full border border-gray-200 font-sans text-xs">\n  <thead>\n    <tr class="bg-gray-100">\n';
      keys.forEach(k => { html += `      <th class="border px-4 py-2 text-left">${k}</th>\n`; });
      html += '    </tr>\n  </thead>\n  <tbody>\n';
      data.forEach(row => {
        html += '    <tr>\n';
        keys.forEach(k => { html += `      <td class="border px-4 py-2">${row[k] !== undefined ? row[k] : ''}</td>\n`; });
        html += '    </tr>\n';
      });
      html += '  </tbody>\n</table>';
      return html;
    }
    case 'markdown': {
      const keys = Object.keys(data[0]);
      const headers = '| ' + keys.join(' | ') + ' |';
      const dividers = '| ' + keys.map(() => '---').join(' | ') + ' |';
      const rows = data.map(row => {
        return '| ' + keys.map(k => String(row[k] !== undefined ? row[k] : '')).join(' | ') + ' |';
      });
      return [headers, dividers, ...rows].join('\n');
    }
    case 'js':
      return `const dataList = ${JSON.stringify(data, null, 2)};`;
    default:
      return JSON.stringify(data);
  }
}

function arrayToDelimited(data: Record<string, any>[], delimiter: string): string {
  const headers = Object.keys(data[0]);
  const headerRow = headers.join(delimiter);
  const rows = data.map(row => {
    return headers.map(h => {
      const cell = String(row[h] !== undefined ? row[h] : '');
      if (cell.includes(delimiter) || cell.includes('"') || cell.includes('\n')) {
        return `"${cell.replace(/"/g, '""')}"`;
      }
      return cell;
    }).join(delimiter);
  });
  return [headerRow, ...rows].join('\n');
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

// -------------------------------------------------------------
// 4. Case Conversion Engine
// -------------------------------------------------------------
export function transformTextCase(text: string, mode: string): string {
  switch (mode) {
    case 'upper':
      return text.toUpperCase();
    case 'lower':
      return text.toLowerCase();
    case 'sentence':
      return text.split(/[.!?]\s+/).map(sentence => {
        if (!sentence) return '';
        return sentence.charAt(0).toUpperCase() + sentence.slice(1).toLowerCase();
      }).join('. ');
    case 'title':
      return text.replace(/\b\w/g, c => c.toUpperCase());
    case 'camel':
      return text.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase());
    case 'snake':
      return text.toLowerCase().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
    case 'kebab':
      return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '');
    case 'slug':
      return text.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
    case 'constant':
      return text.toUpperCase().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
    default:
      return text;
  }
}

// -------------------------------------------------------------
// 5. Native Client-Side MD5 Algorithm
// -------------------------------------------------------------
export function md5(string: string): string {
  function RotateLeft(lValue: number, iShiftBits: number) {
    return (lValue<<iShiftBits) | (lValue>>>(32-iShiftBits));
  }
  function AddUnsigned(lX: number, lY: number) {
    const lX4 = (lX & 0x40000000);
    const lY4 = (lY & 0x40000000);
    const lX8 = (lX & 0x80000000);
    const lY8 = (lY & 0x80000000);
    let lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
    if (lX4 & lY4) {
      lResult = (lResult ^ 0x80000000 ^ lX8 ^ lY8);
    } else if (lX4 | lY4) {
      if (lResult & 0x40000000) {
        lResult = (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
      } else {
        lResult = (lResult ^ 0x40000000 ^ lX8 ^ lY8);
      }
    } else {
      lResult = (lResult ^ lX8 ^ lY8);
    }
    return lResult;
  }
  function F(x: number, y: number, z: number) { return (x & y) | ((~x) & z); }
  function G(x: number, y: number, z: number) { return (x & z) | (y & (~z)); }
  function H(x: number, y: number, z: number) { return (x ^ y ^ z); }
  function I(x: number, y: number, z: number) { return (y ^ (x | (~z))); }
  function FF(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  }
  function GG(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  }
  function HH(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  }
  function II(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  }
  function ConvertToWordArray(str: string) {
    let lWordCount;
    const lMessageLength = str.length;
    const lNumberOfWords_temp1 = lMessageLength + 8;
    const lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
    const lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
    const lWordArray = Array(lNumberOfWords).fill(0);
    let lBytePosition = 0;
    let lByteCount = 0;
    while (lByteCount < lMessageLength) {
      lWordCount = (lByteCount - (lByteCount % 4)) / 4;
      lBytePosition = (lByteCount % 4) * 8;
      lWordArray[lWordCount] = (lWordArray[lWordCount] | (str.charCodeAt(lByteCount) << lBytePosition));
      lByteCount++;
    }
    lWordCount = (lByteCount - (lByteCount % 4)) / 4;
    lBytePosition = (lByteCount % 4) * 8;
    lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
    lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
    lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
    return lWordArray;
  }
  function WordToHex(lValue: number) {
    let WordToHexValue = "";
    let WordToHexValue_temp = "";
    let lByte;
    let lCount;
    for (lCount = 0; lCount <= 3; lCount++) {
      lByte = (lValue >>> (lCount * 8)) & 255;
      WordToHexValue_temp = "0" + lByte.toString(16);
      WordToHexValue = WordToHexValue + WordToHexValue_temp.substring(WordToHexValue_temp.length - 2);
    }
    return WordToHexValue;
  }
  function Utf8Encode(str: string) {
    str = str.replace(/\r\n/g, "\n");
    let utftext = "";
    for (let n = 0; n < str.length; n++) {
      const c = str.charCodeAt(n);
      if (c < 128) {
        utftext += String.fromCharCode(c);
      } else if ((c > 127) && (c < 2048)) {
        utftext += String.fromCharCode((c >> 6) | 192);
        utftext += String.fromCharCode((c & 63) | 128);
      } else {
        utftext += String.fromCharCode((c >> 12) | 224);
        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
        utftext += String.fromCharCode((c & 63) | 128);
      }
    }
    return utftext;
  }
  let k, S11=7, S12=12, S13=17, S14=22;
  let S21=5, S22=9, S23=14, S24=20;
  let S31=4, S32=11, S33=16, S34=23;
  let S41=6, S42=10, S43=15, S44=21;
  string = Utf8Encode(string);
  const x = ConvertToWordArray(string);
  let a = 0x67452301;
  let b = 0xEFCDAB89;
  let c = 0x98BADCFE;
  let d = 0x10325476;
  for (k = 0; k < x.length; k += 16) {
    let AA = a, BB = b, CC = c, DD = d;
    a = FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
    d = FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
    c = FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
    b = FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
    a = FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
    d = FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
    c = FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
    b = FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
    a = FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
    d = FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
    c = FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
    b = FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
    a = FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
    d = FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
    c = FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
    b = FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
    a = GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
    d = GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
    c = GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
    b = GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
    a = GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
    d = GG(d, a, b, c, x[k + 10], S22, 0x2441453);
    c = GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
    b = GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
    a = GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
    d = GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
    c = GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
    b = GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
    a = GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
    d = GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
    c = GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
    b = GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
    a = HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
    d = HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
    c = HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
    b = HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
    a = HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
    d = HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
    c = HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
    b = HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
    a = HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
    d = HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
    c = HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
    b = HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
    a = HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
    d = HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
    c = HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
    b = HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
    a = II(a, b, c, d, x[k + 0], S41, 0xF4292244);
    d = II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
    c = II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
    b = II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
    a = II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
    d = II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
    c = II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
    b = II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
    a = II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
    d = II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
    c = II(c, d, a, b, x[k + 6], S43, 0xA3014314);
    b = II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
    a = II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
    d = II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
    c = II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
    b = II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
    a = AddUnsigned(a, AA);
    b = AddUnsigned(b, BB);
    c = AddUnsigned(c, CC);
    d = AddUnsigned(d, DD);
  }
  return (WordToHex(a) + WordToHex(b) + WordToHex(c) + WordToHex(d)).toLowerCase();
}

// -------------------------------------------------------------
// 6. Text to PDF Document Offline Compiler (using pdf-lib)
// -------------------------------------------------------------
export async function convertTextToPDF(text: string, title = 'Döküman'): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([595, 842]); // A4 Size
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  const lines = text.split('\n');
  let y = 800;
  
  page.drawText(title.toUpperCase(), { x: 50, y, size: 16, font });
  y -= 40;

  for (const line of lines) {
    if (y < 60) {
      page = pdfDoc.addPage([595, 842]);
      y = 800;
    }
    
    // Simple line wrap at 80 characters
    let remainder = line;
    while (remainder.length > 0) {
      const chunk = remainder.substring(0, 80);
      page.drawText(chunk, { x: 50, y, size: 10, font });
      y -= 15;
      remainder = remainder.substring(80);
      
      if (y < 60) {
        page = pdfDoc.addPage([595, 842]);
        y = 800;
      }
    }
  }

  return await pdfDoc.save();
}

// -------------------------------------------------------------
// 7. 100+ Features Checklist Catalog
// -------------------------------------------------------------
export const MASTER_FEATURE_CATALOG = [
  { id: 'f1', name: 'PNG Formatına Dönüştürme', category: 'image', status: 'active' },
  { id: 'f2', name: 'JPG / JPEG Formatına Dönüştürme', category: 'image', status: 'active' },
  { id: 'f3', name: 'WebP Formatına Dönüştürme', category: 'image', status: 'active' },
  { id: 'f4', name: 'BMP Formatına Dönüştürme', category: 'image', status: 'active' },
  { id: 'f5', name: 'Favicon ICO Formatına (32x32) İndirme', category: 'image', status: 'active' },
  { id: 'f6', name: 'Özel Genişlik Değişimi (px)', category: 'image', status: 'active' },
  { id: 'f7', name: 'Özel Yükseklik Değişimi (px)', category: 'image', status: 'active' },
  { id: 'f8', name: 'En / Boy Oranı Kilitleme', category: 'image', status: 'active' },
  { id: 'f9', name: 'Sıkıştırma Oranı Belirleme (%10-%100)', category: 'image', status: 'active' },
  { id: 'f10', name: 'Siyah Beyaz (Grayscale) Filtresi', category: 'image', status: 'active' },
  { id: 'f11', name: 'Renkleri Ters Çevirme (Invert)', category: 'image', status: 'active' },
  { id: 'f12', name: 'Sepya Nostaljik Ton Filtresi', category: 'image', status: 'active' },
  { id: 'f13', name: 'Bulanıklık Efekti (Blur Slider)', category: 'image', status: 'active' },
  { id: 'f14', name: 'Parlaklık Ayarı Slider (-100% ile +100%)', category: 'image', status: 'active' },
  { id: 'f15', name: 'Kontrast Ayarı Slider (-100% ile +100%)', category: 'image', status: 'active' },
  { id: 'f16', name: 'Doygunluk Derecesi (Saturate 0-300%)', category: 'image', status: 'active' },
  { id: 'f17', name: 'Renk Değişimi (Hue Rotate 0-360°)', category: 'image', status: 'active' },
  { id: 'f18', name: 'Yatay Çevirme (Mirror Flip)', category: 'image', status: 'active' },
  { id: 'f19', name: 'Dikey Çevirme (Flip Vertical)', category: 'image', status: 'active' },
  { id: 'f20', name: 'Rotasyon Çevirici (90°, 180°, 270°)', category: 'image', status: 'active' },
  { id: 'f21', name: 'Polaroid Retro Çerçeve Ekleme', category: 'image', status: 'active' },
  { id: 'f22', name: 'JSON verisini CSV tablosuna çevirme', category: 'data', status: 'active' },
  { id: 'f23', name: 'JSON verisini TSV tablosuna çevirme', category: 'data', status: 'active' },
  { id: 'f24', name: 'JSON verisini XML dökümanına çevirme', category: 'data', status: 'active' },
  { id: 'f25', name: 'JSON verisini YAML ayar dosyasına çevirme', category: 'data', status: 'active' },
  { id: 'f26', name: 'JSON verisini SQL INSERT komutuna çevirme', category: 'data', status: 'active' },
  { id: 'f27', name: 'JSON verisini HTML tablo koduna çevirme', category: 'data', status: 'active' },
  { id: 'f28', name: 'JSON verisini Markdown tablo koduna çevirme', category: 'data', status: 'active' },
  { id: 'f29', name: 'JSON verisini JS Native Array yapısına çevirme', category: 'data', status: 'active' },
  { id: 'f30', name: 'CSV tablosunu JSON verisine çevirme', category: 'data', status: 'active' },
  { id: 'f31', name: 'CSV tablosunu TSV tablosuna çevirme', category: 'data', status: 'active' },
  { id: 'f32', name: 'CSV tablosunu XML dosyasına çevirme', category: 'data', status: 'active' },
  { id: 'f33', name: 'CSV tablosunu YAML konfigurasyonuna çevirme', category: 'data', status: 'active' },
  { id: 'f34', name: 'CSV tablosunu SQL INSERT komutuna çevirme', category: 'data', status: 'active' },
  { id: 'f35', name: 'CSV tablosunu HTML tablo koduna çevirme', category: 'data', status: 'active' },
  { id: 'f36', name: 'CSV tablosunu Markdown tablo koduna çevirme', category: 'data', status: 'active' },
  { id: 'f37', name: 'TSV tablosunu JSON verisine çevirme', category: 'data', status: 'active' },
  { id: 'f38', name: 'TSV tablosunu CSV tablosuna çevirme', category: 'data', status: 'active' },
  { id: 'f39', name: 'TSV tablosunu XML dosyasına çevirme', category: 'data', status: 'active' },
  { id: 'f40', name: 'TSV tablosunu YAML konfigurasyonuna çevirme', category: 'data', status: 'active' },
  { id: 'f41', name: 'TSV tablosunu SQL INSERT komutuna çevirme', category: 'data', status: 'active' },
  { id: 'f42', name: 'TSV tablosunu HTML tablo koduna çevirme', category: 'data', status: 'active' },
  { id: 'f43', name: 'TSV tablosunu Markdown tablo koduna çevirme', category: 'data', status: 'active' },
  { id: 'f44', name: 'XML belgesini JSON verisine çevirme', category: 'data', status: 'active' },
  { id: 'f45', name: 'XML belgesini CSV tablosuna çevirme', category: 'data', status: 'active' },
  { id: 'f46', name: 'XML belgesini YAML formatına çevirme', category: 'data', status: 'active' },
  { id: 'f47', name: 'XML belgesini HTML tablo koduna çevirme', category: 'data', status: 'active' },
  { id: 'f48', name: 'YAML dosyasını JSON verisine çevirme', category: 'data', status: 'active' },
  { id: 'f49', name: 'YAML dosyasını CSV tablosuna çevirme', category: 'data', status: 'active' },
  { id: 'f50', name: 'YAML dosyasını XML formatına çevirme', category: 'data', status: 'active' },
  { id: 'f51', name: 'SQL Insert scriptlerini JSON formatına çevirme', category: 'data', status: 'active' },
  { id: 'f52', name: 'SQL Insert scriptlerini CSV formatına çevirme', category: 'data', status: 'active' },
  { id: 'f53', name: 'HTML Tablo kodunu JSON formatına çevirme', category: 'data', status: 'active' },
  { id: 'f54', name: 'Markdown Tablo kodunu JSON formatına çevirme', category: 'data', status: 'active' },
  { id: 'f55', name: 'JS Native Array yapısını JSON formatına çevirme', category: 'data', status: 'active' },
  { id: 'f56', name: 'TXT / Markdown belgesinden PDF dökümanı üretme', category: 'doc', status: 'active' },
  { id: 'f57', name: 'TXT belgesini HTML koduna çevirme', category: 'doc', status: 'active' },
  { id: 'f58', name: 'Markdown belgesini HTML koduna çevirme', category: 'doc', status: 'active' },
  { id: 'f59', name: 'HTML dökümanını Markdown formatına çevirme', category: 'doc', status: 'active' },
  { id: 'f60', name: 'HTML dökümanını Düz Metine (Plain Text) çevirme', category: 'doc', status: 'active' },
  { id: 'f61', name: 'SRT (Altyazı) dosyasını VTT formatına dönüştürme', category: 'doc', status: 'active' },
  { id: 'f62', name: 'VTT (Altyazı) dosyasını SRT formatına dönüştürme', category: 'doc', status: 'active' },
  { id: 'f63', name: 'JSON string listesini Düzyazı Metin Satırlarına çevirme', category: 'doc', status: 'active' },
  { id: 'f64', name: 'Düzyazı Satırlarını JSON array formatına çevirme', category: 'doc', status: 'active' },
  { id: 'f65', name: 'Kelime Sayıcı & İstatistik raporlama', category: 'doc', status: 'active' },
  { id: 'f66', name: 'Karakter Sayıcı (Boşluklu / Boşluksuz)', category: 'doc', status: 'active' },
  { id: 'f67', name: 'Ortalama Kelime Uzunluğu Hesaplayıcı', category: 'doc', status: 'active' },
  { id: 'f68', name: 'Tahmini Okuma Süresi Ölçümü', category: 'doc', status: 'active' },
  { id: 'f69', name: 'Cümle Sayacı ve Yoğunluk Grafiği', category: 'doc', status: 'active' },
  { id: 'f70', name: 'Metni tamamen BÜYÜK harfe dönüştürme', category: 'doc', status: 'active' },
  { id: 'f71', name: 'Metni tamamen küçük harfe dönüştürme', category: 'doc', status: 'active' },
  { id: 'f72', name: 'Metni Cümle Formatına dönüştürme', category: 'doc', status: 'active' },
  { id: 'f73', name: 'Metni Title Case (Başlık Biçimi) yapma', category: 'doc', status: 'active' },
  { id: 'f74', name: 'Metni camelCase formatına dönüştürme', category: 'doc', status: 'active' },
  { id: 'f75', name: 'Metni snake_case formatına dönüştürme', category: 'doc', status: 'active' },
  { id: 'f76', name: 'Metni kebab-case formatına dönüştürme', category: 'doc', status: 'active' },
  { id: 'f77', name: 'Metni slugify (url dostu) biçimine çevirme', category: 'doc', status: 'active' },
  { id: 'f78', name: 'Metni CONSTANT_CASE formatına çevirme', category: 'doc', status: 'active' },
  { id: 'f79', name: 'MD5 Kriptografik Karma Üretimi (Hash)', category: 'crypto', status: 'active' },
  { id: 'f80', name: 'SHA-1 Güvenlik Karması Oluşturma', category: 'crypto', status: 'active' },
  { id: 'f81', name: 'SHA-256 Saniyeler İçinde Karma Çıkışı', category: 'crypto', status: 'active' },
  { id: 'f82', name: 'SHA-512 Maksimum Güvenlik Karması Çıkarma', category: 'crypto', status: 'active' },
  { id: 'f83', name: 'Base64 Metin Kodlama (Encode)', category: 'crypto', status: 'active' },
  { id: 'f84', name: 'Base64 Kod Çözümleme (Decode)', category: 'crypto', status: 'active' },
  { id: 'f85', name: 'URL Kodlama (URL safe parameters)', category: 'crypto', status: 'active' },
  { id: 'f86', name: 'URL Kod Çözme (Parameter Decode)', category: 'crypto', status: 'active' },
  { id: 'f87', name: "Hexadecimal (16'lık taban) Metin Kodlayıcı", category: 'crypto', status: 'active' },
  { id: 'f88', name: 'Hexadecimal Metin Kod Çözücü', category: 'crypto', status: 'active' },
  { id: 'f89', name: 'HTML Entities (Özel karakter kodlama)', category: 'crypto', status: 'active' },
  { id: 'f90', name: 'HTML Entities Kod Çözücü', category: 'crypto', status: 'active' },
  { id: 'f91', name: 'JavaScript Kod Sıkıştırıcı (Minifier)', category: 'crypto', status: 'active' },
  { id: 'f92', name: 'CSS Stil Sıkıştırıcı (Minifier)', category: 'crypto', status: 'active' },
  { id: 'f93', name: 'JSON Veri Küçültücü', category: 'crypto', status: 'active' },
  { id: 'f94', name: 'JSON Veri Güzelleştirici (Beautifier - Indented)', category: 'crypto', status: 'active' },
  { id: 'f95', name: 'XML hiyerarşik Güzelleştirici', category: 'crypto', status: 'active' },
  { id: 'f96', name: 'ROT13 Gizli Yazı Şifrleyici (Cipher)', category: 'crypto', status: 'active' },
  { id: 'f97', name: 'ROT13 Kod Çözücü (Decipher)', category: 'crypto', status: 'active' },
  { id: 'f98', name: 'Düz Metni İkili Sisteme (Binary) Çevirme', category: 'crypto', status: 'active' },
  { id: 'f99', name: 'Binary Dizisini Düz Metine Geri Çevirme', category: 'crypto', status: 'active' },
  { id: 'f100', name: 'Ses Sentezleyici (Text to Speech - TTS)', category: 'audio', status: 'active' },
  { id: 'f101', name: 'TTS pitch (ses perdesi) ayarı', category: 'audio', status: 'active' },
  { id: 'f102', name: 'TTS hız (konuşma hızı) kontrolü', category: 'audio', status: 'active' },
  { id: 'f103', name: 'Mikrofon Sesi Kaydedici (Ses Dosyası Çıkarma)', category: 'audio', status: 'active' },
  { id: 'f104', name: 'Sinüs, Kare, Testere Dişi, Üçgen Ses Sentezi', category: 'audio', status: 'active' },
  { id: 'f105', name: 'Ton Jeneratörü (Hertz frekansı ayarlama 20-20000Hz)', category: 'audio', status: 'active' },
  { id: 'f106', name: 'Duyulabilir Frekans WAV dosyası üretme ve indirme', category: 'audio', status: 'active' },
  { id: 'f107', name: 'Metni Mors Koduna (.) (-) Çevirme', category: 'audio', status: 'active' },
  { id: 'f108', name: 'Mors Kodunu Duyulabilir Tona Sentezleme & Oynatma', category: 'audio', status: 'active' },
  { id: 'f109', name: 'Mors Kodunun WAV Ses Dosyasını Oluşturma & İndirme', category: 'audio', status: 'active' },
  { id: 'f110', name: 'Ayarlanabilir Tempo Metronomu (BPM 40-240)', category: 'audio', status: 'active' }
];
