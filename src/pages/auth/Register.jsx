import { Link, useNavigate } from 'react-router';
import Brand from '../../components/Brand.jsx';
import { WILD } from '../../data/constants.js';
import { useStore } from '../../data/storeContext.js';
import { toast } from '../../lib/toast.js';

export default function Register() {
  const { act } = useStore();
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    const form = Object.fromEntries(new FormData(e.target));
    const result = act.register(form);

    if (!result.ok) {
      toast(result.error);
      return;
    }
    toast('Account created. You can log in now.');
    navigate('/login');
  }

  return (
    <div className="login">
      <div className="hero">
        <img src={WILD} alt="Wildcats mascot" />
        <p>Create a student account to report lost items and track them.</p>
      </div>

      <div>
        <Brand />
        <h2>Create account</h2>
        <span className="brush" />

        <form onSubmit={handleSubmit}>
          <label htmlFor="reg-id">Student ID</label>
          <input id="reg-id" name="id" required autoComplete="username" />

          <label htmlFor="reg-name">Full name</label>
          <input id="reg-name" name="name" required autoComplete="name" />

          <label htmlFor="reg-pw">Password</label>
          <input id="reg-pw" type="password" name="pw" required autoComplete="new-password" />

          <label htmlFor="reg-confirm">Confirm password</label>
          <input id="reg-confirm" type="password" name="confirm" required autoComplete="new-password" />

          <div className="row">
            <button className="btn g">Register</button>
          </div>
        </form>

        <p className="sub">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}