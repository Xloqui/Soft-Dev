import { Navigate } from 'react-router';
import { useStore } from '../data/storeContext.js';
import { homeFor } from '../lib/routes.js';

// Only lets a logged-in user with the right role see the pages inside it.
// Not logged in → login page. Wrong role → their own home page.
export default function RequireRole({ role, children }) {
  const { session } = useStore();

  if (!session) return <Navigate to="/login" replace />;
  if (session.role !== role) return <Navigate to={homeFor(session.role)} replace />;

  return children;
}
