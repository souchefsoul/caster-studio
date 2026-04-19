---
phase: 04-responsive-shell
plan: 03
subsystem: ui

tags: [responsive, canvas, toolbar, hamburger, safe-area, flex-wrap, focus-management, zustand, tailwind]

# Dependency graph
requires:
  - phase: 04-responsive-shell
    plan: 01
    provides: viewport-fit=cover (enables nonzero env(safe-area-inset-top) on notched iOS), global overflow-x hygiene
  - phase: 04-responsive-shell
    plan: 02
    provides: Sidebar focus-return useEffect that queries [data-sidebar-trigger="true"] on drawer close
provides:
  - Auto-close drawer on currentMode or activeView change below lg (useEffect in WorkspaceLayout)
  - Canvas hamburger carries data-sidebar-trigger="true" + aria-label (closes 04-02 focus-return contract end-to-end)
  - Canvas toolbar respects env(safe-area-inset-top) via max(0.5rem, env(...)) floor
  - min-w-0 on toolbar left flex-wrap parent + truncate on generation-count span (intrinsic-size overflow fix at 360px)
  - gap-2 between left button group and hamburger when wrapping
affects: [05-mobile-canvas, 06-mode-panels, 07-aux-views, 08-device-qa]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "useEffect dependency array watching multiple zustand slices ([currentMode, activeView]) to trigger a single side-effect"
    - "matchMedia gate inside effect (window.matchMedia('(min-width: 1024px)').matches) to scope mobile-only behavior without resize listeners"
    - "Tailwind arbitrary-value class pt-[max(0.5rem,env(safe-area-inset-top))] — preserves py-2 (0.5rem) floor on non-notch devices, extends on notched"
    - "min-w-0 on flex-wrap parent to allow children to shrink below intrinsic content size — idiomatic Tailwind fix for flex horizontal overflow"

key-files:
  created: []
  modified:
    - src/components/WorkspaceLayout.tsx
    - src/components/Canvas.tsx

key-decisions:
  - "Auto-close effect lives in WorkspaceLayout (not Sidebar or Canvas) because it owns the backdrop and both Sidebar + Canvas as children — it is the natural host for cross-component drawer lifecycle"
  - "Dependency array includes BOTH currentMode and activeView so either transition triggers close — matches LAYOUT-03 CONTEXT decision verbatim"
  - "matchMedia isDesktop guard inside effect (not a conditional hook) — keeps the effect unconditional for React's rules-of-hooks while the body is scoped correctly"
  - "data-sidebar-trigger='true' + aria-label='Toggle sidebar' added together — icon-only button needed the aria-label anyway for screen readers; combining with the data-attribute keeps attribute churn to a single change"
  - "Kept lg:hidden on hamburger unchanged — hamburger must NOT appear on desktop where sidebar is always visible"
  - "max(0.5rem, env(safe-area-inset-top)) — 0.5rem matches existing py-2 floor; plain pt-[env(...)] would collapse to 0 on non-notch devices and visually shift the toolbar"
  - "gap-2 on toolbar root (justify-between parent) — ensures hamburger never butts directly against a wrapped left-group label at tiny widths"

patterns-established:
  - "Multi-slice useEffect for cross-component UI lifecycle — single effect responds to any of several zustand store changes"
  - "matchMedia-inside-effect for viewport-scoped behavior without subscribing to resize events"

requirements-completed: [LAYOUT-03, LAYOUT-04, LAYOUT-05]

# Metrics
duration: 1 min
completed: 2026-04-19
---

# Phase 04 Plan 03: Auto-close Drawer + Canvas Hamburger Identity + Toolbar Safe-Area Summary

**Mobile drawer now auto-closes on mode/view change below lg, the Canvas hamburger carries data-sidebar-trigger so plan 04-02's focus-return works end-to-end, and the canvas toolbar respects iOS safe-area-inset-top with min-w-0 intrinsic-size overflow protection at 360px.**

## Performance

- **Duration:** ~1 min
- **Started:** 2026-04-19T00:35:18Z
- **Completed:** 2026-04-19T00:36:44Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- `src/components/WorkspaceLayout.tsx` gains `useEffect` from React, `currentMode` selector, and a single effect with dependency array `[currentMode, activeView, setSidebarOpen]` that calls `setSidebarOpen(false)` only below lg (matchMedia-guarded)
- `src/components/Canvas.tsx` hamburger `<Button>` now carries `data-sidebar-trigger="true"` (closes cross-plan contract with 04-02's focus-return effect) and `aria-label="Toggle sidebar"` (a11y for icon-only button)
- `src/components/Canvas.tsx` toolbar root adds `gap-2` and `pt-[max(0.5rem,env(safe-area-inset-top))]`
- `src/components/Canvas.tsx` left flex-wrap parent gains `min-w-0`; generation-count `<span>` gains `min-w-0 truncate` to prevent 360px horizontal overflow from long translated labels
- `npm run build` passes in 394ms
- `npx eslint src/components/WorkspaceLayout.tsx src/components/Canvas.tsx` passes clean — no new lint errors introduced

## Task Commits

1. **Task 1: Auto-close drawer on currentMode or activeView change (below lg only)** — `b688808d` (feat)
2. **Task 2: Canvas hamburger identity + toolbar safe-area + flex-wrap hardening** — `98925d8a` (feat)

## Files Created/Modified

- `src/components/WorkspaceLayout.tsx` — React `useEffect` import, `currentMode` store selector, auto-close effect gated to below-lg via matchMedia
- `src/components/Canvas.tsx` — `data-sidebar-trigger` + `aria-label` on hamburger, `gap-2` + `pt-[max(0.5rem,env(safe-area-inset-top))]` on toolbar root, `min-w-0` on left flex parent + `min-w-0 truncate` on generation-count span

## Exact Changes Applied

**`src/components/WorkspaceLayout.tsx` — auto-close effect:**

```tsx
import { useEffect } from 'react'
// ...
const currentMode = useWorkspaceStore((s) => s.currentMode)

useEffect(() => {
  // Below lg, navigation (mode switch or view switch) should return the user to the canvas.
  // On lg+ the sidebar is always visible as a fixed column, so this is a no-op.
  if (typeof window === 'undefined') return
  const isDesktop = window.matchMedia('(min-width: 1024px)').matches
  if (isDesktop) return
  setSidebarOpen(false)
}, [currentMode, activeView, setSidebarOpen])
```

**`src/components/Canvas.tsx` — toolbar root + left group:**

```tsx
<div className="flex items-center justify-between gap-2 border-b border-border px-4 py-2 pt-[max(0.5rem,env(safe-area-inset-top))]">
  <div className="flex min-w-0 items-center gap-1 flex-wrap">
```

**`src/components/Canvas.tsx` — generation-count span:**

```tsx
<span className="ml-2 min-w-0 truncate text-xs text-muted-foreground">
  {generations.length} {t('workspace.canvas.generationCount')}
</span>
```

**`src/components/Canvas.tsx` — hamburger Button:**

```tsx
<Button
  variant="ghost"
  size="icon-sm"
  onClick={toggleSidebar}
  data-sidebar-trigger="true"
  aria-label="Toggle sidebar"
  className="rounded-none lg:hidden"
>
  <Menu className="size-4" />
</Button>
```

## Decisions Made

- **Auto-close effect in WorkspaceLayout (not Sidebar or Canvas):** WorkspaceLayout already owns the mobile backdrop and composes Sidebar + Canvas; it is the natural host for drawer lifecycle. Putting the effect in Sidebar would mean listening to `currentMode` from inside the drawer it is supposed to close, which inverts the ownership.
- **matchMedia-guard inside the effect (not a condition on the hook):** Effect runs unconditionally to satisfy React's rules-of-hooks; the body early-returns on desktop. Cheaper than a branched hook and avoids stomping the sidebar during resize scenarios on lg+.
- **Dependency array = [currentMode, activeView, setSidebarOpen]:** Both transitions must trigger close per CONTEXT.md LAYOUT-03 decision. `setSidebarOpen` is included because it's used inside — React's exhaustive-deps rule requires it.
- **lg:hidden preserved on hamburger:** Must not appear on desktop where the sidebar is always a fixed column.
- **max(0.5rem, env(safe-area-inset-top)) form:** Matches the existing py-2 (0.5rem) top padding as the floor on non-notch devices. Using plain `pt-[env(...)]` would collapse to 0 on Android/desktop and visually shift the toolbar.
- **gap-2 on toolbar root:** The toolbar uses `justify-between`, so when the left group wraps, its right edge can otherwise kiss the hamburger. `gap-2` provides 8px separation unconditionally.
- **aria-label added to hamburger:** Icon-only buttons need a label for screen readers; piggy-backing the a11y fix onto the same diff that adds `data-sidebar-trigger` minimizes churn.

## Deviations from Plan

None - plan executed exactly as written. Both tasks landed on first attempt with grep/build verification passing.

## Issues Encountered

- **Pre-existing lint errors** in `src/components/ui/button.tsx`, `src/hooks/useBrandModels.ts`, `src/hooks/useGenerations.ts` (3 errors, same set observed in plan 04-02). Files are NOT modified by this plan and were already logged to `.planning/phases/04-responsive-shell/deferred-items.md` during 04-02. Direct lint on files modified by this plan (`eslint src/components/WorkspaceLayout.tsx src/components/Canvas.tsx`) exits clean.

## User Setup Required

None - no external service configuration required. Mobile auto-close, safe-area inset, and focus-return behavior can be verified in browser DevTools (360px emulator, iOS device frame) during plan 08 real-device QA.

## Next Phase Readiness

- **Phase 04 is complete.** Responsive shell delivers: viewport-fit=cover + overflow-x hygiene (04-01), drawer mechanics + safe-area insets + focus-return wiring (04-02), auto-close on navigation + hamburger identity + toolbar safe-area + intrinsic-size overflow protection (04-03).
- End-to-end focus-return works now that both 04-02's effect and 04-03's `data-sidebar-trigger="true"` attribute are applied.
- No blockers. Phase 05 (mobile canvas grid/single-view reflow) can proceed.

## Cross-Plan Contracts Closed

- **04-02 focus-return contract:** 04-02 added `useEffect` querying `[data-sidebar-trigger="true"]` on drawer close (safe no-op until attribute lands). 04-03 Task 2 adds that exact attribute to the Canvas hamburger `<Button>`. Focus-return is now functional end-to-end.

## Self-Check: PASSED

- `src/components/WorkspaceLayout.tsx` contains `import { useEffect } from 'react'`: FOUND (line 1)
- `src/components/WorkspaceLayout.tsx` contains `const currentMode = useWorkspaceStore((s) => s.currentMode)`: FOUND (line 12)
- `src/components/WorkspaceLayout.tsx` contains exactly one `useEffect(` call: CONFIRMED (grep count = 1)
- `src/components/WorkspaceLayout.tsx` `useEffect` deps contain `currentMode, activeView`: FOUND (line 22)
- `src/components/WorkspaceLayout.tsx` contains `matchMedia('(min-width: 1024px)')`: FOUND (line 18)
- `src/components/WorkspaceLayout.tsx` contains `setSidebarOpen(false)` inside effect body: FOUND (line 20)
- `src/components/WorkspaceLayout.tsx` backdrop class `fixed inset-0 z-30 bg-black/50 lg:hidden` still present: CONFIRMED
- `src/components/Canvas.tsx` contains `data-sidebar-trigger="true"`: FOUND (line 115)
- `src/components/Canvas.tsx` contains `aria-label="Toggle sidebar"`: FOUND (line 116)
- `src/components/Canvas.tsx` still contains `lg:hidden` on hamburger: CONFIRMED
- `src/components/Canvas.tsx` contains `pt-[max(0.5rem,env(safe-area-inset-top))]`: FOUND (line 46)
- `src/components/Canvas.tsx` contains `flex min-w-0 items-center gap-1 flex-wrap`: FOUND (line 47)
- `src/components/Canvas.tsx` contains `ml-2 min-w-0 truncate text-xs text-muted-foreground`: FOUND (line 67)
- Commit `b688808d` exists in git log: FOUND
- Commit `98925d8a` exists in git log: FOUND
- `npm run build` exits 0: CONFIRMED (built in 394ms)
- `eslint` on modified files exits 0: CONFIRMED (no output)

---
*Phase: 04-responsive-shell*
*Completed: 2026-04-19*
