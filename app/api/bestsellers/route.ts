export const dynamic = 'force-dynamic';

export interface BestsellerBook {
  isbn: string;
  title: string;
  author: string;
  publisher: string;
  image: string;
  position: number;
  variation: string;
  weeks: number;
}

export interface BestsellerCategory {
  slug: string;
  label: string;
  books: BestsellerBook[];
}

const CATEGORIES = [
  { slug: 'generale',         label: 'Generale',               path: 'libri' },
  { slug: 'narrativa-it',    label: 'Narrativa Italiana',      path: 'libri_narrativa-italiana' },
  { slug: 'gialli',           label: 'Gialli / Thriller',       path: 'libri_gialli-thriller-horror' },
  { slug: 'fantasy',          label: 'Fantasy / Fantascienza',  path: 'libri_fantasy-fantascienza' },
  { slug: 'societa',          label: 'Società e politica',      path: 'libri_societa-politica-comunicazione' },
  { slug: 'filosofia',        label: 'Filosofia',               path: 'libri_filosofia' },
  { slug: 'biografie',        label: 'Biografie',               path: 'libri_biografie' },
  { slug: 'educazione',       label: 'Educazione',              path: 'libri_educazione-formazione' },
  { slug: 'psicologia',       label: 'Psicologia',              path: 'libri_psicologia' },
  { slug: 'informatica',      label: 'Informatica',             path: 'libri_ingegneria-informatica' },
  { slug: 'scienze',          label: 'Scienze',                 path: 'libri_scienze-geografia-ambiente' },
  { slug: 'sport',            label: 'Sport',                   path: 'libri_sport' },
  { slug: 'storia',           label: 'Storia',                  path: 'libri_storia-archeologia' },
  { slug: 'classici',         label: 'Classici',                path: 'libri_classici-poesia-teatro-critica' },
  { slug: 'salute',           label: 'Salute',                  path: 'libri_salute-famiglia-benessere-personale' },
];

const BASE = 'https://www.lafeltrinelli.it/classifica';
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

function decodeHtml(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n)))
    .replace(/&nbsp;/g, ' ')
    .trim();
}

function parseBooks(html: string): BestsellerBook[] {
  const books: BestsellerBook[] = [];
  const items = html.split('<li class="cc-product-list-item cc-product-list-item--ranking">');

  for (let i = 1; i < items.length; i++) {
    const item = items[i];

    const headerMatch = item.match(/data-ean="([^"]+)"[^>]*data-item-name="([^"]*)"[^>]*data-index="(\d+)"/);
    if (!headerMatch) continue;

    const ean = headerMatch[1];
    const title = decodeHtml(headerMatch[2]);
    const position = parseInt(headerMatch[3]);

    if (position > 20) continue;
    if (!ean || !title) continue;

    const imageMatch = item.match(/<img class="cc-img" src="([^"]+)"/);
    const image = imageMatch ? imageMatch[1] : `https://www.lafeltrinelli.it/images/${ean}_0_0_190_0_75.jpg`;

    const authorMatch = item.match(/class="cc-author-name">([^<]+)/);
    const author = authorMatch ? decodeHtml(authorMatch[1].trim()) : '';

    const publisherMatch = item.match(/<span class="cc-owner">\s*([\s\S]*?)\s*<\/span>/);
    const publisherRaw = publisherMatch ? decodeHtml(publisherMatch[1]) : '';
    // Strip year suffix: "Feltrinelli, 2026" → "Feltrinelli"
    const publisher = publisherRaw.replace(/,\s*\d{4}$/, '').trim();

    const iconAltMatch = item.match(/class="cc-icon"[^>]*alt="(Posizione[^"]+)"[^>]*\/>/);
    const iconAlt = iconAltMatch ? iconAltMatch[1] : '';
    let variation = 'Stabile';
    if (iconAlt.includes('aumento')) variation = 'In ascesa';
    else if (iconAlt.includes('decremento')) variation = 'In discesa';

    books.push({ isbn: ean, title, author, publisher, image, position, variation, weeks: 0 });
  }

  books.sort((a, b) => a.position - b.position);
  return books;
}

async function fetchCategory(path: string, period: string): Promise<BestsellerBook[]> {
  const url = `${BASE}/${path}/${period}/sold`;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, 'Accept': 'text/html,application/xhtml+xml' },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const html = await res.text();
    return parseBooks(html);
  } catch {
    return [];
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawPeriod = searchParams.get('period');
  const period = rawPeriod === 'month' ? '1month' : '1week';

  try {
    const results = await Promise.all(
      CATEGORIES.map(cat => fetchCategory(cat.path, period))
    );

    const categories: BestsellerCategory[] = CATEGORIES
      .map((cat, i) => ({ slug: cat.slug, label: cat.label, books: results[i] }))
      .filter(c => c.books.length > 0);

    if (categories.length === 0) return Response.json(null, { status: 502 });

    return Response.json(categories);
  } catch {
    return Response.json(null, { status: 500 });
  }
}
