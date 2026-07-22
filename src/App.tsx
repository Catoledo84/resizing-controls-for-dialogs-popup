import { useState } from "react";
import { ResizablePopup } from "./ResizablePopup";

export default function App() {
  const [open, setOpen] = useState(false);

  return (
    <main className="page">
      <h1>Accessible resizable popup</h1>
      <p>
        Open the popup, then press <kbd>Tab</kbd> until the corner grip is
        focused. A floating keyboard guide appears next to it. Use the arrow
        keys to resize, <kbd>Shift</kbd>+arrow for bigger steps,{" "}
        <kbd>Home</kbd>/<kbd>End</kbd> for smallest/largest, <kbd>Enter</kbd> to
        reset, and <kbd>Esc</kbd> to close.
      </p>

      <button type="button" className="open-btn" onClick={() => setOpen(true)}>
        Open popup
      </button>

      <ResizablePopup
        open={open}
        onClose={() => setOpen(false)}
        title="Popup page"
      >
        <p>
          This is the popup content. Resize it from the corner grip using your
          mouse or the keyboard — the size is announced to screen readers as you
          go.
        </p>
        <p>
          Everything stays inside a focus trap: Tab cycles through the close
          button and the resize grip, and focus returns to the trigger when the
          popup closes.
        </p>
      </ResizablePopup>
    </main>
  );
}
