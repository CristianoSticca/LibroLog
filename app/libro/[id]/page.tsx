'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useBooks } from '@/context/BooksContext';
import RatingStars from '@/components/RatingStars';
import { BookStatus } from '@/lib/types';

const STATUS_LABELS: Record<BookStatus, string> = {
  'to-read': 'Da Leggere',
  reading: 'In Lettura',
  read: 'Completato',
  dropped: 'Abbandonato',
};

export default function LibroDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { getBook, updateBook, deleteBook } = useBooks();
  const book = getBook(id);

  const [currentPage, setCurrentPage] = useState(book?.currentPage ?? 0);
  const [rating, setRating] = useState(book?.rating ?? 0);
  const [notes, setNotes] = useState(book?.notes ?? '');
  const [status, setStatus] = useState<BookStatus>(book?.status ?? 'to-read');
  const [startDate, setStartDate] = useState(book?.startDate ?? '');
  const [endDate, setEndDate] = useState(book?.endDate ?? '');
  const [saved, setSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pageInput, setPageInput] = useState(String(book?.currentPage ?? 0));

  useEffect(() => {
    if (book) {
      setCurrentPage(book.currentPage);
      setPageInput(String(book.currentPage));
      setRating(book.rating ?? 0);
      setNotes(book.notes ?? '');
      setStatus(book.status);
      setStartDate(book.startDate ?? '');
      setEndDate(book.endDate ?? '');
    }
  }, [book]);

  if (!book) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <span className="material-symbols-outlined text-5xl text-[#c4c6cd] mb-4 block">book_off</span>
        <p className="text-[#43474c] mb-4">Libro non trovato.</p>
        <Link href="/libreria" className="text-[#162b1d] font-semibold underline">Torna alla libreria</Link>
      </div>
    );
  }

  const progress = book.pages > 0 ? Math.round((currentPage / book.pages) * 100) : 0;

  function handleSave() {
    if (!book) return;
    const updates: Partial<typeof book> = { currentPage, rating, notes, status, startDate: startDate || undefined, endDate: endDate || undefined };
    if (status === 'read' && currentPage < book.pages && book.pages > 0) {
      updates.currentPage = book.pages;
      setCurrentPage(book.pages);
      setPageInput(String(book.pages));
    }
    if (status === 'reading' && !startDate) {
      updates.startDate = new Date().toISOString().split('T')[0];
      setStartDate(updates.startDate);
    }
    if (status === 'read' && !endDate) {
      updates.endDate = new Date().toISOString().split('T')[0];
      setEndDate(updates.endDate);
    }
    updateBook(id, updates);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleDelete() {
    deleteBook(id);
    router.push('/libreria');
  }

  function handlePageChange(val: string) {
    setPageInput(val);
    const n = parseInt(val);
    if (!isNaN(n) && n >= 0) {
      const capped = book && book.pages > 0 ? Math.min(n, book.pages) : n;
      setCurrentPage(capped);
    }
  }

  return (
    <>
      <header className="fixed top-0 w-full flex items-center gap-4 px-6 py-4 bg-[#fcf9f4]/80 backdrop-blur-md z-50">
        <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#f0ede8] transition-colors">
          <span className="material-symbols-outlined text-[#162b1d]">arrow_back</span>
        </button>
        <span className="font-serif italic text-xl text-[#162b1d] flex-1 truncate">{book.title}</span>
        <button
          onClick={handleSave}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
            saved ? 'bg-[#d0e9d4] text-[#162b1d]' : 'bg-[#162b1d] text-white'
          }`}
        >
          {saved ? '✓ Salvato' : 'Salva'}
        </button>
      </header>

      <main className="pt-24 pb-32 px-6 max-w-2xl mx-auto">
        {/* Hero copertina + info */}
        <div className="flex gap-6 mb-8">
          <div className="w-32 aspect-[2/3] rounded-xl shadow-lg overflow-hidden flex-shrink-0 bg-[#ebe8e3]">
            {book.cover ? (
              <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="material-symbols-outlined text-[#74777d] text-3xl">menu_book</span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 py-2">
            <h1 className="font-serif text-2xl text-[#162b1d] leading-tight mb-1">{book.title}</h1>
            <p className="text-[#4e6073] mb-2">{book.author}</p>
            {book.publishedYear && (
              <p className="text-xs text-[#74777d] mb-1">{book.publishedYear}</p>
            )}
            {book.pages > 0 && (
              <p className="text-xs text-[#74777d] mb-3">{book.pages} pagine</p>
            )}
            {book.genres && book.genres.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {book.genres.slice(0, 3).map(g => (
                  <span key={g} className="text-[10px] bg-[#cfe2f9] text-[#526478] px-2 py-0.5 rounded-sm uppercase tracking-tighter font-bold">
                    {g}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Status */}
        <div className="bg-[#f6f3ee] rounded-2xl p-5 mb-4">
          <h3 className="text-xs uppercase tracking-widest text-[#4e6073] mb-3">Stato lettura</h3>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(STATUS_LABELS) as BookStatus[]).map(s => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  status === s
                    ? 'bg-[#162b1d] text-white'
                    : 'bg-[#ebe8e3] text-[#43474c] hover:bg-[#e5e2dd]'
                }`}
              >
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        {/* Progresso pagine */}
        {(status === 'reading' || status === 'read') && book.pages > 0 && (
          <div className="bg-[#f6f3ee] rounded-2xl p-5 mb-4">
            <h3 className="text-xs uppercase tracking-widest text-[#4e6073] mb-3">Progresso</h3>
            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center gap-2 flex-1">
                <span className="text-sm text-[#43474c]">Pagina</span>
                <input
                  type="number"
                  value={pageInput}
                  onChange={e => handlePageChange(e.target.value)}
                  min={0}
                  max={book.pages}
                  className="w-20 px-3 py-1.5 bg-[#ebe8e3] rounded-lg text-center font-bold text-[#162b1d] border-none outline-none focus:ring-2 focus:ring-[#162b1d]/20 text-sm"
                />
                <span className="text-sm text-[#74777d]">di {book.pages}</span>
              </div>
              <span className="font-serif text-2xl font-bold text-[#162b1d]">{progress}%</span>
            </div>
            <div className="h-2 w-full bg-[#d0e9d4] rounded-full overflow-hidden">
              <div className="h-full bg-[#162b1d] rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            {/* Quick +10 */}
            <div className="flex gap-2 mt-3 flex-wrap">
              {[10, 25, 50].map(n => (
                <button
                  key={n}
                  onClick={() => {
                    const next = Math.min(currentPage + n, book.pages);
                    setCurrentPage(next);
                    setPageInput(String(next));
                  }}
                  className="px-3 py-1 bg-[#ebe8e3] text-[#43474c] rounded-lg text-xs font-semibold hover:bg-[#e5e2dd] transition-colors"
                >
                  +{n} pag.
                </button>
              ))}
              <button
                onClick={() => { setCurrentPage(book.pages); setPageInput(String(book.pages)); setStatus('read'); }}
                className="px-3 py-1 bg-[#d0e9d4] text-[#162b1d] rounded-lg text-xs font-semibold hover:bg-[#b4cdb8] transition-colors"
              >
                Finito! ✓
              </button>
            </div>
          </div>
        )}

        {/* Date */}
        <div className="bg-[#f6f3ee] rounded-2xl p-5 mb-4">
          <h3 className="text-xs uppercase tracking-widest text-[#4e6073] mb-3">Date</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[#43474c] block mb-1.5">Inizio lettura</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#ebe8e3] rounded-lg text-sm border-none outline-none focus:ring-2 focus:ring-[#162b1d]/20 text-[#1c1c19]"
              />
            </div>
            <div>
              <label className="text-xs text-[#43474c] block mb-1.5">Fine lettura</label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#ebe8e3] rounded-lg text-sm border-none outline-none focus:ring-2 focus:ring-[#162b1d]/20 text-[#1c1c19]"
              />
            </div>
          </div>
        </div>

        {/* Valutazione */}
        <div className="bg-[#f6f3ee] rounded-2xl p-5 mb-4">
          <h3 className="text-xs uppercase tracking-widest text-[#4e6073] mb-3">Valutazione</h3>
          <RatingStars value={rating} onChange={setRating} size="md" />
        </div>

        {/* Note */}
        <div className="bg-[#f6f3ee] rounded-2xl p-5 mb-4">
          <h3 className="text-xs uppercase tracking-widest text-[#4e6073] mb-3">Note personali</h3>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Pensieri, citazioni, impressioni..."
            rows={4}
            className="w-full px-4 py-3 bg-[#ebe8e3] rounded-xl text-sm border-none outline-none focus:ring-2 focus:ring-[#162b1d]/20 text-[#1c1c19] placeholder:text-[#74777d] resize-none"
          />
        </div>

        {/* Descrizione */}
        {book.description && (
          <div className="bg-[#f6f3ee] rounded-2xl p-5 mb-6">
            <h3 className="text-xs uppercase tracking-widest text-[#4e6073] mb-3">Descrizione</h3>
            <p className="text-sm text-[#43474c] leading-relaxed line-clamp-6">{book.description}</p>
          </div>
        )}

        {/* Salva */}
        <button
          onClick={handleSave}
          className={`w-full py-4 rounded-full font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 mb-4 ${
            saved ? 'bg-[#d0e9d4] text-[#162b1d]' : 'bg-[#162b1d] text-white shadow-[0px_12px_32px_rgba(28,28,25,0.1)]'
          }`}
        >
          <span className="material-symbols-outlined">{saved ? 'check_circle' : 'save'}</span>
          {saved ? 'Salvato!' : 'Salva modifiche'}
        </button>

        {/* Elimina */}
        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            className="w-full py-3 rounded-full text-[#ba1a1a] text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#ffdad6] transition-colors"
          >
            <span className="material-symbols-outlined text-sm">delete</span>
            Rimuovi dalla libreria
          </button>
        ) : (
          <div className="bg-[#ffdad6] rounded-2xl p-4 text-center">
            <p className="text-sm text-[#93000a] mb-3">Sicuro di voler rimuovere &ldquo;{book.title}&rdquo;?</p>
            <div className="flex gap-3 justify-center">
              <button onClick={handleDelete} className="px-5 py-2 bg-[#ba1a1a] text-white rounded-full text-sm font-semibold">
                Sì, rimuovi
              </button>
              <button onClick={() => setConfirmDelete(false)} className="px-5 py-2 bg-[#ebe8e3] text-[#43474c] rounded-full text-sm font-semibold">
                Annulla
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
