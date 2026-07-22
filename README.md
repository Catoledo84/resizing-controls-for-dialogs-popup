# Resizing controls popup menu

An accessible, resizable modal popup (React + TypeScript + Vite). It implements
**Idea 4**: a corner resize grip plus a **floating keyboard-hint popover** that
appears when the grip receives focus.

## Run

```bash
npm install
npm run dev      # start the dev server (Vite prints the local URL)
npm run build    # type-check + production build
```

## What makes it accessible

Built on the WAI-ARIA APG **Window Splitter** pattern, composed with an
accessible modal dialog.

**The resize grip** (`role="separator"`, focusable):

| Key | Action |
| --- | --- |
| `←` `→` | change width |
| `↑` `↓` | change height |
| `Shift` + arrow | bigger steps |
| `PageUp` / `PageDown` | grow / shrink both axes |
| `Home` / `End` | smallest / largest |
| `Enter` | reset to initial size |
| `Esc` | close the popup |

- `aria-valuemin` / `aria-valuenow` / `aria-valuemax` track position; a
  human-readable `aria-valuetext` ("Width 480, height 320 pixels") is announced
  instead of the raw number.
- A visible focus ring is always present.
- Pointer users can still drag the grip.

**The dialog:**

- `role="dialog"` + `aria-modal="true"` + `aria-labelledby` the title.
- Focus is trapped inside (Tab cycles), moved into the dialog on open, and
  returned to the trigger on close.
- `Esc` and overlay click close it.

**The floating key hint** (`KeyHint.tsx`):

- A non-focusable `role="tooltip"` referenced by the grip via
  `aria-describedby`, so screen readers announce it and it never adds a tab
  stop.
- Shown on focus **and** hover (hover-only would exclude keyboard users).
- Respects `prefers-reduced-motion`.

## Deploying on Vercel

This project is already configured for Vercel with `vercel.json`.

1. Push your repo to GitHub, GitLab, or Bitbucket.
2. In Vercel, choose **New Project** → import your repository.
3. Confirm the detected settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Deploy.

If you want a local preview before deployment:

```bash
npm run preview
```

## Files

- `src/useResizable.ts` — resize logic (keyboard + pointer), clamping, aria values.
- `src/ResizablePopup.tsx` — the accessible modal + grip + focus trap.
- `src/KeyHint.tsx` — the floating keyboard guide.
- `src/App.tsx` — demo page.
- `src/styles.css` — styling (matches the mockup's navy/blue look).
