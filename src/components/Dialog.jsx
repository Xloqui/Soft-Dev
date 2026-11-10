import { useEffect, useRef } from 'react';

// A pop-up window. Shown while `open` is true; onClose runs when it is closed
// (Cancel button, Esc key, or after submitting).
export default function Dialog({ open, onClose, children }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog ref={ref} onClose={onClose}>
      {open && children}
    </dialog>
  );
}
