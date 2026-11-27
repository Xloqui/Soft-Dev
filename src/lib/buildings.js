// Rules for which building admin handles what.
import { BUILDINGS } from '../data/constants.js';

// Each admin has their own notification inbox.
export function staffMailbox(building) {
  return `#staff:${building}`;
}

// A report with a stated building goes only to that building's admin.
// A report with no building ("Not sure") goes to every admin.
export function isUnsure(report) {
  return !report.building || report.building === 'UNSURE';
}

export function adminCanSee(report, building) {
  return isUnsure(report) || report.building === building;
}

// The inboxes a report's notices go to.
export function mailboxesFor(report) {
  const buildings = isUnsure(report) ? Object.keys(BUILDINGS) : [report.building];
  return buildings.map(staffMailbox);
}

export function buildingLabel(code) {
  if (!code || code === 'UNSURE') return 'Building not sure';
  return BUILDINGS[code]?.label || code;
}

export function pickupOffice(code) {
  return BUILDINGS[code]?.office || 'the campus lost and found office';
}
