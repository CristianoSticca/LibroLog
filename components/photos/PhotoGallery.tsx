'use client';

import { useEffect, useRef, useState } from 'react';
import { BookPhoto } from '@/lib/types';
import { useBookPhotos } from '@/context/BookPhotosContext';
import PhotoCard from './PhotoCard';
import PhotoAnnotationEditor from './PhotoAnnotationEditor';

interface Props {
  bookId: string;
}

export default function PhotoGallery({ bookId }: Props) {
  const { loadPhotos, addPhoto, deletePhoto, getPhotosForBook, loading, uploading } = useBookPhotos();
  const [selectedPhoto, setSelectedPhoto] = useState<BookPhoto | null>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadPhotos(bookId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId]);

  const photos = getPhotosForBook(bookId);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    await addPhoto(bookId, file);
    // reset so same file can be re-selected
    e.target.value = '';
  }

  if (loading) {
    return (
      <div className="px-4 pt-4 grid grid-cols-2 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="aspect-[3/4] rounded-2xl bg-[#f0ede8] dark:bg-[#1e1e1b] animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="px-4 pt-4 pb-32">
        {/* Upload buttons */}
        {uploading ? (
          <div className="w-full flex items-center justify-center gap-2 py-3 mb-4 rounded-2xl border-2 border-dashed border-[#b4cdb8] dark:border-[#2e3d30] text-[#162b1d] dark:text-[#b4cdb8] font-semibold text-sm opacity-60">
            <span className="material-symbols-outlined text-xl animate-spin">progress_activity</span>
            Caricamento...
          </div>
        ) : (
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => cameraRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-[#b4cdb8] dark:border-[#2e3d30] text-[#162b1d] dark:text-[#b4cdb8] font-semibold text-sm transition-colors hover:bg-[#eaf0eb] dark:hover:bg-[#1a261c]"
            >
              <span className="material-symbols-outlined text-xl">add_a_photo</span>
              Fotocamera
            </button>
            <button
              onClick={() => galleryRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-[#b4cdb8] dark:border-[#2e3d30] text-[#162b1d] dark:text-[#b4cdb8] font-semibold text-sm transition-colors hover:bg-[#eaf0eb] dark:hover:bg-[#1a261c]"
            >
              <span className="material-symbols-outlined text-xl">photo_library</span>
              Galleria
            </button>
          </div>
        )}

        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />
        <input
          ref={galleryRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Grid */}
        {photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="material-symbols-outlined text-5xl text-[#c4c6cd] dark:text-[#4a4a47] mb-3 block">
              camera_alt
            </span>
            <p className="text-[#74777d] text-sm">Fotografa le pagine più importanti</p>
            <p className="text-[#c4c6cd] dark:text-[#4a4a47] text-xs mt-1">Le foto vengono compresse automaticamente</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {photos.map(photo => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                onClick={setSelectedPhoto}
                onDelete={deletePhoto}
              />
            ))}
          </div>
        )}
      </div>

      {/* Editor overlay */}
      {selectedPhoto && (
        <PhotoAnnotationEditor
          photo={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
        />
      )}
    </>
  );
}
