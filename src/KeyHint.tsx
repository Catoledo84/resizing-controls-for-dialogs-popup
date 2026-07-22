interface KeyHintProps {
  id: string;
}

interface Row {
  keys: string[];
  label: string;
}

const ROWS: Row[] = [
  { keys: ["←", "→"], label: "Width" },
  { keys: ["↑", "↓"], label: "Height" },
  { keys: ["Shift", "+ arrow"], label: "Bigger steps" },
  { keys: ["Home", "End"], label: "Smallest / largest" },
  { keys: ["Enter"], label: "Reset size" },
  { keys: ["Esc"], label: "Close" },
];

/**
 * Floating keyboard guide docked to the outside bottom edge of the popup,
 * spanning its width. It is a non-focusable role="tooltip" that the grip
 * references via aria-describedby, so screen readers announce it and it never
 * adds a tab stop. It becomes visible when the grip is focused or hovered.
 */
export function KeyHint({ id }: KeyHintProps) {
  return (
    <div id={id} role="tooltip" className="keyhint">
      {ROWS.map((row) => (
        <span key={row.label} className="keyhint__item">
          <span className="keyhint__keys">
            {row.keys.map((k) => (
              <kbd key={k}>{k}</kbd>
            ))}
          </span>
          <span className="keyhint__label">{row.label}</span>
        </span>
      ))}
    </div>
  );
}
