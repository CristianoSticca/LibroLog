'use client';

import Link from 'next/link';
import { useBooks } from '@/context/BooksContext';
import { useRouter } from 'next/navigation';
import StreakBadge from '@/components/StreakBadge';

export default function Dashboard() {
  const { books, booksByStatus, loading, user } = useBooks();
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#162b1d] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const reading = booksByStatus('reading');
  const readBooks = booksByStatus('read');
  const currentYear = new Date().getFullYear();

  const booksThisYear = readBooks.filter(b => {
    if (!b.endDate) return false;
    return new Date(b.endDate).getFullYear() === currentYear;
  });

  const totalPages = readBooks.reduce((sum, b) => sum + (b.pages || 0), 0);
  const currentBook = reading[0];
  const progress = currentBook && currentBook.pages > 0
    ? Math.round((currentBook.currentPage / currentBook.pages) * 100)
    : 0;

  return (
    <>
      <header className="fixed top-0 w-full flex justify-between items-center px-6 py-4 bg-[#fcf9f4]/80 backdrop-blur-md z-50">
        <span className="font-serif italic text-2xl text-[#162b1d]">LibroLog</span>
        <button
          onClick={() => router.push('/impostazioni')}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#f0ede8] transition-colors"
          title="Impostazioni"
        >
          <span className="material-symbols-outlined text-[#162b1d]">settings</span>
        </button>
      </header>

      <main className="pt-24 pb-32 px-6 max-w-2xl mx-auto">
        <section className="mb-10">
          <h1 className="font-serif text-4xl font-light mb-8 text-[#162b1d]">
            {books.length === 0 ? 'Benvenuto.' : 'Bentornato.'}
          </h1>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#f0ede8] p-6 rounded-xl flex flex-col justify-between aspect-square">
              <span className="text-xs uppercase tracking-widest text-[#4e6073]">Letti nel {currentYear}</span>
              <span className="font-serif text-5xl font-bold text-[#162b1d]">{booksThisYear.length}</span>
            </div>
            <div className="bg-[#2c4132] p-6 rounded-xl flex flex-col justify-between aspect-square">
              <span className="text-xs uppercase tracking-widest text-[#95ad9a]">Pagine totali</span>
              <span className="font-serif text-5xl font-bold text-white">{totalPages.toLocaleString('it-IT')}</span>
            </div>
          </div>
          <div className="mt-4">
            <StreakBadge />
          </div>
        </section>

        <section className="mb-12">
          <div className="flex justify-between items-baseline mb-6">
            <h2 className="font-serif text-2xl text-[#162b1d]">In lettura</h2>
            <Link href="/libreria" className="text-[#4e6073] text-sm font-medium hover:underline">
              Vedi libreria
            </Link>
          </div>

          {currentBook ? (
            <div className="bg-[#f6f3ee] rounded-2xl overflow-hidden flex gap-6 p-6">
              <div className="w-32 aspect-[2/3] rounded-lg shadow-lg overflow-hidden flex-shrink-0">
                {currentBook.cover ? (
                  <img src={currentBook.cover} alt={currentBook.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[#ebe8e3] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#74777d]">menu_book</span>
                  </div>
                )}
              </div>
              <div className="flex flex-col justify-between flex-grow py-2 min-w-0">
                <div>
                  <h3 className="font-serif text-2xl text-[#162b1d] mb-1 leading-tight line-clamp-2">{currentBook.title}</h3>
                  <p className="text-[#4e6073] text-base mb-4 truncate">{currentBook.author}</p>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-end">
                      <span className="text-sm text-[#43474c] font-medium">{progress}% completato</span>
                      <span className="text-xs text-[#4e6073] italic">Pag. {currentBook.currentPage} di {currentBook.pages}</span>
                    </div>
                    <div className="h-1 w-full bg-[#d0e9d4] rounded-full overflow-hidden">
                      <div className="h-full bg-[#162b1d] rounded-full transition-all" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                </div>
                <Link
                  href={`/libro/${currentBook.id}`}
                  className="w-full py-3 bg-[#162b1d] text-white rounded-full font-semibold flex items-center justify-center gap-2 text-sm transition-transform active:scale-95"
                >
                  <span className="material-symbols-outlined text-sm">edit</span>
                  Aggiorna Pagine
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-[#f6f3ee] rounded-2xl p-10 text-center">
              <span className="material-symbols-outlined text-5xl text-[#c4c6cd] mb-4 block">auto_stories</span>
              <p className="text-[#43474c] mb-4">Nessun libro in lettura.</p>
              <Link href="/ricerca" className="inline-flex items-center gap-2 px-6 py-3 bg-[#162b1d] text-white rounded-full text-sm font-semibold">
                <span className="material-symbols-outlined text-sm">search</span>
                Cerca un libro
              </Link>
            </div>
          )}
        </section>

        {booksByStatus('to-read').length > 0 && (
          <section className="mb-12">
            <div className="flex justify-between items-baseline mb-6">
              <h2 className="font-serif text-2xl text-[#162b1d]">Da leggere</h2>
              <Link href="/libreria" className="text-[#4e6073] text-sm font-medium hover:underline">
                Vedi tutti ({booksByStatus('to-read').length})
              </Link>
            </div>
            <div className="flex gap-5 overflow-x-auto pb-4 -mx-2 px-2">
              {booksByStatus('to-read').slice(0, 6).map(b => (
                <Link key={b.id} href={`/libro/${b.id}`} className="flex-shrink-0 w-32 group">
                  <div className="aspect-[2/3] bg-[#e5e2dd] rounded-lg mb-2 shadow-sm overflow-hidden">
                    {b.cover && <img src={b.cover} alt={b.title} className="w-full h-full object-cover" />}
                  </div>
                  <h4 className="font-semibold text-sm text-[#162b1d] truncate">{b.title}</h4>
                  <p className="text-xs text-[#4e6073] truncate">{b.author}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {books.length === 0 && (
          <section className="text-center py-12">
            <span className="material-symbols-outlined text-6xl text-[#c4c6cd] mb-4 block">library_books</span>
            <h2 className="font-serif text-2xl text-[#162b1d] mb-2">Inizia la tua libreria</h2>
            <p className="text-[#43474c] mb-6 text-sm">Cerca un libro e aggiungilo alla tua collezione.</p>
            <Link href="/ricerca" className="inline-flex items-center gap-2 px-8 py-4 bg-[#162b1d] text-white rounded-full font-semibold">
              <span className="material-symbols-outlined">search</span>
              Cerca libri
            </Link>
          </section>
        )}
      </main>

      <Link href="/ricerca" className="fixed right-6 bottom-28 w-16 h-16 rounded-full bg-[#162b1d] text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform z-40">
        <span className="material-symbols-outlined text-3xl">add</span>
      </Link>
    </>
  );
}
