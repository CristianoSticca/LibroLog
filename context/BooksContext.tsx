'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { Book, BookStatus } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { generateId } from '@/lib/storage';

interface BooksContextValue {
  books: Book[];
  user: User | null;
  loading: boolean;
  addBook: (book: Omit<Book, 'id' | 'addedAt'>) => Promise<void>;
  updateBook: (id: string, changes: Partial<Book>) => Promise<void>;
  deleteBook: (id: string) => Promise<void>;
  getBook: (id: string) => Book | undefined;
  booksByStatus: (status: BookStatus) => Book[];
  signOut: () => Promise<void>;
}

const BooksContext = createContext<BooksContextValue | null>(null);

function toRow(book: Book, userId: string) {
  return {
    id: book.id,
    user_id: userId,
    title: book.title,
    author: book.author,
    cover: book.cover,
    pages: book.pages,
    current_page: book.currentPage,
    status: book.status,
    start_date: book.startDate ?? null,
    end_date: book.endDate ?? null,
    rating: book.rating ?? null,
    notes: book.notes ?? null,
    google_books_id: book.googleBooksId ?? null,
    isbn: book.isbn ?? null,
    description: book.description ?? null,
    publisher: book.publisher ?? null,
    published_year: book.publishedYear ?? null,
    genres: book.genres ?? null,
    added_at: book.addedAt,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromRow(row: any): Book {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    cover: row.cover ?? '',
    pages: row.pages ?? 0,
    currentPage: row.current_page ?? 0,
    status: row.status as BookStatus,
    startDate: row.start_date ?? undefined,
    endDate: row.end_date ?? undefined,
    rating: row.rating ?? undefined,
    notes: row.notes ?? undefined,
    googleBooksId: row.google_books_id ?? undefined,
    isbn: row.isbn ?? undefined,
    description: row.description ?? undefined,
    publisher: row.publisher ?? undefined,
    publishedYear: row.published_year ?? undefined,
    genres: row.genres ?? undefined,
    addedAt: row.added_at,
  };
}

export function BooksProvider({ children }: { children: ReactNode }) {
  const [books, setBooks] = useState<Book[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) fetchBooks(user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) fetchBooks(u.id);
      else { setBooks([]); setLoading(false); }
    });

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchBooks(userId: string) {
    setLoading(true);
    const { data } = await supabase
      .from('books')
      .select('*')
      .eq('user_id', userId)
      .order('added_at', { ascending: false });
    setBooks((data ?? []).map(fromRow));

    // Migra localStorage se ci sono dati e il DB è vuoto
    if ((data ?? []).length === 0) {
      try {
        const raw = localStorage.getItem('librologbooks');
        if (raw) {
          const localBooks: Book[] = JSON.parse(raw);
          if (localBooks.length > 0) {
            const rows = localBooks.map(b => toRow(b, userId));
            await supabase.from('books').insert(rows);
            setBooks(localBooks);
            localStorage.removeItem('librologbooks');
          }
        }
      } catch {}
    }

    setLoading(false);
  }

  async function addBook(data: Omit<Book, 'id' | 'addedAt'>) {
    if (!user) return;
    const book: Book = { ...data, id: generateId(), addedAt: new Date().toISOString() };
    setBooks(prev => [book, ...prev]);
    await supabase.from('books').insert(toRow(book, user.id));
  }

  async function updateBook(id: string, changes: Partial<Book>) {
    if (!user) return;
    setBooks(prev => prev.map(b => b.id === id ? { ...b, ...changes } : b));
    const book = books.find(b => b.id === id);
    if (!book) return;
    const updated = { ...book, ...changes };
    await supabase.from('books').update(toRow(updated, user.id)).eq('id', id);
  }

  async function deleteBook(id: string) {
    if (!user) return;
    setBooks(prev => prev.filter(b => b.id !== id));
    await supabase.from('books').delete().eq('id', id);
  }

  function getBook(id: string) {
    return books.find(b => b.id === id);
  }

  function booksByStatus(status: BookStatus) {
    return books.filter(b => b.status === status);
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <BooksContext.Provider value={{ books, user, loading, addBook, updateBook, deleteBook, getBook, booksByStatus, signOut }}>
      {children}
    </BooksContext.Provider>
  );
}

export function useBooks() {
  const ctx = useContext(BooksContext);
  if (!ctx) throw new Error('useBooks must be used within BooksProvider');
  return ctx;
}
