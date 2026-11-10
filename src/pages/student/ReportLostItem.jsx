import LostReportCard from '../../components/LostReportCard.jsx';
import { CATEGORIES } from '../../data/constants.js';
import { useStore } from '../../data/storeContext.js';
import { toast } from '../../lib/toast.js';

export default function ReportLostItem() {
  const { state, session, act } = useStore();
  const myReports = state.lost.filter(l => l.ownerId === session.id);

  function handleSubmit(e) {
    e.preventDefault();
    act.addLostReport(Object.fromEntries(new FormData(e.target)));
    e.target.reset();
    toast('Report submitted');
  }

  return (
    <>
      <h2>Report a lost item</h2>
      <p className="sub">Give as many details as you can so staff can identify your item.</p>

      <form onSubmit={handleSubmit} className="two">
        <div>
          <label htmlFor="lost-name">Item name</label>
          <input id="lost-name" name="name" required />
        </div>
        <div>
          <label htmlFor="lost-cat">Category</label>
          <select id="lost-cat" name="cat">
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="lost-color">Color</label>
          <input id="lost-color" name="color" />
        </div>
        <div>
          <label htmlFor="lost-loc">Where you lost it</label>
          <input id="lost-loc" name="loc" required />
        </div>
        <div>
          <label htmlFor="lost-date">Date / time lost</label>
          <input id="lost-date" type="datetime-local" name="date" required />
        </div>
        <div />
        <div style={{ gridColumn: '1 / -1' }}>
          <label htmlFor="lost-desc">Description</label>
          <textarea id="lost-desc" name="desc" required placeholder="Brand, marks, contents…" />
        </div>
        <div className="row" style={{ gridColumn: '1 / -1' }}>
          <button className="btn">Submit report</button>
        </div>
      </form>

      <h4>My reports</h4>
      {myReports.length
        ? myReports.map(r => <LostReportCard key={r.id} report={r} onRemove={act.removeLostReport} />)
        : <div className="empty">You have not reported anything yet.</div>}
    </>
  );
}
