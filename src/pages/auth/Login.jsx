import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import Brand from '../../components/Brand.jsx';
import { WILD } from '../../data/constants.js';
import { useStore } from '../../data/storeContext.js';
import { homeFor } from '../../lib/routes.js';
import { toast } from '../../lib/toast.js';

export default function Login() {
  const { state, act } = useStore();
  const navigate = useNavigate();
  const [role, setRole] = useState('student');
  const isStudent = role === 'student';

  function handleSubmit(e) {
    e.preventDefault();
    const form = Object.fromEntries(new FormData(e.target));
    const result = act.login({ role, ...form });

    if (!result.ok) {
      toast(result.error);
      return;
    }

    if (role === 'admin') {
      const waiting = state.lost.filter(l => l.status === 'open').length;
      if (waiting) toast(`${waiting} student request${waiting > 1 ? 's' : ''} waiting for review`);
    }
    navigate(homeFor(role));
  }

  return (
    <div className="login">
      <div className="hero">
        <img src={WILD} alt="Wildcats mascot" />
        <p>Lost something on campus? Report it and the Wildcats staff will help you find it.</p>
      </div>

      <div>
        <Brand />

        <nav>
          <button type="button" className={isStudent ? 'on' : ''} onClick={() => setRole('student')}>
            Student
          </button>
          <button type="button" className={!isStudent ? 'on' : ''} onClick={() => setRole('admin')}>
            Admin / Staff
          </button>
        </nav>

        {/* key={role} resets the form when switching tabs */}
        <form key={role} onSubmit={handleSubmit}>
          
         <label htmlFor="login-id">{isStudent ? 'Student ID' : 'Staff username'}</label>
          <input id="login-id" name="id" required autoComplete="username" />

          <label htmlFor="login-pw">Password</label>
          <input id="login-pw" type="password" name="pw" required autoComplete="current-password" />

          <div className="row">
            <button className="btn g">Log in</button>
          </div>
        </form>

        <p className="sub">
          {isStudent
            ? <>No account yet? <Link to="/register">Create one</Link></>
            : 'Demo staff login: admin / admin123'}
        </p>
      </div>
    </div>
  );
}
