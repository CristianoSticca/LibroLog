'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useBooks } from '@/context/BooksContext';

interface Props {
  initialIsbn?: string;
  onClose: () => void;
}

export default function AddBookManuallyModal({ initialIsbn = '', onClose }: Props) {
  const router = useRouter();
  const { addBook } = useBooks();

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [isbn, setIsbn] = useState(initialIsbn);
  const [pages, setPages] = useState('');
  const [year, setYear] = useState('');
  const [coverMode, setCoverMode] = useState<'url' | 'photo'>('url');
  const [coverUrl, setCoverUrl] = useState('');
  const [coverBase64, setCoverBase64] = useState('');
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isValid = title.trim() !== '' && author.trim() !== '';

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCoverBase64(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(status: 'reading' | 'to-read') {
    if (!isValid) return;
    setSaving(true);
    const cover = coverMode === 'url' ? coverUrl.trim() : coverBase64;
    await addBook({
      title: title.trim(),
      author: author.trim(),
      cover,
      pages: pages ? parseInt(pages) : 0,
      currentPage: 0,
      status,
      startDate: status === 'reading' ? new Date().toISOString().split('T')[0] : undefined,
      isbn: isbn.trim() || undefined,
      publishedYear: year ? parseInt(year) : undefined,
    });
    setSaving(false);
    onClose();
    if (status === 'reading') router.push('/');
    else router.push('/libreria');
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#fcf9f4] dark:bg-[#121210]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#ebe8e3] dark:border-[#2c2c28]">
        <h2 className="font-serif text-xl text-[#162b1d] dark:text-[#b4cdb8]">Aggiungi manualmente</h2>
        <button
          onClick={onClose}
          className="text-[#74777d] hover:text-[#1c1c19] dark:hover:text-[#e5e2dd] transition-colors"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 max-w-lg mx-auto w-full">
        {/* Titolo */}
        <div>
          <label className="block text-xs font-semibold text-[#43474c] dark:text-[#95ad9a] mb-1">
            Titolo <span className="text-[#b05a3a]">*</span>
          </label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Es. Il nome della rosa"
            className="w-full px-4 py-3 bg-[#ebe8e3] dark:bg-[#2c2c28] rounded-xl text-sm text-[#1c1c19] dark:text-[#e5e2dd] placeholder:text-[#74777d] outline-none focus:ring-2 focus:ring-[#162b1d]/20 dark:focus:ring-[#b4cdb8]/20"
          />
        </div>

        {/* Autore */}
        <div>
          <label className="block text-xs font-semibold text-[#43474c] dark:text-[#95ad9a] mb-1">
            Autore <span className="text-[#b05a3a]">*</span>
          </label>
          <input
            value={author}
            onChange={e => setAuthor(e.target.value)}
            placeholder="Es. Umberto Eco"
            className="w-full px-4 py-3 bg-[#ebe8e3] dark:bg-[#2c2c28] rounded-xl text-sm text-[#1c1c19] dark:text-[#e5e2dd] placeholder:text-[#74777d] outline-none focus:ring-2 focus:ring-[#162b1d]/20 dark:focus:ring-[#b4cdb8]/20"
          />
        </div>

        {/* ISBN */}
        <div>
          <label className="block text-xs font-semibold text-[#43474c] dark:text-[#95ad9a] mb-1">ISBN</label>
          <input
            value={isbn}
            onChange={e => setIsbn(e.target.value)}
            placeholder="Es. 9788807823237"
            className="w-full px-4 py-3 bg-[#ebe8e3] dark:bg-[#2c2c28] rounded-xl text-sm text-[#1c1c19] dark:text-[#e5e2dd] placeholder:text-[#74777d] outline-none focus:ring-2 focus:ring-[#162b1d]/20 dark:focus:ring-[#b4cdb8]/20"
          />
        </div>

        {/* Pagine + Anno */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-[#43474c] dark:text-[#95ad9a] mb-1">Pagine</label>
            <input
              value={pages}
              onChange={e => setPages(e.target.value.replace(/\D/g, ''))}
              placeholder="Es. 320"
              inputMode="numeric"
              className="w-full px-4 py-3 bg-[#ebe8e3] dark:bg-[#2c2c28] rounded-xl text-sm text-[#1c1c19] dark:text-[#e5e2dd] placeholder:text-[#74777d] outline-none focus:ring-2 focus:ring-[#162b1d]/20 dark:focus:ring-[#b4cdb8]/20"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-semibold text-[#43474c] dark:text-[#95ad9a] mb-1">Anno</label>
            <input
              value={year}
              onChange={e => setYear(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="Es. 1980"
              inputMode="numeric"
              className="w-full px-4 py-3 bg-[#ebe8e3] dark:bg-[#2c2c28] rounded-xl text-sm text-[#1c1c19] dark:text-[#e5e2dd] placeholder:text-[#74777d] outline-none focus:ring-2 focus:ring-[#162b1d]/20 dark:focus:ring-[#b4cdb8]/20"
            />
          </div>
        </div>

        {/* Copertina */}
        <div>
          <label className="block text-xs font-semibold text-[#43474c] dark:text-[#95ad9a] mb-2">Copertina</label>
          <div className="flex gap-1 bg-[#ebe8e3] dark:bg-[#2c2c28] rounded-full p-0.5 w-fit mb-3">
            <button
              onClick={() => setCoverMode('url')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                coverMode === 'url'
                  ? 'bg-[#162b1d] text-white'
                  : 'text-[#43474c] dark:text-[#95ad9a]'
              }`}
            >
              URL
            </button>
            <button
              onClick={() => setCoverMode('photo')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                coverMode === 'photo'
                  ? 'bg-[#162b1d] text-white'
                  : 'text-[#43474c] dark:text-[#95ad9a]'
              }`}
            >
              Foto
            </button>
          </div>

          {coverMode === 'url' ? (
            <input
              value={coverUrl}
              onChange={e => setCoverUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-3 bg-[#ebe8e3] dark:bg-[#2c2c28] rounded-xl text-sm text-[#1c1c19] dark:text-[#e5e2dd] placeholder:text-[#74777d] outline-none focus:ring-2 focus:ring-[#162b1d]/20 dark:focus:ring-[#b4cdb8]/20"
            />
          ) : (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
              {coverBase64 ? (
                <div className="flex items-center gap-3">
                  <img src={coverBase64} alt="Copertina" className="w-12 aspect-[2/3] object-cover rounded-lg" />
                  <button
                    onClick={() => { setCoverBase64(''); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                    className="text-xs text-[#74777d] hover:text-[#b05a3a] transition-colors"
                  >
                    Rimuovi
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-3 bg-[#ebe8e3] dark:bg-[#2c2c28] rounded-xl text-sm text-[#43474c] dark:text-[#95ad9a] w-full"
                >
                  <span className="material-symbols-outlined text-lg">add_photo_alternate</span>
                  Scegli immagine
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer con bottoni azione */}
      <div className="px-4 pb-8 pt-3 border-t border-[#ebe8e3] dark:border-[#2c2c28] space-y-2 max-w-lg mx-auto w-full">
        <button
          onClick={() => handleSubmit('reading')}
          disabled={!isValid || saving}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#162b1d] text-white rounded-full font-semibold disabled:opacity-40 transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-sm">auto_stories</span>
          {saving ? 'Aggiungendo...' : 'Inizia a leggere'}
        </button>
        <button
          onClick={() => handleSubmit('to-read')}
          disabled={!isValid || saving}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#cfe2f9] text-[#526478] rounded-full font-semibold disabled:opacity-40 transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-sm">bookmark_add</span>
          {saving ? 'Aggiungendo...' : 'Da leggere'}
        </button>
      </div>
    </div>
  );
}
