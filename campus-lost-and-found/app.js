/* ==========================================================================
   1. CONSTANTS
   ========================================================================== */
const ADMIN = '#staff'; // owner key for notifications addressed to staff
const SEAL = 'assets/cit-seal.png';
const WILD = 'assets/wildcats.jpg';

const CATS = [
  'Bags',
  'Electronics',
  'IDs & Cards',
  'Keys',
  'Clothing',
  'Books & Notes',
  'Water Bottles',
  'Other',
];

const ICON = {
  'Bags': '🎒',
  'Electronics': '🎧',
  'IDs & Cards': '🪪',
  'Keys': '🔑',
  'Clothing': '🧥',
  'Books & Notes': '📚',
  'Water Bottles': '🥤',
  'Other': '📦',
};

const ST = {
  available: 'Available',
  pending: 'Claim pending',
  approved: 'Approved – ready for pickup',
  returned: 'Returned',
  unclaimed: 'Unclaimed',
};

/* ==========================================================================
   2. HELPERS
   ========================================================================== */
const $ = s => document.querySelector(s);

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}[c]));

const fmt = t => new Date(t).toLocaleString([], {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

const opts = (list, selected) =>
  list.map(x => `<option ${x === selected ? 'selected' : ''}>${x}</option>`).join('');

function toast(msg) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  document.body.append(el);
  setTimeout(() => el.remove(), 2200);
}

/* ==========================================================================
   3. STATE & STORAGE
   ========================================================================== */
function load() {
  try {
    const saved = JSON.parse(localStorage.getItem('clf-v1'));
    if (saved) return saved;
  } catch (e) {}

  const t = Date.now();
  const d = 864e5;

  return {
    me: '',
    items: [
      {
        id: 1,
        name: 'Black backpack',
        desc: 'Black Jansport with a keychain of a small bear',
        cat: 'Bags',
        color: 'Black',
        loc: 'Library, 2nd floor',
        date: t - 2 * d,
        status: 'available',
      },
      {
        id: 2,
        name: 'Wireless earbuds',
        desc: 'White case, scratched on the lid',
        cat: 'Electronics',
        color: 'White',
        loc: 'Cafeteria',
        date: t - d,
        status: 'available',
      },
      {
        id: 3,
        name: 'Student ID',
        desc: 'ID card, name partly hidden by a sticker',
        cat: 'IDs & Cards',
        color: 'Blue',
        loc: 'Gym entrance',
        date: t - 4 * d,
        status: 'available',
      },
    ],
    lost: [],
    claims: [],
    notes: [],
    n: 10,
  };
}

function save() {
  try {
    localStorage.setItem('clf-v1', JSON.stringify(S));
  } catch (e) {}
}

let S = load();
let role = 'student';
let view = 'report';
let q = '';
let fc = '';
let lr = 'student';

S.accts = S.accts || [{ id: 'admin', pw: 'admin123', role: 'admin', name: 'Staff' }];
S.session = S.session || null;

/* ==========================================================================
   4. AUTHENTICATION
   ========================================================================== */
function loginView() {
  const isStudent = lr === 'student';

  return `<div class="login">
  <div class="hero">
    <img src="${WILD}" alt="Wildcats mascot">
    <p>Lost something on campus? Report it and the Wildcats staff will help you find it.</p>
  </div>
  <div>
    <div class="brand">
      <img src="${SEAL}" alt="CIT-U seal">
      <div>
        <h1>Campus Lost and Found</h1>
        <div class="sub">Cebu Institute of Technology – University</div>
      </div>
    </div>
    <span class="brush"></span>
    <nav>
      <button class="${isStudent ? 'on' : ''}" onclick="lr='student';render()">Student</button>
      <button class="${!isStudent ? 'on' : ''}" onclick="lr='admin';render()">Admin / Staff</button>
    </nav>
    <form onsubmit="return login(event)">
      <label>${isStudent ? 'Student ID' : 'Staff username'}</label>
      <input name="id" required autocomplete="username">
      ${isStudent ? '<label>Full name (first log in only)</label><input name="name">' : ''}
      <label>Password</label>
      <input type="password" name="pw" required autocomplete="current-password">
      <div class="row"><button class="btn g">Log in</button></div>
    </form>
    <p class="sub">${isStudent
      ? 'First time? Enter your ID, full name and a password to create your account.'
      : 'Demo staff login: admin / admin123'}</p>
  </div>
</div>`;
}

function login(e) {
  e.preventDefault();

  const f = Object.fromEntries(new FormData(e.target));
  const id = f.id.trim().toLowerCase();
  let a = S.accts.find(x => x.id === id && x.role === lr);

  if (!a) {
    if (lr === 'admin') {
      toast('Wrong username or password');
      return false;
    }
    if (!(f.name || '').trim()) {
      toast('Enter your full name to create an account');
      return false;
    }
    a = { id, pw: f.pw, role: 'student', name: f.name.trim() };
    S.accts.push(a);
  } else if (a.pw !== f.pw) {
    toast('Wrong username or password');
    return false;
  }

  S.session = { role: a.role, name: a.name, id: a.id };
  view = a.role === 'student' ? 'report' : 'found';
  save();
  render();

  if (a.role === 'admin') {
    const waiting = S.lost.filter(l => (l.status || 'open') === 'open').length;
    if (waiting) toast(`${waiting} student request${waiting > 1 ? 's' : ''} waiting for review`);
  }
  return false;
}

function logout() {
  S.session = null;
  save();
  render();
  toast('Logged out');
}

/* ==========================================================================
   5. MATCHING & NOTIFICATIONS
   ========================================================================== */
function words(s) {
  return (s || '').toLowerCase().split(/\W+/).filter(w => w.length > 3);
}

function match(lost, item) {
  if (lost.cat !== item.cat) return false;

  if (lost.color && item.color && lost.color.toLowerCase() === item.color.toLowerCase()) {
    return true;
  }

  const a = words(lost.name + ' ' + lost.desc);
  const b = words(item.name + ' ' + item.desc);
  return a.some(w => b.includes(w));
}

function notify(owner, text) {
  S.notes.unshift({ id: S.n++, owner, text, date: Date.now() });
}

// Tells the staff dashboard that a student sent a new request.
function notifyStaff(text) {
  notify(ADMIN, text);
}

// Found items staff can still hand out (not yet returned or unclaimed).
const openItems = () => S.items.filter(i => ['available', 'pending'].includes(i.status));

const reqPill = l => l.status === 'matched'
  ? '<span class="pill available">Staff found a match</span>'
  : '<span class="pill pending">Waiting for staff</span>';

/* ==========================================================================
   6. RENDERING
   ========================================================================== */
function render() {
  if (!S.session) {
    $('#app').innerHTML = loginView();
    return;
  }

  role = S.session.role;
  S.me = S.session.name;

  const nav = role === 'student'
    ? [['report', 'Report lost item'], ['mine', 'My reports & notices']]
    : [['found', 'Found items'], ['requests', 'Student requests'], ['claims', 'Claims'], ['returns', 'Returns & unclaimed']];
  const mailbox = role === 'admin' ? ADMIN : S.me;
  const unread = S.notes.filter(n => n.owner === mailbox && !n.read).length;

  let h = `<div class="top">
  <div>
    <div class="brand">
      <img src="${SEAL}" alt="CIT-U seal">
      <div>
        <h1>Campus Lost and Found</h1>
        <div class="sub">Cebu Institute of Technology – University</div>
      </div>
    </div>
    <span class="brush"></span>
  </div>
  <div class="me">Signed in as <b>${esc(S.me)}</b> (${role === 'student' ? 'Student' : 'Staff'})
    <button class="btn l" onclick="logout()">Log out</button>
  </div>
</div>
<nav>${nav.map(([k, label]) =>
    `<button class="${view === k ? 'on' : ''}" onclick="view='${k}';render()">${label}${(k === 'mine' || k === 'requests') && unread ? ` (${unread})` : ''}</button>`
  ).join('')}</nav>`;

  h += VIEWS[view]();
  $('#app').innerHTML = h;
}

const itemCard = (i, act = '') => `<div class="card">
  <div class="ph">${i.photo ? `<img src="${i.photo}" alt="${esc(i.name)}">` : ICON[i.cat]}</div>
  <h3>${esc(i.name)}</h3>
  <p>${esc(i.desc)}</p>
  <p>${esc(i.cat)} · ${esc(i.color || '—')}<br>Found at ${esc(i.loc)} · ${fmt(i.date)}</p>
  <div class="row"><span class="pill ${i.status}">${ST[i.status]}</span>${act}</div>
</div>`;

const VIEWS = {
  search() {
    const list = S.items
      .filter(i => ['available', 'pending'].includes(i.status))
      .filter(i => (!fc || i.cat === fc)
        && (!q || (i.name + ' ' + i.desc + ' ' + i.color + ' ' + i.loc).toLowerCase().includes(q.toLowerCase())));

    const claimBtn = i => i.status === 'available'
      ? `<button class="btn g" onclick="claimDlg(${i.id})">Claim this item</button>`
      : '';

    return `<div class="bar">
  <input id="q" placeholder="Search by keyword (e.g. black, earbuds)" value="${esc(q)}" oninput="q=this.value;keep()" aria-label="Search">
  <select onchange="fc=this.value;render()" aria-label="Category">
    <option value="">All categories</option>${opts(CATS, fc)}
  </select>
</div>
${list.length
  ? `<div class="grid">${list.map(i => itemCard(i, claimBtn(i))).join('')}</div>`
  : '<div class="empty">No official listings match. Report your lost item and we will tell you when something similar is turned in.</div>'}`;
  },

  report() {
    const mine = S.lost.filter(l => l.owner === S.me);

    return `<h2>Report a lost item</h2>
<p class="sub">Give as many details as you can so staff can identify your item.</p>
<form onsubmit="return addLost(event)" class="two">
  <div><label>Item name</label><input name="name" required></div>
  <div><label>Category</label><select name="cat">${opts(CATS)}</select></div>
  <div><label>Color</label><input name="color"></div>
  <div><label>Where you lost it</label><input name="loc" required></div>
  <div><label>Date / time lost</label><input type="datetime-local" name="date" required></div>
  <div></div>
  <div style="grid-column:1/-1"><label>Description</label><textarea name="desc" required placeholder="Brand, marks, contents…"></textarea></div>
  <div class="row" style="grid-column:1/-1"><button class="btn">Submit report</button></div>
</form>
<h4>My reports</h4>${mine.map(l => `<div class="card" style="margin-bottom:10px">
  <h3>${esc(l.name)}</h3>
  <p>${esc(l.desc)}<br>${esc(l.cat)} · lost at ${esc(l.loc)} · ${esc(l.date)}</p>
  <div class="row">${reqPill(l)}<button class="btn l" onclick="delLost(${l.id})">Remove report</button></div>
</div>`).join('') || '<div class="empty">You have not reported anything yet.</div>'}`;
  },

  mine() {
    S.notes.filter(n => n.owner === S.me).forEach(n => n.read = 1);
    save();

    if (!S.me) return '<div class="empty">Enter your name at the top to see your reports and claims.</div>';

    const lost = S.lost.filter(l => l.owner === S.me);
    const claims = S.claims.filter(c => c.owner === S.me);
    const notes = S.notes.filter(n => n.owner === S.me);

    const lostCard = l => {
      const matches = (l.matched || []).map(id => S.items.find(x => x.id === id)).filter(Boolean);

      return `<div class="card" style="margin-bottom:10px">
  <h3>${esc(l.name)}</h3>
  <p>${esc(l.desc)}<br>${esc(l.cat)} · lost at ${esc(l.loc)} · ${esc(l.date)}</p>
  ${matches.length
    ? `<p><b>Staff found possible match(es):</b></p>${l.staffMsg ? `<div class="note">${esc(l.staffMsg)}</div>` : ''}${matches.map(i => `<div class="row">
    <span>${ICON[i.cat]} ${esc(i.name)} – ${esc(i.loc)}</span>
    ${i.status === 'available'
      ? `<button class="btn g" onclick="claimDlg(${i.id})">Claim</button>`
      : `<span class="pill ${i.status}">${ST[i.status]}</span>`}
  </div>`).join('')}`
    : '<p>Staff are still checking the found items for your request.</p>'}
  <div class="row">${reqPill(l)}<button class="btn l" onclick="delLost(${l.id})">Remove report</button></div>
</div>`;
    };

    const claimRow = c => {
      const i = S.items.find(x => x.id === c.itemId);
      const label = c.status === 'approved'
        ? 'Approved – pick up at the office'
        : c.status[0].toUpperCase() + c.status.slice(1);

      return `<tr><td>${esc(i?.name)}</td><td>${fmt(c.date)}</td><td><span class="pill ${c.status}">${label}</span></td></tr>`;
    };

    return `<h4>Notifications</h4>${notes.length
      ? notes.slice(0, 6).map(n => `<div class="note">${esc(n.text)}<br><small>${fmt(n.date)}</small></div>`).join('')
      : '<div class="empty">Nothing yet.</div>'}
<h4>My lost item reports</h4>${lost.length
  ? lost.map(lostCard).join('')
  : '<div class="empty">No reports yet.</div>'}
<h4>My claims</h4>${claims.length
  ? `<div class="scroll"><table><tr><th>Item</th><th>Submitted</th><th>Status</th></tr>${claims.map(claimRow).join('')}</table></div>`
  : '<div class="empty">You have not submitted any claims.</div>'}`;
  },

  found() {
    const count = k => S.items.filter(i => i.status === k).length;

    const statusSelect = i => `<select style="width:auto" onchange="setStatus(${i.id},this.value)" aria-label="Status">${
      Object.entries(ST).map(([k, v]) => `<option value="${k}" ${k === i.status ? 'selected' : ''}>${v}</option>`).join('')
    }</select>`;

    return `<div class="stats">
  <div class="stat"><b>${count('available')}</b>Available</div>
  <div class="stat"><b>${count('pending')}</b>Claims pending</div>
  <div class="stat"><b>${count('approved')}</b>Awaiting pickup</div>
  <div class="stat"><b>${S.lost.filter(l => (l.status || 'open') === 'open').length}</b>Open requests</div>
</div>
<div class="row" style="margin:0 0 14px"><button class="btn g" onclick="addDlg()">+ Add found item</button></div>
${S.items.length
  ? `<div class="grid">${S.items.map(i => itemCard(i, statusSelect(i))).join('')}</div>`
  : '<div class="empty">No found items recorded. Add the first one.</div>'}`;
  },

  requests() {
    const mine = S.notes.filter(n => n.owner === ADMIN);
    const fresh = new Set(mine.filter(n => !n.read).map(n => n.id));
    mine.forEach(n => { n.read = 1; });
    save();

    const isOpen = l => (l.status || 'open') === 'open';

    const reqCard = l => {
      const cand = openItems();
      const sug = cand.filter(i => match(l, i));
      const rest = cand.filter(i => !sug.includes(i));

      const pick = (i, tag) => `<label class="pick">
    <input type="checkbox" name="m" value="${i.id}" ${(l.matched || []).includes(i.id) ? 'checked' : ''}>
    <span>${ICON[i.cat]} <b>${esc(i.name)}</b> – ${esc(i.desc)}<br>
      <small>${esc(i.cat)} · ${esc(i.color || '—')} · found at ${esc(i.loc)} · ${fmt(i.date)}</small>
      ${tag ? `<span class="pill available">${tag}</span>` : ''}</span>
  </label>`;

      return `<div class="card" style="margin-bottom:12px">
  <h3>${esc(l.name)} <small class="sub">from ${esc(l.owner)}</small></h3>
  <p>${esc(l.desc)}</p>
  <p>${esc(l.cat)} · ${esc(l.color || '—')} · lost at ${esc(l.loc)} · ${esc(l.date)}${l.created ? ` · sent ${fmt(l.created)}` : ''}</p>
  ${l.notified ? `<div class="note">Student last notified ${fmt(l.notified)}.</div>` : ''}
  <form onsubmit="return notifyMatch(event,${l.id})">
    <h4>Check against found items</h4>
    ${cand.length
      ? sug.map(i => pick(i, 'Suggested')).join('') + rest.map(i => pick(i, '')).join('')
      : '<div class="empty">No found items recorded yet.</div>'}
    <label>Message to student (optional)</label>
    <textarea name="msg" placeholder="e.g. Please bring your school ID to the office.">${esc(l.staffMsg || '')}</textarea>
    <div class="row">
      <button class="btn g" ${cand.length ? '' : 'disabled'}>${l.status === 'matched' ? 'Update & notify student again' : 'Notify student of match'}</button>
    </div>
  </form>
</div>`;
    };

    const open = S.lost.filter(isOpen);
    const done = S.lost.filter(l => !isOpen(l));

    return `<h2>Student requests</h2><span class="brush"></span>
${mine.length
  ? mine.slice(0, 5).map(n => `<div class="note">${fresh.has(n.id) ? '<b>New · </b>' : ''}${esc(n.text)}<br><small>${fmt(n.date)}</small></div>`).join('')
  : ''}
<h4>Waiting for review (${open.length})</h4>${open.length
  ? open.map(reqCard).join('')
  : '<div class="empty">No requests waiting. New student requests will show up here.</div>'}
<h4>Student already notified (${done.length})</h4>${done.length
  ? done.map(reqCard).join('')
  : '<p class="sub">None yet.</p>'}`;
  },

  claims() {
    const pending = S.claims.filter(c => c.status === 'pending');
    const past = S.claims.filter(c => c.status !== 'pending');

    const claimCard = c => {
      const i = S.items.find(x => x.id === c.itemId);

      return `<div class="card" style="margin-bottom:12px">
  <h3>${esc(c.owner)} → ${esc(i?.name)}</h3>
  <p>${esc(i?.desc)} (found at ${esc(i?.loc)})</p>
  <div class="note"><b>Proof of ownership:</b> ${esc(c.proof)}</div>
  <div class="row">
    <button class="btn g" onclick="decide(${c.id},true)">Approve</button>
    <button class="btn r" onclick="decide(${c.id},false)">Reject</button>
  </div>
</div>`;
    };

    return `<h2>Claims to review</h2><span class="brush"></span>${pending.length
      ? pending.map(claimCard).join('')
      : '<div class="empty">No claims waiting for review.</div>'}
<h4>Past decisions</h4>${past.map(c =>
    `<p>${esc(c.owner)} – ${esc(S.items.find(x => x.id === c.itemId)?.name)} <span class="pill ${c.status}">${c.status}</span></p>`
  ).join('') || '<p class="sub">None yet.</p>'}`;
  },

  returns() {
    const byStatus = k => S.items.filter(i => i.status === k);

    const section = (title, list, action) => `<h4>${title}</h4>${list.length
      ? `<div class="grid">${list.map(i => itemCard(i, action ? action(i) : '')).join('')}</div>`
      : '<div class="empty">None.</div>'}`;

    return section(
      'Approved – ready for handover',
      byStatus('approved'),
      i => `<button class="btn g" onclick="setStatus(${i.id},'returned')">Record return</button>`
    )
      + section('Returned', byStatus('returned'))
      + section(
        'Unclaimed',
        byStatus('unclaimed'),
        i => `<button class="btn l" onclick="setStatus(${i.id},'available')">Re-list</button>`
      );
  },
};

// Re-renders only the results of the search view so the input keeps focus while typing.
function keep() {
  const app = $('#app');
  const tmp = document.createElement('div');
  tmp.innerHTML = VIEWS.search();

  app.querySelectorAll('.grid,.empty').forEach(e => e.remove());
  [...tmp.children]
    .filter(e => !e.classList.contains('bar'))
    .forEach(e => app.append(e));
}

/* ==========================================================================
   7. ACTIONS: LOST REPORTS
   ========================================================================== */
function addLost(e) {
  e.preventDefault();

  if (!S.me) {
    toast('Enter your name at the top first');
    $('#me')?.focus();
    return false;
  }

  const f = Object.fromEntries(new FormData(e.target));
  const l = { id: S.n++, owner: S.me, ...f, status: 'open', created: Date.now() };
  S.lost.unshift(l);
  notifyStaff(`New request from ${S.me}: lost "${l.name}" (${l.cat}, ${l.loc}).`);
  save();
  view = 'report';
  render();
  toast('Report submitted');
  return false;
}

function delLost(id) {
  S.lost = S.lost.filter(l => l.id !== id);
  save();
  render();
}

/* ==========================================================================
   7b. ACTIONS: STAFF MATCHING
   ========================================================================== */
function notifyMatch(e, id) {
  e.preventDefault();

  const l = S.lost.find(x => x.id === id);
  const fd = new FormData(e.target);
  const ids = fd.getAll('m').map(Number);
  const picked = ids.map(n => S.items.find(x => x.id === n)).filter(Boolean);

  if (!l || !picked.length) {
    toast('Tick at least one found item that matches');
    return false;
  }

  l.matched = ids;
  l.status = 'matched';
  l.staffMsg = (fd.get('msg') || '').trim();
  l.notified = Date.now();

  const names = picked.map(i => `"${i.name}" (${i.loc})`).join(', ');
  notify(l.owner, `Staff found a possible match for your lost "${l.name}": ${names}. Open "My reports & notices" to claim it.${l.staffMsg ? ' Staff note: ' + l.staffMsg : ''}`);

  save();
  render();
  toast(`${l.owner} has been notified`);
  return false;
}

/* ==========================================================================
   8. ACTIONS: CLAIMS
   ========================================================================== */
function claimDlg(id) {
  if (!S.me) {
    toast('Enter your name at the top first');
    $('#me')?.focus();
    return;
  }

  const i = S.items.find(x => x.id === id);

  $('#dlg').innerHTML = `<h3>Claim: ${esc(i.name)}</h3>
<p class="sub">Describe something only the owner would know (marks, contents, lock screen, serial no.).</p>
<form onsubmit="return sendClaim(event,${id})">
  <label>Proof of ownership</label>
  <textarea name="proof" required></textarea>
  <div class="row">
    <button class="btn g">Submit claim</button>
    <button type="button" class="btn l" onclick="dlg.close()">Cancel</button>
  </div>
</form>`;
  dlg.showModal();
}

function sendClaim(e, id) {
  e.preventDefault();

  S.claims.unshift({
    id: S.n++,
    itemId: id,
    owner: S.me,
    proof: new FormData(e.target).get('proof'),
    status: 'pending',
    date: Date.now(),
  });
  S.items.find(x => x.id === id).status = 'pending';

  save();
  dlg.close();
  view = 'mine';
  render();
  toast('Claim submitted');
  return false;
}

function decide(id, ok) {
  const c = S.claims.find(x => x.id === id);
  const i = S.items.find(x => x.id === c.itemId);

  c.status = ok ? 'approved' : 'rejected';

  if (ok) {
    i.status = 'approved';

    S.claims
      .filter(x => x.itemId === i.id && x.status === 'pending')
      .forEach(x => {
        x.status = 'rejected';
        notify(x.owner, `Your claim for "${i.name}" was rejected.`);
      });

    notify(c.owner, `Your claim for "${i.name}" was approved. Please pick it up at the campus office.`);
  } else {
    i.status = 'available';
    notify(c.owner, `Your claim for "${i.name}" was rejected. Contact the office if you have more proof.`);
  }

  save();
  render();
  toast(ok ? 'Claim approved' : 'Claim rejected');
}

/* ==========================================================================
   9. ACTIONS: FOUND ITEMS
   ========================================================================== */
function addDlg() {
  $('#dlg').innerHTML = `<h3>Add found item</h3>
<form onsubmit="return addItem(event)">
  <label>Item name</label>
  <input name="name" required>
  <div class="two">
    <div><label>Category</label><select name="cat">${opts(CATS)}</select></div>
    <div><label>Color</label><input name="color"></div>
  </div>
  <label>Where it was found</label>
  <input name="loc" required>
  <label>Description</label>
  <textarea name="desc" required></textarea>
  <label>Photo (optional)</label>
  <input type="file" accept="image/*" name="photo">
  <div class="row">
    <button class="btn g">Post item</button>
    <button type="button" class="btn l" onclick="dlg.close()">Cancel</button>
  </div>
</form>`;
  dlg.showModal();
}

// Shrinks the chosen photo to a small JPEG data URL; calls done('') if there is no usable photo.
function readPhoto(file, done) {
  if (!(file && file.size)) {
    done('');
    return;
  }

  const reader = new FileReader();

  reader.onload = () => {
    const img = new Image();

    img.onload = () => {
      const k = Math.min(1, 360 / img.width);
      const canvas = document.createElement('canvas');
      canvas.width = img.width * k;
      canvas.height = img.height * k;
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      done(canvas.toDataURL('image/jpeg', 0.7));
    };

    img.onerror = () => done('');
    img.src = reader.result;
  };

  reader.readAsDataURL(file);
}

function addItem(e) {
  e.preventDefault();

  const fd = new FormData(e.target);

  const done = photo => {
    S.items.unshift({
      id: S.n++,
      name: fd.get('name'),
      cat: fd.get('cat'),
      color: fd.get('color'),
      loc: fd.get('loc'),
      desc: fd.get('desc'),
      photo,
      date: Date.now(),
      status: 'available',
    });
    save();
    dlg.close();
    render();
    toast('Found item posted');
  };

  readPhoto(fd.get('photo'), done);
  return false;
}

function setStatus(id, status) {
  const i = S.items.find(x => x.id === id);
  i.status = status;

  if (status === 'returned') {
    const c = S.claims.find(x => x.itemId === id && x.status === 'approved');
    if (c) notify(c.owner, `"${i.name}" has been recorded as returned to you.`);
  }

  save();
  render();
}

/* ==========================================================================
   10. INIT
   ========================================================================== */
const dlg = $('#dlg');
render();