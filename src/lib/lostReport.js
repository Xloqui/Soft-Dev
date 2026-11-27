// Shared rules for the student's lost item report form (used when reporting and when editing).

// Formats a Date for <input type="datetime-local">, e.g. "2026-11-16T09:30".
export function toLocalInput(date) {
  const pad = n => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// Cleans up the form values and checks them.
// Returns { fields } when everything is fine, or { error: '...' } to show the student.
export function readReportForm(form) {
  const f = Object.fromEntries(new FormData(form));
  const fields = {
    name: (f.name || '').trim(),
    cat: f.cat,
    color: (f.color || '').trim(),
    loc: (f.loc || '').trim(),
    date: f.date,
    desc: (f.desc || '').trim(),
  };

  if (!fields.name || !fields.loc || !fields.desc) {
    return { error: 'Please fill in the item name, place and description' };
  }
  if (new Date(fields.date) > new Date()) {
    return { error: 'The date lost cannot be in the future' };
  }
  return { fields };
}
