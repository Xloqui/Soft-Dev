import { useEffect, useState } from 'react';
import { onToast } from '../lib/toast.js';

// Shows messages sent with toast('...'). Rendered once in App.jsx.
export default function Toaster() {
  const [messages, setMessages] = useState([]);

  useEffect(() => onToast(text => {
    const id = Date.now() + Math.random();
    setMessages(list => [...list, { id, text }]);
    setTimeout(() => setMessages(list => list.filter(m => m.id !== id)), 2200);
  }), []);

  return messages.map(m => (
    <div key={m.id} className="toast" role="status">{m.text}</div>
  ));
}
