'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { BookPhoto, Annotation } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { generateId } from '@/lib/storage';

const MAX_SIZE_PX = 1600;
const JPEG_QUALITY = 0.82;

async function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > MAX_SIZE_PX || height > MAX_SIZE_PX) {
        if (width > height) {
          height = Math.round((height / width) * MAX_SIZE_PX);
          width = MAX_SIZE_PX;
        } else {
          width = Math.round((width / height) * MAX_SIZE_PX);
          height = MAX_SIZE_PX;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Compression failed'));
        },
        'image/jpeg',
        JPEG_QUALITY,
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image load failed')); };
    img.src = url;
  });
}

interface BookPhotosContextValue {
  photos: BookPhoto[];
  loading: boolean;
  uploading: boolean;
  loadPhotos: (bookId: string) => Promise<void>;
  addPhoto: (bookId: string, file: File, note?: string, pageNumber?: number) => Promise<void>;
  updateAnnotations: (photoId: string, annotations: Annotation[]) => Promise<void>;
  deletePhoto: (photoId: string) => Promise<void>;
  getPhotosForBook: (bookId: string) => BookPhoto[];
}

const BookPhotosContext = createContext<BookPhotosContextValue | null>(null);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromRow(row: any): BookPhoto {
  return {
    id: row.id,
    bookId: row.book_id,
    userId: row.user_id,
    storageUrl: row.storage_url,
    storagePath: row.storage_path,
    note: row.note ?? undefined,
    pageNumber: row.page_number ?? undefined,
    annotations: row.annotations ?? [],
    createdAt: row.created_at,
  };
}

export function BookPhotosProvider({ children }: { children: ReactNode }) {
  const [photos, setPhotos] = useState<BookPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const supabase = createClient();

  async function loadPhotos(bookId: string) {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const { data } = await supabase
      .from('book_photos')
      .select('*')
      .eq('book_id', bookId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setPhotos((data ?? []).map(fromRow));
    setLoading(false);
  }

  async function addPhoto(bookId: string, file: File, note?: string, pageNumber?: number) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setUploading(true);
    try {
      const compressed = await compressImage(file);
      const photoId = generateId();
      const storagePath = `${user.id}/${bookId}/${photoId}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('book-photos')
        .upload(storagePath, compressed, { contentType: 'image/jpeg', upsert: false });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('book-photos')
        .getPublicUrl(storagePath);

      const photo: BookPhoto = {
        id: photoId,
        bookId,
        userId: user.id,
        storageUrl: publicUrl,
        storagePath,
        note,
        pageNumber,
        annotations: [],
        createdAt: new Date().toISOString(),
      };

      const { error: dbError } = await supabase.from('book_photos').insert({
        id: photo.id,
        user_id: photo.userId,
        book_id: photo.bookId,
        storage_path: photo.storagePath,
        storage_url: photo.storageUrl,
        note: photo.note ?? null,
        page_number: photo.pageNumber ?? null,
        annotations: [],
        created_at: photo.createdAt,
      });
      if (dbError) throw dbError;

      setPhotos(prev => [photo, ...prev]);
    } finally {
      setUploading(false);
    }
  }

  async function updateAnnotations(photoId: string, annotations: Annotation[]) {
    await supabase
      .from('book_photos')
      .update({ annotations })
      .eq('id', photoId);
    setPhotos(prev =>
      prev.map(p => p.id === photoId ? { ...p, annotations } : p)
    );
  }

  async function deletePhoto(photoId: string) {
    const photo = photos.find(p => p.id === photoId);
    if (!photo) return;
    await supabase.storage.from('book-photos').remove([photo.storagePath]);
    await supabase.from('book_photos').delete().eq('id', photoId);
    setPhotos(prev => prev.filter(p => p.id !== photoId));
  }

  function getPhotosForBook(bookId: string): BookPhoto[] {
    return photos.filter(p => p.bookId === bookId);
  }

  return (
    <BookPhotosContext.Provider value={{ photos, loading, uploading, loadPhotos, addPhoto, updateAnnotations, deletePhoto, getPhotosForBook }}>
      {children}
    </BookPhotosContext.Provider>
  );
}

export function useBookPhotos() {
  const ctx = useContext(BookPhotosContext);
  if (!ctx) throw new Error('useBookPhotos must be used within BookPhotosProvider');
  return ctx;
}
