# Phase 5: Mobile Canvas - Context

**Gathered:** 2026-04-19
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase makes the canvas (grid + single view) reflow cleanly on phones and ensures every canvas-level action is reachable by touch without a hover interaction. It covers: grid column density at each breakpoint, single-view fill with no letterbox gap, touch-friendly per-item actions, and iOS-compatible inline video playback. It does NOT touch the sidebar/drawer (Phase 4, done), mode panel internals (Phase 6), auxiliary views or input ergonomics (Phase 7), or real-device QA (Phase 8).

</domain>

<decisions>
## Implementation Decisions

### Grid Density & Thumbnails (CANVAS-01)
- Keep existing `grid-cols-2 md:grid-cols-3 lg:grid-cols-4` — already matches spec
- Keep `gap-2` between cells at all breakpoints
- Keep `aspect-square` cells at all breakpoints
- Cell tap target is the whole cell (~160px at 360px / 2-col) — no extra tap-target class needed

### Single View Fill (CANVAS-02)
- Mobile: image/video uses `w-full` with `object-contain` inside a container with no padding — fills viewport width while preserving aspect
- Remove `p-4` padding around the single-view surface below `lg` (keep `p-4` at `lg+` to match desktop)
- Keep a 1px `border-border` frame around the single-view surface (Win95 flat consistency)
- Canvas chrome (toolbar + hamburger) stays visible in single view on mobile — no auto-hide

### Touch-Equivalent Grid Actions (CANVAS-04)
- Below `lg`: overlay is always-visible on each grid item (not hover-gated) — `lg:opacity-0 lg:group-hover:opacity-100`, visible by default on mobile
- On `lg+`: preserve existing hover-reveal pattern — no desktop regression
- Cell body tap still opens single view; action buttons continue to `e.stopPropagation()` (already coded)
- Actions exposed: delete / download / create-video (unchanged from desktop)

### Mobile Video Playback (CANVAS-05)
- Add `playsInline` to every `<video>` element (required for iOS inline playback — without it, iOS forces fullscreen on play)
- Add `muted` so `autoPlay` is permitted by the mobile autoplay policy; user unmutes via native controls
- Keep `loop` — preview-style playback is the intended feel
- Keep native `controls` — no custom controls work

### Claude's Discretion
- Exact CSS trick for "no p-4 on mobile but p-4 on lg+" (e.g., `p-0 lg:p-4` vs. responsive utility)
- Whether the always-visible mobile overlay still uses the current `bg-black/70` strip design or a slightly different visual (must not redesign; just ensure it's readable on all thumbnails)
- Whether `muted` is applied only to grid-preview videos or also to single-view — both are acceptable; single-view with muted autoplay + visible controls matches iOS conventions

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Canvas.tsx` — already imports `Menu, Grid3x3, Maximize2, Play`; single-view + grid-view branch logic in place
- Hover overlay pattern already exists (`group-hover:opacity-100`) — only needs mobile branch flipped to visible-by-default
- `<video controls autoPlay loop className="max-h-full max-w-full" />` pattern — add `playsInline muted`
- Phase 4 already wired `flex-wrap gap-2` + `pt-[max(0.5rem,env(safe-area-inset-top))]` on the toolbar row; CANVAS-03 is largely already satisfied — verify at 360px only

### Established Patterns
- Tailwind v4 responsive modifiers: `lg:` is the desktop threshold project-wide (established in Phase 02-01)
- Windows 95 flat: `rounded-none`, 1px borders, no shadows/gradients (preserved)
- Fire-and-forget delete via `useGenerations`; `handleDelete` already wired
- `thumbnailUrl ?? imageUrl!` pattern for grid preview

### Integration Points
- `src/components/Canvas.tsx` — ALL Phase 5 edits concentrate here: single-view container, grid overlay, `<video>` attributes
- No store/state changes anticipated — `useWorkspaceStore`'s `canvasViewMode` + `selectedGenerationId` already support single-view fill

</code_context>

<specifics>
## Specific Ideas

- Always-visible mobile overlay must remain readable over any thumbnail — the existing `bg-black/70` strip is adequate; keep it
- `playsInline` + `muted` is the specific iOS-compatibility contract — both attributes are mandatory, not optional

</specifics>

<deferred>
## Deferred Ideas

- Swipe gestures (left/right between generations in single view) — deferred to v1.2+ per REQUIREMENTS.md MOBILE-01
- Pull-to-refresh on grid — deferred per MOBILE-02
- Custom video controls / scrubber — out of scope
- Long-press context menu for grid items — deferred; always-visible overlay is simpler

</deferred>
