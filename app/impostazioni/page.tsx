'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBooks } from '@/context/BooksContext';
import { getSettings, saveSettings } from '@/lib/settings';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Impostazioni() {
  const { user, signOut } = useBooks();
  const router = useRouter();

  const [annualGoal, setAnnualGoal] = useState(12);
  const [dailyPagesGoal, setDailyPagesGoal] = useState(30);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const s = getSettings();
    setAnnualGoal(s.annualGoal);
    setDailyPagesGoal(s.dailyPagesGoal);
  }, []);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    saveSettings({ annualGoal, dailyPagesGoal });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <>
      <header className="fixed top-0 w-full flex items-center gap-4 px-6 py-4 bg-[#fcf9f4]/80 dark:bg-[#121210]/80 backdrop-blur-md z-50">
        <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#f0ede8] dark:hover:bg-[#2c2c28] transition-colors">
          <span className="material-symbols-outlined text-[#162b1d] dark:text-[#b4cdb8]">arrow_back</span>
        </button>
        <span className="font-serif italic text-2xl text-[#162b1d] dark:text-[#b4cdb8]">Impostazioni</span>
      </header>

      <main className="pt-24 pb-32 px-6 max-w-lg mx-auto space-y-6">

        {/* Aspetto */}
        <section>
          <h2 className="text-xs uppercase tracking-widest text-[#4e6073] mb-3">Aspetto</h2>
          <ThemeToggle />
        </section>

        {/* Account */}
        <section>
          <h2 className="text-xs uppercase tracking-widest text-[#4e6073] mb-3">Account</h2>
          <div className="bg-[#f6f3ee] rounded-2xl divide-y divide-[#e5e2dd]">
            <div className="px-6 py-4 flex items-center gap-3">
              <span className="material-symbols-outlined text-[#4e6073]">person</span>
              <div>
                <p className="text-xs text-[#74777d] mb-0.5">Email</p>
                <p className="text-sm text-[#1c1c19] font-medium">{user?.email}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Obiettivi */}
        <section>
          <h2 className="text-xs uppercase tracking-widest text-[#4e6073] mb-3">Obiettivi di lettura</h2>
          <form onSubmit={handleSave} className="bg-[#f6f3ee] rounded-2xl p-6 space-y-6">
            <div>
              <label className="text-xs uppercase tracking-widest text-[#4e6073] block mb-2">
                Libri da leggere nel {new Date().getFullYear()}
              </label>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setAnnualGoal(g => Math.max(1, g - 1))}
                  className="w-10 h-10 rounded-full bg-[#ebe8e3] flex items-center justify-center text-[#162b1d] dark:text-[#b4cdb8] font-bold text-lg hover:bg-[#dbd8d3] transition-colors"
                >−</button>
                <span className="font-serif text-4xl font-bold text-[#162b1d] dark:text-[#b4cdb8] w-16 text-center">{annualGoal}</span>
                <button
                  type="button"
                  onClick={() => setAnnualGoal(g => g + 1)}
                  className="w-10 h-10 rounded-full bg-[#ebe8e3] flex items-center justify-center text-[#162b1d] dark:text-[#b4cdb8] font-bold text-lg hover:bg-[#dbd8d3] transition-colors"
                >+</button>
              </div>
            </div>

            <div>
              <label className="text-xs uppercase tracking-widest text-[#4e6073] block mb-2">
                Pagine al giorno
              </label>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setDailyPagesGoal(g => Math.max(1, g - 5))}
                  className="w-10 h-10 rounded-full bg-[#ebe8e3] flex items-center justify-center text-[#162b1d] dark:text-[#b4cdb8] font-bold text-lg hover:bg-[#dbd8d3] transition-colors"
                >−</button>
                <span className="font-serif text-4xl font-bold text-[#162b1d] dark:text-[#b4cdb8] w-16 text-center">{dailyPagesGoal}</span>
                <button
                  type="button"
                  onClick={() => setDailyPagesGoal(g => g + 5)}
                  className="w-10 h-10 rounded-full bg-[#ebe8e3] flex items-center justify-center text-[#162b1d] dark:text-[#b4cdb8] font-bold text-lg hover:bg-[#dbd8d3] transition-colors"
                >+</button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#162b1d] text-white rounded-full font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-sm">{saved ? 'check' : 'save'}</span>
              {saved ? 'Salvato!' : 'Salva'}
            </button>
          </form>
        </section>

        {/* Logout */}
        <section>
          <h2 className="text-xs uppercase tracking-widest text-[#4e6073] mb-3">Sessione</h2>
          <div className="bg-[#f6f3ee] rounded-2xl overflow-hidden">
            <button
              onClick={signOut}
              className="w-full px-6 py-4 flex items-center gap-3 text-[#ba1a1a] hover:bg-[#ffdad6]/40 transition-colors"
            >
              <span className="material-symbols-outlined">logout</span>
              <span className="font-medium">Disconnetti</span>
            </button>
          </div>
        </section>

      </main>
    </>
  );
}
