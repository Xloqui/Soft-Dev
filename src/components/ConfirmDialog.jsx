import Dialog from './Dialog.jsx';

// A small "Are you sure?" pop-up. Open while `open` is true.
export default function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', onConfirm, onClose }) {
  return (
    <Dialog open={open} onClose={onClose}>
      <h3>{title}</h3>
      <p className="sub">{message}</p>
      <div className="row">
        <button type="button" className="btn r" onClick={onConfirm}>{confirmLabel}</button>
        <button type="button" className="btn l" onClick={onClose}>Cancel</button>
      </div>
    </Dialog>
  );
}
