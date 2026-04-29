'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { BookPhoto, Annotation, AnnotationType } from '@/lib/types';
import { useBookPhotos } from '@/context/BookPhotosContext';

const AnnotationCanvas = dynamic(() => import('./AnnotationCanvas'), {
  ssr: false,
  loading: () => <div className="flex-1 bg-black animate-pulse" />,
});

interface Props {
  photo: BookPhoto;
  onClose: () => void;
}

const COLORS = ['#facc15', '#86efac', '#93c5fd', '#fca5a5'];
const TOOLS: { id: AnnotationType | 'eraser'; icon: string; label: string }[] = [
  { id: 'highlight', icon: 'ink_highlighter', label: 'Evidenzia' },
  { id: 'text',      icon: 'text_fields',    label: 'Testo' },
  { id: 'freehand',  icon: 'draw',           label: 'Disegno' },
  { id: 'eraser',    icon: 'ink_eraser',     label: 'Cancella' },
];

export default function PhotoAnnotationEditor({ photo, onClose }: Props) {
  const { updateAnnotations } = useBookPhotos();
  const [annotations, setAnnotations] = useState<Annotation[]>(photo.annotations);
  const [history, setHistory] = useState<Annotation[][]>([photo.annotations]);
  const [activeTool, setActiveTool] = useState<AnnotationType | 'eraser'>('highlight');
  const [activeColor, setActiveColor] = useState(COLORS[0]);
  const [saving, setSaving] = useState(false);

  function handleChange(next: Annotation[]) {
    setHistory(h => [...h, annotations]);
    setAnnotations(next);
  }

  function undo() {
    if (history.length <= 1) return;
    const prev = history[history.length - 1];
    setHistory(h => h.slice(0, -1));
    setAnnotations(prev);
  }

  async function handleSave() {
    setSaving(true);
    await updateAnnotations(photo.id, annotations);
    setSaving(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#0d0d0b]">
        <button
          onClick={onClose}
          className="flex items-center gap-1 text-[#b4cdb8] text-sm font-medium"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Chiudi
        </button>
        {photo.note && (
          <p className="text-[#74777d] text-xs truncate max-w-[40%]">{photo.note}</p>
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#162b1d] text-[#b4cdb8] text-sm font-semibold px-4 py-1.5 rounded-full disabled:opacity-50"
        >
          {saving ? 'Salvo...' : 'Salva'}
        </button>
      </div>

      {/* Canvas */}
      <AnnotationCanvas
        imageUrl={photo.storageUrl}
        annotations={annotations}
        activeTool={activeTool}
        activeColor={activeColor}
        onChange={handleChange}
      />

      {/* Bottom toolbar */}
      <div className="bg-[#0d0d0b] px-4 py-3 flex items-center gap-3 safe-area-bottom">
        {/* Tools */}
        <div className="flex gap-1 flex-1">
          {TOOLS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTool(t.id)}
              title={t.label}
              className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-colors ${
                activeTool === t.id
                  ? 'bg-[#162b1d] text-[#b4cdb8]'
                  : 'text-[#74777d] hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-xl">{t.icon}</span>
            </button>
          ))}
          <button
            onClick={undo}
            title="Annulla"
            className="flex flex-col items-center justify-center w-12 h-12 rounded-xl text-[#74777d] hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-xl">undo</span>
          </button>
        </div>

        {/* Color swatches */}
        <div className="flex gap-2">
          {COLORS.map(c => (
            <button
              key={c}
              onClick={() => setActiveColor(c)}
              className={`w-7 h-7 rounded-full border-2 transition-transform ${
                activeColor === c ? 'border-white scale-110' : 'border-transparent'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
