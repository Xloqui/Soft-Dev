import { Outlet } from 'react-router';
import Navbar from '../components/Navbar.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { STAFF_MAILBOX } from '../data/constants.js';
import { useStore } from '../data/storeContext.js';

// Header + staff menu around every admin/staff page.
export default function AdminLayout() {
  const { state } = useStore();
  const unread = state.notes.filter(n => n.owner === STAFF_MAILBOX && !n.read).length;

  const links = [
    { to: '/admin/found', label: 'Found items' },
    { to: '/admin/requests', label: 'Student requests', badge: unread },
    { to: '/admin/claims', label: 'Claims' },
    { to: '/admin/returns', label: 'Returns & unclaimed' },
  ];

  return (
    <>
      <PageHeader />
      <Navbar links={links} />
      <Outlet />
    </>
  );
}
