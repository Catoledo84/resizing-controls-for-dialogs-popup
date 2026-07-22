import {
  useEffect,
  useId,
  useRef,
  type ReactNode,
  type KeyboardEvent,
} from "react";
import { useResizable, type SizeConstraints, type Size } from "./useResizable";
import { KeyHint } from "./KeyHint";

interface ResizablePopupProps {
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
  minWidth: 320,
  maxWidth: 900,
  minHeight: 200,
  maxHeight: 640,
  step: 16,
  coarseStep: 48,
};

/** Focusable elements used for the focus trap. */
const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export function ResizablePopup({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  initialSize = { width: 480, height: 320 },
  constraints,
}: ResizablePopupProps) {
  const c: SizeConstraints = { ...DEFAULT_CONSTRAINTS, ...constraints };
  const { size, widthPercent, onGripKeyDown, onGripPointerDown } = useResizable(
    initialSize,
    c
  );

  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const titleId = useId();
  const subtitleId = useId();
  const hintId = useId();

  // Focus management: remember opener, focus dialog on open, restore on close.
  useEffect(() => {
    if (open) {
      previouslyFocused.current = document.activeElement as HTMLElement | null;
      dialogRef.current?.focus();
      return () => previouslyFocused.current?.focus();
    }
  }, [open]);

  if (!open) return null;

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

  const sizeText = `Width ${size.width}, height ${size.height} pixels`;

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
        style={{ width: size.width, height: size.height }}
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
          <button
            type="button"
            className="popup__close"
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

        <div className="popup__body">{children}</div>

        {footer && <div className="popup__footer">{footer}</div>}

        <button
          type="button"
          className="popup__grip"
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize popup"
          aria-controls={titleId}
          aria-describedby={hintId}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={widthPercent}
          aria-valuetext={sizeText}
          onKeyDown={onGripKeyDown}
          onPointerDown={onGripPointerDown}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
            <g fill="currentColor">
              <circle cx="10" cy="10" r="1.1" />
              <circle cx="10" cy="6" r="1.1" />
              <circle cx="6" cy="10" r="1.1" />
              <circle cx="10" cy="2" r="1.1" />
              <circle cx="6" cy="6" r="1.1" />
              <circle cx="2" cy="10" r="1.1" />
            </g>
          </svg>
        </button>

        <KeyHint id={hintId} />

        {/* Polite live region announces size while resizing. */}
        <div className="sr-only" aria-live="polite">
          {sizeText}
        </div>
      </div>
    </div>
  );
}
