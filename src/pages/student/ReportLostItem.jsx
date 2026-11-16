import { useState } from 'react';
import { useNavigate } from 'react-router';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import LostReportCard from '../../components/LostReportCard.jsx';
import { CATEGORIES } from '../../data/constants.js';
import { useStore } from '../../data/storeContext.js';
import { reportStage } from '../../lib/reportStage.js';
import { toast } from '../../lib/toast.js';

// Formats a Date for <input type="datetime-local">, e.g. "2026-11-16T09:30".
function toLocalInput(date) {
  const pad = n => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function ReportLostItem() {
  const { state, session, act } = useStore();
  const navigate = useNavigate();
  const [removing, setRemoving] = useState(null);
  const [maxDate, setMaxDate] = useState(() => toLocalInput(new Date()));

  const myReports = state.lost.filter(l => l.ownerId === session.id);

  function handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const f = Object.fromEntries(new FormData(form));
    const fields = {
      name: f.name.trim(),
      cat: f.cat,
      color: f.color.trim(),
      loc: f.loc.trim(),
      date: f.date,
      desc: f.desc.trim(),
    };

    if (!fields.name || !fields.loc || !fields.desc) {
      toast('Please fill in the item name, place and description');
      return;
    }
    if (new Date(fields.date) > new Date()) {
      toast('The date lost cannot be in the future');
      return;
    }

    act.addLostReport(fields);
    form.reset();
    setMaxDate(toLocalInput(new Date()));
    toast('Report submitted. Staff will check the found items.');
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
          />
        ))
        : <div className="empty">You have not reported anything yet.</div>}

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
