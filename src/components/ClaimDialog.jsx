import { useState } from 'react';
import Dialog from './Dialog.jsx';

const MIN_PROOF = 10;

// Asks the student for proof of ownership before submitting a claim.
// `item` is the found item being claimed, or null when closed.
// Only the item's name and place are shown - the rest stays with staff to verify the proof.
export default function ClaimDialog({ item, onSubmit, onClose }) {
  const [error, setError] = useState('');

  function close() {
    setError('');
    onClose();
  }

  function handleSubmit(e) {
    e.preventDefault();
    const proof = String(new FormData(e.target).get('proof') || '').trim();

    if (proof.length < MIN_PROOF) {
      setError(`Please write at least ${MIN_PROOF} characters so staff can verify you.`);
      return;
    }
    setError('');
    onSubmit(item.id, proof);
  }

  return (
    <Dialog open={Boolean(item)} onClose={close}>
      {item && (
        <>
          <h3>Claim: {item.name}</h3>
          <p className="sub">Found at {item.loc}</p>
          <p className="sub">
            Describe something only the owner would know (marks, contents, lock screen, serial no.).
            Staff will compare it with the item.
          </p>
          <form onSubmit={handleSubmit}>
            <label htmlFor="claim-proof">Proof of ownership</label>
            <textarea id="claim-proof" name="proof" required aria-invalid={Boolean(error)} />
            {error && <div className="note" role="alert">{error}</div>}
            <div className="row">
              <button className="btn g">Submit claim</button>
              <button type="button" className="btn l" onClick={close}>Cancel</button>
            </div>
          </form>
        </>
      )}
    </Dialog>
  );
}
