import { CATEGORY_ICON } from '../data/constants.js';
import { formatDate } from '../lib/helpers.js';
import { sharedWords } from '../lib/matching.js';
import Highlight from './Highlight.jsx';

// STAFF ONLY: one pending claim, with the student's proof next to the item's hidden details.
// Words found in both are highlighted to help staff decide.
export default function ClaimReviewCard({ claim, item, report, onApprove, onReject }) {
  const hidden = item?.hidden || '';
  const inHidden = sharedWords(claim.proof, hidden);
  const inDescription = sharedWords(claim.proof, item?.desc).filter(w => !inHidden.includes(w));

  return (
    <div className="card claim-review">
      <h3>{claim.ownerName} → {item?.name}</h3>
      <p>
        Student ID {claim.ownerId} · claimed {formatDate(claim.date)}
        <br />
        {CATEGORY_ICON[item?.cat]} {item?.cat} · {item?.color || '—'} · found at {item?.loc} · {formatDate(item?.date)}
      </p>

      {report && (
        <p>
          <b>Their lost report:</b> {report.name} – {report.desc}
          {' '}({report.color || 'no color'}, lost at {report.loc}, {formatDate(report.date)})
        </p>
      )}

      <div className="compare">
        <div className="note">
          <b>Student&apos;s proof</b>
          <p><Highlight text={claim.proof} words={[...inHidden, ...inDescription]} /></p>
        </div>
        <div className="note secret">
          <b>🔒 Hidden details (staff only)</b>
          <p>
            {hidden
              ? <Highlight text={hidden} words={inHidden} />
              : <i>No hidden details recorded. Check the item itself before approving.</i>}
          </p>
        </div>
      </div>

      <p className="verdict">
        {inHidden.length
          ? <>✅ Proof matches hidden details: <b>{inHidden.join(', ')}</b></>
          : hidden
            ? <>⚠️ No words in common with the hidden details. Ask the student more questions before approving.</>
            : null}
        {inDescription.length > 0 && (
          <><br />Also mentions details from the description: {inDescription.join(', ')}</>
        )}
      </p>

      <div className="row">
        <button type="button" className="btn g" onClick={() => onApprove(claim)}>Approve</button>
        <button type="button" className="btn r" onClick={() => onReject(claim)}>Reject</button>
      </div>
    </div>
  );
}
