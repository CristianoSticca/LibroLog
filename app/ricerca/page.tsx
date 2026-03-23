'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useBooks } from '@/context/BooksContext';
import { GoogleBooksVolume } from '@/lib/types';
import IsbnScanner from '@/components/IsbnScanner';

const GENRES = [
  { label: 'Narrativa',  query: 'subject:fiction' },
  { label: 'Thriller',   query: 'subject:thriller' },
  { label: 'Fantasy',    query: 'subject:fantasy' },
  { label: 'Gialli',     query: 'subject:mystery' },
  { label: 'Saggistica', query: 'subject:nonfiction' },
  { label: 'Romance',    query: 'subject:romance' },
  { label: 'Classici',   query: 'subject:classics' },
  { label: 'Bambini',    query: 'subject:juvenile fiction' },
];

function getCover(vol: GoogleBooksVolume): string {
  const thumb = vol.volumeInfo.imageLinks?.thumbnail || vol.volumeInfo.imageLinks?.smallThumbnail || '';
  return thumb.replace('http://', 'https://');
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

  const [activeGenre, setActiveGenre] = useState(0);
  const [genreBooks, setGenreBooks] = useState<GoogleBooksVolume[]>([]);
  const [genreLoading, setGenreLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const genreCache = useRef<Record<number, GoogleBooksVolume[]>>({});

  const loadGenre = useCallback(async (index: number) => {
    if (genreCache.current[index]) {
      setGenreBooks(genreCache.current[index]);
      setExpandedId(null);
      return;
    }
    setGenreLoading(true);
    setExpandedId(null);
    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY;
      const keyParam = apiKey ? `&key=${apiKey}` : '';
      const res = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(GENRES[index].query)}&maxResults=20&orderBy=relevance${keyParam}`
      );
      const data = await res.json();
      const items: GoogleBooksVolume[] = (data.items || []).filter((v: GoogleBooksVolume) =>
        v.volumeInfo.imageLinks?.thumbnail || v.volumeInfo.imageLinks?.smallThumbnail
      );
      genreCache.current[index] = items;
      setGenreBooks(items);
    } catch {
      setGenreBooks([]);
    } finally {
      setGenreLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGenre(0);
  }, [loadGenre]);

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
    const isbnQuery = `isbn:${isbn}`;
    setQuery(isbn);
    setScannerOpen(false);
    search(isbnQuery);
  }

  function isInLibrary(googleId: string) {
    return books.some(b => b.googleBooksId === googleId);
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

  function BookCard({ vol }: { vol: GoogleBooksVolume }) {
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
          <p className="text-sm text-[#4e6073] mt-0.5 truncate">
            {info.authors?.join(', ') || 'Autore sconosciuto'}
          </p>
          <div className="flex gap-2 mt-1 flex-wrap">
            {info.publishedDate && (
              <span className="text-xs text-[#74777d]">{info.publishedDate.slice(0, 4)}</span>
            )}
            {info.pageCount && (
              <span className="text-xs text-[#74777d]">· {info.pageCount} pag.</span>
            )}
          </div>
          {info.description && (
            <p className="text-xs text-[#43474c] dark:text-[#8a8a85] mt-2 line-clamp-2">{info.description}</p>
          )}
          <div className="flex gap-2 mt-3">
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

  return (
    <>
      {/* Scanner ISBN */}
      {scannerOpen && (
        <IsbnScanner onScan={handleScan} onClose={() => setScannerOpen(false)} />
      )}

      <header className="fixed top-0 w-full flex items-center gap-4 px-6 py-4 bg-[#fcf9f4]/80 dark:bg-[#121210]/80 backdrop-blur-md z-50">
        <span className="font-serif italic text-2xl text-[#162b1d] dark:text-[#b4cdb8] flex-shrink-0">LibroLog</span>
        <div className="relative flex-1 max-w-lg">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#74777d]">search</span>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()}
            className="w-full pl-12 pr-4 py-2.5 bg-[#ebe8e3] dark:bg-[#2c2c28] rounded-xl border-none outline-none focus:ring-2 focus:ring-[#162b1d]/20 dark:focus:ring-[#b4cdb8]/20 text-[#1c1c19] dark:text-[#e5e2dd] placeholder:text-[#74777d] text-sm"
            placeholder="Titolo, autore o ISBN..."
            autoFocus
          />
        </div>
        <button
          onClick={() => setScannerOpen(true)}
          title="Scansiona ISBN"
          className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-[#ebe8e3] dark:bg-[#2c2c28] rounded-xl hover:bg-[#e5e2dd] transition-colors"
        >
          <span className="material-symbols-outlined text-[#162b1d] dark:text-[#b4cdb8]">photo_camera</span>
        </button>
        <button
          onClick={() => search()}
          disabled={loading || !query.trim()}
          className="flex-shrink-0 px-5 py-2.5 bg-[#162b1d] text-white rounded-xl text-sm font-semibold disabled:opacity-50 transition-opacity"
        >
          {loading ? 'Cerca...' : 'Cerca'}
        </button>
      </header>

      <main className="pt-24 pb-32 max-w-3xl mx-auto">

        {/* Sezione scopri per genere (visibile solo quando non si sta cercando) */}
        {!searched && (
          <div className="mt-4">
            <h2 className="px-6 font-serif text-xl text-[#162b1d] dark:text-[#b4cdb8] mb-3">Scopri per genere</h2>

            {/* Pill generi */}
            <div className="flex gap-2 overflow-x-auto px-6 pb-1 scrollbar-hide">
              {GENRES.map((g, i) => (
                <button
                  key={g.label}
                  onClick={() => { setActiveGenre(i); loadGenre(i); }}
                  className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    activeGenre === i
                      ? 'bg-[#162b1d] text-white'
                      : 'bg-[#ebe8e3] dark:bg-[#2c2c28] text-[#43474c] dark:text-[#95ad9a] hover:bg-[#dedad4] dark:hover:bg-[#363630]'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>

            {/* Copertine scroll orizzontale */}
            <div className="mt-4 px-6">
              {genreLoading ? (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex-shrink-0 w-24 aspect-[2/3] rounded-xl bg-[#ebe8e3] dark:bg-[#2c2c28] animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {genreBooks.map(vol => {
                    const cover = getCover(vol);
                    const isExpanded = expandedId === vol.id;
                    return (
                      <button
                        key={vol.id}
                        onClick={() => setExpandedId(isExpanded ? null : vol.id)}
                        className={`flex-shrink-0 w-24 aspect-[2/3] rounded-xl overflow-hidden bg-[#ebe8e3] dark:bg-[#2c2c28] transition-all ${
                          isExpanded ? 'ring-2 ring-[#162b1d] dark:ring-[#b4cdb8]' : ''
                        }`}
                      >
                        {cover ? (
                          <img src={cover} alt={vol.volumeInfo.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-[#74777d] text-2xl">menu_book</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Card espansa del libro selezionato */}
            {expandedId && (() => {
              const vol = genreBooks.find(v => v.id === expandedId);
              if (!vol) return null;
              return (
                <div className="mx-6 mt-3">
                  <BookCard vol={vol} />
                </div>
              );
            })()}
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
            <div className="space-y-4 mt-6">
              <p className="text-sm text-[#74777d]">{results.length} risultati per &ldquo;{query}&rdquo;</p>
              {results.map(vol => <BookCard key={vol.id} vol={vol} />)}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
