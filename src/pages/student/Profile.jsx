import { useStore } from '../../data/storeContext.js';
import { reportStage } from '../../lib/reportStage.js';
import { toast } from '../../lib/toast.js';

// The logged-in student's account: their info, a summary of their activity,
// and forms to change their name and password.
export default function Profile() {
  const { state, session, act } = useStore();

  const reports = state.lost.filter(l => l.ownerId === session.id);
  const claims = state.claims.filter(c => c.ownerId === session.id);
  const returned = reports.filter(r => reportStage(r, state.claims, state.items).status === 'returned').length;

  function saveName(e) {
    e.preventDefault();
    const result = act.updateProfileName(new FormData(e.target).get('name'));
    toast(result.ok ? 'Name updated' : result.error);
  }

  function savePassword(e) {
    e.preventDefault();
    const form = e.target;
    const result = act.changePassword(Object.fromEntries(new FormData(form)));

    if (!result.ok) {
      toast(result.error);
      return;
    }
    form.reset();
    toast('Password changed. Use it the next time you log in.');
  }

  return (
    <>
      <h2>My profile</h2>
      <span className="brush" />

      <div className="card profile-card">
        <div className="avatar" aria-hidden="true">{session.name.trim()[0]?.toUpperCase()}</div>
        <div>
          <h3>{session.name}</h3>
          <p>Student ID: <b className="nowrap">{session.id}</b></p>
          <p>Account type: Student</p>
        </div>
      </div>

      <div className="stats" style={{ marginTop: 14 }}>
        <div className="stat"><b>{reports.length}</b>Lost reports</div>
        <div className="stat"><b>{claims.length}</b>Claims</div>
        <div className="stat"><b>{returned}</b>Items returned</div>
      </div>

      <div className="two profile-forms">
        <form onSubmit={saveName} className="card">
          <h3>Change name</h3>
          <label htmlFor="profile-name">Full name</label>
          <input id="profile-name" name="name" required maxLength={60} defaultValue={session.name} autoComplete="name" />
          <p className="sub">Staff see this name on your reports and claims.</p>
          <div className="row">
            <button className="btn g">Save name</button>
          </div>
        </form>

        <form onSubmit={savePassword} className="card">
          <h3>Change password</h3>
          <label htmlFor="profile-current">Current password</label>
          <input id="profile-current" type="password" name="current" required autoComplete="current-password" />

          <label htmlFor="profile-pw">New password</label>
          <input id="profile-pw" type="password" name="pw" required minLength={6} autoComplete="new-password" />

          <label htmlFor="profile-confirm">Confirm new password</label>
          <input id="profile-confirm" type="password" name="confirm" required autoComplete="new-password" />

          <p className="sub">At least 6 characters.</p>
          <div className="row">
            <button className="btn g">Change password</button>
          </div>
        </form>
      </div>
    </>
  );
}
