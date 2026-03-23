# LibroLog

Il tuo diario di lettura personale. Cerca libri, tieni traccia dei progressi, registra le sessioni e visualizza le tue statistiche.

**Live:** [librolog.cristianosticca.com](https://librolog.cristianosticca.com)

---

## Funzionalità

### Dashboard
- Contatore libri letti nell'anno corrente e pagine totali
- Striscia di lettura attiva (streak): giorni consecutivi con almeno una sessione registrata
- Libro attualmente in lettura con barra di progresso e accesso rapido all'aggiornamento
- Scroll orizzontale dei libri in lista "Da leggere"
- FAB per aggiungere subito un nuovo libro

### Libreria
- Griglia di copertine con tutti i propri libri
- Filtri per stato: Tutti, Da leggere, In lettura, Completati, Abbandonati
- Ricerca testuale tra i propri libri per titolo o autore

### Ricerca e scoperta
- Ricerca per titolo, autore o ISBN tramite Google Books API
- **Scansione ISBN via fotocamera**: usa `BarcodeDetector` nativo (Chrome/Android) con fallback `@zxing/browser` per altri browser
- **Classifiche italiane** (Il Sole 24 Ore / GfK): 7 categorie settimanali aggiornate ogni ora — Classifica Generale, Narrativa Italiana, Narrativa Straniera, Saggistica, Tascabili, Ragazzi, Varia. Card verticali con badge posizione, settimane in classifica e variazione (New Entry, In ascesa, ecc.). Se la fonte non è disponibile la sezione viene nascosta silenziosamente
- **Link acquisto Amazon** su ogni libro, sia nelle classifiche che nei risultati di ricerca e nel dettaglio
- Aggiunta diretta del libro con stato "Inizia a leggere" o "Da leggere"

### Dettaglio libro
- Cambio stato lettura: Da leggere → In lettura → Completato / Abbandonato
- Aggiornamento pagina corrente con shortcuts rapidi (+10, +25, +50, Finito!)
- Registrazione tempo di lettura per sessione (minuti, opzionale)
- Storico sessioni di lettura con date e pagine lette
- Valutazione a stelle (1–5)
- Date di inizio e fine lettura
- Note personali libere
- Descrizione del libro e tag generi
- Link diretto all'acquisto su Amazon.it
- Eliminazione con conferma

### Statistiche
- **Obiettivo annuale**: cerchio di avanzamento con percentuale e libri rimanenti
- **Grafico mensile a barre**: attività per tutti i 12 mesi, mese record evidenziato
- Confronto mese corrente vs mese precedente (delta)
- **Generi preferiti**: donut chart con top 4 generi e percentuali
- Mese record con numero di libri completati e durata media di lettura
- Totale libri completati, pagine lette, valutazione media
- **Pagine al giorno**: media anno corrente vs obiettivo configurabile
- **Velocità di lettura**: pagine/ora calcolata automaticamente dalle sessioni con tempo registrato
- Top 5 autori più letti con barra proporzionale
- Top 3 libri meglio valutati

### Impostazioni
- Toggle tema chiaro/scuro
- Obiettivo annuale libri (configurabile)
- Obiettivo pagine al giorno (configurabile)
- Logout

### Autenticazione e sincronizzazione
- Login passwordless tramite magic link (email OTP) via Supabase Auth
- Dati sincronizzati su PostgreSQL (Supabase): libri e sessioni accessibili da qualsiasi dispositivo

---

## Stack

| Layer | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI Library | React 19 |
| Styling | Tailwind CSS v4 |
| Font | Newsreader (serif) + Manrope (sans) |
| Icone | Material Symbols Outlined |
| Backend / Auth | Supabase (PostgreSQL + Auth) |
| Deploy | Vercel + Vercel Analytics |
| Design | Google Stitch |
| Classifiche libri | Il Sole 24 Ore / GfK (Next.js API route proxy) |
| Dati libri | Google Books API |
| Scanner ISBN | BarcodeDetector API + @zxing/browser (fallback) |

---

## Setup locale

### 1. Clona il repo e installa le dipendenze

```bash
git clone https://github.com/CristianoSticca/LibroLog.git
cd LibroLog
npm install
```

### 2. Configura le variabili d'ambiente

Crea un file `.env.local` nella root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY=<google-books-key>   # opzionale ma consigliato
```

> La Google Books API key è opzionale: senza di essa le ricerche funzionano comunque ma con rate limit più bassi.

### 3. Configura Supabase

Esegui questo SQL nel tuo progetto Supabase (SQL Editor):

```sql
-- Tabella libri
create table books (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  author text not null,
  cover text default '',
  pages integer default 0,
  current_page integer default 0,
  status text not null default 'to-read',
  start_date date,
  end_date date,
  rating integer,
  notes text,
  google_books_id text,
  isbn text,
  description text,
  publisher text,
  published_year integer,
  genres text[],
  added_at timestamptz default now()
);

alter table books enable row level security;

create policy "Users manage their own books" on books
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Tabella sessioni di lettura
create table reading_sessions (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  book_id text references books(id) on delete cascade not null,
  session_date date not null,
  start_page integer not null,
  end_page integer not null,
  pages_read integer not null,
  minutes integer,
  created_at timestamptz default now()
);

alter table reading_sessions enable row level security;

create policy "Users manage their own sessions" on reading_sessions
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

In **Authentication → URL Configuration**:
- **Site URL:** `http://localhost:3000`
- **Redirect URLs:** aggiungi `http://localhost:3000/auth/confirm`

### 4. Avvia il server di sviluppo

```bash
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000).

---

## Deploy su Vercel

1. Collega il repo GitHub a Vercel
2. Aggiungi le variabili d'ambiente nel pannello Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` → `https://tuo-dominio.vercel.app`
   - `NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY` (opzionale)
3. Su Supabase, aggiorna:
   - **Site URL** → `https://tuo-dominio.vercel.app`
   - **Redirect URLs** → aggiungi `https://tuo-dominio.vercel.app/auth/confirm`

---

## Struttura del progetto

```
app/
  page.tsx                   # Dashboard
  layout.tsx                 # Layout root
  login/page.tsx             # Login magic link
  auth/confirm/route.ts      # Callback autenticazione
  libreria/page.tsx          # Libreria con filtri e ricerca
  ricerca/page.tsx           # Ricerca + classifiche Il Sole 24 Ore
  statistiche/page.tsx       # Statistiche di lettura
  libro/[id]/page.tsx        # Dettaglio e modifica libro
  impostazioni/page.tsx      # Impostazioni e obiettivi
  api/
    bestsellers/route.ts     # Proxy classifiche Il Sole 24 Ore (cache 1h)
components/
  BottomNav.tsx              # Navigazione inferiore
  BookCard.tsx               # Card libro con copertina
  RatingStars.tsx            # Valutazione a stelle
  IsbnScanner.tsx            # Scanner ISBN via fotocamera
  SessionLog.tsx             # Storico sessioni di lettura
  StreakBadge.tsx            # Badge striscia di lettura
  ThemeProvider.tsx          # Provider tema
  ThemeToggle.tsx            # Toggle tema chiaro/scuro
context/
  BooksContext.tsx           # State globale libri + Supabase sync
  ReadingSessionsContext.tsx # Sessioni di lettura e streak
lib/
  types.ts                   # Tipi TypeScript (Book, ReadingSession, ecc.)
  settings.ts                # Impostazioni locali (obiettivi)
  storage.ts                 # Utility storage
  supabase/
    client.ts                # Client Supabase lato browser
    server.ts                # Client Supabase lato server (SSR)
```
