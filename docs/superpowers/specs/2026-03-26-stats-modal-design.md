# Stats Modal — Mapa do Sossego

**Date:** 2026-03-26
**Feature:** Refactor StatsPanel from dropdown to centered modal with filter toggles

---

## Problem

The current `StatsPanel` renders as an `absolute` dropdown below its trigger button. As the number of entries grows, the panel overflows off-screen with no scroll. It also shows all content simultaneously with no way to filter.

---

## Solution: Centered Modal with Backdrop (Option A)

### Structure

- `StatsPanel` renders a portal (`createPortal`) into `document.body`
- **Backdrop:** `fixed inset-0 z-[100] bg-black/60` — clicking it closes the modal
- **Modal container:** `fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101]`
  - Width: `w-[min(90vw,360px)]`
  - Max height: `max-h-[70vh]`
  - Internal scroll: `overflow-y-auto`
  - Visual: `bg-background border-3 border-border brutal-shadow` (matches project style)
- **Close button (X):** top-right corner of the modal

### Header

Single row inside the modal header:
- Left: `"ESTATÍSTICAS"` — `font-heading text-sm font-bold uppercase`
- Right: two filter toggle buttons — `🔴` and `🟢`

### Filter Toggle Behavior

- Default state: neither selected → neutral style (no active border/background)
- Active state: `border-2 border-black` + colored background (`bg-red-400` for critical, `bg-green-400` for quiet)
- Clicking an active button deactivates it (returns to "all")
- The two buttons are mutually exclusive — activating one deactivates the other
- State is local to the modal (`useState<'all' | 'critical' | 'quiet'>`)

### Content Logic

| Filter state | Content shown |
|---|---|
| `all` | Section "Mais críticas" + Section "Mais silenciosas" (same as today) |
| `critical` | Only "Mais críticas" section |
| `quiet` | Only "Mais silenciosas" section |

Each entry in a section remains a clickable button that calls `flyTo()` and closes the modal (same as today).

---

## Files Affected

- `src/app/ferramentas/mapa-do-sossego/_components/StatsPanel.tsx` — full rewrite
- `src/i18n/pt.ts` and `src/i18n/en.ts` — no new keys needed (existing `stats.*` keys are sufficient)

---

## Out of Scope

- No changes to data fetching (`getNoiseZones`)
- No changes to MapClient, FilterBar, or other components
- No new i18n keys
