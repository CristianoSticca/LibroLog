'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useBooks } from '@/context/BooksContext';
import { GoogleBooksVolume } from '@/lib/types';
import IsbnScanner from '@/components/IsbnScanner';
import type { BestsellerBook, BestsellerCategory } from '@/app/api/bestsellers/route';

function getCover(vol: GoogleBooksVolume): string {
  const thumb = vol.volumeInfo.imageLinks?.thumbnail || vol.volumeInfo.imageLinks?.smallThumbnail || '';
  return thumb.replace('http://', 'https://');
}

function amazonUrl(title: string, author: string) {
  return `https://www.amazon.it/s?k=${encodeURIComponent(`${title} ${author}`)}&i=stripbooks`;
}

export default function Ricerca() {
  const router = useRouter();
  const { books, addBook } = useBooks();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GoogleBooksVolume[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);

  const [categories, setCategories] = useState<BestsellerCategory[] | null>(null);
  const [activeCategory, setActiveCategory] = useState(0);
  const categoryCache = useRef<BestsellerCategory[] | null>(null);

  useEffect(() => {
    fetch('/api/bestsellers')
      .then(r => r.ok ? r.json() : null)
      .then((data: BestsellerCategory[] | null) => {
        if (Array.isArray(data) && data.length > 0) {
          categoryCache.current = data;
          setCategories(data);
        }
      })
      .catch(() => {});
  }, []);

  const search = useCallback(async (overrideQuery?: string) => {
    const q = overrideQuery ?? query;
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY;
      const keyParam = apiKey ? `&key=${apiKey}` : '';
      const isIsbn = /^\d{10,13}$/.test(q.trim()) || q.startsWith('isbn:');
      const langParam = isIsbn ? '' : '&langRestrict=it';
      const res = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=20${langParam}${keyParam}`
      );
      const data = await res.json();
      setResults(data.items || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [query]);

  function handleScan(isbn: string) {
    setQuery(isbn);
    setScannerOpen(false);
    search(`isbn:${isbn}`);
  }

  function isInLibrary(googleId: string) {
    return books.some(b => b.googleBooksId === googleId);
  }

  function isInLibraryByIsbn(isbn: string) {
    return books.some(b => b.isbn === isbn);
  }

  function handleAdd(vol: GoogleBooksVolume, status: 'to-read' | 'reading') {
    setAdding(vol.id);
    const info = vol.volumeInfo;
    const isbn = info.industryIdentifiers?.find(i => i.type === 'ISBN_13')?.identifier
      || info.industryIdentifiers?.find(i => i.type === 'ISBN_10')?.identifier;
    addBook({
      title: info.title,
      author: info.authors?.join(', ') || 'Autore sconosciuto',
      cover: getCover(vol),
      pages: info.pageCount || 0,
      currentPage: 0,
      status,
      startDate: status === 'reading' ? new Date().toISOString().split('T')[0] : undefined,
      googleBooksId: vol.id,
      isbn,
      description: info.description,
      publisher: info.publisher,
      publishedYear: info.publishedDate ? parseInt(info.publishedDate) : undefined,
      genres: info.categories,
    });
    setTimeout(() => {
      setAdding(null);
      if (status === 'reading') router.push('/');
      else router.push('/libreria');
    }, 600);
  }

  function handleAddFromBestseller(book: BestsellerBook, status: 'to-read' | 'reading') {
    const tempId = `bs-${book.isbn}`;
    setAdding(tempId);
    addBook({
      title: book.title,
      author: book.author || 'Autore sconosciuto',
      cover: book.image,
      pages: 0,
      currentPage: 0,
      status,
      startDate: status === 'reading' ? new Date().toISOString().split('T')[0] : undefined,
      isbn: book.isbn,
      publisher: book.publisher,
    });
    setTimeout(() => {
      setAdding(null);
      if (status === 'reading') router.push('/');
      else router.push('/libreria');
    }, 600);
  }

  // Card per risultati di ricerca Google Books
  function SearchBookCard({ vol }: { vol: GoogleBooksVolume }) {
    const info = vol.volumeInfo;
    const cover = getCover(vol);
    const inLib = isInLibrary(vol.id);
    const isAdding = adding === vol.id;

    return (
      <div className="bg-[#f6f3ee] dark:bg-[#1e1e1b] rounded-2xl p-4 flex gap-4">
        <div className="w-16 aspect-[2/3] rounded-lg overflow-hidden flex-shrink-0 bg-[#ebe8e3]">
          {cover ? (
            <img src={cover} alt={info.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="material-symbols-outlined text-[#74777d] text-2xl">menu_book</span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-serif text-lg leading-tight text-[#162b1d] dark:text-[#b4cdb8] line-clamp-2">{info.title}</h3>
          <p className="text-sm text-[#4e6073] mt-0.5 truncate">{info.authors?.join(', ') || 'Autore sconosciuto'}</p>
          <div className="flex gap-2 mt-1 flex-wrap">
            {info.publishedDate && <span className="text-xs text-[#74777d]">{info.publishedDate.slice(0, 4)}</span>}
            {info.pageCount && <span className="text-xs text-[#74777d]">· {info.pageCount} pag.</span>}
          </div>
          {info.description && (
            <p className="text-xs text-[#43474c] dark:text-[#8a8a85] mt-2 line-clamp-2">{info.description}</p>
          )}
          <a
            href={amazonUrl(info.title, info.authors?.[0] ?? '')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-2 text-xs text-[#74777d] hover:text-[#1c1c19] dark:hover:text-[#e5e2dd] transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>shopping_cart</span>
            Acquista su Amazon
          </a>
          <div className="flex gap-2 mt-2">
            {inLib ? (
              <span className="text-xs text-[#4e6073] bg-[#ebe8e3] px-3 py-1.5 rounded-full flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">check</span>
                Già in libreria
              </span>
            ) : (
              <>
                <button
                  onClick={() => handleAdd(vol, 'reading')}
                  disabled={isAdding}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-[#162b1d] text-white rounded-full text-xs font-semibold disabled:opacity-50 transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined text-sm">auto_stories</span>
                  {isAdding ? 'Aggiunto!' : 'Inizia a leggere'}
                </button>
                <button
                  onClick={() => handleAdd(vol, 'to-read')}
                  disabled={isAdding}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-[#cfe2f9] text-[#526478] rounded-full text-xs font-semibold disabled:opacity-50 transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined text-sm">bookmark_add</span>
                  Da leggere
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Card per libri delle classifiche
  function BestsellerCard({ book }: { book: BestsellerBook }) {
    const inLib = isInLibraryByIsbn(book.isbn);
    const isAdding = adding === `bs-${book.isbn}`;

    return (
      <div className="bg-[#f6f3ee] dark:bg-[#1e1e1b] rounded-2xl p-4 flex gap-4">
        <div className="relative flex-shrink-0">
          <div className="w-16 aspect-[2/3] rounded-lg overflow-hidden bg-[#ebe8e3]">
            {book.image ? (
              <img src={book.image} alt={book.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="material-symbols-outlined text-[#74777d] text-2xl">menu_book</span>
              </div>
            )}
          </div>
          <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-[#162b1d] text-white text-[10px] font-bold flex items-center justify-center">
            {book.position}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-serif text-lg leading-tight text-[#162b1d] dark:text-[#b4cdb8] line-clamp-2">{book.title}</h3>
          <p className="text-sm text-[#4e6073] mt-0.5 truncate">{book.author || 'Autore sconosciuto'}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {book.publisher && <span className="text-xs text-[#74777d]">{book.publisher}</span>}
            {book.weeks > 0 && <span className="text-xs text-[#74777d]">· {book.weeks} {book.weeks === 1 ? 'sett.' : 'sett.'} in classifica</span>}
            {book.variation && book.variation !== 'Stabile' && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                book.variation.toLowerCase().includes('new') || book.variation === 'Rientro'
                  ? 'bg-[#d0e9d4] text-[#162b1d]'
                  : book.variation === 'In ascesa'
                  ? 'bg-[#cfe2f9] text-[#526478]'
                  : 'bg-[#ebe8e3] text-[#74777d]'
              }`}>
                {book.variation}
              </span>
            )}
          </div>
          <a
            href={amazonUrl(book.title, book.author)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-2 text-xs text-[#74777d] hover:text-[#1c1c19] dark:hover:text-[#e5e2dd] transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>shopping_cart</span>
            Acquista su Amazon
          </a>
          <div className="flex gap-2 mt-2">
            {inLib ? (
              <span className="text-xs text-[#4e6073] bg-[#ebe8e3] px-3 py-1.5 rounded-full flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">check</span>
                Già in libreria
              </span>
            ) : (
              <>
                <button
                  onClick={() => handleAddFromBestseller(book, 'reading')}
                  disabled={isAdding}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-[#162b1d] text-white rounded-full text-xs font-semibold disabled:opacity-50 transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined text-sm">auto_stories</span>
                  {isAdding ? 'Aggiunto!' : 'Inizia a leggere'}
                </button>
                <button
                  onClick={() => handleAddFromBestseller(book, 'to-read')}
                  disabled={isAdding}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-[#cfe2f9] text-[#526478] rounded-full text-xs font-semibold disabled:opacity-50 transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined text-sm">bookmark_add</span>
                  Da leggere
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  const currentBooks: BestsellerBook[] = categories?.[activeCategory]?.books ?? [];

  return (
    <>
      {scannerOpen && (
        <IsbnScanner onScan={handleScan} onClose={() => setScannerOpen(false)} />
      )}

      <header className="fixed top-0 w-full px-4 py-3 bg-[#fcf9f4]/80 dark:bg-[#121210]/80 backdrop-blur-md z-50">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#74777d]">search</span>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()}
            className="w-full pl-12 pr-12 py-3 bg-[#ebe8e3] dark:bg-[#2c2c28] rounded-full border-none outline-none focus:ring-2 focus:ring-[#162b1d]/20 dark:focus:ring-[#b4cdb8]/20 text-[#1c1c19] dark:text-[#e5e2dd] placeholder:text-[#74777d] text-sm"
            placeholder="Titolo, autore o ISBN..."
            autoFocus
          />
          <button
            onClick={() => setScannerOpen(true)}
            title="Scansiona ISBN"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#74777d] hover:text-[#162b1d] dark:hover:text-[#b4cdb8] transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>photo_camera</span>
          </button>
        </div>
      </header>

      <main className="pt-24 pb-32 max-w-3xl mx-auto">

        {/* Classifiche — visibili solo quando non si sta cercando */}
        {!searched && categories && (
          <div className="mt-4">
            <div className="px-6 flex items-baseline gap-2 mb-3">
              <h2 className="font-serif text-xl text-[#162b1d] dark:text-[#b4cdb8]">Classifiche</h2>
              <span className="text-xs text-[#74777d]">Il Sole 24 Ore · GfK</span>
            </div>

            {/* Pill categorie */}
            <div className="flex gap-2 overflow-x-auto px-6 pb-2 scrollbar-hide">
              {categories.map((cat, i) => (
                <button
                  key={cat.slug}
                  onClick={() => setActiveCategory(i)}
                  className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    activeCategory === i
                      ? 'bg-[#162b1d] text-white'
                      : 'bg-[#ebe8e3] dark:bg-[#2c2c28] text-[#43474c] dark:text-[#95ad9a] hover:bg-[#dedad4] dark:hover:bg-[#363630]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Lista verticale */}
            <div className="px-6 mt-4 space-y-3">
              {currentBooks.map(book => (
                <BestsellerCard key={book.isbn} book={book} />
              ))}
            </div>
          </div>
        )}

        {/* Risultati ricerca */}
        <div className="px-6">
          {loading && (
            <div className="text-center py-20">
              <div className="w-10 h-10 border-2 border-[#162b1d] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-[#43474c] text-sm">Ricerca in corso...</p>
            </div>
          )}

          {searched && !loading && results.length === 0 && (
            <div className="text-center py-20">
              <span className="material-symbols-outlined text-5xl text-[#c4c6cd] mb-4 block">search_off</span>
              <p className="text-[#43474c]">Nessun risultato per &ldquo;{query}&rdquo;</p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="space-y-3 mt-6">
              <p className="text-sm text-[#74777d]">{results.length} risultati per &ldquo;{query}&rdquo;</p>
              {results.map(vol => <SearchBookCard key={vol.id} vol={vol} />)}
            </div>
          )}

          {!searched && !categories && (
            <div className="text-center py-20">
              <span className="material-symbols-outlined text-6xl text-[#c4c6cd] mb-4 block">search</span>
              <h2 className="font-serif text-2xl text-[#162b1d] dark:text-[#b4cdb8] mb-2">Cerca un libro</h2>
              <p className="text-[#43474c] text-sm">Inserisci titolo, autore o ISBN per trovare il libro.</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
