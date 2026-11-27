import { CATEGORIES } from '../data/constants.js';
import { readReportForm, toLocalInput } from '../lib/lostReport.js';
import { toast } from '../lib/toast.js';
import Dialog from './Dialog.jsx';

// Lets a student fix their own lost report while staff are still looking for it.
// `report` is the report being edited, or null when closed.
export default function EditLostReportDialog({ report, onSave, onClose }) {
  function handleSubmit(e) {
    e.preventDefault();
    const { fields, error } = readReportForm(e.target);

    if (error) {
      toast(error);
      return;
    }
    onSave(fields);
  }

  return (
    <Dialog open={Boolean(report)} onClose={onClose}>
      {report && (
        <>
          <h3>Edit report: {report.name}</h3>
          <p className="sub">You can edit this until staff find a match.</p>

          <form onSubmit={handleSubmit}>
            <label htmlFor="edit-name">Item name</label>
            <input id="edit-name" name="name" required maxLength={60} defaultValue={report.name} />

            <div className="two">
              <div>
                <label htmlFor="edit-cat">Category</label>
                <select id="edit-cat" name="cat" defaultValue={report.cat}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="edit-color">Color</label>
                <input id="edit-color" name="color" maxLength={30} defaultValue={report.color} />
              </div>
            </div>

            <label htmlFor="edit-loc">Where you lost it</label>
            <input id="edit-loc" name="loc" required maxLength={80} defaultValue={report.loc} />

            <label htmlFor="edit-date">Date / time lost</label>
            <input
              id="edit-date"
              type="datetime-local"
              name="date"
              required
              max={toLocalInput(new Date())}
              defaultValue={report.date}
            />

            <label htmlFor="edit-desc">Description</label>
            <textarea id="edit-desc" name="desc" required maxLength={400} defaultValue={report.desc} />

            <div className="row">
              <button className="btn g">Save changes</button>
              <button type="button" className="btn l" onClick={onClose}>Cancel</button>
            </div>
          </form>
        </>
      )}
    </Dialog>
  );
}
