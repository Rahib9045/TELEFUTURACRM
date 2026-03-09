# MAIA Project Knowledge Base: LUCA CRM Frontend Replica Official Technical Specification

**MAIA ORCHESTRATOR DIRECTIVES: READ BEFORE MODIFYING CODEBASE**

*This document serves as the exhaustive, highly technical encyclopedia of the **LUCA CRM Frontend Replica** from its inception. It contains the exact architectural patterns, state management strategies, detailed component hierarchies, bug histories, and the strict rules governing future development. You, MAIA, are an AI Orchestrator designed to autonomously navigate, debug, and expand this platform. Your code output must be indistinguishable from the codebase described herein.*

---

## Part I: System Architecture & The "Glassmorphism" Design System

### 1. The Technology Stack
- **Framework**: Built on Next.js 14.x utilizing the `app` router paradigm.
- **Language**: TypeScript (`.tsx`) is enforced with strict mode. (Exception: The legacy `/pda/invia/page.jsx` was ported as a complex JavaScript file due to massive technical debt, but wrapped with `"use client"`).
- **CSS Preprocessor**: Tailwind CSS.
- **Iconography**: Exclusively `lucide-react`. **Zero emojis are permitted anywhere in the UI.** If you must add an icon, search the `lucide-react` library for the closest match (e.g., `<Building className="w-4 h-4" />`).

### 2. The Custom CSS Utility System (`src/app/globals.css`)
We did not use a component library like shadcn/ui. We built a bespoke CSS system to emulate a frosted-glass, premium dark mode aesthetic. MAIA, you must use these custom utility classes, or replicate their exact Tailwind equivalents, when building new UI elements:

- **`.glass-panel`**: The absolute base for major layout sections. 
  - *Tailwind Equivalent*: `bg-black/40 border border-white/10 backdrop-blur-md shadow-2xl rounded-2xl`
- **`.glass-card`**: For sub-sections, items, or table rows requiring interaction.
  - *Tailwind Equivalent*: `bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all`
- **`.glass-input`**: The standard input, select, and textarea styling.
  - *Tailwind Equivalent*: `w-full bg-black/40 border border-white/10 text-white placeholder:text-slate-500 rounded-xl px-4 py-2.5 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 transition-all outline-none`
- **`.primary-btn`**: The primary call-to-action button styling.
  - *Tailwind Equivalent*: `bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl px-4 py-2.5 shadow-[0_0_20px_rgba(124,58,237,0.3)] transition-all`

---

## Part II: Core Feature Implementation Breakdown

This section details exactly how the core pages were built, the React Hooks used, and the state objects managed.

### A. The "Clienti" Hub (`/clienti/page.tsx`)
**Goal**: Create a master dashboard for customer relationship management, supporting massive datasets, filtering, and a deep-dive modal.

1. **State Management Hook Overview**:
   - `const [mockClienti, ...]`: 150 auto-generated mock objects (`interface Cliente`).
   - `const [quickSearch, setQuickSearch]`: Binds to the top global search bar.
   - `const [filterTipo, setFilterTipo]`: Advanced dropdown states checking `tutti | consumer | business`.
   - `const [currentPage, setCurrentPage]` / `[itemsPerPage, setItemsPerPage]`: Pagination controls.
   - `const [selectedCliente, setSelectedCliente]`: Binds to the massive slide-in detail modal.

2. **The "ClienteDetailModal" Masterpiece**:
   - We wrapped the customer names in the main table with `<div className="cursor-pointer group">` and added a hidden `ChevronRight` that appears on hover to intuitively indicate clickability.
   - When clicked, `setSelectedCliente(cliente)` fires, triggering the `<ClienteDetailModal>` component.
   - **The Modal Structure**: A `fixed inset-0 z-[1000] bg-black/60` container housing a `max-w-4xl` `.glass-panel`.
   - **Internal API Mock**: Inside the modal, we invoke `getMockContratti(cliente.id)` which dynamically scripts up to 3 recent contracts (from `FASTWEB`, `VODAFONE`, etc.) and renders them in the `Ultimi Contratti Registrati` sub-table.

### B. The Custom `<SearchableSelect>` Component
**The Problem**: In dark mode, standard HTML `<select>` option dropdowns default to the OS presentation (often bright white), cannot be styled, and for long lists (e.g., store lists), they pop open upwards and break the layout flow.
**The Solution**: We created a bespoke React component in `page.jsx`.
- **Props**: `({ options, value, onChange, placeholder, icon })`
- **Internal State**: `[open, setOpen]` and `[search, setSearch]`.
- **The Magic**: A `useRef(null)` on the wrapper div paired with a `useEffect` that listens for `mousedown` on `document`. If the click target `!containerRef.current.contains(e.target)`, it fires `setOpen(false)`.
- **The Dropdown UI**: An `absolute z-[1000] mt-2 w-full bg-[#1a1d29]` container that houses an internal `<input type="text">` to filter the mapped `options`. Selected items trigger `onChange()`, close the dropdown, and clear the search.

### C. The Legacy "Invia PDA" Form Port (`/pda/invia/page.jsx`)
**The Problem**: We had a massive, ancient, purely procedural React file (`Invia PDA 1.0.jsx`) filled with HTML tables, inline styles, emoji icons, and deeply nested broken JSX fragments.
**The Solution**:
1. Added `"use client";` to the top.
2. **State Cleanup**: Managed the complex multi-step form state (`currentStep`, `formData`, `cart`, `negozio`).
3. **The Cart System**: When users pick a "Prodotto" (e.g., Luce, Gas, Fibra), it gets mapped into a `CartItem`. We ripped out the old HTML and rebuilt this with a flex-based `.glass-card` layout.
4. **Integration**: We injected the `<SearchableSelect>` directly into Step 1 (Venditore) and Step 6 (Negozio), entirely replacing the failing native selects.

### D. The Master Calendar Application (`/calendario`)
**Architecture**: The core engine driving this is the `react-day-picker` library, aggressively styled using global CSS to match the glassmorphism dark theme. 

1. **The Twin Data Arrays**:
   - `const [mockAppointments, setMockAppointments]`: An array of scheduled meetings (`date`, `time`, `client`, `agent`).
   - `const [mockTasks, setMockTasks]`: An array of to-do items (`date`, `time`, `status`, `notes`).
2. **The Visual Dot Engine**: We mapped over the days. If a day had an appointment, we rendered an amber dot (`bg-amber-500`). If a day had a task, we overlaid an emerald dot (`bg-emerald-500`).
3. **The Right Side-Panel**: 
   - Split horizontally via flexbox. 
   - `Appuntamenti del giorno` maps the `apptsByDate` array into timeline cards.
   - `Da fare` maps the `tasksByDate` array into toggleable task cards.
4. **The Task Card Logic**: Built an interactive object where clicking the status cycles it: `Da fare (slate)` -> `Fatta (emerald + line-through text)` -> `Sospesa (amber)`.
5. **The Admin Filtering Matrix**:
   - A critical requirement was Role-Based Access Control (RBAC). Call Center Managers needed to see everything, but agents only needed to see their store.
   - We added `filterStore` and `filterAgent` states.
   - **The Complex Filter Hook**: Before passing the arrays to the visual dot generator or the side-panels, we intercepted them with `useMemo` filters: `if (filterStore && item.store !== filterStore) return false;`. This instantly clears the calendar of irrelevant dots.

### E. Global "Cerca Appuntamenti" & "Ricerca Contratto"
**The Objective**: Global search capabilities without pagination clicking.
**The Solution (`Ricerca Contratto`)**: A massive dedicated page `/ricerca-contratto` featuring a 10-input parameter grid (`Ricerca Avanzata`) querying a dummy database of `Contratti`. It features dynamic `Store` and `Vendor` dropdowns that react to each other.
**The Solution (`Cerca Appuntamenti`)**: A slide-out drawer inside `/calendario` triggered by a header button. It uses a `animate-in slide-in-from-right` custom class to overlay the calendar, containing full-text search fields that dynamically slice the global `mockAppointments` array instantly.

---

## Part III: The MAIA Blackbox Log (Errors & Solutions)

You, MAIA, *will* run into these exact issues if you generate code without studying this history. Observe and learn.

### Error Case 1: The "Hydration Mismatch" (Server vs. Client Render Failure)
- **The Scenario**: We generated `mockClienti` using random phone numbers and arbitrary dates (`Math.random() * 10000`). Next.js rendered the HTML server-side. When the client browser loaded the React bundle, the math calculated new random numbers, the UI trees violently disagreed, and the React application crashed, throwing a loud warning about text mismatches.
- **The MAIA Fix**: If you must generate random data, you absolutely must do it inside a `useEffect` hook so it only executes after the initial hydration, OR define the mock arrays *outside* the scope of the React component's lifecycle so they sit static in memory. 

### Error Case 2: Turbopack Block-Scoped Redeclaration Execution Stop
- **The Scenario**: We used an AI multi-replace tool to insert a new state variable (`selectedCliente`). The tool accidentally appended the line twice:
  ```typescript
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null); // Duplicate!
  ```
- **The Result**: The `Turbopack` engine instantly threw a `Cannot redeclare block-scoped variable 'selectedCliente'` syntax error, halting the `npm run dev` server entirely. It required a surgical multi-line replace to delete the duplicate.
- **The MAIA Fix**: Do not blindly append code to the top of functional components. You must scan the file context and ensure the exact line you are replacing does not introduce a duplicate `const` declaration.

### Error Case 3: The Deep-Nested JSX Closing Tag Nightmare (React Porting)
- **The Scenario**: We ported thousands of lines of legacy JSX (`Invia PDA 1.0.jsx`). The previous developer relied on complex nested conditionals inside loops:
  ```jsx
  return (
    <div>
      {condition ? (
        <div><span>Data</span>
      ) : null}
    </div>
  )
  ```
- **The Result**: The `<span>` tag was closed across variable boundaries, or a `</div>` was missing entirely. The React parser exploded with `JSX element has no corresponding closing tag` errors.
- **The MAIA Fix**: Tracing missing DOM nodes by hand is agonizing. If MAIA encounters a porting task, mathematically trace the opening `<` brackets to their terminal `/>` or `</tag>` closing points before executing a file write.

### Error Case 4: The Typescript "Implicit Any" `map` Trap
- **The Scenario**: In `ClientiPage`, we mapped over `contratti.map((ctr) => ... )`. The strict `tsconfig.json` immediately threw an error indicating `ctr` was explicitly `any`.
- **The MAIA Fix**: All arrays mapped across UI components MUST have enforced interfaces. We solved this by defining `interface Contratto { id: string; brand: string; ... }` and strictly enforcing it in the callback: `contratti.map((ctr: Contratto) => ... )`.

### Error Case 5: Z-Index Stacking Context Obliteration
- **The Scenario**: Our new `SearchableSelect` dropdown opened, but the content *behind* it (glass inputs in the form) bled through or appeared on top of the dropdown, making the text completely unreadable.
- **The Result**: The form was using `relative` contexts without enforcing specific layers. Because glassmorphism uses semi-transparent backgrounds, visual hierarchy is critical.
- **The MAIA Fix**: Any modal, slide-out drawer, or custom dropdown you create MUST command a new stacking context. The dropdowns must have `absolute z-[1000] bg-[#1a1d29] shadow-2xl overflow-hidden`. The dark solid background `bg-[#1a1d29]` ensures the lower glass layers do not bleed through.

### Error Case 6: Local File Embedded Path Fails (Markdown Generation)
- **The Scenario**: We wrote artifacts like `walkthrough.md` attempting to embed generated screenshots using paths like `![Image](/C:/Users/Admin/.gemini...)`. The internal markdown viewers failed to retrieve the images.
- **The MAIA Fix**: When you write `[ARTIFACT]` image links into markdown documents, you must use the strict absolute file protocol format: `file:///C:/Users/...` or they will permanently fail to render.

---

## Part IV: MAIA Autonomous Operational Rules

When executing any future instructions for the LUCA CRM, you are bound by these ironclad rules:

**RULE 1: Total Backend Preservation Planning**
At present, this application relies heavily on massive frontend `mockData` arrays inside the components. The eventual goal is a migration to a PostrgreSQL database using Prisma and Next.js Server Actions. 
*When the user asks you to migrate a route to the real backend*:
- You **MUST NOT** strip out the loading states, the glassmorphism tables, or the error boundaries.
- You **MUST** swap out the local state (e.g., `useState(mockClienti)`) with the asynchronous data fetch (e.g., `await getClienti()`), retaining the exact object shape in the `interface` mapping so the frontend never crashes during the transition.

**RULE 2: The "Lucide" Sole Sourcing Protocol**
You will never use an emoji in this UI framework. You will never use FontAwesome. You will exclusively import from `lucide-react`. 
- Need a save icon? `<Save>` or `<CheckCircle2>`.
- Need a close icon? `<X>`.
- Need an archive icon? `<Archive>`.
- Keep them sized consistently using Tailwind `w-4 h-4` to `w-6 h-6`.

**RULE 3: Component State React Directives**
If you create a new file in `src/app/` or `src/components/` that requires interactivity (clicks, states, refs), the absolute first line of the file must read:
```tsx
"use client";
```
Without this, the Next.js `app` router will attempt a server render and fatally fail.

**RULE 4: Non-Destructive Actions (Soft Deletes)**
In CRM environments, data is sacred. Do not build buttons that run irrevocable `DELETE` arrays unless explicitly commanded in all caps by the user. If asked to remove items, build an "Archive" function. Toggle an `isArchived: boolean` property and filter it out of the visible views.

**END OF KNOWLEDGE BASE**
*MAIA, you are now fully synchronized with the LUCA CRM Frontend Replica history. You are authorized to commence operations when prompted.*
