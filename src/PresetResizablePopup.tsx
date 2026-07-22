import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
  type KeyboardEvent,
} from "react";
import type { Size, SizeConstraints } from "./useResizable";

interface PresetResizablePopupProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Optional line shown under the title. */
  subtitle?: string;
  children?: ReactNode;
  /** Optional footer content (e.g. Cancel / Clear / Submit actions). */
  footer?: ReactNode;
  initialSize?: Size;
  constraints?: Partial<SizeConstraints>;
}

const DEFAULT_CONSTRAINTS: SizeConstraints = {
  minWidth: 360,
  maxWidth: 900,
  minHeight: 240,
  maxHeight: 640,
  step: 80,
  coarseStep: 80,
};

/** Focusable elements used for the focus trap. */
const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

/**
 * Resize via a − / + stepper plus a maximize toggle, all in the header next to
 * the close button. They are plain <button>s — no separator role, no aria-value*
 * bookkeeping, no keyboard resize map to get wrong. The stepper buttons disable
 * themselves at the size limits (and while maximized); the maximize button is a
 * toggle (aria-pressed) that fills the screen and restores the previous size.
 */
export function PresetResizablePopup({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  initialSize = { width: 560, height: 400 },
  constraints,
}: PresetResizablePopupProps) {
  const c: SizeConstraints = { ...DEFAULT_CONSTRAINTS, ...constraints };
  const step = c.step ?? 80;

  const clampSize = (s: Size): Size => ({
    width: clamp(s.width, c.minWidth, c.maxWidth),
    height: clamp(s.height, c.minHeight, c.maxHeight),
  });

  const [size, setSize] = useState<Size>(() => clampSize(initialSize));
  const [maximized, setMaximized] = useState(false);

  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const titleId = useId();
  const subtitleId = useId();
  const groupId = useId();

  // Reset to the initial size (and un-maximize) each time the popup opens.
  useEffect(() => {
    if (open) {
      setSize(clampSize(initialSize));
      setMaximized(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Focus management: remember opener, focus dialog on open, restore on close.
  useEffect(() => {
    if (open) {
      previouslyFocused.current = document.activeElement as HTMLElement | null;
      dialogRef.current?.focus();
      return () => previouslyFocused.current?.focus();
    }
  }, [open]);

  if (!open) return null;

  const { width, height } = size;
  const atMax = width >= c.maxWidth && height >= c.maxHeight;
  const atMin = width <= c.minWidth && height <= c.minHeight;
  const sizeText = maximized
    ? "Popup maximized"
    : `Width ${width}, height ${height} pixels`;

  const grow = () =>
    setSize((s) => clampSize({ width: s.width + step, height: s.height + step }));
  const shrink = () =>
    setSize((s) => clampSize({ width: s.width - step, height: s.height - step }));

  // Escape closes; Tab is trapped inside the dialog.
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      onClose();
      return;
    }
    if (e.key !== "Tab") return;
    const nodes = dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
    if (!nodes || nodes.length === 0) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  // When maximized, ignore the explicit size and fill (most of) the screen.
  const dialogStyle = maximized
    ? { width: "96vw", height: "92vh" }
    : { width, height };

  return (
    <div
      className="overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className="popup"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={subtitle ? subtitleId : undefined}
        tabIndex={-1}
        style={dialogStyle}
        onKeyDown={onKeyDown}
      >
        <div className="popup__titlebar">
          <div className="popup__titlegroup">
            <h2 id={titleId} className="popup__title">
              {title}
            </h2>
            {subtitle && (
              <p id={subtitleId} className="popup__subtitle">
                {subtitle}
              </p>
            )}
          </div>

          {/* Header controls: − / + stepper, maximize toggle, then close. */}
          <div className="popup__controls">
            <div className="stepper" role="group" aria-labelledby={groupId}>
              <span id={groupId} className="sr-only">
                Popup size
              </span>
              <button
                type="button"
                className="ctrl-btn"
                aria-label="Decrease popup size"
                onClick={shrink}
                disabled={maximized || atMin}
              >
                &minus;
              </button>
              <button
                type="button"
                className="ctrl-btn"
                aria-label="Increase popup size"
                onClick={grow}
                disabled={maximized || atMax}
              >
                +
              </button>
            </div>

            <span className="popup__controls-divider" aria-hidden="true" />

            <button
              type="button"
              className="ctrl-btn"
              aria-label="Maximize popup"
              aria-pressed={maximized}
              onClick={() => setMaximized((m) => !m)}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                <path
                  d="M2 5.5V2.5h3M14 5.5V2.5h-3M2 10.5v3h3M14 10.5v3h-3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <button
              type="button"
              className="ctrl-btn popup__close"
              aria-label="Close popup"
              onClick={onClose}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                <path
                  d="M3 3l10 10M13 3L3 13"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="popup__body">{children}</div>

        {footer && <div className="popup__footer">{footer}</div>}

        {/* Polite live region announces the new size / maximized state. */}
        <div className="sr-only" aria-live="polite">
          {sizeText}
        </div>
      </div>
    </div>
  );
}
