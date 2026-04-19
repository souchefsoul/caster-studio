# Phase 4: Responsive Shell - Context

**Gathered:** 2026-04-19
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase delivers the application frame's responsive behavior — viewport meta, sidebar drawer mechanics below `lg`, safe-area inset handling, and horizontal-scroll hygiene — so that every v1.0 route renders without layout break on a 360px phone while the desktop (`lg+`) layout remains unchanged. It does NOT touch canvas grid/single-view reflow (Phase 5), mode panel internals (Phase 6), auxiliary views or input ergonomics (Phase 7), or real-device QA (Phase 8).

</domain>

<decisions>
## Implementation Decisions

### Drawer Mechanics
- Drawer width: `85vw` with `max-width: 360px` — leaves a sliver of canvas visible as a cue (Claude's discretion; user deferred)
- Transition: keep existing ~150ms `translate-x` slide — matches "snappy not flashy" principle (Claude's discretion; user deferred)
- User-initiated dismiss: tap backdrop (user-selected — only trigger chosen beyond the LAYOUT-03-mandated auto-close on navigation)
- Focus management: return focus to the hamburger trigger on close; no auto-focus on open (Claude's discretion; user deferred)

### Safe-Area Insets
- Applied to all top-level edge containers (sidebar, canvas toolbar, account row, any floating control)
- Implementation: Tailwind arbitrary values `pt-[env(safe-area-inset-top)]` etc. directly on edge containers
- Bottom inset: applied to sidebar account row and to canvas toolbar if/where it sits on the bottom edge
- Update `<meta viewport>` to include `viewport-fit=cover` — required for iOS to yield nonzero inset values

### Overflow & Scroll Hygiene
- Global `overflow-x: hidden` on `html` + `body` as a safety net
- Minimum supported width: fluid down to 320px, 360px is the primary target (matches VERIFY-02)
- Known offenders fixed at shell level now: sidebar width (32rem → responsive), canvas toolbar `flex-wrap`, `min-width: 0` on flex children that hold text
- Shell-level text wrapping: enforce `min-w-0` on flex parents holding textareas/long strings plus `break-words` defaults

### Hamburger & Mobile Header
- Location: leading (left) edge of the existing canvas toolbar — `Menu` icon is already imported in Canvas.tsx
- Visibility: visible only below `lg`; hidden on `lg+` (sidebar is a fixed column)
- Default state on mobile: closed after login; user lands on canvas
- Auto-close drawer on both `currentMode` change AND `activeView` change (Brand Face) — satisfies LAYOUT-03

### Claude's Discretion
- Exact animation duration/easing within the "150ms-ish slide" constraint
- Drawer width specifics (85vw / max 360px is the guidance, final CSS is Claude's)
- Focus-management implementation (ref-based vs. base-ui `Dialog` primitive, etc.)
- Choice of `overflow-x: clip` vs. `hidden` if one causes regressions
- Whether to extract a `useLockBodyScroll` hook or inline it — pick what's simplest

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `WorkspaceLayout.tsx` — already has mobile backdrop (`bg-black/50 lg:hidden`) and `sidebarOpen` wiring
- `Sidebar.tsx` — already uses `translate-x-0 / -translate-x-full` + `fixed inset-y-0 lg:static lg:translate-x-0` pattern; only width (32rem) and safe-area insets need fixing
- `Canvas.tsx` — imports `Menu` icon and calls `toggleSidebar` from `useWorkspaceStore`; hamburger button likely wired (verify placement/visibility on mobile)
- `useWorkspaceStore` — exposes `sidebarOpen`, `setSidebarOpen`, `toggleSidebar`
- `@base-ui/react` is installed and could provide a `Dialog` primitive for focus trap if needed — optional

### Established Patterns
- Windows 95 flat aesthetic: `rounded-none`, 1px borders, no shadows/gradients
- Tailwind CSS v4 with `@theme inline` tokens and `lg:` breakpoint as the desktop threshold (per Phase 02-01 decision)
- `fixed` positioning + z-40 overlay on mobile, static on `lg+` — pattern already in use
- Zustand single-store pattern (`useWorkspaceStore`) for shell UI state

### Integration Points
- `index.html` — viewport meta needs `viewport-fit=cover` added
- `index.css` — may add a global `html, body { overflow-x: hidden }` base rule or utility
- `WorkspaceLayout.tsx` — where the drawer/backdrop composition lives
- `Sidebar.tsx` — width class and safe-area padding go here
- `Canvas.tsx` — hamburger visibility (`lg:hidden`), safe-area on toolbar, `flex-wrap` on toolbar row
- Any component that reads `currentMode` or `activeView` — auto-close wiring (likely a single effect in `WorkspaceLayout` or `Sidebar` watching those store slices)

</code_context>

<specifics>
## Specific Ideas

- Hamburger stays in the canvas toolbar (not a separate mobile header) to avoid adding a new chrome bar
- Drawer closes only on backdrop tap for user-initiated dismiss (per user selection); swipe and ESC are intentionally deferred

</specifics>

<deferred>
## Deferred Ideas

- Swipe-left gesture to close drawer — deferred; tap-backdrop is enough for v1.1
- ESC-key dismiss — deferred; not part of the mobile flow the user cares about now
- Auto-focus first nav item on open — deferred; return-to-hamburger is the only managed focus
- PWA install prompt / manifest — out of scope per REQUIREMENTS.md (v1.2+)

</deferred>
