import { useState } from 'react';
import { useNavigate } from 'react-router';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import EditLostReportDialog from '../../components/EditLostReportDialog.jsx';
import LostReportCard from '../../components/LostReportCard.jsx';
import { CATEGORIES } from '../../data/constants.js';
import { useStore } from '../../data/storeContext.js';
import { readReportForm, toLocalInput } from '../../lib/lostReport.js';
import { reportStage } from '../../lib/reportStage.js';
import { toast } from '../../lib/toast.js';

export default function ReportLostItem() {
  const { state, session, act } = useStore();
  const navigate = useNavigate();
  const [removing, setRemoving] = useState(null);
  const [editing, setEditing] = useState(null);
  const [maxDate, setMaxDate] = useState(() => toLocalInput(new Date()));

  const myReports = state.lost.filter(l => l.ownerId === session.id);

  function handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const { fields, error } = readReportForm(form);

    if (error) {
      toast(error);
      return;
    }

    act.addLostReport(fields);
    form.reset();
    setMaxDate(toLocalInput(new Date()));
    toast('Report submitted. Staff will check the found items.');
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
      <h2>Report a lost item</h2>
      <p className="sub">
        Give as many details as you can so staff can identify your item. Staff will check the found
        items and notify you if something matches.
      </p>

      <form onSubmit={handleSubmit} className="two">
        <div>
          <label htmlFor="lost-name">Item name</label>
          <input id="lost-name" name="name" required maxLength={60} placeholder="e.g. Black umbrella" />
        </div>
        <div>
          <label htmlFor="lost-cat">Category</label>
          <select id="lost-cat" name="cat">
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="lost-color">Color</label>
          <input id="lost-color" name="color" maxLength={30} />
        </div>
        <div>
          <label htmlFor="lost-loc">Where you lost it</label>
          <input id="lost-loc" name="loc" required maxLength={80} placeholder="e.g. Library, 2nd floor" />
        </div>
        <div>
          <label htmlFor="lost-date">Date / time lost</label>
          <input id="lost-date" type="datetime-local" name="date" required max={maxDate} />
        </div>
        <div />
        <div style={{ gridColumn: '1 / -1' }}>
          <label htmlFor="lost-desc">Description</label>
          <textarea id="lost-desc" name="desc" required maxLength={400} placeholder="Brand, marks, contents…" />
        </div>
        <div className="row" style={{ gridColumn: '1 / -1' }}>
          <button className="btn">Submit report</button>
          <button type="button" className="btn l" onClick={() => navigate('/student/reports')}>
            View my reports &amp; notices
          </button>
        </div>
      </form>

      <h4>My reports</h4>
      {myReports.length
        ? myReports.map(r => (
          <LostReportCard
            key={r.id}
            report={r}
            stage={reportStage(r, state.claims, state.items)}
            onRemove={setRemoving}
            onEdit={setEditing}
          />
        ))
        : <div className="empty">You have not reported anything yet.</div>}

      <EditLostReportDialog report={editing} onSave={saveEdit} onClose={() => setEditing(null)} />
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
