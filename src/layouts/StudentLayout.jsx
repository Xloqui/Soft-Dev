import { Outlet } from 'react-router';
import Navbar from '../components/Navbar.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { useStore } from '../data/storeContext.js';

// Header + student menu around every student page.
// Note: there is deliberately NO page for browsing found items (professor's rule).
export default function StudentLayout() {
  const { state, session } = useStore();
  const unread = state.notes.filter(n => n.owner === session.id && !n.read).length;

  const links = [
    { to: '/student/report', label: 'Report lost item' },
    { to: '/student/reports', label: 'My reports & notices', badge: unread },
  ];

  return (
    <>
      <PageHeader />
      <Navbar links={links} />
      <Outlet />
    </>
  );
}
