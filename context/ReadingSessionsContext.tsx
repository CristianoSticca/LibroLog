'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useMemo } from 'react';
import { ReadingSession } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { generateId } from '@/lib/storage';

interface AddSessionData {
  bookId: string;
  sessionDate: string;
  startPage: number;
  endPage: number;
  minutes?: number;
}

interface ReadingSessionsContextValue {
  sessions: ReadingSession[];
  loading: boolean;
  addSession: (data: AddSessionData) => Promise<void>;
  getSessionsForBook: (bookId: string) => ReadingSession[];
  streakDays: number;
  avgPagesPerHour: (bookId?: string) => number | null;
}

const ReadingSessionsContext = createContext<ReadingSessionsContextValue | null>(null);

function toRow(session: ReadingSession, userId: string) {
  return {
    id: session.id,
    user_id: userId,
    book_id: session.bookId,
    session_date: session.sessionDate,
    start_page: session.startPage,
    end_page: session.endPage,
    minutes: session.minutes ?? null,
    created_at: session.createdAt,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromRow(row: any): ReadingSession {
  return {
    id: row.id,
    bookId: row.book_id,
    sessionDate: row.session_date,
    startPage: row.start_page,
    endPage: row.end_page,
    pagesRead: row.pages_read ?? (row.end_page - row.start_page),
    minutes: row.minutes ?? undefined,
    createdAt: row.created_at,
  };
}

function computeStreak(sessions: ReadingSession[]): number {
  const uniqueDates = [...new Set(sessions.map(s => s.sessionDate))].sort().reverse();
  let streak = 0;
  let expected = new Date().toISOString().split('T')[0];
  for (const date of uniqueDates) {
    if (date === expected) {
      streak++;
      const d = new Date(expected);
      d.setDate(d.getDate() - 1);
      expected = d.toISOString().split('T')[0];
    } else {
      break;
    }
  }
  return streak;
}

export function ReadingSessionsProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<ReadingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id);
        fetchSessions(user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUserId(u?.id ?? null);
      if (u) {
        fetchSessions(u.id);
      } else {
        setSessions([]);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchSessions(uid: string) {
    setLoading(true);
    const { data } = await supabase
      .from('reading_sessions')
      .select('*')
      .eq('user_id', uid)
      .order('session_date', { ascending: false });
    setSessions((data ?? []).map(fromRow));
    setLoading(false);
  }

  async function addSession(data: AddSessionData) {
    if (!userId) return;
    const session: ReadingSession = {
      id: generateId(),
      bookId: data.bookId,
      sessionDate: data.sessionDate,
      startPage: data.startPage,
      endPage: data.endPage,
      pagesRead: data.endPage - data.startPage,
      minutes: data.minutes,
      createdAt: new Date().toISOString(),
    };
    // Optimistic update
    setSessions(prev => [session, ...prev]);
    await supabase.from('reading_sessions').insert(toRow(session, userId));
  }

  function getSessionsForBook(bookId: string): ReadingSession[] {
    return sessions.filter(s => s.bookId === bookId);
  }

  const streakDays = useMemo(() => computeStreak(sessions), [sessions]);

  function avgPagesPerHour(bookId?: string): number | null {
    const subset = bookId ? sessions.filter(s => s.bookId === bookId) : sessions;
    const withMinutes = subset.filter(s => s.minutes && s.minutes > 0);
    if (withMinutes.length === 0) return null;
    const totalPages = withMinutes.reduce((sum, s) => sum + s.pagesRead, 0);
    const totalHours = withMinutes.reduce((sum, s) => sum + (s.minutes! / 60), 0);
    if (totalHours === 0) return null;
    return Math.round(totalPages / totalHours);
  }

  return (
    <ReadingSessionsContext.Provider value={{ sessions, loading, addSession, getSessionsForBook, streakDays, avgPagesPerHour }}>
      {children}
    </ReadingSessionsContext.Provider>
  );
}

export function useReadingSessions() {
  const ctx = useContext(ReadingSessionsContext);
  if (!ctx) throw new Error('useReadingSessions must be used within ReadingSessionsProvider');
  return ctx;
}
