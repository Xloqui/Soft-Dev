// All app data and every action that changes it.
//
// For now the data is saved in the browser's localStorage, so each browser has
// its own copy. When we add Supabase, only this file (and StoreProvider.jsx)
// should need to change. The pages call the same action names either way.
//
// Each action receives a copy of the state (`s`) and changes it directly.
// StoreProvider saves the result and re-renders the pages.

import { STAFF_MAILBOX } from './constants.js';

const STORAGE_KEY = 'clf-react-v1';
const DAY = 24 * 60 * 60 * 1000;

function sampleData() {
  const now = Date.now();

  return {
    accounts: [{ id: 'admin', pw: 'admin123', role: 'admin', name: 'Staff' }],
    session: null,
    items: [
      {
        id: 1,
        name: 'Black backpack',
        desc: 'Black Jansport with a keychain of a small bear',
        cat: 'Bags',
        color: 'Black',
        loc: 'Library, 2nd floor',
        date: now - 2 * DAY,
        status: 'available',
      },
      {
        id: 2,
        name: 'Wireless earbuds',
        desc: 'White case, scratched on the lid',
        cat: 'Electronics',
        color: 'White',
        loc: 'Cafeteria',
        date: now - DAY,
        status: 'available',
      },
      {
        id: 3,
        name: 'Student ID',
        desc: 'ID card, name partly hidden by a sticker',
        cat: 'IDs & Cards',
        color: 'Blue',
        loc: 'Gym entrance',
        date: now - 4 * DAY,
        status: 'available',
      },
    ],
    lost: [],
    claims: [],
    notes: [],
    nextId: 10,
  };
}

export function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved) return saved;
  } catch {
    // Ignore broken or missing data and start fresh.
  }
  return sampleData();
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage can be full or blocked (e.g. private mode). The app still works until refresh.
  }
}

/* ---------- small helpers used by the actions ---------- */

function newId(s) {
  return s.nextId++;
}

function notify(s, owner, text) {
  s.notes.unshift({ id: newId(s), owner, text, date: Date.now(), read: false });
}

/* ---------- actions ---------- */

export const actions = {
  // Returns { ok: true } or { ok: false, error: '...' }.
  login(s, { role, id, name, pw }) {
    const userId = (id || '').trim().toLowerCase();
    let account = s.accounts.find(a => a.id === userId && a.role === role);

    if (!account) {
      if (role === 'admin') return { ok: false, error: 'Wrong username or password' };
      if (!(name || '').trim()) return { ok: false, error: 'Enter your full name to create an account' };

      account = { id: userId, pw, role: 'student', name: name.trim() };
      s.accounts.push(account);
    } else if (account.pw !== pw) {
      return { ok: false, error: 'Wrong username or password' };
    }

    s.session = { id: account.id, role: account.role, name: account.name };
    return { ok: true };
  },

  logout(s) {
    s.session = null;
  },

  markNotesRead(s, mailbox) {
    s.notes.forEach(n => {
      if (n.owner === mailbox) n.read = true;
    });
  },

  /* ----- student ----- */

  addLostReport(s, fields) {
    const me = s.session;
    const report = {
      id: newId(s),
      ownerId: me.id,
      ownerName: me.name,
      name: fields.name,
      cat: fields.cat,
      color: fields.color,
      loc: fields.loc,
      date: fields.date,
      desc: fields.desc,
      status: 'open',
      matched: [],
      created: Date.now(),
    };

    s.lost.unshift(report);
    notify(s, STAFF_MAILBOX, `New request from ${me.name}: lost "${report.name}" (${report.cat}, ${report.loc}).`);
  },

  removeLostReport(s, id) {
    s.lost = s.lost.filter(l => !(l.id === id && l.ownerId === s.session.id));
  },

  submitClaim(s, itemId, proof) {
    const me = s.session;
    const item = s.items.find(i => i.id === itemId);
    if (!item || item.status !== 'available') return { ok: false, error: 'This item can no longer be claimed' };

    s.claims.unshift({
      id: newId(s),
      itemId,
      ownerId: me.id,
      ownerName: me.name,
      proof,
      status: 'pending',
      date: Date.now(),
    });
    item.status = 'pending';
    notify(s, STAFF_MAILBOX, `${me.name} submitted a claim for "${item.name}".`);
    return { ok: true };
  },

  /* ----- staff ----- */

  addFoundItem(s, fields) {
    s.items.unshift({
      id: newId(s),
      name: fields.name,
      cat: fields.cat,
      color: fields.color,
      loc: fields.loc,
      desc: fields.desc,
      photo: fields.photo || '',
      date: Date.now(),
      status: 'available',
    });
  },

  setItemStatus(s, itemId, status) {
    const item = s.items.find(i => i.id === itemId);
    if (!item) return;
    item.status = status;

    if (status === 'returned') {
      const claim = s.claims.find(c => c.itemId === itemId && c.status === 'approved');
      if (claim) notify(s, claim.ownerId, `"${item.name}" has been recorded as returned to you.`);
    }
  },

  // Staff tick the found items that match a student's report and notify the student.
  notifyMatch(s, lostId, itemIds, message) {
    const report = s.lost.find(l => l.id === lostId);
    const picked = itemIds.map(id => s.items.find(i => i.id === id)).filter(Boolean);

    if (!report || !picked.length) return { ok: false, error: 'Tick at least one found item that matches' };

    report.matched = picked.map(i => i.id);
    report.status = 'matched';
    report.staffMsg = (message || '').trim();
    report.notified = Date.now();

    const names = picked.map(i => `"${i.name}" (${i.loc})`).join(', ');
    notify(
      s,
      report.ownerId,
      `Staff found a possible match for your lost "${report.name}": ${names}. Open "My reports & notices" to claim it.`
        + (report.staffMsg ? ` Staff note: ${report.staffMsg}` : ''),
    );
    return { ok: true, studentName: report.ownerName };
  },

  decideClaim(s, claimId, approve) {
    const claim = s.claims.find(c => c.id === claimId);
    const item = claim && s.items.find(i => i.id === claim.itemId);
    if (!claim || !item) return;

    claim.status = approve ? 'approved' : 'rejected';

    if (approve) {
      item.status = 'approved';

      // Any other pending claims for the same item are rejected automatically.
      s.claims
        .filter(c => c.itemId === item.id && c.status === 'pending')
        .forEach(c => {
          c.status = 'rejected';
          notify(s, c.ownerId, `Your claim for "${item.name}" was rejected.`);
        });

      notify(s, claim.ownerId, `Your claim for "${item.name}" was approved. Please pick it up at the campus office.`);
    } else {
      item.status = 'available';
      notify(s, claim.ownerId, `Your claim for "${item.name}" was rejected. Contact the office if you have more proof.`);
    }
  },
};
