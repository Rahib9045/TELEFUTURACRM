# Production Audit — Supabase Wiring & Buttons

**Date:** Post full-project audit. All data flows and buttons checked against Supabase and migrations.

---

## ✅ Fully wired to Supabase (production-ready)

| Page / Area | Data source | Main actions |
|-------------|-------------|--------------|
| **Dashboard** | `contracts` (brand, categoria, stato, created_at) | Date filters, "Aggiorna Grafici", "Pulisci" refetch from Supabase |
| **Clienti** | `clients` | List, create (with generated `id`), update, detail modal, "Nuovo Cliente", "Modifica" |
| **Gestione PDA** | `contracts` + `clients` (join) | List, filters, status/note update |
| **Registra Contratto** | `clients` (upsert), `contracts` (insert), `contract_attachments` (insert), storage `contracts` | Full submit: client upsert → file upload → contracts insert → attachment rows |
| **Ricerca Contratto** | `contracts` + `clients` (join) | Paginated list, filters (incl. client name), "Modifica stato" update |
| **Tracking PDA** | `contracts` + `clients` (join) | Paginated list, filters (incl. ragione sociale), export CSV |
| **Invia PDA** | Same as Registra (clients, contracts, attachments, storage) | Full submit wired |
| **Collaboratori** | `shifts`, `vacation_requests`, `sickness_absences` | Badge in/out/pause, ferie request/approve/reject, malattia create/list |
| **Usati** | `usati`, storage `usati_attachments` | List, create, update, status change, file upload |
| **Ordine Merce** | `merchandise_orders`, `merchandise_order_items` | List, create order + items, status/ETA update, bulk actions |
| **Chiusura Negozio** | `chiusura`, `chiusura_attachments`, storage `chiusura` | List, create closure, upload files, "Emessa" toggle |
| **Password (V2)** | API → `password_credentials`, `password_access_log` | List by brand/category/store, reveal (logs access) |
| **Calendario** | `appointments`, `calendar_tasks`, `agenda_blocks`, `calendar_meetings` | CRUD for all four; create/update/status/outcome |
| **Documentazione** | `documentation`, storage `documentation` | List, upload, delete, rename |
| **Comunicazioni** | `comunicazioni` | List, "Segna come letto" (localStorage), "Segna tutti come letti" |

---

## 🔧 Fixes applied during audit

1. **Clienti — Nuovo Cliente**  
   Insert now sends a generated `id` (`CL-${cfPiva}-${Date.now()}`). Previously the insert omitted `id` and would fail (PK required).

2. **Ricerca Contratto / Tracking PDA — Filtro per nome cliente**  
   Filter by client name (nome/cognome/ragione_sociale) now uses correct Supabase nested filter:  
   `clients.nome.ilike.%term%,clients.cognome.ilike.%term%,clients.ragione_sociale.ilike.%term%`  
   and input is sanitized (no `,` or `"`) so the `.or()` query does not break.

3. **Merchandise orders (016 + 020)**  
   - 016: Policies made idempotent (`DROP POLICY IF EXISTS` before `CREATE POLICY`).  
   - 020: Anon read/write policies so Ordine Merce works with the anon key.

---

## ⚠️ Production notes (no code change)

- **Auth**  
  Login is still **mock** (`AuthContext` + `MOCK_USERS`). For production you’ll want Supabase Auth (or another provider) and to replace the mock login with real sign-in and session.

- **Calendario — Agenti / negozi / meeting users**  
  Dropdowns use **static** lists: `MOCK_AGENTS`, `MOCK_STORES`, `MOCK_MEETING_USERS`. Calendar **data** (appointments, tasks, blocks, meetings) is in Supabase; only reference data for assignees/stores is mock. Optional improvement: load agents/stores from a table or from auth.

- **Ordine Merce — Order number**  
  `order_number` is `ORD-{year}-{orders.length + 1}`. Under concurrency, two users can get the same number. For production, consider a DB sequence or `gen_random_uuid()` and display that (or a separate human-readable counter).

- **Chiusura / Usati / Documentation storage**  
  Some storage policies use `TO authenticated`. If you only use the **anon** key (no Supabase Auth), upload/read may be denied until you add anon policies or use the service role.

- **Comunicazioni — "Segna come letto"**  
  Read state is stored in **localStorage** only, not in Supabase. Optional: add a `comunicazioni_read` table or user-read tracking if you need cross-device read state.

---

## Migrations to run (if not already)

Run in this order in Supabase SQL Editor:

1. **001** → **019** (as you had before).  
2. **020_merchandise_anon_policies.sql** — so Ordine Merce works with anon key.

No need to re-run **016** unless you want the idempotent policy definitions; existing DB is already correct.

---

## Quick checklist (every button / data)

- Dashboard: dates + Aggiorna Grafici + Pulisci → Supabase `contracts`.
- Clienti: list, nuovo, modifica, dettaglio → `clients`.
- Gestione: list, filtri, note, stato → `contracts` (+ clients).
- Registra Contratto: lookup CF/PIVA, submit (client + contracts + attachments + storage) → Supabase.
- Ricerca Contratto: list, filtri (incl. cliente), modifica stato → `contracts` (+ clients).
- Tracking PDA: list, filtri, export → `contracts` (+ clients).
- Invia PDA: same flow as Registra → Supabase.
- Collaboratori: badge, ferie, malattia → `shifts`, `vacation_requests`, `sickness_absences`.
- Usati: list, nuovo, modifica, allegati → `usati` + storage.
- Ordine Merce: list, crea ordine, aggiorna stato/ETA, bulk → `merchandise_orders` / `merchandise_order_items`.
- Chiusura: list, crea, upload, emessa → `chiusura`, `chiusura_attachments`, storage.
- Password V2: list, reveal → API → `password_credentials`, `password_access_log`.
- Calendario: appointments, tasks, blocks, meetings CRUD → Supabase (reference lists still mock).
- Documentazione: list, upload, delete, rename → `documentation` + storage.
- Comunicazioni: list, segna letto → `comunicazioni` (read state in localStorage).

All of the above are wired; the only intentional “mock” left is **Auth** (and optional reference data on Calendario).
