// A small coloured label. `status` picks the colour (see .pill.* in index.css).
export default function StatusPill({ status, children }) {
  return <span className={`pill ${status}`}>{children}</span>;
}
