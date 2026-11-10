import { useState } from 'react';
import AddFoundItemDialog from '../../components/AddFoundItemDialog.jsx';
import ItemCard from '../../components/ItemCard.jsx';
import { ITEM_STATUS } from '../../data/constants.js';
import { useStore } from '../../data/storeContext.js';
import { toast } from '../../lib/toast.js';

export default function FoundItems() {
  const { state, act } = useStore();
  const [adding, setAdding] = useState(false);

  const count = status => state.items.filter(i => i.status === status).length;
  const openRequests = state.lost.filter(l => l.status === 'open').length;

  function addItem(fields) {
    act.addFoundItem(fields);
    setAdding(false);
    toast('Found item posted');
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

      {state.items.length ? (
        <div className="grid">
          {state.items.map(item => (
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
            </ItemCard>
          ))}
        </div>
      ) : (
        <div className="empty">No found items recorded. Add the first one.</div>
      )}

      <AddFoundItemDialog open={adding} onSubmit={addItem} onClose={() => setAdding(false)} />
    </>
  );
}
