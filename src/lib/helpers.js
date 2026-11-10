// Formats a timestamp or date string as e.g. "Nov 10, 9:30 AM".
export function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function capitalize(text) {
  return text ? text[0].toUpperCase() + text.slice(1) : '';
}
