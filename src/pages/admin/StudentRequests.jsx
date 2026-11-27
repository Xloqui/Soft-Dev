import { useEffect, useState } from 'react';
import RequestCard from '../../components/RequestCard.jsx';
import { OPEN_STATUSES } from '../../data/constants.js';
import { useStore } from '../../data/storeContext.js';
import { adminCanSee, buildingLabel, staffMailbox } from '../../lib/buildings.js';
import { formatDate } from '../../lib/helpers.js';
import { toast } from '../../lib/toast.js';

// Staff review students' lost reports and tell the student when a found item matches.
// Each admin sees reports for their building plus reports where the student chose "Not sure",
// and can only match them with found items from their own building.
export default function StudentRequests() {
  const { state, session, act } = useStore();
  const mailbox = staffMailbox(session.building);
  const staffNotes = state.notes.filter(n => n.owner === mailbox);

  // Remember which notes were unread when the page opened, then mark them read.
  const [freshIds] = useState(() => new Set(staffNotes.filter(n => !n.read).map(n => n.id)));
  useEffect(() => {
    act.markNotesRead(mailbox);
  }, [act, mailbox]);

  const openItems = state.items.filter(i => i.building === session.building && OPEN_STATUSES.includes(i.status));
  const visible = state.lost.filter(l => adminCanSee(l, session.building));
  const waiting = visible.filter(l => l.status === 'open');
  const notified = visible.filter(l => l.status !== 'open');

  function notifyStudent(reportId, itemIds, message) {
    const result = act.notifyMatch(reportId, itemIds, message);
    toast(result.ok ? `${result.studentName} has been notified` : result.error);
  }

  const card = report => (
    <RequestCard key={report.id} report={report} openItems={openItems} onNotify={notifyStudent} />
  );

  return (
    <>
      <h2>Student requests</h2>
      <span className="brush" />
      <p className="sub">
        Requests for the {buildingLabel(session.building)} and requests where the student isn&apos;t sure
        of the building. You can match them with your building&apos;s found items.
      </p>

      {staffNotes.slice(0, 5).map(n => (
        <div key={n.id} className="note">
          {freshIds.has(n.id) && <b>New · </b>}
          {n.text}
          <br />
          <small>{formatDate(n.date)}</small>
        </div>
      ))}

      <h4>Waiting for review ({waiting.length})</h4>
      {waiting.length
        ? waiting.map(card)
        : <div className="empty">No requests waiting. New student requests will show up here.</div>}

      <h4>Student already notified ({notified.length})</h4>
      {notified.length ? notified.map(card) : <p className="sub">None yet.</p>}
    </>
  );
}
