'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Book, BookStatus } from '@/lib/types';
import { getBooks, saveBooks, generateId } from '@/lib/storage';

interface BooksContextValue {
  books: Book[];
  addBook: (book: Omit<Book, 'id' | 'addedAt'>) => void;
  updateBook: (id: string, changes: Partial<Book>) => void;
  deleteBook: (id: string) => void;
  getBook: (id: string) => Book | undefined;
  booksByStatus: (status: BookStatus) => Book[];
}

const BooksContext = createContext<BooksContextValue | null>(null);

export function BooksProvider({ children }: { children: ReactNode }) {
  const [books, setBooks] = useState<Book[]>([]);

  useEffect(() => {
    setBooks(getBooks());
  }, []);

  function addBook(data: Omit<Book, 'id' | 'addedAt'>) {
    const book: Book = { ...data, id: generateId(), addedAt: new Date().toISOString() };
    const updated = [...books, book];
    setBooks(updated);
    saveBooks(updated);
  }

  function updateBook(id: string, changes: Partial<Book>) {
    const updated = books.map(b => b.id === id ? { ...b, ...changes } : b);
    setBooks(updated);
    saveBooks(updated);
  }

  function deleteBook(id: string) {
    const updated = books.filter(b => b.id !== id);
    setBooks(updated);
    saveBooks(updated);
  }

  function getBook(id: string) {
    return books.find(b => b.id === id);
  }

  function booksByStatus(status: BookStatus) {
    return books.filter(b => b.status === status);
  }

  return (
    <BooksContext.Provider value={{ books, addBook, updateBook, deleteBook, getBook, booksByStatus }}>
      {children}
    </BooksContext.Provider>
  );
}

export function useBooks() {
  const ctx = useContext(BooksContext);
  if (!ctx) throw new Error('useBooks must be used within BooksProvider');
  return ctx;
}
