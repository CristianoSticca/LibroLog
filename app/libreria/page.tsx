'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useBooks } from '@/context/BooksContext';
import BookCard from '@/components/BookCard';
import { BookStatus } from '@/lib/types';

const FILTERS: { value: 'all' | BookStatus; label: string }[] = [
  { value: 'all', label: 'Tutti' },
  { value: 'to-read', label: 'Da Leggere' },
  { value: 'reading', label: 'In Lettura' },
  { value: 'read', label: 'Completati' },
  { value: 'dropped', label: 'Abbandonati' },
];

export default function Libreria() {
  const { books } = useBooks();
  const [filter, setFilter] = useState<'all' | BookStatus>('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    let list = filter === 'all' ? books : books.filter(b => b.status === filter);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(b =>
        b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
  }, [books, filter, query]);

  return (
    <>
      <header className="fixed top-0 w-full flex justify-between items-center px-6 py-4 bg-[#fcf9f4]/80 dark:bg-[#121210]/80 backdrop-blur-md z-50">
        <span className="font-serif italic text-2xl text-[#162b1d] dark:text-[#b4cdb8] dark:text-[#b4cdb8]">LibroLog</span>
      </header>

      <main className="pt-24 pb-32 px-6 max-w-5xl mx-auto">
        <section className="mb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-1">
              <h2 className="font-serif text-4xl text-[#162b1d] dark:text-[#b4cdb8] font-medium">La tua Libreria</h2>
              <p className="text-[#4e6073]">
                {books.length === 0
                  ? 'La tua collezione è vuota.'
                  : `${books.length} libr${books.length === 1 ? 'o' : 'i'} nella tua collezione.`}
              </p>
            </div>
            <div className="relative w-full md:w-72">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#74777d]">search</span>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-[#ebe8e3] rounded-xl border-none outline-none focus:ring-2 focus:ring-[#162b1d]/20 text-[#1c1c19] placeholder:text-[#74777d]"
                placeholder="Cerca tra i tuoi libri..."
                type="text"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-8 overflow-x-auto pb-2">
            {FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-5 py-2 rounded-lg text-sm whitespace-nowrap transition-all active:scale-95 ${
                  filter === f.value
                    ? 'bg-[#162b1d] text-white'
                    : 'bg-[#cfe2f9] text-[#526478] hover:bg-[#e5e2dd]'
                }`}
              >
                {f.label}
                {f.value !== 'all' && (
                  <span className="ml-1.5 opacity-70">
                    ({books.filter(b => b.status === f.value).length})
                  </span>
                )}
              </button>
            ))}
          </div>
        </section>

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-5xl text-[#c4c6cd] mb-4 block">
              {query ? 'search_off' : 'library_books'}
            </span>
            <p className="text-[#43474c] mb-4">
              {query ? `Nessun risultato per "${query}"` : 'Nessun libro in questa categoria.'}
            </p>
            <Link
              href="/ricerca"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#162b1d] text-white rounded-full text-sm font-semibold"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              Aggiungi un libro
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
            {filtered.map(book => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </main>

      <Link
        href="/ricerca"
        className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-[#162b1d] text-white shadow-[0px_12px_32px_rgba(28,28,25,0.2)] flex items-center justify-center hover:scale-110 active:scale-95 z-40 transition-transform"
      >
        <span className="material-symbols-outlined text-2xl">add</span>
      </Link>
    </>
  );
}
