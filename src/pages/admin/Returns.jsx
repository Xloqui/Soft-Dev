import ItemCard from '../../components/ItemCard.jsx';
import { useStore } from '../../data/storeContext.js';

// Staff record handovers and handle unclaimed items.
export default function Returns() {
  const { state, act } = useStore();
  const withStatus = status => state.items.filter(i => i.status === status);

  const section = (title, items, renderAction) => (
    <>
      <h4>{title}</h4>
      {items.length ? (
        <div className="grid">
          {items.map(item => (
            <ItemCard key={item.id} item={item}>{renderAction?.(item)}</ItemCard>
          ))}
        </div>
      ) : (
        <div className="empty">None.</div>
      )}
    </>
  );

  return (
    <>
      {section('Approved – ready for handover', withStatus('approved'), item => (
        <button type="button" className="btn g" onClick={() => act.setItemStatus(item.id, 'returned')}>
          Record return
        </button>
      ))}
      {section('Returned', withStatus('returned'))}
      {section('Unclaimed', withStatus('unclaimed'), item => (
        <button type="button" className="btn l" onClick={() => act.setItemStatus(item.id, 'available')}>
          Re-list
        </button>
      ))}
    </>
  );
}
