import { useEffect, useState } from 'react';
import ClaimDialog from '../../components/ClaimDialog.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import EditLostReportDialog from '../../components/EditLostReportDialog.jsx';
import LostReportCard from '../../components/LostReportCard.jsx';
import StatusPill from '../../components/StatusPill.jsx';
import { CATEGORY_ICON, ITEM_STATUS } from '../../data/constants.js';
import { useStore } from '../../data/storeContext.js';
import { capitalize, formatDate } from '../../lib/helpers.js';
import { claimStatus, reportStage } from '../../lib/reportStage.js';
import { toast } from '../../lib/toast.js';

const NOTES_SHOWN = 5;

// Choices for the "Show" filter on My lost item reports (labels come from lib/reportStage.js).
const STAGE_FILTERS = [
  'Waiting for staff',
  'Staff found a match',
  'Claim under review',
  'Ready for pickup',
  'Returned to you',
];

// Student's notices, their lost reports (with matches staff picked), and their claims.
// RULE: students only ever see the found items that staff matched to THEIR report.
export default function MyReports() {
  const { state, session, act } = useStore();
  const [claiming, setClaiming] = useState(null);
  const [removing, setRemoving] = useState(null);
  const [editing, setEditing] = useState(null);
  const [stageFilter, setStageFilter] = useState('');
  const [showAllNotes, setShowAllNotes] = useState(false);

  // Remember which notices were unread on arrival, so we can mark them "New".
  const [newIds] = useState(
    () => new Set(state.notes.filter(n => n.owner === session.id && !n.read).map(n => n.id)),
  );

  // Opening this page marks the student's notices as read.
  useEffect(() => {
    act.markNotesRead(session.id);
  }, [act, session.id]);

  const notes = state.notes.filter(n => n.owner === session.id);
  const reports = state.lost.filter(l => l.ownerId === session.id);
  const claims = state.claims.filter(c => c.ownerId === session.id);
  const findItem = id => state.items.find(i => i.id === id);
  const stages = reports.map(r => reportStage(r, state.claims, state.items));
  const count = status => stages.filter(s => s.status === status).length;

  function submitClaim(itemId, proof) {
    const result = act.submitClaim(itemId, proof);
    setClaiming(null);
    toast(result.ok ? 'Claim submitted. Staff will review it.' : result.error);
  }

  function saveEdit(fields) {
    const result = act.updateLostReport(editing.id, fields);
    setEditing(null);
    toast(result.ok ? 'Report updated' : result.error);
  }

  function confirmRemove() {
    act.removeLostReport(removing.id);
    setRemoving(null);
    toast('Report removed');
  }

  return (
    <>
      <h2>My reports &amp; notices</h2>

      <div className="stats">
        <div className="stat"><b>{reports.length}</b>Reports</div>
        <div className="stat"><b>{reports.filter(r => r.status === 'matched').length}</b>Matches found</div>
        <div className="stat"><b>{stages.filter(s => s.label === 'Claim under review').length}</b>Claims in review</div>
        <div className="stat"><b>{count('approved')}</b>Ready for pickup</div>
      </div>

      <h4>Notices</h4>
      {notes.length
        ? (
          <>
            {notes.slice(0, showAllNotes ? notes.length : NOTES_SHOWN).map(n => (
              <div key={n.id} className="note">
                {newIds.has(n.id) && <><StatusPill status="available">New</StatusPill>{' '}</>}
                {n.text}
                <br />
                <small>{formatDate(n.date)}</small>
              </div>
            ))}
            {notes.length > NOTES_SHOWN && (
              <button type="button" className="btn l" onClick={() => setShowAllNotes(v => !v)}>
                {showAllNotes ? 'Show fewer' : `Show all ${notes.length} notices`}
              </button>
            )}
          </>
        )
        : <div className="empty">Nothing yet. Staff will message you here when they find a match.</div>}

      <h4>My lost item reports</h4>
      {reports.length > 1 && (
        <div className="row" style={{ marginBottom: 10 }}>
          <label htmlFor="stage-filter" style={{ margin: 0 }}>Show</label>
          <select
            id="stage-filter"
            style={{ width: 'auto' }}
            value={stageFilter}
            onChange={e => setStageFilter(e.target.value)}
          >
            <option value="">All reports ({reports.length})</option>
            {STAGE_FILTERS.map(label => {
              const n = stages.filter(s => s.label === label).length;
              return <option key={label} value={label} disabled={!n}>{label} ({n})</option>;
            })}
          </select>
        </div>
      )}
      {reports.length
        ? reports.map((report, index) => {
          if (stageFilter && stages[index].label !== stageFilter) return null;
          const matches = (report.matched || []).map(findItem).filter(Boolean);

          return (
            <LostReportCard
              key={report.id}
              report={report}
              stage={stages[index]}
              onRemove={setRemoving}
              onEdit={setEditing}
            >
              {matches.length ? (
                <>
                  <p><b>Staff found possible match(es):</b></p>
                  {report.staffMsg && <div className="note">{report.staffMsg}</div>}
                  {matches.map(item => (
                    <div key={item.id} className="row">
                      <span>{CATEGORY_ICON[item.cat]} {item.name} – {item.loc}</span>
                      {item.status === 'available'
                        ? <button type="button" className="btn g" onClick={() => setClaiming(item)}>Claim</button>
                        : <StatusPill status={item.status}>{ITEM_STATUS[item.status]}</StatusPill>}
                    </div>
                  ))}
                </>
              ) : (
                <p>Staff are still checking the found items for your request.</p>
              )}
            </LostReportCard>
          );
        })
        : <div className="empty">No reports yet. Use “Report lost item” to start one.</div>}

      <h4>My claims</h4>
      {claims.length ? (
        <div className="scroll">
          <table>
            <thead>
              <tr><th>Item</th><th>Submitted</th><th>Status</th></tr>
            </thead>
            <tbody>
              {claims.map(c => {
                const item = findItem(c.itemId);
                const status = claimStatus(c, state.claims, item);
                const labels = {
                  approved: 'Approved – pick up at the office',
                  returned: 'Returned to you',
                };

                return (
                  <tr key={c.id}>
                    <td>{item?.name}</td>
                    <td>{formatDate(c.date)}</td>
                    <td>
                      <StatusPill status={status}>{labels[status] || capitalize(status)}</StatusPill>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty">You have not submitted any claims.</div>
      )}

      <EditLostReportDialog report={editing} onSave={saveEdit} onClose={() => setEditing(null)} />
      <ClaimDialog item={claiming} onSubmit={submitClaim} onClose={() => setClaiming(null)} />
      <ConfirmDialog
        open={Boolean(removing)}
        title="Remove this report?"
        message={removing ? `"${removing.name}" will be removed and staff will stop looking for it.` : ''}
        confirmLabel="Remove report"
        onConfirm={confirmRemove}
        onClose={() => setRemoving(null)}
      />
    </>
  );
}
