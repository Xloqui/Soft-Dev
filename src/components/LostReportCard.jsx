import { formatDate } from '../lib/helpers.js';
import StatusPill from './StatusPill.jsx';

// One of the student's own lost item reports.
// `children` is shown between the details and the bottom row (e.g. staff matches).
export default function LostReportCard({ report, onRemove, children }) {
  return (
    <div className="card" style={{ marginBottom: 10 }}>
      <h3>{report.name}</h3>
      <p>
        {report.desc}
        <br />
        {report.cat} · lost at {report.loc} · {formatDate(report.date)}
      </p>
      {children}
      <div className="row">
        {report.status === 'matched'
          ? <StatusPill status="available">Staff found a match</StatusPill>
          : <StatusPill status="pending">Waiting for staff</StatusPill>}
        <button type="button" className="btn l" onClick={() => onRemove(report.id)}>
          Remove report
        </button>
      </div>
    </div>
  );
}
