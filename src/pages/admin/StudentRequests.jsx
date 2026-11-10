import { useEffect, useState } from 'react';
import RequestCard from '../../components/RequestCard.jsx';
import { OPEN_STATUSES, STAFF_MAILBOX } from '../../data/constants.js';
import { useStore } from '../../data/storeContext.js';
import { formatDate } from '../../lib/helpers.js';
import { toast } from '../../lib/toast.js';

// Staff review students' lost reports and tell the student when a found item matches.
export default function StudentRequests() {
  const { state, act } = useStore();
  const staffNotes = state.notes.filter(n => n.owner === STAFF_MAILBOX);

  // Remember which notes were unread when the page opened, then mark them read.
  const [freshIds] = useState(() => new Set(staffNotes.filter(n => !n.read).map(n => n.id)));
  useEffect(() => {
    act.markNotesRead(STAFF_MAILBOX);
  }, [act]);

  const openItems = state.items.filter(i => OPEN_STATUSES.includes(i.status));
  const waiting = state.lost.filter(l => l.status === 'open');
  const notified = state.lost.filter(l => l.status !== 'open');

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
