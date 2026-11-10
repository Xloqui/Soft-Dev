import { useEffect, useState } from 'react';
import ClaimDialog from '../../components/ClaimDialog.jsx';
import LostReportCard from '../../components/LostReportCard.jsx';
import StatusPill from '../../components/StatusPill.jsx';
import { CATEGORY_ICON, ITEM_STATUS } from '../../data/constants.js';
import { useStore } from '../../data/storeContext.js';
import { capitalize, formatDate } from '../../lib/helpers.js';
import { toast } from '../../lib/toast.js';

// Student's notifications, their lost reports (with matches staff picked), and their claims.
// Students only ever see the found items that staff matched to THEIR report.
export default function MyReports() {
  const { state, session, act } = useStore();
  const [claiming, setClaiming] = useState(null);

  // Opening this page marks the student's notifications as read.
  useEffect(() => {
    act.markNotesRead(session.id);
  }, [act, session.id]);

  const notes = state.notes.filter(n => n.owner === session.id);
  const reports = state.lost.filter(l => l.ownerId === session.id);
  const claims = state.claims.filter(c => c.ownerId === session.id);
  const findItem = id => state.items.find(i => i.id === id);

  function submitClaim(itemId, proof) {
    const result = act.submitClaim(itemId, proof);
    setClaiming(null);
    toast(result.ok ? 'Claim submitted' : result.error);
  }

  return (
    <>
      <h4>Notifications</h4>
      {notes.length
        ? notes.slice(0, 6).map(n => (
          <div key={n.id} className="note">
            {n.text}
            <br />
            <small>{formatDate(n.date)}</small>
          </div>
        ))
        : <div className="empty">Nothing yet.</div>}

      <h4>My lost item reports</h4>
      {reports.length
        ? reports.map(report => {
          const matches = (report.matched || []).map(findItem).filter(Boolean);

          return (
            <LostReportCard key={report.id} report={report} onRemove={act.removeLostReport}>
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
        : <div className="empty">No reports yet.</div>}

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
                const pickedUp = c.status === 'approved' && item?.status === 'returned';

                return (
                  <tr key={c.id}>
                    <td>{item?.name}</td>
                    <td>{formatDate(c.date)}</td>
                    <td>
                      {pickedUp ? (
                        <StatusPill status="returned">Returned to you</StatusPill>
                      ) : (
                        <StatusPill status={c.status}>
                          {c.status === 'approved' ? 'Approved – pick up at the office' : capitalize(c.status)}
                        </StatusPill>
                      )}
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

      <ClaimDialog item={claiming} onSubmit={submitClaim} onClose={() => setClaiming(null)} />
    </>
  );
}
