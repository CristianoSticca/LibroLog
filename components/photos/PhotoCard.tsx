'use client';

import { useState } from 'react';
import { BookPhoto } from '@/lib/types';

interface Props {
  photo: BookPhoto;
  onClick: (photo: BookPhoto) => void;
  onDelete: (photoId: string) => void;
}

export default function PhotoCard({ photo, onClick, onDelete }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="relative group rounded-2xl overflow-hidden bg-[#f0ede8] dark:bg-[#1e1e1b] shadow-sm">
      {/* Thumbnail */}
      <button
        onClick={() => onClick(photo)}
        className="w-full aspect-[3/4] block"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.storageUrl}
          alt={photo.note ?? 'Appunto fotografico'}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </button>

      {/* Page badge */}
      {photo.pageNumber && (
        <span className="absolute top-2 left-2 bg-black/50 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
          p. {photo.pageNumber}
        </span>
      )}

      {/* Annotations badge */}
      {photo.annotations.length > 0 && (
        <span className="absolute top-2 right-2 bg-[#162b1d]/70 text-[#b4cdb8] text-[10px] font-semibold px-2 py-0.5 rounded-full">
          {photo.annotations.length} note
        </span>
      )}

      {/* Note + delete */}
      <div className="px-3 py-2">
        {photo.note && (
          <p className="text-xs text-[#43474c] dark:text-[#9e9e9b] line-clamp-2 mb-1">{photo.note}</p>
        )}
        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            className="text-[#c4c6cd] hover:text-red-400 transition-colors"
            title="Elimina"
          >
            <span className="material-symbols-outlined text-base">delete</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#74777d]">Elimina?</span>
            <button
              onClick={() => onDelete(photo.id)}
              className="text-[10px] font-semibold text-red-400 hover:text-red-500"
            >
              Sì
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="text-[10px] text-[#74777d] hover:text-[#43474c]"
            >
              No
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
