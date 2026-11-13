import { CATEGORY_ICON } from '../data/constants.js';
import { formatDate } from '../lib/helpers.js';
import { rankMatches } from '../lib/matching.js';
import StatusPill from './StatusPill.jsx';

// Staff view of one student's lost report, with every open found item as a checkbox.
// Items are sorted by match score (see lib/matching.js), best match first.
export default function RequestCard({ report, openItems, onNotify }) {
  const ranked = rankMatches(report, openItems);
  const bestId = ranked[0]?.suggested ? ranked[0].item.id : null;

  function handleSubmit(e) {
    e.preventDefault();
    const form = new FormData(e.target);
    onNotify(report.id, form.getAll('match').map(Number), form.get('msg'));
  }

  const pick = ({ item, score, reasons, suggested, impossible }) => (
    <label key={item.id} className={`pick${impossible ? ' unlikely' : ''}`}>
      <input
        type="checkbox"
        name="match"
        value={item.id}
        defaultChecked={(report.matched || []).includes(item.id)}
      />
      <span>
        {CATEGORY_ICON[item.cat]} <b>{item.name}</b> – {item.desc}
        <br />
        <small>{item.cat} · {item.color || '—'} · found at {item.loc} · {formatDate(item.date)}</small>
        {item.id === bestId && <> <StatusPill status="approved">Best match</StatusPill></>}
        {suggested && <> <StatusPill status="available">Suggested</StatusPill></>}
        {reasons.length > 0 && (
          <span className="why">
            {impossible ? 'Unlikely: ' : `Score ${score} · `}
            {reasons.join(' · ')}
          </span>
        )}
      </span>
    </label>
  );

  return (
    <div className="card" style={{ marginBottom: 12 }}>
      <h3>{report.name} <small className="sub">from {report.ownerName}</small></h3>
      <p>{report.desc}</p>
      <p>
        {report.cat} · {report.color || '—'} · lost at {report.loc} · {formatDate(report.date)}
        {report.created && <> · sent {formatDate(report.created)}</>}
      </p>
      {report.notified && <div className="note">Student last notified {formatDate(report.notified)}.</div>}

      <form onSubmit={handleSubmit}>
        <h4>Check against found items</h4>
        <p className="sub">Sorted by how well each item matches the report. Best matches are at the top.</p>
        {ranked.length
          ? ranked.map(pick)
          : <div className="empty">No found items recorded yet.</div>}

        <label htmlFor={`msg-${report.id}`}>Message to student (optional)</label>
        <textarea
          id={`msg-${report.id}`}
          name="msg"
          placeholder="e.g. Please bring your school ID to the office."
          defaultValue={report.staffMsg || ''}
        />

        <div className="row">
          <button className="btn g" disabled={!openItems.length}>
            {report.status === 'matched' ? 'Update & notify student again' : 'Notify student of match'}
          </button>
        </div>
      </form>
    </div>
  );
}
