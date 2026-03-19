import { Book } from './types';

const STORAGE_KEY = 'librologbooks';

export function getBooks(): Book[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveBooks(books: Book[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
}

export function addBook(book: Book): Book[] {
  const books = getBooks();
  const updated = [...books, book];
  saveBooks(updated);
  return updated;
}

export function updateBook(id: string, changes: Partial<Book>): Book[] {
  const books = getBooks();
  const updated = books.map(b => b.id === id ? { ...b, ...changes } : b);
  saveBooks(updated);
  return updated;
}

export function deleteBook(id: string): Book[] {
  const books = getBooks();
  const updated = books.filter(b => b.id !== id);
  saveBooks(updated);
  return updated;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
