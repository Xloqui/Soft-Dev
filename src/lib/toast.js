// A tiny message bus for toast pop-ups.
// Call toast('Saved!') from anywhere; <Toaster /> shows the messages.

const listeners = new Set();

export function toast(message) {
  listeners.forEach(listener => listener(message));
}

export function onToast(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
