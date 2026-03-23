'use client';

import { useReadingSessions } from '@/context/ReadingSessionsContext';

export default function StreakBadge() {
  const { streakDays } = useReadingSessions();

  if (streakDays === 0) return null;

  return (
    <div className="bg-[#392117] rounded-xl p-6 flex flex-col justify-between">
      <span className="text-xs uppercase tracking-widest text-[#c4a882]">Striscia attiva</span>
      <div className="flex items-end gap-2 mt-2">
        <span className="font-serif text-5xl font-bold text-white">{streakDays}</span>
        <div className="flex items-center gap-1 mb-1">
          <span className="material-symbols-outlined text-[#f4a832]" style={{ fontSize: '24px', fontVariationSettings: "'FILL' 1" }}>
            local_fire_department
          </span>
          <span className="text-sm text-[#c4a882]">
            {streakDays === 1 ? 'giorno' : 'giorni'}
          </span>
        </div>
      </div>
    </div>
  );
}
