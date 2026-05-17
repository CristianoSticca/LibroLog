'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

type Lang = 'it' | 'en';

/* ─────────────────────────────────────────────
   COPY
───────────────────────────────────────────── */
const T = {
  it: {
    nav: { cta: 'Accedi' },
    hero: {
      label: 'Il diario di lettura personale',
      title: 'Leggi.\nTraccia.\nCresci.',
      sub: 'Cerca libri, registra ogni sessione di lettura, visualizza le tue statistiche. LibroLog è il compagno che ogni lettore merita.',
      cta: 'Inizia gratis',
      scroll: 'Scopri le funzionalità',
    },
    features: {
      title: 'Tutto quello che serve a un lettore',
      sub: 'Dalle classifiche italiane al contatore pagine, dal barcode scanner alle statistiche annuali.',
      items: [
        { icon: 'menu_book', title: 'Libreria personale', desc: 'Organizza i tuoi libri per stato: da leggere, in lettura, completati, abbandonati. Filtra e cerca in pochi tap.' },
        { icon: 'timer', title: 'Sessioni di lettura', desc: 'Registra pagine e minuti per ogni sessione. LibroLog calcola automaticamente la tua velocità di lettura.' },
        { icon: 'leaderboard', title: 'Statistiche avanzate', desc: 'Obiettivo annuale, grafici mensili, generi preferiti, mese record. Tutte le tue metriche in una sola vista.' },
        { icon: 'trending_up', title: 'Classifiche italiane', desc: 'Top 20 de La Feltrinelli in 15 categorie — Narrativa, Gialli, Fantasy e molto altro — aggiornate ogni ora.' },
        { icon: 'qr_code_scanner', title: 'Scansione ISBN', desc: 'Inquadra il codice a barre del libro con la fotocamera. Aggiunto alla libreria in un secondo.' },
        { icon: 'local_fire_department', title: 'Streak di lettura', desc: 'Tieni traccia dei giorni consecutivi con almeno una sessione registrata. La costanza fa la differenza.' },
      ],
    },
    mockup: {
      title: "Un'app che sembra\nfatta per te",
      sub: 'Interfaccia curata, tema scuro, ottimizzata per mobile.',
      tabs: ['Dashboard', 'Libreria', 'Ricerca', 'Statistiche'],
    },
    how: {
      title: 'Come funziona',
      steps: [
        { icon: 'search', num: '01', title: 'Cerca', desc: 'Trova il libro per titolo, autore o ISBN. Oppure scansiona il barcode con la fotocamera.' },
        { icon: 'add_circle', num: '02', title: 'Aggiungi', desc: "Aggiungilo alla tua libreria in un tap. Scegli se iniziare a leggerlo subito o salvarlo per dopo." },
        { icon: 'insights', num: '03', title: 'Traccia', desc: 'Aggiorna le pagine dopo ogni sessione. Guarda le tue statistiche crescere nel tempo.' },
      ],
    },
    install: {
      title: 'Sempre con te,\nsu ogni dispositivo.',
      sub: 'LibroLog è una Progressive Web App: funziona nel browser e può essere installata come app nativa su iPhone e Android, senza passare dagli store.',
      iosLabel: 'iPhone',
      androidLabel: 'Android',
      ios: ['Apri Safari', 'Tocca il tasto Condividi (↑)', 'Seleziona "Aggiungi a schermata Home"', 'Conferma con "Aggiungi"'],
      android: ['Apri Chrome', 'Tocca il menu (⋮) in alto a destra', 'Seleziona "Aggiungi a schermata Home"', 'Conferma con "Aggiungi"'],
      cta: 'Inizia a leggere meglio',
      note: 'Gratis. Nessun abbonamento. Per sempre.',
    },
    waitlist: {
      label: 'Accesso su invito',
      title: 'Vuoi entrare?',
      sub: 'LibroLog è ancora in accesso limitato. Lascia la tua email e ti avviso non appena apriamo i prossimi posti.',
      placeholder: 'la-tua@email.it',
      cta: 'Unisciti alla lista',
      loading: 'Un momento…',
      success: '✓ Sei in lista! Ti avviseremo presto.',
      duplicate: '✓ Sei già in lista!',
      error: 'Qualcosa è andato storto, riprova.',
    },
    footer: {
      tagline: 'Il tuo diario di lettura personale.',
      made: 'Fatto con ♥ da',
      author: 'Cristiano Sticca',
      loginLabel: 'Accedi',
    },
  },
  en: {
    nav: { cta: 'Sign in' },
    hero: {
      label: 'Your personal reading journal',
      title: 'Read.\nTrack.\nGrow.',
      sub: 'Search books, log every reading session, visualize your stats. LibroLog is the companion every reader deserves.',
      cta: 'Get started free',
      scroll: 'See features',
    },
    features: {
      title: 'Everything a reader needs',
      sub: 'From Italian bestseller charts to page counters, barcode scanner to annual statistics.',
      items: [
        { icon: 'menu_book', title: 'Personal library', desc: 'Organize books by status: to read, reading, completed, dropped. Filter and search in a few taps.' },
        { icon: 'timer', title: 'Reading sessions', desc: 'Log pages and minutes per session. LibroLog automatically calculates your reading speed.' },
        { icon: 'leaderboard', title: 'Advanced statistics', desc: 'Annual goal, monthly charts, favorite genres, record month. All your metrics in one view.' },
        { icon: 'trending_up', title: 'Italian bestsellers', desc: 'La Feltrinelli top 20 in 15 categories — Fiction, Thrillers, Fantasy and more — updated hourly.' },
        { icon: 'qr_code_scanner', title: 'ISBN scanner', desc: 'Point your camera at the book barcode. Added to your library in one second.' },
        { icon: 'local_fire_department', title: 'Reading streak', desc: 'Track consecutive days with at least one logged reading session. Consistency makes the difference.' },
      ],
    },
    mockup: {
      title: 'An app that feels\nmade for you',
      sub: 'Refined interface, dark mode, optimized for mobile.',
      tabs: ['Dashboard', 'Library', 'Search', 'Statistics'],
    },
    how: {
      title: 'How it works',
      steps: [
        { icon: 'search', num: '01', title: 'Search', desc: 'Find a book by title, author or ISBN. Or scan the barcode with your camera.' },
        { icon: 'add_circle', num: '02', title: 'Add', desc: 'Add it to your library in one tap. Choose to start reading now or save it for later.' },
        { icon: 'insights', num: '03', title: 'Track', desc: 'Update pages after each session. Watch your statistics grow over time.' },
      ],
    },
    install: {
      title: 'Always with you,\non every device.',
      sub: 'LibroLog is a Progressive Web App: it works in the browser and can be installed as a native app on iPhone and Android, no app store needed.',
      iosLabel: 'iPhone',
      androidLabel: 'Android',
      ios: ['Open Safari', 'Tap the Share button (↑)', 'Select "Add to Home Screen"', 'Confirm with "Add"'],
      android: ['Open Chrome', 'Tap the menu (⋮) top right', 'Select "Add to Home Screen"', 'Confirm with "Add"'],
      cta: 'Start reading better',
      note: 'Free. No subscription. Forever.',
    },
    waitlist: {
      label: 'Invite only',
      title: 'Want in?',
      sub: `LibroLog is still in limited access. Leave your email and we'll notify you as soon as new spots open.`,
      placeholder: 'your@email.com',
      cta: 'Join the waitlist',
      loading: 'One moment…',
      success: `✓ You're on the list! We'll be in touch soon.`,
      duplicate: `✓ You're already on the list!`,
      error: 'Something went wrong, please try again.',
    },
    footer: {
      tagline: 'Your personal reading journal.',
      made: 'Made with ♥ by',
      author: 'Cristiano Sticca',
      loginLabel: 'Sign in',
    },
  },
};

/* ─────────────────────────────────────────────
   SCROLL REVEAL HOOK
───────────────────────────────────────────── */
function useReveal(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* ─────────────────────────────────────────────
   PHONE MOCK SCREENS
───────────────────────────────────────────── */
function DashboardScreen({ lang }: { lang: Lang }) {
  return (
    <div className="bg-[#fcf9f4] h-full flex flex-col overflow-hidden">
      <div className="flex justify-between items-center px-3 pt-2 pb-1">
        <span className="font-serif italic text-[13px] text-[#162b1d]">LibroLog</span>
        <span className="material-symbols-outlined text-[#162b1d]" style={{ fontSize: 14 }}>settings</span>
      </div>
      <div className="px-3 grid grid-cols-2 gap-2 mb-2">
        <div className="bg-[#f0ede8] rounded-xl p-3 flex flex-col">
          <span className="text-[8px] uppercase tracking-widest text-[#4e6073]">
            {lang === 'it' ? 'Letti nel 2025' : 'Read in 2025'}
          </span>
          <span className="font-serif text-2xl font-bold text-[#162b1d] mt-auto">8</span>
        </div>
        <div className="bg-[#2c4132] rounded-xl p-3 flex flex-col">
          <span className="text-[8px] uppercase tracking-widest text-[#95ad9a]">
            {lang === 'it' ? 'Pagine totali' : 'Total pages'}
          </span>
          <span className="font-serif text-2xl font-bold text-white mt-auto">2,847</span>
        </div>
      </div>
      <div className="px-3 mb-2">
        <div className="bg-[#392117] text-[#ffdbce] rounded-full px-3 py-1 inline-flex items-center gap-1">
          <span className="material-symbols-outlined" style={{ fontSize: 11, fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
          <span className="text-[9px] font-semibold">14 {lang === 'it' ? 'giorni' : 'days'}</span>
        </div>
      </div>
      <div className="px-3">
        <p className="text-[8px] uppercase tracking-widest text-[#4e6073] mb-1">
          {lang === 'it' ? 'In lettura' : 'Reading now'}
        </p>
        <div className="bg-[#f6f3ee] rounded-xl p-3 flex gap-2">
          <div className="w-8 flex-shrink-0 rounded-lg bg-[#162b1d]" style={{ aspectRatio: '2/3' }} />
          <div className="flex-1 min-w-0">
            <p className="font-serif text-[10px] text-[#162b1d] font-semibold leading-tight line-clamp-1">Il Nome della Rosa</p>
            <p className="text-[8px] text-[#4e6073] mb-2">Umberto Eco</p>
            <div className="h-1 w-full bg-[#d0e9d4] rounded-full mb-1">
              <div className="h-full bg-[#162b1d] rounded-full" style={{ width: '64%' }} />
            </div>
            <p className="text-[7px] text-[#4e6073]">64% · Pag. 384 di 600</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function LibraryScreen({ lang }: { lang: Lang }) {
  const books = [
    { bg: '#162b1d' }, { bg: '#392117' }, { bg: '#0b2013' },
    { bg: '#2c4132' }, { bg: '#52362b' }, { bg: '#364c3c' },
    { bg: '#162b1d' }, { bg: '#392117' }, { bg: '#2c4132' },
  ];
  const filters = lang === 'it'
    ? ['Tutti', 'Da leggere', 'In lettura', 'Completati']
    : ['All', 'To read', 'Reading', 'Completed'];
  return (
    <div className="bg-[#fcf9f4] h-full flex flex-col overflow-hidden">
      <div className="px-3 pt-2 pb-1">
        <p className="font-serif text-[14px] text-[#162b1d] mb-2">{lang === 'it' ? 'Libreria' : 'Library'}</p>
        <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
          {filters.map((f, i) => (
            <span key={f} className="text-[8px] px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0"
              style={{ background: i === 0 ? '#162b1d' : '#f0ede8', color: i === 0 ? '#fff' : '#4e6073' }}>
              {f}
            </span>
          ))}
        </div>
      </div>
      <div className="px-3 grid grid-cols-3 gap-1.5">
        {books.map((b, i) => (
          <div key={i} className="rounded-lg" style={{ backgroundColor: b.bg, aspectRatio: '2/3' }} />
        ))}
      </div>
    </div>
  );
}

function SearchScreen({ lang }: { lang: Lang }) {
  const books = lang === 'it'
    ? [
        { title: 'La Coscienza di Zeno', author: 'Italo Svevo', bg: '#2c4132' },
        { title: "Cent'anni di solitudine", author: 'G. G. Márquez', bg: '#392117' },
        { title: 'Il deserto dei Tartari', author: 'Dino Buzzati', bg: '#162b1d' },
      ]
    : [
        { title: 'The Name of the Rose', author: 'Umberto Eco', bg: '#162b1d' },
        { title: 'One Hundred Years', author: 'G. G. Márquez', bg: '#392117' },
        { title: 'The Tartar Steppe', author: 'Dino Buzzati', bg: '#2c4132' },
      ];
  return (
    <div className="bg-[#fcf9f4] h-full flex flex-col overflow-hidden">
      <div className="px-3 pt-2 pb-1">
        <p className="font-serif text-[14px] text-[#162b1d] mb-2">{lang === 'it' ? 'Ricerca' : 'Search'}</p>
        <div className="bg-[#f0ede8] rounded-xl px-2 py-1.5 flex items-center gap-1.5 mb-3">
          <span className="material-symbols-outlined text-[#4e6073]" style={{ fontSize: 12 }}>search</span>
          <span className="text-[9px] text-[#74777d]">{lang === 'it' ? 'Titolo, autore, ISBN...' : 'Title, author, ISBN...'}</span>
          <span className="material-symbols-outlined text-[#162b1d] ml-auto" style={{ fontSize: 12 }}>qr_code_scanner</span>
        </div>
      </div>
      <div className="px-3 space-y-1.5">
        {books.map(book => (
          <div key={book.title} className="bg-[#f6f3ee] rounded-xl p-2 flex items-center gap-2">
            <div className="w-6 rounded flex-shrink-0" style={{ backgroundColor: book.bg, aspectRatio: '2/3' }} />
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-semibold text-[#162b1d] truncate">{book.title}</p>
              <p className="text-[7px] text-[#4e6073]">{book.author}</p>
            </div>
            <button className="w-5 h-5 rounded-full bg-[#162b1d] flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-white" style={{ fontSize: 10 }}>add</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatsScreen({ lang }: { lang: Lang }) {
  const bars = [1, 3, 2, 4, 1, 2, 3, 5, 2, 1, 0, 0];
  const months = ['G', 'F', 'M', 'A', 'M', 'G', 'L', 'A', 'S', 'O', 'N', 'D'];
  return (
    <div className="bg-[#fcf9f4] h-full flex flex-col overflow-hidden p-3">
      <p className="font-serif text-[14px] text-[#162b1d] mb-3">{lang === 'it' ? 'Statistiche' : 'Statistics'}</p>
      <div className="flex items-center gap-3 mb-3">
        <div className="relative w-14 h-14 flex-shrink-0">
          <svg viewBox="0 0 64 64" className="w-full h-full" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="32" cy="32" r="26" fill="none" stroke="#d0e9d4" strokeWidth="8" />
            <circle cx="32" cy="32" r="26" fill="none" stroke="#162b1d" strokeWidth="8"
              strokeDasharray="163.4" strokeDashoffset="40.85" strokeLinecap="round" />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center font-serif text-[11px] font-bold text-[#162b1d]">75%</span>
        </div>
        <div>
          <p className="text-[10px] font-semibold text-[#162b1d]">{lang === 'it' ? 'Obiettivo annuale' : 'Annual goal'}</p>
          <p className="text-[8px] text-[#4e6073]">8 / 12 {lang === 'it' ? 'libri nel 2025' : 'books in 2025'}</p>
          <p className="text-[8px] text-[#4e6073] mt-0.5">{lang === 'it' ? '4 libri rimasti' : '4 books to go'}</p>
        </div>
      </div>
      <p className="text-[8px] uppercase tracking-widest text-[#4e6073] mb-1.5">{lang === 'it' ? 'Attività mensile' : 'Monthly activity'}</p>
      <div className="flex items-end gap-1" style={{ height: 52 }}>
        {bars.map((h, i) => (
          <div key={i} className="flex-1 flex flex-col justify-end">
            <div className="rounded-sm" style={{
              height: `${h * 9}px`,
              backgroundColor: i === 7 ? '#162b1d' : i === 3 ? '#2c4132' : '#d0e9d4',
            }} />
          </div>
        ))}
      </div>
      <div className="flex mt-0.5">
        {months.map((m, i) => (
          <span key={i} className="flex-1 text-center" style={{ fontSize: 6, color: '#4e6073' }}>{m}</span>
        ))}
      </div>
    </div>
  );
}

const SCREENS = [DashboardScreen, LibraryScreen, SearchScreen, StatsScreen];

/* ─────────────────────────────────────────────
   PHONE MOCKUP COMPONENT
───────────────────────────────────────────── */
function PhoneMockup({ activeTab, lang }: { activeTab: number; lang: Lang }) {
  const [displayed, setDisplayed] = useState(activeTab);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (activeTab === displayed) return;
    setFading(true);
    const t = setTimeout(() => {
      setDisplayed(activeTab);
      setFading(false);
    }, 180);
    return () => clearTimeout(t);
  }, [activeTab, displayed]);

  const Screen = SCREENS[displayed];

  return (
    <div className="relative mx-auto" style={{ width: 220, filter: 'drop-shadow(0 32px 48px rgba(22,43,29,0.45))' }}>
      {/* Phone frame */}
      <div className="relative rounded-[36px] overflow-hidden border-[6px] border-[#162b1d]" style={{ width: 220, height: 440, background: '#fcf9f4' }}>
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-4 bg-[#162b1d] rounded-b-2xl z-10" />
        {/* Screen content */}
        <div className="absolute inset-0 pt-4 pb-10 overflow-hidden"
          style={{ opacity: fading ? 0 : 1, transition: 'opacity 0.18s ease' }}>
          <Screen lang={lang} />
        </div>
        {/* Bottom nav bar */}
        <div className="absolute bottom-0 left-0 right-0 h-10 bg-[#fcf9f4]/90 flex items-center justify-around px-2" style={{ borderTop: '1px solid #e5e2dd' }}>
          {[
            { icon: 'home' },
            { icon: 'menu_book' },
            { icon: 'search' },
            { icon: 'leaderboard' },
          ].map((tab, i) => (
            <div key={i} className="flex flex-col items-center justify-center px-2 py-1 rounded-xl"
              style={i === activeTab ? { background: '#2c4132' } : undefined}>
              <span className="material-symbols-outlined"
                style={{ fontSize: 14, color: i === activeTab ? '#fcf9f4' : '#4e6073', fontVariationSettings: i === activeTab ? "'FILL' 1" : "'FILL' 0" }}>
                {tab.icon}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
export default function WelcomePage() {
  const [lang, setLang] = useState<Lang>('it');
  const [activeTab, setActiveTab] = useState(0);
  const [installTab, setInstallTab] = useState<'ios' | 'android'>('ios');
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistStatus, setWaitlistStatus] = useState<'idle' | 'loading' | 'success' | 'duplicate' | 'error'>('idle');
  const featuresRef = useRef<HTMLElement>(null);
  const t = T[lang];

  const featuresReveal = useReveal();
  const mockupReveal = useReveal();
  const howReveal = useReveal();
  const installReveal = useReveal();
  const waitlistReveal = useReveal();

  async function handleWaitlist(e: React.FormEvent) {
    e.preventDefault();
    if (!waitlistEmail) return;
    setWaitlistStatus('loading');
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: waitlistEmail }),
      });
      const data = await res.json();
      if (res.status === 201) setWaitlistStatus('success');
      else if (res.status === 200 && data.message === 'Sei già in lista!') setWaitlistStatus('duplicate');
      else if (res.status === 200) setWaitlistStatus('success');
      else setWaitlistStatus('error');
    } catch {
      setWaitlistStatus('error');
    }
  }

  function scrollToFeatures() {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div className="bg-[#fcf9f4] min-h-screen font-[family-name:var(--font-body)]">

      {/* ── NAV BAR ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[#fcf9f4]/80 backdrop-blur-md border-b border-[#e5e2dd]/60">
        <span className="font-[family-name:var(--font-headline)] italic text-2xl text-[#162b1d]">LibroLog</span>
        <div className="flex items-center gap-3">
          {/* Language toggle */}
          <button
            onClick={() => setLang(l => l === 'it' ? 'en' : 'it')}
            className="flex items-center gap-1 text-[11px] font-semibold tracking-widest uppercase px-3 py-1.5 rounded-full border border-[#d0e9d4] text-[#162b1d] hover:bg-[#f0ede8] transition-colors"
          >
            <span style={{ opacity: lang === 'it' ? 1 : 0.4 }}>IT</span>
            <span className="text-[#4e6073]">/</span>
            <span style={{ opacity: lang === 'en' ? 1 : 0.4 }}>EN</span>
          </button>
          <Link
            href="/login"
            className="text-sm font-semibold text-[#162b1d] px-4 py-2 rounded-full bg-[#162b1d] text-white hover:bg-[#2c4132] transition-colors"
          >
            {t.nav.cta}
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16 overflow-hidden">
        {/* Decorative floating books */}
        <div className="absolute inset-0 pointer-events-none select-none" aria-hidden>
          {[
            { top: '12%', left: '6%', w: 44, h: 66, bg: '#162b1d', rot: '-12deg', delay: '0s' },
            { top: '18%', right: '8%', w: 36, h: 54, bg: '#392117', rot: '8deg', delay: '0.4s' },
            { top: '55%', left: '3%', w: 32, h: 48, bg: '#2c4132', rot: '-6deg', delay: '0.8s' },
            { top: '60%', right: '5%', w: 48, h: 72, bg: '#0b2013', rot: '14deg', delay: '0.2s' },
            { top: '78%', left: '14%', w: 28, h: 42, bg: '#52362b', rot: '-4deg', delay: '1.2s' },
            { top: '30%', right: '16%', w: 26, h: 39, bg: '#364c3c', rot: '18deg', delay: '0.6s' },
          ].map((b, i) => (
            <div
              key={i}
              className="absolute rounded-md"
              style={{
                top: b.top,
                left: b.left,
                right: b.right,
                width: b.w,
                height: b.h,
                backgroundColor: b.bg,
                transform: `rotate(${b.rot})`,
                opacity: 0.18,
                animation: `floatBook 6s ease-in-out ${b.delay} infinite`,
              }}
            />
          ))}
        </div>

        {/* Hero content */}
        <div className="relative z-10 text-center max-w-xl">
          <p className="text-xs uppercase tracking-[0.25em] text-[#4e6073] mb-4 font-semibold">{t.hero.label}</p>
          <h1 className="font-[family-name:var(--font-headline)] text-6xl sm:text-7xl font-light leading-[1.05] text-[#162b1d] mb-6 whitespace-pre-line">
            {t.hero.title}
          </h1>
          <p className="text-[#4e6073] text-lg leading-relaxed max-w-md mx-auto mb-10">
            {t.hero.sub}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#162b1d] text-white rounded-full font-semibold text-base hover:bg-[#2c4132] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#162b1d]/20"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18, fontVariationSettings: "'FILL' 1" }}>auto_stories</span>
              {t.hero.cta}
            </Link>
            <button
              onClick={scrollToFeatures}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-[#162b1d]/20 text-[#162b1d] rounded-full font-semibold text-base hover:border-[#162b1d]/50 hover:bg-[#f0ede8] transition-all"
            >
              {t.hero.scroll}
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_downward</span>
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce" aria-hidden>
          <span className="material-symbols-outlined text-[#4e6073]/40" style={{ fontSize: 24 }}>keyboard_arrow_down</span>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section ref={featuresRef as React.RefObject<HTMLElement>} className="px-6 py-20 bg-[#f6f3ee]">
        <div
          ref={featuresReveal.ref}
          style={{
            opacity: featuresReveal.visible ? 1 : 0,
            transform: featuresReveal.visible ? 'translateY(0)' : 'translateY(28px)',
            transition: 'opacity 0.7s ease, transform 0.7s ease',
          }}
        >
          <div className="max-w-3xl mx-auto text-center mb-14">
            <h2 className="font-[family-name:var(--font-headline)] text-4xl font-light text-[#162b1d] mb-4">{t.features.title}</h2>
            <p className="text-[#4e6073] text-base leading-relaxed max-w-lg mx-auto">{t.features.sub}</p>
          </div>
          <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {t.features.items.map((item, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 flex flex-col gap-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                <div className="w-11 h-11 rounded-xl bg-[#162b1d] flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-white" style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}>
                    {item.icon}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-[#162b1d] mb-1.5 text-[15px]">{item.title}</h3>
                  <p className="text-[#4e6073] text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PHONE MOCKUP SHOWCASE ── */}
      <section className="px-6 py-20 bg-[#162b1d] overflow-hidden">
        <div
          ref={mockupReveal.ref}
          style={{
            opacity: mockupReveal.visible ? 1 : 0,
            transform: mockupReveal.visible ? 'translateY(0)' : 'translateY(28px)',
            transition: 'opacity 0.7s ease, transform 0.7s ease',
          }}
        >
          <div className="max-w-4xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Text side */}
            <div className="flex-1 text-center lg:text-left">
              <h2 className="font-[family-name:var(--font-headline)] text-4xl font-light text-white mb-4 whitespace-pre-line leading-tight">
                {t.mockup.title}
              </h2>
              <p className="text-[#95ad9a] text-base mb-8">{t.mockup.sub}</p>
              {/* Screen tabs */}
              <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                {t.mockup.tabs.map((tab, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveTab(i)}
                    className="px-4 py-2 rounded-full text-sm font-semibold transition-all"
                    style={{
                      background: activeTab === i ? '#fcf9f4' : 'transparent',
                      color: activeTab === i ? '#162b1d' : '#95ad9a',
                      border: activeTab === i ? '2px solid transparent' : '2px solid #2c4132',
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            {/* Phone mockup */}
            <div className="flex-shrink-0">
              <PhoneMockup activeTab={activeTab} lang={lang} />
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="px-6 py-20 bg-[#fcf9f4]">
        <div
          ref={howReveal.ref}
          style={{
            opacity: howReveal.visible ? 1 : 0,
            transform: howReveal.visible ? 'translateY(0)' : 'translateY(28px)',
            transition: 'opacity 0.7s ease, transform 0.7s ease',
          }}
        >
          <div className="max-w-3xl mx-auto">
            <h2 className="font-[family-name:var(--font-headline)] text-4xl font-light text-[#162b1d] mb-14 text-center">{t.how.title}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6 relative">
              {/* Connector line (desktop only) */}
              <div className="hidden sm:block absolute top-8 left-[calc(16.66%+16px)] right-[calc(16.66%+16px)] h-px bg-[#d0e9d4] z-0" />
              {t.how.steps.map((step, i) => (
                <div key={i} className="flex flex-col items-center text-center relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-[#162b1d] flex items-center justify-center mb-4 shadow-lg shadow-[#162b1d]/20">
                    <span className="material-symbols-outlined text-white" style={{ fontSize: 28, fontVariationSettings: "'FILL' 1" }}>
                      {step.icon}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold tracking-widest text-[#4e6073] mb-1">{step.num}</span>
                  <h3 className="font-[family-name:var(--font-headline)] text-xl text-[#162b1d] mb-2">{step.title}</h3>
                  <p className="text-[#4e6073] text-sm leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── INSTALL / CTA ── */}
      <section className="px-6 py-20 bg-[#2c4132]">
        <div
          ref={installReveal.ref}
          style={{
            opacity: installReveal.visible ? 1 : 0,
            transform: installReveal.visible ? 'translateY(0)' : 'translateY(28px)',
            transition: 'opacity 0.7s ease, transform 0.7s ease',
          }}
        >
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#fcf9f4]/10 flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-[#fcf9f4]" style={{ fontSize: 32, fontVariationSettings: "'FILL' 1" }}>smartphone</span>
            </div>
            <h2 className="font-[family-name:var(--font-headline)] text-4xl font-light text-white mb-4 whitespace-pre-line leading-tight">
              {t.install.title}
            </h2>
            <p className="text-[#b4cdb8] text-base leading-relaxed max-w-lg mx-auto mb-10">
              {t.install.sub}
            </p>

            {/* Device tabs */}
            <div className="inline-flex bg-[#162b1d]/40 rounded-full p-1 mb-6">
              {(['ios', 'android'] as const).map(platform => (
                <button
                  key={platform}
                  onClick={() => setInstallTab(platform)}
                  className="px-5 py-2 rounded-full text-sm font-semibold transition-all"
                  style={{
                    background: installTab === platform ? '#fcf9f4' : 'transparent',
                    color: installTab === platform ? '#162b1d' : '#95ad9a',
                  }}
                >
                  {platform === 'ios' ? t.install.iosLabel : t.install.androidLabel}
                </button>
              ))}
            </div>

            {/* Install steps */}
            <div className="bg-[#162b1d]/30 rounded-2xl p-6 mb-8 text-left">
              <ol className="space-y-3">
                {(installTab === 'ios' ? t.install.ios : t.install.android).map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-[#fcf9f4]/20 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-[#d0e9d4] text-sm">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-10 py-4 bg-[#fcf9f4] text-[#162b1d] rounded-full font-bold text-base hover:bg-white transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-[#0b2013]/30 mb-4"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}>auto_stories</span>
              {t.install.cta}
            </Link>
            <p className="text-[#95ad9a] text-sm">{t.install.note}</p>
          </div>
        </div>
      </section>

      {/* ── WAITLIST ── */}
      <section className="px-6 py-20 bg-[#f6f3ee]">
        <div
          ref={waitlistReveal.ref}
          style={{
            opacity: waitlistReveal.visible ? 1 : 0,
            transform: waitlistReveal.visible ? 'translateY(0)' : 'translateY(28px)',
            transition: 'opacity 0.7s ease, transform 0.7s ease',
          }}
        >
          <div className="max-w-lg mx-auto text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-[#4e6073] mb-3 font-semibold">{t.waitlist.label}</p>
            <h2 className="font-[family-name:var(--font-headline)] text-4xl font-light text-[#162b1d] mb-4">{t.waitlist.title}</h2>
            <p className="text-[#4e6073] text-base leading-relaxed mb-8">{t.waitlist.sub}</p>

            {waitlistStatus === 'success' || waitlistStatus === 'duplicate' ? (
              <p className="text-[#2c4132] font-semibold text-base bg-[#d0e9d4]/60 rounded-2xl px-6 py-4">
                {waitlistStatus === 'duplicate' ? t.waitlist.duplicate : t.waitlist.success}
              </p>
            ) : (
              <form onSubmit={handleWaitlist} action="/api/waitlist" method="POST" className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  required
                  value={waitlistEmail}
                  onChange={e => setWaitlistEmail(e.target.value)}
                  placeholder={t.waitlist.placeholder}
                  className="flex-1 px-5 py-3.5 rounded-full border-2 border-[#162b1d]/15 bg-white text-[#162b1d] placeholder-[#4e6073]/60 focus:outline-none focus:border-[#162b1d]/40 text-sm"
                />
                <button
                  type="submit"
                  disabled={waitlistStatus === 'loading'}
                  className="px-7 py-3.5 bg-[#162b1d] text-white rounded-full font-semibold text-sm hover:bg-[#2c4132] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {waitlistStatus === 'loading' ? t.waitlist.loading : t.waitlist.cta}
                </button>
              </form>
            )}
            {waitlistStatus === 'error' && (
              <p className="text-red-600 text-sm mt-3">{t.waitlist.error}</p>
            )}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="px-6 py-10 bg-[#162b1d]">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left">
            <p className="font-[family-name:var(--font-headline)] italic text-2xl text-white mb-1">LibroLog</p>
            <p className="text-[#95ad9a] text-sm">{t.footer.tagline}</p>
          </div>
          <div className="flex flex-col items-center sm:items-end gap-3">
            <Link href="/login" className="text-[#b4cdb8] text-sm font-semibold hover:text-white transition-colors">
              {t.footer.loginLabel} →
            </Link>
            <p className="text-[#4e6073] text-xs">
              {t.footer.made} <span className="text-[#95ad9a]">{t.footer.author}</span>
            </p>
          </div>
        </div>
      </footer>

      {/* ── GLOBAL KEYFRAMES ── */}
      <style>{`
        @keyframes floatBook {
          0%, 100% { transform: translateY(0px) rotate(var(--rot, 0deg)); }
          50% { transform: translateY(-12px) rotate(var(--rot, 0deg)); }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
