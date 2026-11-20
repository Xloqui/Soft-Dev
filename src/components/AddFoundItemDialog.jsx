import { CATEGORIES } from '../data/constants.js';
import { readPhoto } from '../lib/photo.js';
import Dialog from './Dialog.jsx';

// Staff form for recording an item that was turned in, or editing one already posted.
// Pass `item` to edit it; leave it out to add a new item.
export default function AddFoundItemDialog({ open, item, onSubmit, onClose }) {
  const editing = Boolean(item);

  async function handleSubmit(e) {
    e.preventDefault();
    const form = new FormData(e.target);
    const newPhoto = await readPhoto(form.get('photo'));

    // When editing: keep the current photo unless a new one is chosen or "Remove photo" is ticked.
    let photo = newPhoto;
    if (editing && !newPhoto) photo = form.get('removePhoto') ? '' : undefined;

    onSubmit({
      name: form.get('name'),
      cat: form.get('cat'),
      color: form.get('color'),
      loc: form.get('loc'),
      desc: form.get('desc'),
      hidden: form.get('hidden'),
      photo,
    });
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <h3>{editing ? `Edit: ${item.name}` : 'Add found item'}</h3>
      <form onSubmit={handleSubmit}>
        <label htmlFor="found-name">Item name</label>
        <input id="found-name" name="name" required defaultValue={item?.name} />

        <div className="two">
          <div>
            <label htmlFor="found-cat">Category</label>
            <select id="found-cat" name="cat" defaultValue={item?.cat}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="found-color">Color</label>
            <input id="found-color" name="color" defaultValue={item?.color} />
          </div>
        </div>

        <label htmlFor="found-loc">Where it was found</label>
        <input id="found-loc" name="loc" required defaultValue={item?.loc} />

        <label htmlFor="found-desc">Description</label>
        <textarea
          id="found-desc"
          name="desc"
          required
          placeholder="What anyone can see on the item"
          defaultValue={item?.desc}
        />

        <label htmlFor="found-hidden">🔒 Hidden details (staff only)</label>
        <textarea
          id="found-hidden"
          name="hidden"
          maxLength={300}
          placeholder="e.g. lock screen is a cat photo, name written inside, contents of the bag"
          defaultValue={item?.hidden}
        />
        <p className="sub">
          Students never see this. Use it to check their proof of ownership when they claim the item.
        </p>

        <label htmlFor="found-photo">{editing && item.photo ? 'Replace photo (optional)' : 'Photo (optional)'}</label>
        <input id="found-photo" type="file" accept="image/*" name="photo" />

        {editing && item.photo && (
          <label className="pick">
            <input type="checkbox" name="removePhoto" />
            <span>Remove the current photo</span>
          </label>
        )}

        <div className="row">
          <button className="btn g">{editing ? 'Save changes' : 'Post item'}</button>
          <button type="button" className="btn l" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </Dialog>
  );
}
