import { formatDate } from '../lib/helpers.js';
import StatusPill from './StatusPill.jsx';

// One of the student's own lost item reports.
// `stage` is { status, label, locked } from lib/reportStage.js.
// `children` is shown between the details and the bottom row (e.g. staff matches).
// `onEdit` is optional: the Edit button only shows while the report is still waiting for staff.
export default function LostReportCard({ report, stage, onRemove, onEdit, children }) {
  return (
    <div className="card" style={{ marginBottom: 10 }}>
      <h3>{report.name}</h3>
      <p>
        {report.desc}
        <br />
        {report.cat}{report.color ? ` · ${report.color}` : ''} · lost at {report.loc} · {formatDate(report.date)}
        {report.edited && <> · edited {formatDate(report.edited)}</>}
      </p>
      {children}
      <div className="row">
        <StatusPill status={stage.status}>{stage.label}</StatusPill>
        {onEdit && report.status === 'open' && (
          <button type="button" className="btn l" onClick={() => onEdit(report)}>
            Edit
          </button>
        )}
        {!stage.locked && (
          <button type="button" className="btn l" onClick={() => onRemove(report)}>
            Remove report
          </button>
        )}
      </div>
    </div>
  );
}
