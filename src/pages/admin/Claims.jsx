import StatusPill from '../../components/StatusPill.jsx';
import { useStore } from '../../data/storeContext.js';
import { toast } from '../../lib/toast.js';

// Staff compare the student's proof of ownership with the item and approve or reject.
export default function Claims() {
  const { state, act } = useStore();
  const findItem = id => state.items.find(i => i.id === id);

  const pending = state.claims.filter(c => c.status === 'pending');
  const past = state.claims.filter(c => c.status !== 'pending');

  function decide(claimId, approve) {
    act.decideClaim(claimId, approve);
    toast(approve ? 'Claim approved' : 'Claim rejected');
  }

  return (
    <>
      <h2>Claims to review</h2>
      <span className="brush" />

      {pending.length ? pending.map(claim => {
        const item = findItem(claim.itemId);

        return (
          <div key={claim.id} className="card" style={{ marginBottom: 12 }}>
            <h3>{claim.ownerName} → {item?.name}</h3>
            <p>{item?.desc} (found at {item?.loc})</p>
            <div className="note"><b>Proof of ownership:</b> {claim.proof}</div>
            <div className="row">
              <button type="button" className="btn g" onClick={() => decide(claim.id, true)}>Approve</button>
              <button type="button" className="btn r" onClick={() => decide(claim.id, false)}>Reject</button>
            </div>
          </div>
        );
      }) : (
        <div className="empty">No claims waiting for review.</div>
      )}

      <h4>Past decisions</h4>
      {past.length ? past.map(claim => (
        <p key={claim.id}>
          {claim.ownerName} – {findItem(claim.itemId)?.name}{' '}
          <StatusPill status={claim.status}>{claim.status}</StatusPill>
        </p>
      )) : (
        <p className="sub">None yet.</p>
      )}
    </>
  );
}
