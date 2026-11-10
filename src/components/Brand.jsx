import { SEAL } from '../data/constants.js';

// CIT-U seal + app title, used on the login page and in the page header.
export default function Brand() {
  return (
    <>
      <div className="brand">
        <img src={SEAL} alt="CIT-U seal" />
        <div>
          <h1>Campus Lost and Found</h1>
          <div className="sub">Cebu Institute of Technology – University</div>
        </div>
      </div>
      <span className="brush" />
    </>
  );
}
