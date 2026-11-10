import { Link } from 'react-router';

export default function NotFound() {
  return (
    <div className="empty">
      <h2>Page not found</h2>
      <p>This page doesn&apos;t exist, or you don&apos;t have access to it.</p>
      <Link to="/" className="btn">Go to my home page</Link>
    </div>
  );
}
