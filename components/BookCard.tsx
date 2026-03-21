'use client';

import Link from 'next/link';
import { Book } from '@/lib/types';

const STATUS_LABELS: Record<string, string> = {
  reading: 'In Lettura',
  read: 'Completato',
  'to-read': 'Da Leggere',
  dropped: 'Abbandonato',
};

const STATUS_COLORS: Record<string, string> = {
  reading: 'text-[#162b1d] bg-[#fcf9f4]/90',
  read: 'text-[#4e6073] bg-[#e5e2dd]/90',
  'to-read': 'text-[#392117] bg-[#ffdbce]/90',
  dropped: 'text-[#74777d] bg-[#f0ede8]/90',
};

interface BookCardProps {
  book: Book;
  showStatus?: boolean;
}

export default function BookCard({ book, showStatus = true }: BookCardProps) {
  const progress = book.pages > 0 ? Math.round((book.currentPage / book.pages) * 100) : 0;

  const amazonUrl = `https://www.amazon.it/s?k=${encodeURIComponent(`${book.title} ${book.author}`)}&i=stripbooks`;

  return (
    <div className="group cursor-pointer">
      <Link href={`/libro/${book.id}`}>
        <div className="relative aspect-[2/3] rounded-lg bg-[#f0ede8] overflow-hidden transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-[0px_12px_32px_rgba(28,28,25,0.1)]">
          {book.cover ? (
            <img
              src={book.cover}
              alt={book.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-[#ebe8e3]">
              <span className="material-symbols-outlined text-4xl text-[#74777d] mb-2">menu_book</span>
              <span className="text-[10px] text-[#74777d] text-center font-medium leading-tight">{book.title}</span>
            </div>
          )}
          {showStatus && (
            <div className={`absolute top-3 right-3 px-2 py-1 backdrop-blur-sm rounded-md shadow-sm ${STATUS_COLORS[book.status]}`}>
              <span className="text-[10px] font-bold uppercase tracking-tighter">
                {book.status === 'reading' && progress > 0 ? `${progress}% letto` : STATUS_LABELS[book.status]}
              </span>
            </div>
          )}
          {book.status === 'reading' && progress > 0 && (
            <div className="absolute bottom-0 left-0 w-full h-1 bg-[#d0e9d4]">
              <div className="h-full bg-[#162b1d] rounded-full" style={{ width: `${progress}%` }} />
            </div>
          )}
        </div>
        <div className="mt-4 space-y-1">
          <h3 className="font-serif text-lg leading-tight text-[#1c1c19] group-hover:text-[#162b1d] transition-colors line-clamp-2">
            {book.title}
          </h3>
          <p className="text-sm text-[#4e6073] truncate">{book.author}</p>
        </div>
      </Link>
      {book.status !== 'dropped' && (
        <a
          href={amazonUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 flex items-center gap-1 text-xs text-[#74777d] hover:text-[#1c1c19] transition-colors"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>shopping_cart</span>
          Acquista su Amazon
        </a>
      )}
    </div>
  );
}
