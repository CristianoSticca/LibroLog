# LibroLog

Il tuo diario di lettura personale. Cerca libri, gestisci la tua libreria, tieni traccia dei progressi e visualizza le tue statistiche di lettura.

**Live:** [libro-log-beryl.vercel.app](https://libro-log-beryl.vercel.app)

---

## Funzionalità

- **Ricerca libri** tramite Google Books API
- **Libreria personale** con stati: In lettura, Letto, Da leggere, Abbandonato
- **Tracciamento pagine** con shortcuts (+10, +25, +50)
- **Date di inizio/fine**, valutazione a stelle, note
- **Dashboard** con libro corrente, progresso e statistiche annuali
- **Statistiche** mensili, autori preferiti, libri meglio valutati
- **Autenticazione** passwordless via magic link (email OTP)
- **Multi-device** — dati sincronizzati su Supabase

---

## Stack

| Layer | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS v4 |
| Font | Newsreader + Manrope (Google Fonts) |
| Icone | Material Symbols Outlined |
| Backend / Auth | Supabase (PostgreSQL + Auth) |
| Deploy | Vercel |
| Design | Google Stitch |

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
```

### 3. Configura Supabase

Esegui questo SQL nel tuo progetto Supabase (SQL Editor):

```sql
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
3. Su Supabase, aggiorna:
   - **Site URL** → `https://tuo-dominio.vercel.app`
   - **Redirect URLs** → aggiungi `https://tuo-dominio.vercel.app/auth/confirm`

---

## Struttura del progetto

```
app/
  page.tsx              # Dashboard
  login/page.tsx        # Login con magic link
  auth/confirm/route.ts # Callback autenticazione
  libreria/page.tsx     # Libreria con filtri
  ricerca/page.tsx      # Ricerca Google Books
  statistiche/page.tsx  # Statistiche di lettura
  libro/[id]/page.tsx   # Dettaglio libro
components/
  BottomNav.tsx         # Navigazione inferiore
  BookCard.tsx          # Card libro con copertina
  RatingStars.tsx       # Valutazione a stelle
context/
  BooksContext.tsx      # State globale + Supabase sync
lib/
  types.ts              # Interfaccia Book
  supabase/
    client.ts           # Client browser
    server.ts           # Client server (SSR)
```
