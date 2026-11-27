import { useState } from 'react';
import ClaimReviewCard from '../../components/ClaimReviewCard.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import StatusPill from '../../components/StatusPill.jsx';
import { useStore } from '../../data/storeContext.js';
import { toast } from '../../lib/toast.js';

// STAFF ONLY: compare each student's proof of ownership with the item's hidden details,
// then approve or reject.
export default function Claims() {
  const { state, session, act } = useStore();
  const [rejecting, setRejecting] = useState(null);
  const findItem = id => state.items.find(i => i.id === id);

  // Only claims for items from this admin's building.
  const mine = state.claims.filter(c => findItem(c.itemId)?.building === session.building);
  const pending = mine.filter(c => c.status === 'pending');
  const past = mine.filter(c => c.status !== 'pending');

  // The lost report this claim came from (the student's report that staff matched to the item).
  const reportFor = claim => state.lost.find(
    l => l.ownerId === claim.ownerId && (l.matched || []).includes(claim.itemId),
  );

  function approve(claim) {
    act.decideClaim(claim.id, true);
    toast(`Claim approved. ${claim.ownerName} has been told to pick it up.`);
  }

  function confirmReject() {
    act.decideClaim(rejecting.id, false);
    toast('Claim rejected');
    setRejecting(null);
  }

  return (
    <>
      <h2>Claims to review</h2>
      <span className="brush" />
      <p className="sub">
        Compare the student&apos;s proof with the 🔒 hidden details. Matching words are highlighted.
      </p>

      {pending.length ? pending.map(claim => (
        <ClaimReviewCard
          key={claim.id}
          claim={claim}
          item={findItem(claim.itemId)}
          report={reportFor(claim)}
          onApprove={approve}
          onReject={setRejecting}
        />
      )) : (
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

      <ConfirmDialog
        open={Boolean(rejecting)}
        title="Reject this claim?"
        message={rejecting
          ? `${rejecting.ownerName} will be told their claim was rejected, and the item becomes available again.`
          : ''}
        confirmLabel="Reject claim"
        onConfirm={confirmReject}
        onClose={() => setRejecting(null)}
      />
    </>
  );
}
