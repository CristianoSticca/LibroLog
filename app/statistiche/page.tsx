'use client';

import { useMemo, useState, useEffect } from 'react';
import { useBooks } from '@/context/BooksContext';
import { useReadingSessions } from '@/context/ReadingSessionsContext';
import RatingStars from '@/components/RatingStars';
import Link from 'next/link';
import { getSettings } from '@/lib/settings';
import YearInBooksModal from '@/components/YearInBooksModal';

const MONTHS = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
const CIRCLE_R = 80;
const CIRCUMFERENCE = 2 * Math.PI * CIRCLE_R;

const GENRE_COLORS = ['#2c4132', '#4e6073', '#cfe2f9', '#392117', '#d0e9d4', '#c4c6cd'];

export default function Statistiche() {
  const { books } = useBooks();
  const { avgPagesPerHour, streakDays } = useReadingSessions();
  const [annualGoal, setAnnualGoal] = useState(12);
  const [dailyPagesGoal, setDailyPagesGoal] = useState(30);
  const [showYearCard, setShowYearCard] = useState(false);

  useEffect(() => {
    const s = getSettings();
    setAnnualGoal(s.annualGoal);
    setDailyPagesGoal(s.dailyPagesGoal);
  }, []);

  const stats = useMemo(() => {
    const read = books.filter(b => b.status === 'read');
    const reading = books.filter(b => b.status === 'reading');
    const toRead = books.filter(b => b.status === 'to-read');
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();

    const booksThisYear = read.filter(b => b.endDate && new Date(b.endDate).getFullYear() === currentYear);
    const totalPages = read.reduce((s, b) => s + (b.pages || 0), 0);
    const rated = read.filter(b => b.rating);
    const avgRating = rated.length > 0 ? rated.reduce((s, b) => s + (b.rating || 0), 0) / rated.length : 0;

    // Libri per mese
    const byMonth: number[] = Array(12).fill(0);
    booksThisYear.forEach(b => {
      if (b.endDate) byMonth[new Date(b.endDate).getMonth()]++;
    });

    // Confronto mese corrente vs precedente
    const thisMonth = byMonth[currentMonth];
    const prevMonth = currentMonth > 0 ? byMonth[currentMonth - 1] : 0;
    const monthDelta = thisMonth - prevMonth;

    // Mese record
    const maxMonthVal = Math.max(...byMonth);
    const recordMonthIdx = byMonth.indexOf(maxMonthVal);
    const recordMonthIndices = byMonth.map((v, i) => v === maxMonthVal && v > 0 ? i : -1).filter(i => i >= 0);
    const recordMonth = maxMonthVal > 0 ? MONTHS[recordMonthIdx] : null;

    // Durata media
    const durations = read
      .filter(b => b.startDate && b.endDate)
      .map(b => Math.round((new Date(b.endDate!).getTime() - new Date(b.startDate!).getTime()) / 86400000))
      .filter(d => d > 0);
    const avgDays = durations.length > 0 ? Math.round(durations.reduce((s, d) => s + d, 0) / durations.length) : 0;

    // Generi
    const genreCount: Record<string, number> = {};
    read.forEach(b => {
      b.genres?.forEach(g => {
        const genre = g.split(' / ')[0].split(' & ')[0].trim();
        genreCount[genre] = (genreCount[genre] || 0) + 1;
      });
    });
    const topGenres = Object.entries(genreCount).sort((a, b) => b[1] - a[1]).slice(0, 4);
    const totalGenreBooks = topGenres.reduce((s, [, c]) => s + c, 0);

    // Autori più letti
    const authorCount: Record<string, number> = {};
    read.forEach(b => { authorCount[b.author] = (authorCount[b.author] || 0) + 1; });
    const topAuthors = Object.entries(authorCount).sort((a, b) => b[1] - a[1]).slice(0, 5);

    // Pagine medie al giorno (anno corrente)
    const pagesThisYear = booksThisYear.reduce((s, b) => s + (b.pages || 0), 0);
    const dayOfYear = Math.ceil((Date.now() - new Date(currentYear, 0, 1).getTime()) / 86400000);
    const avgPagesPerDay = dayOfYear > 0 ? Math.round(pagesThisYear / dayOfYear) : 0;

    // Best rated
    const bestRated = [...read].filter(b => b.rating).sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 5);

    return {
      read, reading, toRead, booksThisYear, totalPages, avgRating,
      byMonth, monthDelta, thisMonth, recordMonth, recordMonthIdx, recordMonthIndices, maxMonthVal,
      avgDays, avgPagesPerDay, topGenres, totalGenreBooks, topAuthors, bestRated, currentYear,
    };
  }, [books]);

  const goalProgress = Math.min(stats.booksThisYear.length / annualGoal, 1);
  const strokeDashoffset = CIRCUMFERENCE * (1 - goalProgress);
  const maxMonth = Math.max(...stats.byMonth, 1);

  if (books.length === 0) {
    return (
      <>
        <header className="fixed top-0 w-full flex items-center px-6 py-4 bg-[#fcf9f4]/80 dark:bg-[#121210]/80 backdrop-blur-md z-50">
          <span className="font-serif italic text-2xl text-[#162b1d] dark:text-[#b4cdb8]">LibroLog</span>
        </header>
        <main className="pt-24 pb-32 px-6 flex flex-col items-center justify-center min-h-screen text-center">
          <span className="material-symbols-outlined text-6xl text-[#c4c6cd] mb-4 block">leaderboard</span>
          <h2 className="font-serif text-2xl text-[#162b1d] dark:text-[#b4cdb8] mb-2">Nessuna statistica</h2>
          <p className="text-[#43474c] text-sm mb-6">Aggiungi e completa qualche libro per vedere le tue statistiche.</p>
          <Link href="/ricerca" className="inline-flex items-center gap-2 px-6 py-3 bg-[#162b1d] text-white rounded-full text-sm font-semibold">
            <span className="material-symbols-outlined text-sm">search</span>
            Cerca un libro
          </Link>
        </main>
      </>
    );
  }

  const booksWithPages = stats.booksThisYear.filter(b => (b.pages || 0) > 0);
  const longestBook = booksWithPages.length
    ? booksWithPages.reduce((max, b) => (b.pages || 0) > (max.pages || 0) ? b : max)
    : null;
  const shortestBook = booksWithPages.length
    ? booksWithPages.reduce((min, b) => (b.pages || 0) < (min.pages || 0) ? b : min)
    : null;

  const monthlyCovers = Array.from({ length: 12 }, (_, i) =>
    stats.booksThisYear
      .filter(b => b.endDate && new Date(b.endDate).getMonth() === i)
      .map(b => b.cover)
      .filter(Boolean) as string[]
  );

  const yearInBooksData = {
    year: stats.currentYear,
    booksCount: stats.booksThisYear.length,
    pagesCount: stats.booksThisYear.reduce((s, b) => s + (b.pages || 0), 0),
    topGenres: stats.topGenres.map(([g]) => g),
    recordMonth: stats.recordMonth,
    topCovers: stats.booksThisYear.map(b => b.cover).filter(Boolean) as string[],
    bestRatedCovers: stats.bestRated.map(b => b.cover).filter(Boolean) as string[],
    fiveStarCovers: stats.read.filter(b => b.rating === 5).map(b => b.cover).filter(Boolean) as string[],
    monthlyCovers,
    longestBook: longestBook ? { title: longestBook.title, pages: longestBook.pages } : null,
    shortestBook: shortestBook && shortestBook.id !== longestBook?.id ? { title: shortestBook.title, pages: shortestBook.pages } : null,
    streakDays,
  };

  return (
    <>
      {showYearCard && (
        <YearInBooksModal data={yearInBooksData} onClose={() => setShowYearCard(false)} />
      )}

      <header className="fixed top-0 w-full flex items-center px-6 py-4 bg-[#fcf9f4]/80 dark:bg-[#121210]/80 backdrop-blur-md z-50">
        <span className="font-serif italic text-2xl text-[#162b1d] dark:text-[#b4cdb8]">LibroLog</span>
      </header>

      <main className="pt-24 pb-32 px-6 max-w-4xl mx-auto">

        {/* Banner Year in Books */}
        {stats.booksThisYear.length > 0 && (
          <button
            onClick={() => setShowYearCard(true)}
            className="w-full mb-8 rounded-2xl overflow-hidden relative flex items-center gap-4 px-6 py-5 text-left transition-transform active:scale-[0.99]"
            style={{ background: 'linear-gradient(135deg, #162b1d 0%, #2c4132 100%)' }}
          >
            <div className="flex-1">
              <p className="text-[#95ad9a] text-xs uppercase tracking-widest mb-1">Scopri</p>
              <p className="font-serif text-white text-xl leading-tight">Il tuo {stats.currentYear} in libri</p>
              <p className="text-[#95ad9a] text-sm mt-1">{stats.booksThisYear.length} libri · {yearInBooksData.pagesCount.toLocaleString('it-IT')} pagine</p>
            </div>
            <span className="material-symbols-outlined text-white opacity-80 text-4xl">auto_stories</span>
          </button>
        )}

        {/* Header */}
        <section className="mb-10">
          <h1 className="font-serif text-4xl font-medium tracking-tight text-[#162b1d] dark:text-[#b4cdb8] mb-2">Il tuo viaggio letterario</h1>
          <p className="text-[#4e6073] text-lg italic">"Un libro è un giardino che puoi custodire in tasca."</p>
        </section>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mb-10">

          {/* Obiettivo annuale — cerchio */}
          <div className="md:col-span-5 bg-white rounded-2xl p-8 shadow-[0px_12px_32px_rgba(28,28,25,0.05)] flex flex-col items-center justify-center text-center">
            <span className="text-xs uppercase tracking-widest text-[#4e6073] mb-6">Obiettivo {stats.currentYear}</span>
            <div className="relative w-44 h-44 flex items-center justify-center mb-6">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r={CIRCLE_R} fill="transparent" stroke="#f0ede8" strokeWidth="10" />
                <circle
                  cx="100" cy="100" r={CIRCLE_R}
                  fill="transparent"
                  stroke="#162b1d"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={strokeDashoffset}
                  style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-serif text-5xl font-bold text-[#162b1d] dark:text-[#b4cdb8]">{stats.booksThisYear.length}</span>
                <span className="text-sm text-[#4e6073]">di {annualGoal} libri</span>
              </div>
            </div>
            <p className="text-sm text-[#43474c] px-2">
              {goalProgress >= 1
                ? 'Obiettivo raggiunto! Fantastico!'
                : `Sei al ${Math.round(goalProgress * 100)}% del tuo percorso. Mancano ${annualGoal - stats.booksThisYear.length} libri!`}
            </p>
          </div>

          {/* Grafico mensile */}
          <div className="md:col-span-7 bg-white rounded-2xl p-8 shadow-[0px_12px_32px_rgba(28,28,25,0.05)]">
            <div className="flex justify-between items-end mb-8">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#4e6073] block mb-1">Attività</span>
                <h3 className="font-serif text-2xl text-[#162b1d] dark:text-[#b4cdb8]">Libri letti</h3>
              </div>
              {stats.monthDelta !== 0 && (
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${stats.monthDelta > 0 ? 'bg-[#d0e9d4] text-[#162b1d] dark:bg-[#2c4132] dark:text-[#b4cdb8]' : 'bg-[#ffdad6] text-[#ba1a1a]'}`}>
                  {stats.monthDelta > 0 ? '+' : ''}{stats.monthDelta} vs. mese prec.
                </span>
              )}
            </div>
            <div className="flex items-end gap-2" style={{ height: '120px' }}>
              {MONTHS.map((m, i) => (
                <div key={m} className="flex flex-col items-center flex-1 gap-1 h-full justify-end">
                  <div
                    className={`w-full rounded-t-lg transition-all ${stats.recordMonthIndices.includes(i) ? 'bg-[#162b1d]' : 'bg-[#ebe8e3] hover:bg-[#b4cdb8]'}`}
                    style={{ height: `${Math.max((stats.byMonth[i] / maxMonth) * 100, stats.byMonth[i] > 0 ? 8 : 2)}px` }}
                  />
                  <span className={`text-[9px] flex-shrink-0 ${stats.recordMonthIndices.includes(i) ? 'font-bold text-[#162b1d] dark:text-[#b4cdb8]' : 'text-[#74777d]'}`}>{m[0]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Generi preferiti */}
          {stats.topGenres.length > 0 && (
            <div className="md:col-span-8 bg-white rounded-2xl p-8 shadow-[0px_12px_32px_rgba(28,28,25,0.05)]">
              <div className="mb-6">
                <span className="text-xs uppercase tracking-widest text-[#4e6073] block mb-1">Analisi</span>
                <h3 className="font-serif text-2xl text-[#162b1d] dark:text-[#b4cdb8]">Generi preferiti</h3>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-8">
                {/* Donut chart */}
                <div className="relative w-36 h-36 flex-shrink-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    {(() => {
                      let offset = 0;
                      return stats.topGenres.map(([, count], i) => {
                        const pct = count / stats.totalGenreBooks;
                        const dash = pct * 2 * Math.PI * 35;
                        const gap = 2 * Math.PI * 35 - dash;
                        const el = (
                          <circle
                            key={i}
                            cx="50" cy="50" r="35"
                            fill="transparent"
                            stroke={GENRE_COLORS[i]}
                            strokeWidth="20"
                            strokeDasharray={`${dash} ${gap}`}
                            strokeDashoffset={-offset}
                          />
                        );
                        offset += dash;
                        return el;
                      });
                    })()}
                  </svg>
                </div>
                <div className="grid grid-cols-2 gap-3 flex-1 w-full">
                  {stats.topGenres.map(([genre, count], i) => (
                    <div key={genre} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: GENRE_COLORS[i] }} />
                      <span className="text-sm text-[#1c1c19] truncate flex-1">{genre}</span>
                      <span className="text-xs text-[#4e6073] flex-shrink-0 font-medium">
                        {Math.round((count / stats.totalGenreBooks) * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Focus card — mese record */}
          {stats.recordMonth && (
            <div className={`${stats.topGenres.length > 0 ? 'md:col-span-4' : 'md:col-span-12'} bg-[#162b1d] text-white rounded-2xl p-8 flex flex-col justify-between overflow-hidden relative`}>
              <div className="relative z-10">
                <span className="text-xs uppercase tracking-widest text-[#95ad9a] block mb-4">Focus</span>
                <h3 className="font-serif text-2xl leading-tight">Mese record: {stats.recordMonth}</h3>
                <p className="mt-4 text-[#95ad9a] text-sm leading-relaxed">
                  Hai completato {stats.maxMonthVal} libr{stats.maxMonthVal === 1 ? 'o' : 'i'} in questo mese.
                  {stats.avgDays > 0 && ` Media di ${stats.avgDays} giorni per libro.`}
                </p>
              </div>
              <div className="absolute -right-8 -bottom-8 opacity-10">
                <span className="material-symbols-outlined" style={{ fontSize: '140px' }}>auto_stories</span>
              </div>
            </div>
          )}

          {/* Stats secondarie */}
          <div className="md:col-span-4 bg-[#f0ede8] rounded-2xl p-6 flex flex-col justify-between">
            <span className="text-xs uppercase tracking-widest text-[#4e6073]">Totale completati</span>
            <span className="font-serif text-5xl font-bold text-[#162b1d] dark:text-[#b4cdb8]">{stats.read.length}</span>
          </div>
          <div className="md:col-span-4 bg-[#f0ede8] rounded-2xl p-6 flex flex-col justify-between">
            <span className="text-xs uppercase tracking-widest text-[#4e6073]">Pagine lette</span>
            <span className="font-serif text-4xl font-bold text-[#162b1d] dark:text-[#b4cdb8]">{stats.totalPages.toLocaleString('it-IT')}</span>
          </div>
          {stats.avgRating > 0 && (
            <div className="md:col-span-4 bg-[#f0ede8] rounded-2xl p-6 flex flex-col justify-between">
              <span className="text-xs uppercase tracking-widest text-[#4e6073]">Valutazione media</span>
              <div className="flex items-end gap-2">
                <span className="font-serif text-4xl font-bold text-[#162b1d] dark:text-[#b4cdb8]">{stats.avgRating.toFixed(1)}</span>
                <span className="text-[#4e6073] mb-1">/ 5</span>
              </div>
            </div>
          )}

          {/* Pagine al giorno */}
          <div className="md:col-span-6 bg-[#f6f3ee] rounded-2xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#4e6073] block mb-1">Pagine al giorno</span>
                <div className="flex items-end gap-2">
                  <span className="font-serif text-4xl font-bold text-[#162b1d] dark:text-[#b4cdb8]">{stats.avgPagesPerDay}</span>
                  <span className="text-sm text-[#4e6073] mb-1">/ {dailyPagesGoal} obiettivo</span>
                </div>
              </div>
              <span className="material-symbols-outlined text-[#4e6073] text-3xl">menu_book</span>
            </div>
            <div className="h-2 bg-[#e5e2dd] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min((stats.avgPagesPerDay / dailyPagesGoal) * 100, 100)}%`,
                  backgroundColor: stats.avgPagesPerDay >= dailyPagesGoal ? '#162b1d' : '#4e6073',
                }}
              />
            </div>
            <p className="text-xs text-[#74777d] mt-2">
              {stats.avgPagesPerDay >= dailyPagesGoal
                ? 'Obiettivo raggiunto!'
                : `Mancano ${dailyPagesGoal - stats.avgPagesPerDay} pag/giorno all'obiettivo`}
            </p>
          </div>

          {/* Velocità di lettura */}
          {(() => {
            const pph = avgPagesPerHour();
            return (
              <div className="md:col-span-6 bg-[#f6f3ee] rounded-2xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs uppercase tracking-widest text-[#4e6073] block mb-1">Velocità di lettura</span>
                    <div className="flex items-end gap-2">
                      {pph !== null ? (
                        <>
                          <span className="font-serif text-4xl font-bold text-[#162b1d]">{pph}</span>
                          <span className="text-sm text-[#4e6073] mb-1">pag/ora</span>
                        </>
                      ) : (
                        <span className="font-serif text-2xl text-[#74777d]">N/D</span>
                      )}
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[#4e6073] text-3xl">speed</span>
                </div>
                <p className="text-xs text-[#74777d]">
                  {pph !== null
                    ? 'Media calcolata sulle sessioni con tempo registrato'
                    : 'Registra il tempo delle sessioni per calcolare la velocità'}
                </p>
              </div>
            );
          })()}

          {/* Autori più letti */}
          {stats.topAuthors.length > 0 && (
            <div className="md:col-span-6 bg-white rounded-2xl p-6 shadow-[0px_12px_32px_rgba(28,28,25,0.05)]">
              <h3 className="font-serif text-xl text-[#162b1d] dark:text-[#b4cdb8] mb-4">Autori più letti</h3>
              <div className="space-y-3">
                {stats.topAuthors.map(([author, count]) => (
                  <div key={author} className="flex items-center gap-3">
                    <span className="text-sm text-[#1c1c19] truncate flex-1">{author}</span>
                    <div className="flex-1 h-1.5 bg-[#e5e2dd] rounded-full overflow-hidden">
                      <div className="h-full bg-[#162b1d] rounded-full" style={{ width: `${(count / stats.topAuthors[0][1]) * 100}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-[#162b1d] dark:text-[#b4cdb8] w-12 text-right flex-shrink-0">{count} libr{count === 1 ? 'o' : 'i'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Migliori libri */}
          {stats.bestRated.length > 0 && (
            <div className="md:col-span-6 bg-white rounded-2xl p-6 shadow-[0px_12px_32px_rgba(28,28,25,0.05)]">
              <h3 className="font-serif text-xl text-[#162b1d] dark:text-[#b4cdb8] mb-4">I tuoi preferiti</h3>
              <div className="space-y-4">
                {stats.bestRated.map(b => (
                  <Link key={b.id} href={`/libro/${b.id}`} className="flex items-center gap-3 group">
                    <div className="w-10 h-14 rounded overflow-hidden flex-shrink-0 bg-[#ebe8e3]">
                      {b.cover && <img src={b.cover} alt={b.title} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#162b1d] dark:text-[#b4cdb8] truncate group-hover:underline">{b.title}</p>
                      <p className="text-xs text-[#4e6073] truncate">{b.author}</p>
                      <RatingStars value={b.rating || 0} size="sm" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Citazione motivazionale */}
        <section className="text-center py-12 border-t border-[#c4c6cd]/20">
          <span className="material-symbols-outlined text-[#162b1d] dark:text-[#b4cdb8] mb-4 block" style={{ fontSize: '32px' }}>format_quote</span>
          <blockquote className="font-serif text-2xl italic text-[#1c1c19] dark:text-[#b4cdb8] mb-4 leading-snug max-w-xl mx-auto">
            "Leggere non è un dovere, ma un modo per vivere infinite vite."
          </blockquote>
          <p className="text-xs uppercase tracking-widest text-[#4e6073]">— Umberto Eco</p>
        </section>

      </main>
    </>
  );
}
