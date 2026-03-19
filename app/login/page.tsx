'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function Login() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      },
    });
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#fcf9f4] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <span className="font-serif italic text-4xl text-[#162b1d]">LibroLog</span>
          <p className="text-[#4e6073] mt-2 text-sm">Il tuo diario di lettura personale</p>
        </div>

        {sent ? (
          <div className="bg-[#d0e9d4] rounded-2xl p-8 text-center">
            <span className="material-symbols-outlined text-4xl text-[#162b1d] mb-3 block">mark_email_read</span>
            <h2 className="font-serif text-xl text-[#162b1d] mb-2">Controlla la tua email</h2>
            <p className="text-sm text-[#43474c]">
              Abbiamo inviato un link di accesso a <strong>{email}</strong>.<br />
              Clicca il link per entrare.
            </p>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="bg-[#f6f3ee] rounded-2xl p-6 space-y-4">
              <div>
                <label className="text-xs uppercase tracking-widest text-[#4e6073] block mb-2">
                  Il tuo indirizzo email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="tu@example.com"
                  required
                  className="w-full px-4 py-3 bg-[#ebe8e3] rounded-xl border-none outline-none focus:ring-2 focus:ring-[#162b1d]/20 text-[#1c1c19] placeholder:text-[#74777d]"
                />
              </div>
              {error && (
                <p className="text-sm text-[#ba1a1a]">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading || !email}
                className="w-full py-4 bg-[#162b1d] text-white rounded-full font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-all active:scale-95"
              >
                <span className="material-symbols-outlined">mail</span>
                {loading ? 'Invio in corso...' : 'Accedi con email'}
              </button>
            </div>
            <p className="text-center text-xs text-[#74777d]">
              Riceverai un link magico — nessuna password necessaria.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
