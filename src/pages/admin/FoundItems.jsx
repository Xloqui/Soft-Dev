import { useState } from 'react';
import AddFoundItemDialog from '../../components/AddFoundItemDialog.jsx';
import ItemCard from '../../components/ItemCard.jsx';
import { CATEGORIES, ITEM_STATUS } from '../../data/constants.js';
import { useStore } from '../../data/storeContext.js';
import { toast } from '../../lib/toast.js';

// STAFF ONLY: the full list of found items, with search, filters, add and edit.
export default function FoundItems() {
  const { state, act } = useStore();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');

  const count = s => state.items.filter(i => i.status === s).length;
  const openRequests = state.lost.filter(l => l.status === 'open').length;

  // Search looks at the name, description, color, place and hidden details.
  const words = search.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const shown = state.items.filter(item => {
    if (category && item.cat !== category) return false;
    if (status && item.status !== status) return false;

    const text = [item.name, item.desc, item.color, item.loc, item.hidden].join(' ').toLowerCase();
    return words.every(word => text.includes(word));
  });
  const filtering = Boolean(words.length || category || status);

  function clearFilters() {
    setSearch('');
    setCategory('');
    setStatus('');
  }

  function addItem(fields) {
    act.addFoundItem(fields);
    setAdding(false);
    toast('Found item posted');
  }

  function saveItem(fields) {
    const result = act.updateFoundItem(editing.id, fields);
    setEditing(null);
    toast(result.ok ? 'Changes saved' : result.error);
  }

  return (
    <>
      <div className="stats">
        <div className="stat"><b>{count('available')}</b>Available</div>
        <div className="stat"><b>{count('pending')}</b>Claims pending</div>
        <div className="stat"><b>{count('approved')}</b>Awaiting pickup</div>
        <div className="stat"><b>{openRequests}</b>Open requests</div>
      </div>

      <div className="row" style={{ margin: '0 0 14px' }}>
        <button type="button" className="btn g" onClick={() => setAdding(true)}>+ Add found item</button>
      </div>

      <div className="filters">
        <input
          type="search"
          placeholder="Search name, color, place, details…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          aria-label="Search found items"
        />
        <select value={category} onChange={e => setCategory(e.target.value)} aria-label="Filter by category">
          <option value="">All categories</option>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={status} onChange={e => setStatus(e.target.value)} aria-label="Filter by status">
          <option value="">All statuses</option>
          {Object.entries(ITEM_STATUS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        {filtering && <button type="button" className="btn l" onClick={clearFilters}>Clear</button>}
      </div>

      {filtering && (
        <p className="sub" style={{ marginBottom: 10 }}>
          Showing {shown.length} of {state.items.length} items
        </p>
      )}

      {shown.length ? (
        <div className="grid">
          {shown.map(item => (
            <ItemCard key={item.id} item={item}>
              <select
                style={{ width: 'auto' }}
                value={item.status}
                onChange={e => act.setItemStatus(item.id, e.target.value)}
                aria-label="Status"
              >
                {Object.entries(ITEM_STATUS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <button type="button" className="btn l" onClick={() => setEditing(item)}>Edit</button>
            </ItemCard>
          ))}
        </div>
      ) : (
        <div className="empty">
          {state.items.length
            ? 'No found items match your search. Try other words or clear the filters.'
            : 'No found items recorded. Add the first one.'}
        </div>
      )}

      <AddFoundItemDialog open={adding} onSubmit={addItem} onClose={() => setAdding(false)} />
      <AddFoundItemDialog
        open={Boolean(editing)}
        item={editing}
        onSubmit={saveItem}
        onClose={() => setEditing(null)}
      />
    </>
  );
}
