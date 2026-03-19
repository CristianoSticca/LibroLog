'use client';

import { useMemo } from 'react';
import { useBooks } from '@/context/BooksContext';
import RatingStars from '@/components/RatingStars';
import Link from 'next/link';

export default function Statistiche() {
  const { books } = useBooks();

  const stats = useMemo(() => {
    const read = books.filter(b => b.status === 'read');
    const reading = books.filter(b => b.status === 'reading');
    const toRead = books.filter(b => b.status === 'to-read');
    const currentYear = new Date().getFullYear();

    const booksThisYear = read.filter(b => b.endDate && new Date(b.endDate).getFullYear() === currentYear);
    const totalPages = read.reduce((s, b) => s + (b.pages || 0), 0);
    const avgPages = read.length > 0 ? Math.round(totalPages / read.length) : 0;
    const rated = read.filter(b => b.rating);
    const avgRating = rated.length > 0 ? rated.reduce((s, b) => s + (b.rating || 0), 0) / rated.length : 0;

    // Libri per mese (anno corrente)
    const byMonth: number[] = Array(12).fill(0);
    booksThisYear.forEach(b => {
      if (b.endDate) byMonth[new Date(b.endDate).getMonth()]++;
    });

    // Autori più letti
    const authorCount: Record<string, number> = {};
    read.forEach(b => { authorCount[b.author] = (authorCount[b.author] || 0) + 1; });
    const topAuthors = Object.entries(authorCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Durata media lettura
    const durations = read
      .filter(b => b.startDate && b.endDate)
      .map(b => {
        const days = Math.round((new Date(b.endDate!).getTime() - new Date(b.startDate!).getTime()) / 86400000);
        return days;
      })
      .filter(d => d > 0);
    const avgDays = durations.length > 0 ? Math.round(durations.reduce((s, d) => s + d, 0) / durations.length) : 0;

    // Best rated
    const bestRated = [...read].filter(b => b.rating).sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 3);

    return { read, reading, toRead, booksThisYear, totalPages, avgPages, avgRating, byMonth, topAuthors, avgDays, bestRated, currentYear };
  }, [books]);

  const MONTHS = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
  const maxMonth = Math.max(...stats.byMonth, 1);

  if (books.length === 0) {
    return (
      <>
        <header className="fixed top-0 w-full flex items-center px-6 py-4 bg-[#fcf9f4]/80 backdrop-blur-md z-50">
          <span className="font-serif italic text-2xl text-[#162b1d]">LibroLog</span>
        </header>
        <main className="pt-24 pb-32 px-6 flex flex-col items-center justify-center min-h-screen text-center">
          <span className="material-symbols-outlined text-6xl text-[#c4c6cd] mb-4 block">leaderboard</span>
          <h2 className="font-serif text-2xl text-[#162b1d] mb-2">Nessuna statistica</h2>
          <p className="text-[#43474c] text-sm mb-6">Aggiungi e completa qualche libro per vedere le tue statistiche.</p>
          <Link href="/ricerca" className="inline-flex items-center gap-2 px-6 py-3 bg-[#162b1d] text-white rounded-full text-sm font-semibold">
            <span className="material-symbols-outlined text-sm">search</span>
            Cerca un libro
          </Link>
        </main>
      </>
    );
  }

  return (
    <>
      <header className="fixed top-0 w-full flex items-center px-6 py-4 bg-[#fcf9f4]/80 backdrop-blur-md z-50">
        <span className="font-serif italic text-2xl text-[#162b1d]">LibroLog</span>
      </header>

      <main className="pt-24 pb-32 px-6 max-w-2xl mx-auto">
        <h1 className="font-serif text-4xl font-light text-[#162b1d] mb-8">Le tue Statistiche</h1>

        {/* Numeri principali */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-[#2c4132] p-6 rounded-xl flex flex-col justify-between aspect-square">
            <span className="text-xs uppercase tracking-widest text-[#95ad9a]">Letti nel {stats.currentYear}</span>
            <span className="font-serif text-5xl font-bold text-white">{stats.booksThisYear.length}</span>
          </div>
          <div className="bg-[#f0ede8] p-6 rounded-xl flex flex-col justify-between aspect-square">
            <span className="text-xs uppercase tracking-widest text-[#4e6073]">Totale completati</span>
            <span className="font-serif text-5xl font-bold text-[#162b1d]">{stats.read.length}</span>
          </div>
          <div className="bg-[#f6f3ee] p-6 rounded-xl flex flex-col justify-between">
            <span className="text-xs uppercase tracking-widest text-[#4e6073]">Pagine lette</span>
            <span className="font-serif text-3xl font-bold text-[#162b1d]">{stats.totalPages.toLocaleString('it-IT')}</span>
          </div>
          <div className="bg-[#f6f3ee] p-6 rounded-xl flex flex-col justify-between">
            <span className="text-xs uppercase tracking-widest text-[#4e6073]">Media pag./libro</span>
            <span className="font-serif text-3xl font-bold text-[#162b1d]">{stats.avgPages}</span>
          </div>
        </div>

        {/* Stato libreria */}
        <div className="bg-[#f6f3ee] rounded-2xl p-6 mb-6">
          <h3 className="font-serif text-xl text-[#162b1d] mb-4">Libreria</h3>
          <div className="space-y-3">
            {[
              { label: 'In lettura', count: stats.reading.length, color: '#162b1d' },
              { label: 'Completati', count: stats.read.length, color: '#2c4132' },
              { label: 'Da leggere', count: stats.toRead.length, color: '#4e6073' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3">
                <span className="text-sm text-[#43474c] w-28">{item.label}</span>
                <div className="flex-1 h-2 bg-[#e5e2dd] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: books.length > 0 ? `${(item.count / books.length) * 100}%` : '0%',
                      backgroundColor: item.color,
                    }}
                  />
                </div>
                <span className="text-sm font-semibold text-[#162b1d] w-6 text-right">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Grafico mensile */}
        {stats.booksThisYear.length > 0 && (
          <div className="bg-[#f6f3ee] rounded-2xl p-6 mb-6">
            <h3 className="font-serif text-xl text-[#162b1d] mb-6">Libri completati per mese ({stats.currentYear})</h3>
            <div className="flex items-end gap-2 h-32">
              {MONTHS.map((m, i) => (
                <div key={m} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-sm bg-[#162b1d] transition-all"
                    style={{ height: `${(stats.byMonth[i] / maxMonth) * 100}%`, minHeight: stats.byMonth[i] > 0 ? '4px' : '0' }}
                  />
                  <span className="text-[9px] text-[#74777d]">{m}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Durata media */}
        {stats.avgDays > 0 && (
          <div className="bg-[#f6f3ee] rounded-2xl p-6 mb-6 flex items-center gap-4">
            <span className="material-symbols-outlined text-4xl text-[#162b1d]">schedule</span>
            <div>
              <p className="text-xs uppercase tracking-widest text-[#4e6073] mb-1">Durata media per libro</p>
              <p className="font-serif text-3xl font-bold text-[#162b1d]">{stats.avgDays} giorni</p>
            </div>
          </div>
        )}

        {/* Valutazione media */}
        {stats.avgRating > 0 && (
          <div className="bg-[#f6f3ee] rounded-2xl p-6 mb-6 flex items-center gap-4">
            <RatingStars value={Math.round(stats.avgRating)} size="md" />
            <div>
              <p className="text-xs uppercase tracking-widest text-[#4e6073] mb-1">Valutazione media</p>
              <p className="font-serif text-3xl font-bold text-[#162b1d]">{stats.avgRating.toFixed(1)} / 5</p>
            </div>
          </div>
        )}

        {/* Autori più letti */}
        {stats.topAuthors.length > 0 && (
          <div className="bg-[#f6f3ee] rounded-2xl p-6 mb-6">
            <h3 className="font-serif text-xl text-[#162b1d] mb-4">Autori più letti</h3>
            <div className="space-y-3">
              {stats.topAuthors.map(([author, count]) => (
                <div key={author} className="flex items-center justify-between">
                  <span className="text-sm text-[#1c1c19] truncate flex-1 mr-4">{author}</span>
                  <span className="text-sm font-bold text-[#162b1d] flex-shrink-0">
                    {count} libr{count === 1 ? 'o' : 'i'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Migliori libri */}
        {stats.bestRated.length > 0 && (
          <div className="bg-[#f6f3ee] rounded-2xl p-6">
            <h3 className="font-serif text-xl text-[#162b1d] mb-4">I tuoi preferiti</h3>
            <div className="space-y-4">
              {stats.bestRated.map(b => (
                <Link key={b.id} href={`/libro/${b.id}`} className="flex items-center gap-3 group">
                  <div className="w-10 h-14 rounded overflow-hidden flex-shrink-0 bg-[#ebe8e3]">
                    {b.cover && <img src={b.cover} alt={b.title} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#162b1d] truncate group-hover:underline">{b.title}</p>
                    <p className="text-xs text-[#4e6073] truncate">{b.author}</p>
                    <RatingStars value={b.rating || 0} size="sm" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
