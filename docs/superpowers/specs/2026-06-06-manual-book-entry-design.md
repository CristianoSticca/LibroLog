# Aggiunta manuale di libri

**Data:** 2026-06-06  
**Problema:** Alcuni libri acquistati (con ISBN) non sono presenti né su Google Books né su Open Library, quindi non possono essere importati tramite ricerca.  
**Soluzione:** Form di inserimento manuale accessibile dalla pagina `/ricerca`.

---

## Trigger e posizionamento

Il bottone "Aggiungi manualmente" compare in due punti della pagina `/ricerca`:

1. **Default (nessuna ricerca attiva):** bottone secondario discreto visibile sopra le classifiche La Feltrinelli.
2. **Stato "nessun risultato":** bottone più prominente con testo "Non trovato? Aggiungilo a mano", mostrato sotto il messaggio di ricerca vuota.

Il click apre un **modal** sovrapposto alla pagina, seguendo lo stesso pattern del componente `IsbnScanner` già presente.

---

## Form — Campi

### Obbligatori
| Campo | Note |
|-------|-------|
| Titolo | Input testo libero |
| Autore | Input testo libero |
| Stato | Bottoni "Inizia a leggere" / "Da leggere" — stesso stile visivo dei risultati di ricerca |

### Opzionali
| Campo | Note |
|-------|-------|
| ISBN | Pre-compilato se l'utente aveva cercato per ISBN nella barra di ricerca |
| Numero di pagine | Input numerico |
| Anno di pubblicazione | Input numerico (4 cifre) |
| Copertina | Toggle tra "URL" (input testo con link immagine) e "Foto" (file upload → convertito in data URL, salvato in localStorage) |

---

## Comportamento al salvataggio

- Validazione: titolo e autore obbligatori, form non inviabile se vuoti.
- Al submit chiama `addBook()` da `BooksContext` con i dati compilati — stesso meccanismo usato dai risultati Google Books e dalle classifiche.
- Se stato = "Inizia a leggere": `startDate` impostato alla data odierna, redirect a `/`.
- Se stato = "Da leggere": redirect a `/libreria`.
- `googleBooksId` e `openLibraryKey` lasciati `undefined` (libro inserito manualmente).

---

## Copertina — gestione

**URL manuale:** la stringa viene salvata direttamente nella colonna `cover` della tabella `books` su Supabase.

**Foto upload:** il file viene letto con `FileReader` e convertito in data URL (base64), salvata in localStorage. Non viene caricata su Supabase Storage.

---

## Componenti da creare / modificare

| Elemento | Azione |
|----------|--------|
| `components/AddBookManuallyModal.tsx` | Nuovo componente modal con il form |
| `app/ricerca/page.tsx` | Aggiungere bottone trigger + stato modal aperto/chiuso |

---

## Fuori scope

- Fallback automatico su Open Library (scartato: anche lì i libri non ci sono).
- Pagina dedicata `/aggiungi` (scartata: modal è sufficiente e mantiene il contesto).
- Upload copertina su cloud storage (app usa localStorage, non necessario).
