import { useNavigate, useLocation } from 'react-router';

// The row of menu buttons. `links` is a list of { to, label, badge }.
export default function Navbar({ links }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav>
      {links.map(link => (
        <button
          key={link.to}
          type="button"
          className={pathname === link.to ? 'on' : ''}
          onClick={() => navigate(link.to)}
        >
          {link.label}
          {link.badge ? ` (${link.badge})` : ''}
        </button>
      ))}
    </nav>
  );
}
