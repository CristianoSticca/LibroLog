export type BookStatus = 'reading' | 'read' | 'to-read' | 'dropped';

export interface Book {
  id: string;
  title: string;
  author: string;
  cover: string;        // URL copertina
  pages: number;
  currentPage: number;  // pagina corrente (per libri in lettura)
  status: BookStatus;
  startDate?: string;   // ISO date string
  endDate?: string;     // ISO date string
  rating?: number;      // 1-5
  notes?: string;
  googleBooksId?: string;
  openLibraryKey?: string;
  isbn?: string;
  description?: string;
  publisher?: string;
  publishedYear?: number;
  genres?: string[];
  addedAt: string;      // ISO date string
}

export interface GoogleBooksVolume {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    description?: string;
    imageLinks?: { thumbnail?: string; smallThumbnail?: string };
    pageCount?: number;
    publishedDate?: string;
    publisher?: string;
    categories?: string[];
    industryIdentifiers?: { type: string; identifier: string }[];
  };
}

export interface ReadingSession {
  id: string;
  bookId: string;
  sessionDate: string;  // YYYY-MM-DD
  startPage: number;
  endPage: number;
  pagesRead: number;    // endPage - startPage
  minutes?: number;
  createdAt: string;
}

export type AnnotationType = 'highlight' | 'text' | 'freehand';

export interface Annotation {
  id: string;
  type: AnnotationType;
  x: number;
  y: number;
  width?: number;
  height?: number;
  text?: string;
  points?: number[];
  color: string;
}

export interface BookPhoto {
  id: string;
  bookId: string;
  userId: string;
  storageUrl: string;
  storagePath: string;
  note?: string;
  pageNumber?: number;
  annotations: Annotation[];
  createdAt: string;
}

export interface OpenLibraryDoc {
  key: string;
  title: string;
  author_name?: string[];
  cover_i?: number;
  number_of_pages_median?: number;
  first_publish_year?: number;
  publisher?: string[];
  subject?: string[];
  isbn?: string[];
}
