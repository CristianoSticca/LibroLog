'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

export interface YearInBooksData {
  year: number;
  booksCount: number;
  pagesCount: number;
  topGenres: string[];
  recordMonth: string | null;
  topCovers: string[];
  bestRatedCovers: string[];
  fiveStarCovers: string[];
  monthlyCovers: string[][];
  longestBook: { title: string; pages: number } | null;
  shortestBook: { title: string; pages: number } | null;
  streakDays: number;
}

interface Props {
  data: YearInBooksData;
  onClose: () => void;
}

const S = 1000;
const MONTHS_IT = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];

// ── Helpers ────────────────────────────────────────────────────

function proxyUrl(url: string) {
  return `/api/proxy-image?url=${encodeURIComponent(url)}`;
}

async function toDataUrl(url: string): Promise<string> {
  try {
    const res = await fetch(proxyUrl(url));
    if (!res.ok) return '';
    const blob = await res.blob();
    return new Promise(resolve => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.readAsDataURL(blob);
    });
  } catch { return ''; }
}

async function loadImg(src: string): Promise<HTMLImageElement | null> {
  if (!src) return null;
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.closePath();
}

function blob(ctx: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number, color: string, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function cover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number, angle = 0, r = 10) {
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(angle * Math.PI / 180);
  ctx.shadowColor = 'rgba(0,0,0,0.35)';
  ctx.shadowBlur = 20; ctx.shadowOffsetY = 8;
  rr(ctx, -w / 2, -h / 2, w, h, r);
  ctx.clip();
  ctx.drawImage(img, -w / 2, -h / 2, w, h);
  ctx.restore();
}

function hashtag(ctx: CanvasRenderingContext2D, color = 'rgba(0,0,0,0.2)') {
  ctx.fillStyle = color;
  ctx.font = '400 18px system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('#LibroLogYearInBooks', S - 60, S - 44);
  ctx.textAlign = 'left';
}

// ── Slide 1 · Hero ─────────────────────────────────────────────
// Statistiche chiave + poche copertine in evidenza
async function drawHero(ctx: CanvasRenderingContext2D, data: YearInBooksData, covers: (HTMLImageElement | null)[]) {
  ctx.fillStyle = '#fdf5e8'; ctx.fillRect(0, 0, S, S);

  blob(ctx, S - 80, 80, 280, 260, '#cce8cc', 0.5);
  blob(ctx, S - 140, 160, 160, 140, '#a8d4ac', 0.35);
  blob(ctx, 80, S - 80, 240, 220, '#f4d0b0', 0.45);

  const PAD = 60;

  // Anno
  ctx.fillStyle = 'rgba(22,43,29,0.28)';
  ctx.font = '400 32px system-ui, sans-serif';
  ctx.fillText(String(data.year), PAD, PAD + 32);

  // "Il tuo anno in libri" (piccolo, sopra)
  ctx.fillStyle = '#3d6b4f';
  ctx.font = '400 38px Georgia, serif';
  ctx.fillText('Il tuo anno in libri', PAD, PAD + 110);

  // Numero grossissimo
  ctx.fillStyle = '#162b1d';
  ctx.font = `900 310px Georgia, serif`;
  ctx.fillText(String(data.booksCount), PAD - 12, PAD + 420);

  // Testo a fianco del numero (verticale)
  ctx.save();
  ctx.translate(PAD + 10 + ctx.measureText(String(data.booksCount)).width - 12, PAD + 290);
  ctx.fillStyle = 'rgba(22,43,29,0.35)';
  ctx.font = '400 28px system-ui, sans-serif';
  ctx.fillText(data.booksCount === 1 ? 'libro' : 'libri', 10, 0);
  ctx.restore();

  // Pagine — in alto a destra
  ctx.textAlign = 'right';
  ctx.fillStyle = 'rgba(22,43,29,0.35)';
  ctx.font = '500 20px system-ui, sans-serif';
  ctx.letterSpacing = '3px';
  ctx.fillText('PAGINE LETTE', S - PAD, PAD + 32);
  ctx.letterSpacing = '0px';
  ctx.fillStyle = '#162b1d';
  ctx.font = `700 72px Georgia, serif`;
  ctx.fillText(data.pagesCount.toLocaleString('it-IT'), S - PAD, PAD + 112);
  ctx.textAlign = 'left';

  // 5 copertine a ventaglio sovrapposto — metà destra
  const valid = covers.filter(Boolean) as HTMLImageElement[];
  const ch = 230, cw = Math.round(ch * 0.65); // 150x230
  const step = 110; // sovrapposizione
  const baseX = S - PAD - cw;
  const angles = [12, -5, 15, -8, 10];
  const yOffsets = [-20, -80, -10, -60, -40];

  valid.slice(0, 5).reverse().forEach((img, i) => {
    const x = baseX - i * step;
    const y = S - PAD - ch + yOffsets[i % yOffsets.length] - 80;
    cover(ctx, img, x, y, cw, ch, angles[i % angles.length]);
  });

  hashtag(ctx, 'rgba(22,43,29,0.25)');
}

// ── Slide 2 · Galleria 5 stelle ────────────────────────────────
// Bacheca con quadri incorniciati — solo libri con voto 5 stelle
async function drawGallery(ctx: CanvasRenderingContext2D, _data: YearInBooksData, fiveStarImgs: (HTMLImageElement | null)[]) {
  // Sfondo lavanda con strisce diagonali sottili
  ctx.fillStyle = '#e4ddf5';
  ctx.fillRect(0, 0, S, S);

  ctx.save();
  ctx.strokeStyle = 'rgba(160,140,210,0.22)';
  ctx.lineWidth = 1.5;
  for (let k = -S; k < S * 2; k += 30) {
    ctx.beginPath(); ctx.moveTo(k, 0); ctx.lineTo(k + S, S); ctx.stroke();
  }
  ctx.restore();

  // Titolo
  ctx.textAlign = 'center';
  ctx.fillStyle = '#2a1a4a';
  ctx.font = '700 54px Georgia, serif';
  ctx.fillText('La tua galleria', S / 2, 96);
  ctx.font = '400 38px system-ui, sans-serif';
  ctx.fillStyle = '#e8a020';
  ctx.fillText('★ ★ ★ ★ ★', S / 2, 146);
  ctx.textAlign = 'left';

  const valid = fiveStarImgs.filter(Boolean) as HTMLImageElement[];

  if (valid.length === 0) {
    ctx.fillStyle = 'rgba(42,26,74,0.35)';
    ctx.font = '400 30px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('Nessun libro con 5 stelle ancora!', S / 2, S / 2 + 40);
    ctx.font = '400 20px system-ui, sans-serif';
    ctx.fillStyle = 'rgba(42,26,74,0.25)';
    ctx.fillText('Continua a leggere e valutare ✨', S / 2, S / 2 + 90);
    ctx.textAlign = 'left';
    hashtag(ctx, 'rgba(42,26,74,0.22)');
    return;
  }

  // Definizione cornici: [x, y, w, h, angleDeg, frameColor]
  type FD = [number, number, number, number, number, string];
  const FRAME_DEFS: FD[] = [
    [42,  170, 192, 258, -2.5, '#c8a020'],  // oro grande
    [263, 188, 150, 205,  3.2, '#3d2b1a'],  // marrone scuro medio
    [444, 166, 180, 242, -1.2, '#b04020'],  // ruggine medio-grande
    [655, 182, 158, 215,  2.8, '#5a6a7a'],  // ardesia medio
    [72,  468, 155, 210,  3.8, '#4a3830'],  // scuro medio
    [256, 450, 185, 252, -2.2, '#c8a020'],  // oro grande
    [472, 476, 145, 200,  1.8, '#7a6875'],  // malva medio
    [646, 458, 165, 225, -3.2, '#b04020'],  // ruggine medio-grande
    [298, 752, 158, 215,  2.2, '#3d2b1a'],  // marrone scuro basso
  ];

  const fw = 17; // spessore cornice
  const mw = 13; // spessore passepartout

  FRAME_DEFS.slice(0, Math.min(valid.length, FRAME_DEFS.length)).forEach(([fx, fy, fw2, fh, ang, fc], i) => {
    const img = valid[i];
    const hw = fw2 / 2, hh = fh / 2;

    ctx.save();
    ctx.translate(fx + hw, fy + hh);
    ctx.rotate(ang * Math.PI / 180);

    // Ombra
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 9;

    // Cornice colorata
    ctx.fillStyle = fc;
    ctx.fillRect(-hw, -hh, fw2, fh);

    // Linea interna scura (profondità)
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = 'rgba(0,0,0,0.18)';
    ctx.lineWidth = 2;
    ctx.strokeRect(-hw + fw - 2, -hh + fw - 2, fw2 - (fw - 2) * 2, fh - (fw - 2) * 2);

    // Passepartout bianco/crema
    ctx.fillStyle = '#f5f0e8';
    ctx.fillRect(-hw + fw, -hh + fw, fw2 - fw * 2, fh - fw * 2);

    // Copertina
    const cx = -hw + fw + mw;
    const cy = -hh + fw + mw;
    const cw2 = fw2 - (fw + mw) * 2;
    const ch2 = fh - (fw + mw) * 2;
    if (cw2 > 0 && ch2 > 0) {
      ctx.drawImage(img, cx, cy, cw2, ch2);
    }

    ctx.restore();
  });

  hashtag(ctx, 'rgba(42,26,74,0.22)');
}

// ── Slide 3 · Generi ───────────────────────────────────────────
// Stile Goodreads: cielo azzurro, libro aperto in basso, top 3 generi sulle pagine
async function drawGeneri(ctx: CanvasRenderingContext2D, data: YearInBooksData) {
  // Sfondo azzurro cielo
  ctx.fillStyle = '#c4e4f0';
  ctx.fillRect(0, 0, S, S);

  // ── Elementi decorativi ──
  // Fiore top-right (cerchi sovrapposti)
  blob(ctx, S - 62, 68, 46, 46, '#c83828', 0.95);
  blob(ctx, S - 30, 52, 32, 32, '#c83828', 0.85);
  ctx.save();
  ctx.strokeStyle = '#5a3010';
  ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(S - 52, 108); ctx.bezierCurveTo(S - 58, 160, S - 70, 200, S - 65, 240); ctx.stroke();
  // Fogliolina
  ctx.fillStyle = '#3a6030';
  ctx.beginPath(); ctx.ellipse(S - 90, 190, 28, 14, -0.6, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  // Libri che spuntano dietro il libro principale (destra, y~340-430)
  const spineColors = ['#c07038', '#8a4820', '#d4a060', '#b05030'];
  [0, 1, 2, 3].forEach((k) => {
    ctx.save();
    ctx.fillStyle = spineColors[k];
    ctx.translate(S - 200 + k * 42, 330);
    ctx.rotate((-8 + k * 5) * Math.PI / 180);
    ctx.fillRect(0, 0, 32, 115);
    ctx.restore();
  });

  // Frutto/pera sinistra
  blob(ctx, 105, 420, 45, 55, '#c07030', 0.8);
  blob(ctx, 98, 372, 10, 28, '#3a5820', 0.9); // gambo
  // Foglia
  ctx.save();
  ctx.fillStyle = '#3a7840';
  ctx.beginPath(); ctx.ellipse(80, 385, 22, 11, -0.8, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  // ── Titolo ──
  ctx.fillStyle = '#1a2830';
  ctx.textAlign = 'center';
  // Adatta la dimensione font alla lunghezza del testo
  const line1 = 'I tuoi generi';
  const line2 = `del ${data.year}.`;
  let titleFs = 78;
  ctx.font = `700 ${titleFs}px Georgia, serif`;
  while (ctx.measureText(line1).width > S - 80 && titleFs > 48) {
    titleFs -= 2;
    ctx.font = `700 ${titleFs}px Georgia, serif`;
  }
  ctx.fillText(line1, S / 2, 158);
  ctx.fillText(line2, S / 2, 158 + titleFs + 14);
  ctx.textAlign = 'left';

  // ── Libro aperto ──
  const bookTop = 370;

  // Copertina dura (navy)
  ctx.fillStyle = '#1e2e3a';
  ctx.beginPath();
  ctx.moveTo(-15, bookTop + 65);
  ctx.lineTo(S / 2, bookTop);
  ctx.lineTo(S + 15, bookTop + 65);
  ctx.lineTo(S + 15, S + 15);
  ctx.lineTo(-15, S + 15);
  ctx.closePath();
  ctx.fill();

  // Pagina sinistra (crema)
  const gl = ctx.createLinearGradient(0, 0, S / 2, 0);
  gl.addColorStop(0, '#ede6d4'); gl.addColorStop(1, '#e0d8c6');
  ctx.fillStyle = gl;
  ctx.beginPath();
  ctx.moveTo(-15, bookTop + 108);
  ctx.bezierCurveTo(140, bookTop + 86, 380, bookTop + 54, S / 2 - 6, bookTop + 40);
  ctx.lineTo(S / 2 - 6, S + 15);
  ctx.lineTo(-15, S + 15);
  ctx.closePath();
  ctx.fill();

  // Pagina destra (crema leggermente più chiara)
  const gr = ctx.createLinearGradient(S / 2, 0, S, 0);
  gr.addColorStop(0, '#e6dece'); gr.addColorStop(1, '#f0ebe0');
  ctx.fillStyle = gr;
  ctx.beginPath();
  ctx.moveTo(S + 15, bookTop + 108);
  ctx.bezierCurveTo(S - 140, bookTop + 86, S - 380, bookTop + 54, S / 2 + 6, bookTop + 40);
  ctx.lineTo(S / 2 + 6, S + 15);
  ctx.lineTo(S + 15, S + 15);
  ctx.closePath();
  ctx.fill();

  // Ombra dorso
  ctx.fillStyle = 'rgba(0,0,0,0.13)';
  ctx.fillRect(S / 2 - 9, bookTop + 40, 18, S - bookTop);

  // Linee sulle pagine (top book, prima dei generi)
  ctx.strokeStyle = 'rgba(0,0,0,0.11)';
  ctx.lineWidth = 1.8;
  for (let ln = 0; ln < 5; ln++) {
    const ly = bookTop + 102 + ln * 26;
    const skew = ln * 3;
    ctx.beginPath();
    ctx.moveTo(52, ly + skew * 0.4);
    ctx.lineTo(S / 2 - 38, ly - skew * 0.4);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(S / 2 + 38, ly - skew * 0.4);
    ctx.lineTo(S - 52, ly + skew * 0.4);
    ctx.stroke();
  }

  // ── Generi ──
  const genres = data.topGenres.slice(0, 3);
  const PAD = 60;
  let gy = bookTop + 292;
  const maxW = S - PAD * 2 - 20;

  if (genres.length === 0) {
    ctx.fillStyle = 'rgba(26,40,48,0.4)';
    ctx.font = '400 32px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('Nessun genere registrato', S / 2, gy + 40);
    ctx.textAlign = 'left';
  }

  genres.forEach((genre, i) => {
    if (i === 0) {
      // Pill scuro con testo italic
      ctx.font = '700 italic 60px Georgia, serif';
      let text = genre;
      while (ctx.measureText(text).width > maxW - 40 && text.length > 4) text = text.slice(0, -1);
      if (text !== genre) text += '…';
      const tw = ctx.measureText(text).width;
      ctx.fillStyle = '#2c4858';
      rr(ctx, PAD - 14, gy - 52, tw + 44, 72, 8);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillText(text, PAD, gy);
      gy += 108;
    } else {
      const fs = i === 1 ? 68 : 52;
      ctx.font = `600 ${fs}px Georgia, serif`;
      ctx.fillStyle = '#2c4858';
      let text = genre;
      while (ctx.measureText(text).width > maxW && text.length > 4) text = text.slice(0, -1);
      if (text !== genre) text += '…';
      ctx.fillText(text, PAD, gy);
      gy += fs + 28;
    }
  });

  hashtag(ctx, 'rgba(26,40,48,0.3)');
}

// ── Slide 4 · Mese per mese ────────────────────────────────────
async function drawMonthly(ctx: CanvasRenderingContext2D, data: YearInBooksData, monthImgs: (HTMLImageElement | null)[][]) {
  ctx.fillStyle = '#fdf0e8'; ctx.fillRect(0, 0, S, S);

  blob(ctx, S - 60, S * 0.2, 180, 320, '#f4c0a0', 0.3);
  blob(ctx, 60, S * 0.8, 150, 250, '#f0d4c0', 0.25);

  const PAD = 60;

  ctx.fillStyle = 'rgba(74,26,0,0.35)';
  ctx.font = '400 28px system-ui, sans-serif';
  ctx.fillText(String(data.year), PAD, PAD + 32);
  ctx.fillStyle = '#4a1a00';
  ctx.font = `700 70px Georgia, serif`;
  ctx.fillText('Mese per mese', PAD, PAD + 112);

  const counts = data.monthlyCovers.map(c => c.length);
  const maxCount = Math.max(...counts, 1);
  const activeMonths = counts.filter(c => c > 0).length || 1;
  const availH = S - PAD * 2 - 154;
  const rowH = Math.min(Math.floor(availH / activeMonths) - 6, 72);
  const barMaxW = S - PAD * 2 - 80;
  const cw = Math.round(rowH * 0.65), ch = rowH - 10;

  let y = PAD + 152;
  counts.forEach((count, i) => {
    if (count === 0) return;
    const barW = Math.max(Math.round((count / maxCount) * barMaxW), 60);
    const x = PAD + 72;

    // Mese label
    ctx.fillStyle = 'rgba(74,26,0,0.5)';
    ctx.font = `500 ${rowH > 60 ? 22 : 18}px system-ui, sans-serif`;
    ctx.fillText(MONTHS_IT[i], PAD, y + rowH * 0.65);

    // Barra
    ctx.fillStyle = '#c84060';
    rr(ctx, x, y + 4, barW, rowH - 8, 10);
    ctx.fill();

    // Copertine sulla barra
    const imgs = monthImgs[i].filter(Boolean) as HTMLImageElement[];
    imgs.forEach((img, j) => {
      const ix = x + 8 + j * (cw + 4);
      if (ix + cw > x + barW - 6) return;
      ctx.save();
      rr(ctx, ix, y + (rowH - ch) / 2, cw, ch, 4); ctx.clip();
      ctx.drawImage(img, ix, y + (rowH - ch) / 2, cw, ch);
      ctx.restore();
    });

    // Count a destra
    ctx.fillStyle = 'rgba(74,26,0,0.4)';
    ctx.font = `600 18px system-ui, sans-serif`;
    ctx.fillText(String(count), x + barW + 10, y + rowH * 0.65);

    y += rowH + 6;
  });

  hashtag(ctx, 'rgba(74,26,0,0.2)');
}

// ── Engine ─────────────────────────────────────────────────────
type DrawFn = (
  ctx: CanvasRenderingContext2D,
  data: YearInBooksData,
  covers: (HTMLImageElement | null)[],
  monthImgs: (HTMLImageElement | null)[][],
  bestRated: (HTMLImageElement | null)[],
  fiveStarImgs: (HTMLImageElement | null)[]
) => Promise<void>;

const SLIDES: { label: string; draw: DrawFn; bg: string }[] = [
  { label: 'Riepilogo', bg: '#fdf5e8', draw: (c, d, _cv, _m, br) => drawHero(c, d, br) },
  { label: 'Galleria',  bg: '#e4ddf5', draw: (c, d, _cv, _m, _br, fs) => drawGallery(c, d, fs) },
  { label: 'Generi',    bg: '#c4e4f0', draw: (c, d) => drawGeneri(c, d) },
  { label: 'Mesi',      bg: '#fdf0e8', draw: (c, d, _cv, m) => drawMonthly(c, d, m) },
];

async function blobFromSlide(
  idx: number, data: YearInBooksData,
  covers: (HTMLImageElement | null)[],
  monthImgs: (HTMLImageElement | null)[][],
  bestRated: (HTMLImageElement | null)[],
  fiveStarImgs: (HTMLImageElement | null)[]
): Promise<Blob | null> {
  const canvas = document.createElement('canvas');
  canvas.width = S; canvas.height = S;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  await SLIDES[idx].draw(ctx, data, covers, monthImgs, bestRated, fiveStarImgs);
  return new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
}

// ── Component ──────────────────────────────────────────────────
export default function YearInBooksModal({ data, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const coversRef = useRef<(HTMLImageElement | null)[]>([]);
  const monthImgsRef = useRef<(HTMLImageElement | null)[][]>(Array.from({ length: 12 }, () => []));
  const bestRatedRef = useRef<(HTMLImageElement | null)[]>([]);
  const fiveStarRef = useRef<(HTMLImageElement | null)[]>([]);
  const [slide, setSlide] = useState(0);
  const [rendering, setRendering] = useState(true);
  const [loading, setLoading] = useState(false);
  const touchX = useRef(0);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const paint = useCallback(async (idx: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = S; canvas.height = S;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setRendering(true);
    await SLIDES[idx].draw(ctx, data, coversRef.current, monthImgsRef.current, bestRatedRef.current, fiveStarRef.current);
    setRendering(false);
  }, [data]);

  useEffect(() => {
    async function init() {
      setRendering(true);
      const [coverUrls, bestUrls, fiveStarUrls, ...monthUrlArrays] = await Promise.all([
        Promise.all(data.topCovers.slice(0, 30).map(toDataUrl)),
        Promise.all(data.bestRatedCovers.slice(0, 5).map(toDataUrl)),
        Promise.all(data.fiveStarCovers.slice(0, 9).map(toDataUrl)),
        ...data.monthlyCovers.map(mc => Promise.all(mc.slice(0, 8).map(toDataUrl))),
      ]);
      coversRef.current = await Promise.all(coverUrls.map(loadImg));
      bestRatedRef.current = await Promise.all(bestUrls.map(loadImg));
      fiveStarRef.current = await Promise.all(fiveStarUrls.map(loadImg));
      monthImgsRef.current = await Promise.all(
        monthUrlArrays.map(urls => Promise.all(urls.map(loadImg)))
      );
      await paint(0);
    }
    init();
  }, [data, paint]);

  useEffect(() => {
    if (!rendering) paint(slide);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slide]);

  const prev = () => setSlide(s => Math.max(0, s - 1));
  const next = () => setSlide(s => Math.min(SLIDES.length - 1, s + 1));

  async function act(share: boolean) {
    setLoading(true);
    try {
      const blob = await blobFromSlide(slide, data, coversRef.current, monthImgsRef.current, bestRatedRef.current, fiveStarRef.current);
      if (!blob) return;
      const file = new File([blob], `librolog-${data.year}-${slide + 1}.png`, { type: 'image/png' });
      if (share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: `Il mio ${data.year} in libri` });
      } else {
        const a = document.createElement('a');
        a.download = file.name; a.href = URL.createObjectURL(blob); a.click();
      }
    } finally { setLoading(false); }
  }

  const canShare = typeof navigator !== 'undefined' && 'share' in navigator;
  const currentBg = SLIDES[slide].bg;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="w-full max-w-sm flex flex-col gap-3"
        onClick={e => e.stopPropagation()}
        onTouchStart={e => { touchX.current = e.touches[0].clientX; }}
        onTouchEnd={e => {
          const d = touchX.current - e.changedTouches[0].clientX;
          if (d > 50) next(); else if (d < -50) prev();
        }}
      >
        {/* Canvas */}
        <div className="relative w-full aspect-square rounded-3xl overflow-hidden" style={{ backgroundColor: currentBg }}>
          {rendering && (
            <div className="absolute inset-0 flex items-center justify-center z-10" style={{ backgroundColor: currentBg + 'cc' }}>
              <div className="w-8 h-8 border-2 border-[#162b1d] border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          <canvas ref={canvasRef} className="w-full h-full" />
          {slide > 0 && (
            <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center text-white z-10">
              <span className="material-symbols-outlined text-xl">chevron_left</span>
            </button>
          )}
          {slide < SLIDES.length - 1 && (
            <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center text-white z-10">
              <span className="material-symbols-outlined text-xl">chevron_right</span>
            </button>
          )}
        </div>

        {/* Dots */}
        <div className="flex justify-center items-center gap-2">
          {SLIDES.map((_, i) => (
            <button key={i} onClick={() => setSlide(i)}
              className={`rounded-full transition-all duration-200 ${i === slide ? 'w-5 h-2 bg-white' : 'w-2 h-2 bg-white/40'}`} />
          ))}
        </div>

        {/* Azioni */}
        <div className="flex gap-3">
          <button onClick={onClose} className="py-3 px-5 rounded-full border border-white/20 text-white text-sm font-medium">Chiudi</button>
          {canShare && (
            <button onClick={() => act(true)} disabled={loading || rendering}
              className="flex-1 py-3 rounded-full bg-white text-[#162b1d] text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
              <span className="material-symbols-outlined text-sm">share</span>
              {loading ? '...' : 'Condividi'}
            </button>
          )}
          <button onClick={() => act(false)} disabled={loading || rendering}
            className="flex-1 py-3 rounded-full bg-white text-[#162b1d] text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
            <span className="material-symbols-outlined text-sm">download</span>
            {loading ? '...' : 'Scarica'}
          </button>
        </div>
      </div>
    </div>
  );
}
