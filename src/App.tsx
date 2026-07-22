import { useState } from "react";
import { ResizablePopup } from "./ResizablePopup";
import { PresetResizablePopup } from "./PresetResizablePopup";

/** Shared form body, reused by both popup variants. */
function PopupForm({ id, onDone }: { id: string; onDone: () => void }) {
  return (
    <form
      id={id}
      className="form"
      onSubmit={(e) => {
        e.preventDefault();
        onDone();
      }}
    >
      <div className="form__row">
        <label htmlFor={`${id}-name`} className="form__label">
          Name
        </label>
        <input
          id={`${id}-name`}
          className="form__input"
          type="text"
          placeholder="Product Name"
        />
      </div>
      <div className="form__row">
        <label htmlFor={`${id}-phone`} className="form__label">
          Phone number
        </label>
        <input
          id={`${id}-phone`}
          className="form__input"
          type="tel"
          placeholder="Product Name"
        />
      </div>
      <div className="form__row">
        <label htmlFor={`${id}-bio`} className="form__label">
          Bio
        </label>
        <textarea
          id={`${id}-bio`}
          className="form__input"
          rows={3}
          placeholder="Product Name"
        />
      </div>
    </form>
  );
}

/** Shared footer actions, reused by both popup variants. */
function PopupFooter({ formId, onClose }: { formId: string; onClose: () => void }) {
  return (
    <>
      <button type="button" className="btn btn--link" onClick={onClose}>
        Cancel
      </button>
      <button type="reset" className="btn btn--outline" form={formId}>
        Clear
      </button>
      <button type="submit" className="btn btn--primary" form={formId}>
        Submit
      </button>
    </>
  );
}

export default function App() {
  const [open, setOpen] = useState(false);
  const [presetOpen, setPresetOpen] = useState(false);

  return (
    <main className="page">
      <h1>Accessible resizable popup</h1>

      <section className="demo">
        <h2>Option A — Corner grip (Window Splitter)</h2>
        <p>
          Open the popup, then press <kbd>Tab</kbd> until the corner grip is
          focused. A floating keyboard guide appears next to it. Use the arrow
          keys to resize, <kbd>Shift</kbd>+arrow for bigger steps,{" "}
          <kbd>Home</kbd>/<kbd>End</kbd> for smallest/largest, <kbd>Enter</kbd>{" "}
          to reset, and <kbd>Esc</kbd> to close.
        </p>
        <button type="button" className="open-btn" onClick={() => setOpen(true)}>
          Open grip popup
        </button>
      </section>

      <section className="demo">
        <h2>Option B — + / − size stepper</h2>
        <p>
          Instead of a drag handle, the popup has <kbd>+</kbd> and <kbd>−</kbd>{" "}
          buttons at the top: each press grows or shrinks the popup by one step,
          and the buttons disable themselves at the size limits. There is no
          separator role and no <code>aria-value*</code> to get wrong; the new
          size is announced to screen readers. This satisfies WCAG 2.5.7
          (Dragging Movements) because no dragging is required at all.
        </p>
        <button
          type="button"
          className="open-btn"
          onClick={() => setPresetOpen(true)}
        >
          Open stepper popup
        </button>
      </section>

      <ResizablePopup
        open={open}
        onClose={() => setOpen(false)}
        title="Popup page"
        subtitle="This is a subtitle"
        initialSize={{ width: 560, height: 440 }}
        footer={<PopupFooter formId="grip-form" onClose={() => setOpen(false)} />}
      >
        <PopupForm id="grip-form" onDone={() => setOpen(false)} />
      </ResizablePopup>

      <PresetResizablePopup
        open={presetOpen}
        onClose={() => setPresetOpen(false)}
        title="Popup page"
        subtitle="This is a subtitle"
        footer={
          <PopupFooter formId="stepper-form" onClose={() => setPresetOpen(false)} />
        }
      >
        <PopupForm id="stepper-form" onDone={() => setPresetOpen(false)} />
      </PresetResizablePopup>
    </main>
  );
}
