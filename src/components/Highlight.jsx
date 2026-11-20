// Shows `text` with every word from `words` wrapped in <mark> (case-insensitive).
export default function Highlight({ text, words }) {
  if (!text) return null;
  const marked = new Set(words.map(w => w.toLowerCase()));

  return text.split(/([A-Za-z0-9]+)/).map((part, i) => (
    marked.has(part.toLowerCase()) ? <mark key={i}>{part}</mark> : part
  ));
}
