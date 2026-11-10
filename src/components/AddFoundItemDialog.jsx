import { CATEGORIES } from '../data/constants.js';
import { readPhoto } from '../lib/photo.js';
import Dialog from './Dialog.jsx';

// Staff form for recording an item that was turned in.
export default function AddFoundItemDialog({ open, onSubmit, onClose }) {
  async function handleSubmit(e) {
    e.preventDefault();
    const form = new FormData(e.target);
    const photo = await readPhoto(form.get('photo'));

    onSubmit({
      name: form.get('name'),
      cat: form.get('cat'),
      color: form.get('color'),
      loc: form.get('loc'),
      desc: form.get('desc'),
      photo,
    });
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <h3>Add found item</h3>
      <form onSubmit={handleSubmit}>
        <label htmlFor="found-name">Item name</label>
        <input id="found-name" name="name" required />

        <div className="two">
          <div>
            <label htmlFor="found-cat">Category</label>
            <select id="found-cat" name="cat">
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="found-color">Color</label>
            <input id="found-color" name="color" />
          </div>
        </div>

        <label htmlFor="found-loc">Where it was found</label>
        <input id="found-loc" name="loc" required />

        <label htmlFor="found-desc">Description</label>
        <textarea id="found-desc" name="desc" required />

        <label htmlFor="found-photo">Photo (optional)</label>
        <input id="found-photo" type="file" accept="image/*" name="photo" />

        <div className="row">
          <button className="btn g">Post item</button>
          <button type="button" className="btn l" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </Dialog>
  );
}
