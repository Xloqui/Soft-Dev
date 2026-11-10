import Dialog from './Dialog.jsx';

// Asks the student for proof of ownership before submitting a claim.
// `item` is the found item being claimed, or null when closed.
export default function ClaimDialog({ item, onSubmit, onClose }) {
  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(item.id, new FormData(e.target).get('proof'));
  }

  return (
    <Dialog open={Boolean(item)} onClose={onClose}>
      {item && (
        <>
          <h3>Claim: {item.name}</h3>
          <p className="sub">
            Describe something only the owner would know (marks, contents, lock screen, serial no.).
          </p>
          <form onSubmit={handleSubmit}>
            <label htmlFor="claim-proof">Proof of ownership</label>
            <textarea id="claim-proof" name="proof" required />
            <div className="row">
              <button className="btn g">Submit claim</button>
              <button type="button" className="btn l" onClick={onClose}>Cancel</button>
            </div>
          </form>
        </>
      )}
    </Dialog>
  );
}
