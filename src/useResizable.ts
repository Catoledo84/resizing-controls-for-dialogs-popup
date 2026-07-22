import { useCallback, useRef, useState } from "react";

export interface SizeConstraints {
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
  /** Step used by arrow keys. */
  step?: number;
  /** Step used by Shift+arrow / PageUp-PageDown. */
  coarseStep?: number;
}

export interface Size {
  width: number;
  height: number;
}

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

/**
 * Drives resizing of a popup for both pointer (drag) and keyboard (arrow keys),
 * following the WAI-ARIA APG "Window Splitter" pattern.
 */
export function useResizable(initial: Size, c: SizeConstraints) {
  const step = c.step ?? 16;
  const coarseStep = c.coarseStep ?? 48;

  const [size, setSize] = useState<Size>(() => ({
    width: clamp(initial.width, c.minWidth, c.maxWidth),
    height: clamp(initial.height, c.minHeight, c.maxHeight),
  }));
  const initialRef = useRef(size);

  const set = useCallback(
    (width: number, height: number) =>
      setSize({
        width: clamp(width, c.minWidth, c.maxWidth),
        height: clamp(height, c.minHeight, c.maxHeight),
      }),
    [c.minWidth, c.maxWidth, c.minHeight, c.maxHeight]
  );

  /** Percentage of the width range (0-100) for aria-valuenow. */
  const widthPercent = Math.round(
    ((size.width - c.minWidth) / (c.maxWidth - c.minWidth)) * 100
  );

  /** Keyboard handler for the resize grip. Returns true if it consumed the key. */
  const onGripKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const s = e.shiftKey ? coarseStep : step;
      switch (e.key) {
        case "ArrowRight":
          set(size.width + s, size.height);
          break;
        case "ArrowLeft":
          set(size.width - s, size.height);
          break;
        case "ArrowDown":
          set(size.width, size.height + s);
          break;
        case "ArrowUp":
          set(size.width, size.height - s);
          break;
        case "PageUp":
          set(size.width + coarseStep, size.height - coarseStep);
          break;
        case "PageDown":
          set(size.width - coarseStep, size.height + coarseStep);
          break;
        case "Home":
          set(c.minWidth, c.minHeight);
          break;
        case "End":
          set(c.maxWidth, c.maxHeight);
          break;
        case "Enter":
          set(initialRef.current.width, initialRef.current.height);
          break;
        default:
          return false;
      }
      e.preventDefault();
      return true;
    },
    [size, set, step, coarseStep, c.minWidth, c.maxWidth, c.minHeight, c.maxHeight]
  );

  /** Pointer drag from the corner grip (mouse / touch users). */
  const onGripPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      const startX = e.clientX;
      const startY = e.clientY;
      const startW = size.width;
      const startH = size.height;

      const move = (ev: PointerEvent) => {
        set(startW + (ev.clientX - startX), startH + (ev.clientY - startY));
      };
      const up = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    },
    [size, set]
  );

  return {
    size,
    setSize: set,
    widthPercent,
    onGripKeyDown,
    onGripPointerDown,
    constraints: c,
  };
}
