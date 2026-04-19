---
phase: 04-responsive-shell
plan: 02
subsystem: ui

tags: [responsive, sidebar, drawer, safe-area, focus-management, zustand, tailwind]

# Dependency graph
requires:
  - phase: 04-responsive-shell
    plan: 01
    provides: viewport-fit=cover (enables iOS env(safe-area-inset-*) nonzero values), global overflow-x hygiene
provides:
  - Responsive sidebar width (85vw capped 360px below lg, 32rem at lg+)
  - iOS safe-area insets on sidebar header (top) and account row (bottom)
  - Mobile-default drawer-closed first-paint behavior (matchMedia-based)
  - Focus-return to hamburger trigger on drawer close (via [data-sidebar-trigger="true"] query)
affects: [04-responsive-shell/04-03, 05-mobile-canvas, 06-mode-panels, 07-aux-views, 08-device-qa]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Zustand store initial value from window.matchMedia for breakpoint-aware defaults"
    - "Tailwind arbitrary values pt-[max(0.75rem,env(safe-area-inset-top))] — max() preserves original padding floor while honoring notch inset"
    - "DOM-level focus handoff via data-attribute selector (avoids ref threading across unrelated components)"

key-files:
  created: []
  modified:
    - src/components/Sidebar.tsx
    - src/stores/workspaceStore.ts

key-decisions:
  - "Drawer width below lg: w-[85vw] max-w-[360px] — leaves a canvas sliver visible as affordance cue"
  - "Desktop restore at lg+: lg:w-[32rem] lg:max-w-none — identical to pre-Phase-04 desktop layout"
  - "Safe-area insets use max(0.75rem, env(...)) so py-3 remains the floor on non-notch devices"
  - "Initial sidebarOpen uses matchMedia('(min-width: 1024px)') — static computation, no resize listener (Tailwind's lg:static lg:translate-x-0 handles breakpoint changes visually)"
  - "Focus-return uses document.querySelector('[data-sidebar-trigger=true]') — DOM-level handoff avoids threading refs through WorkspaceLayout; data-attribute is added by plan 04-03 Task 3"
  - "No auto-focus on open, no focus trap, no ESC handling — deferred per CONTEXT decisions"

patterns-established:
  - "Breakpoint-aware store defaults via matchMedia() at init — clean single-source-of-truth for first-paint state"
  - "Data-attribute-based focus handoff between sibling components — loose coupling without prop-drilling"

requirements-completed: [LAYOUT-02, LAYOUT-05]

# Metrics
duration: 2m
completed: 2026-04-19
---

# Phase 04 Plan 02: Sidebar Drawer Mechanics & Safe-Area Insets Summary

**Sidebar now behaves as a mobile drawer below lg — 85vw/360px-capped width, closed-by-default, iOS safe-area insets on top and bottom, focus-return to hamburger on close — while desktop lg+ layout is byte-for-byte preserved.**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-04-19T00:30:26Z
- **Completed:** 2026-04-19T00:32:18Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- `src/components/Sidebar.tsx` `<aside>` width switched from fixed `w-[32rem]` to responsive `w-[85vw] max-w-[360px] lg:w-[32rem] lg:max-w-none`
- Sidebar header now respects iOS status-bar/notch via `pt-[max(0.75rem,env(safe-area-inset-top))]`
- Sidebar account row now respects iOS home-indicator via `pb-[max(0.75rem,env(safe-area-inset-bottom))]`
- `src/stores/workspaceStore.ts` gains `getInitialSidebarOpen()` helper; `sidebarOpen` default is now `true` on `lg+` and `false` below (via `matchMedia('(min-width: 1024px)')`)
- `Sidebar.tsx` adds `useEffect` keyed on `sidebarOpen` that focuses `[data-sidebar-trigger="true"]` on open→closed transition (data-attribute lands in plan 04-03 Task 3 — safe no-op until then)
- Production build (`npm run build`) passes in 423ms
- Lint on modified files (`eslint src/components/Sidebar.tsx src/stores/workspaceStore.ts`) passes clean — no new errors introduced

## Task Commits

1. **Task 1: Responsive sidebar width and iOS safe-area insets** — `396971a` (feat)
2. **Task 2: Responsive default sidebarOpen + focus-return on drawer close** — `448a158` (feat)

## Files Created/Modified

- `src/components/Sidebar.tsx` — responsive width on `<aside>`, safe-area insets on header + account row, React `useEffect`/`useRef` import + focus-return effect
- `src/stores/workspaceStore.ts` — new `getInitialSidebarOpen()` helper; `sidebarOpen: true` replaced with `sidebarOpen: getInitialSidebarOpen()`
- `.planning/phases/04-responsive-shell/deferred-items.md` — logs pre-existing unrelated lint errors out-of-scope for this plan

## Exact Changes Applied

**`src/components/Sidebar.tsx` — `<aside>` classes:**

```tsx
<aside
  className={`
    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
    fixed inset-y-0 left-0 z-40 w-[85vw] max-w-[360px] border-r border-border bg-background
    flex flex-col
    lg:static lg:translate-x-0 lg:w-[32rem] lg:max-w-none
  `}
>
```

**`src/components/Sidebar.tsx` — header and account row:**

```tsx
<div className="border-b border-border px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
...
<div className="border-t border-border px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
```

**`src/components/Sidebar.tsx` — focus-return effect (inside `Sidebar()`):**

```tsx
const prevSidebarOpen = useRef(sidebarOpen)
useEffect(() => {
  const wasOpen = prevSidebarOpen.current
  prevSidebarOpen.current = sidebarOpen
  if (wasOpen && !sidebarOpen) {
    const hamburger = document.querySelector<HTMLButtonElement>('[data-sidebar-trigger="true"]')
    if (hamburger) hamburger.focus()
  }
}, [sidebarOpen])
```

**`src/stores/workspaceStore.ts` — helper + initial value:**

```typescript
function getInitialSidebarOpen(): boolean {
  if (typeof window === 'undefined') return true
  return window.matchMedia('(min-width: 1024px)').matches
}

// ... in create() return object:
sidebarOpen: getInitialSidebarOpen(),
```

## Decisions Made

- **Responsive width pattern:** Arbitrary-value utilities (`w-[85vw] max-w-[360px]`) rather than `max-w-sm` + custom CSS — matches the existing arbitrary-value pattern already used (`w-[32rem]`).
- **Safe-area `max(..., env(...))` form:** Preserves the existing `py-3` (0.75rem) as the floor on non-notch devices; only notched devices get the larger inset. Using plain `pt-[env(...)]` would collapse to 0 on desktop/Android.
- **Static initial sidebarOpen** (not reactive to resize): Tailwind's `lg:static lg:translate-x-0` on the `<aside>` means the aside always renders correctly at `lg+` regardless of the boolean. A resize listener would add complexity without visual payoff.
- **Data-attribute focus handoff over ref threading:** Hamburger lives in `Canvas.tsx`, Sidebar is a sibling. Threading refs through `WorkspaceLayout` → either child would require prop drilling and extra store slices. A `document.querySelector('[data-sidebar-trigger="true"]')` from inside a `useEffect` is one line and couples only on a stable DOM attribute.
- **No regression on desktop:** Verified that `lg:static lg:translate-x-0 lg:w-[32rem] lg:max-w-none` fully overrides the mobile width/transform rules at `lg+`.

## Deviations from Plan

None — plan executed exactly as written. Both tasks landed on first attempt with grep/build verification passing.

## Issues Encountered

- **Pre-existing lint errors** in `src/components/ui/button.tsx`, `src/hooks/useBrandModels.ts`, `src/hooks/useGenerations.ts` — detected during `npm run lint` but NOT in files modified by this plan. Per executor scope boundary rule, these are out-of-scope; logged to `.planning/phases/04-responsive-shell/deferred-items.md`. Direct lint on modified files (`eslint src/components/Sidebar.tsx src/stores/workspaceStore.ts`) exits clean.

## User Setup Required

None — no external service configuration required. Mobile and iOS safe-area behavior can be verified in browser DevTools (device emulator) and on physical iPhone in plan 04-03/Phase 08.

## Next Phase Readiness

- **Plan 04-03 must add `data-sidebar-trigger="true"` to the Canvas hamburger `<button>`** for focus-return to work end-to-end. Until then the effect is a safe no-op (selector returns null, nothing happens).
- Plan 04-03 can now assume sidebar drawer mechanics (width + safe-area + first-paint state + focus-return plumbing) are complete and focus only on canvas toolbar `flex-wrap`, `min-w-0` concerns, and the hamburger trigger attribute.
- No blockers.

## Self-Check: PASSED

- `src/components/Sidebar.tsx` contains `w-[85vw]`, `max-w-[360px]`, `lg:w-[32rem]`, `lg:max-w-none`: FOUND (line 48, 50)
- `src/components/Sidebar.tsx` contains no bare `w-[32rem]` without `lg:` prefix: CONFIRMED (grep returned 0)
- `src/components/Sidebar.tsx` contains `env(safe-area-inset-top)` and `env(safe-area-inset-bottom)`: FOUND (lines 54, 161)
- `src/components/Sidebar.tsx` imports `useEffect, useRef` from 'react': FOUND (line 1)
- `src/components/Sidebar.tsx` contains `prevSidebarOpen` ref and `document.querySelector` inside useEffect: FOUND (lines 41–47)
- `src/components/Sidebar.tsx` contains `[data-sidebar-trigger="true"]`: FOUND (line 47)
- `src/stores/workspaceStore.ts` contains `function getInitialSidebarOpen`: FOUND (line 21)
- `src/stores/workspaceStore.ts` contains `matchMedia('(min-width: 1024px)')`: FOUND (line 23)
- `src/stores/workspaceStore.ts` contains `sidebarOpen: getInitialSidebarOpen()`: FOUND (line 122)
- `src/stores/workspaceStore.ts` contains no `sidebarOpen: true,`: CONFIRMED (grep returned 0)
- Commit `396971a` exists in git log: FOUND
- Commit `448a158` exists in git log: FOUND
- `npm run build` exits 0: CONFIRMED (built in 423ms)
- `eslint` on modified files exits 0: CONFIRMED (no output)

---
*Phase: 04-responsive-shell*
*Completed: 2026-04-19*
