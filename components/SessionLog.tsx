'use client';

import { useState } from 'react';
import { useReadingSessions } from '@/context/ReadingSessionsContext';

interface SessionLogProps {
  bookId: string;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function SessionLog({ bookId }: SessionLogProps) {
  const { getSessionsForBook } = useReadingSessions();
  const sessions = getSessionsForBook(bookId);

  const [expanded, setExpanded] = useState(sessions.length <= 3);

  if (sessions.length === 0) return null;

  return (
    <div className="bg-[#f6f3ee] rounded-2xl p-5 mb-4">
      {/* Header */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between"
      >
        <h3 className="text-xs uppercase tracking-widest text-[#4e6073]">Sessioni di lettura</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-[#ebe8e3] text-[#43474c] px-2 py-0.5 rounded-full font-semibold">
            {sessions.length}
          </span>
          <span
            className="material-symbols-outlined text-[#4e6073] transition-transform"
            style={{ fontSize: '18px', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            expand_more
          </span>
        </div>
      </button>

      {/* Lista sessioni */}
      {expanded && (
        <div className="mt-3 space-y-2 max-h-72 overflow-y-auto pr-1">
          {sessions.map(s => {
            const pph = s.minutes && s.minutes > 0
              ? Math.round((s.pagesRead / s.minutes) * 60)
              : null;
            return (
              <div key={s.id} className="flex items-center justify-between bg-[#ebe8e3] rounded-xl px-4 py-2.5">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#4e6073]" style={{ fontSize: '16px' }}>
                    menu_book
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-[#162b1d]">
                      +{s.pagesRead} pag.
                      <span className="text-[#74777d] font-normal ml-1">
                        (pag. {s.startPage}→{s.endPage})
                      </span>
                    </p>
                    <p className="text-[10px] text-[#74777d]">{formatDate(s.sessionDate)}</p>
                  </div>
                </div>
                {s.minutes ? (
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-[#43474c] font-medium">{s.minutes} min</p>
                    {pph !== null && (
                      <p className="text-[10px] text-[#74777d]">{pph} pag/h</p>
                    )}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
