import { useNavigate } from 'react-router';
import { useStore } from '../data/storeContext.js';
import { toast } from '../lib/toast.js';
import Brand from './Brand.jsx';

// Top of every logged-in page: logo, who is signed in, and Log out.
export default function PageHeader() {
  const { session, act } = useStore();
  const navigate = useNavigate();

  function logout() {
    act.logout();
    navigate('/login');
    toast('Logged out');
  }

  return (
    <div className="top">
      <div>
        <Brand />
      </div>
      <div className="me">
        Signed in as <b>{session.name}</b> ({session.role === 'student' ? 'Student' : 'Staff'}){' '}
        <button type="button" className="btn l" onClick={logout}>Log out</button>
      </div>
    </div>
  );
}
