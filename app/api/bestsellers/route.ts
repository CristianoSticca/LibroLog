export const revalidate = 3600; // ricarica ogni ora


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

export async function GET() {
  try {
    const res = await fetch('https://libri.ilsole24ore.com/', {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LibroLog/1.0)' },
      next: { revalidate: 3600 },
    });

    if (!res.ok) return Response.json(null, { status: 502 });

    const html = await res.text();
    const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
    if (!match) return Response.json(null, { status: 502 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nextData: any = JSON.parse(match[1]);

    // Struttura reale: props.pageProps.data.allBestsellers.bestsellersList
    // Array di { classificationCategory, bookList: [{ categoryName, position, variation, weeks, book: { isbn, title, ... } }] }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bestsellersList: any[] = nextData?.props?.pageProps?.data?.allBestsellers?.bestsellersList;
    if (!Array.isArray(bestsellersList) || bestsellersList.length === 0) {
      return Response.json(null, { status: 502 });
    }

    const categories: BestsellerCategory[] = bestsellersList
      .map(cat => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const books: BestsellerBook[] = (cat.bookList ?? []).map((entry: any) => {
          const b = entry?.book ?? {};
          return {
            isbn:      String(b.isbn ?? ''),
            title:     String(b.title ?? ''),
            author:    String(b.author ?? ''),
            publisher: String(b.publisher ?? ''),
            image:     String(b.image ?? ''),
            position:  Number(entry.position ?? 0),
            variation: String(entry.variation ?? ''),
            weeks:     Number(entry.weeks ?? 0),
          };
        }).filter((b: BestsellerBook) => b.isbn && b.title);

        const label: string = cat.classificationCategory;
        return {
          slug: label.toLowerCase().replace(/\s+/g, '-'),
          label,
          books,
        };
      })
      .filter(c => c.books.length > 0);

    if (categories.length === 0) return Response.json(null, { status: 502 });

    return Response.json(categories);
  } catch {
    return Response.json(null, { status: 500 });
  }
}
