import { CATEGORY_ICON, ITEM_STATUS } from '../data/constants.js';
import { formatDate } from '../lib/helpers.js';
import StatusPill from './StatusPill.jsx';

// A found item card. STAFF PAGES ONLY: students must never see the found-item list.
// `children` are extra buttons/controls shown next to the status.
export default function ItemCard({ item, children }) {
  return (
    <div className="card">
      <div className="ph">
        {item.photo ? <img src={item.photo} alt={item.name} /> : CATEGORY_ICON[item.cat]}
      </div>
      <h3>{item.name}</h3>
      <p>{item.desc}</p>
      <p>
        {item.cat} · {item.color || '—'}
        <br />
        Found at {item.loc} · {formatDate(item.date)}
      </p>
      <div className="row">
        <StatusPill status={item.status}>{ITEM_STATUS[item.status]}</StatusPill>
        {children}
      </div>
    </div>
  );
}
