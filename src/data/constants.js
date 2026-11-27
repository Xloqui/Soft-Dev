// Images live in public/assets/, so they are referenced from the site root.
export const SEAL = '/assets/cit-seal.png';
export const WILD = '/assets/wildcats.jpg';

// Each building has its own admin account. Admins post the items found in their building,
// and students pick up approved items at that building's office.
// CAMPUS = anywhere outside the three buildings; handled by the CIT-U admin.
export const BUILDINGS = {
  GLE: { label: 'GLE Building', admin: 'GLE Admin', office: 'the GLE building lost and found office' },
  NGE: { label: 'NGE Building', admin: 'NGE Admin', office: 'the NGE building lost and found office' },
  ACAD: { label: 'ACAD Building', admin: 'ACAD Admin', office: 'the ACAD building lost and found office' },
  CAMPUS: { label: 'Elsewhere on campus', admin: 'CIT-U Admin', office: 'the CIT-U main lost and found office' },
};

// What a student can choose as "Building" on a lost report.
// UNSURE = not stated, so every admin sees the report.
export const REPORT_BUILDINGS = [
  ['GLE', 'GLE Building'],
  ['NGE', 'NGE Building'],
  ['ACAD', 'ACAD Building'],
  ['CAMPUS', 'Elsewhere on campus (outside the buildings)'],
  ['UNSURE', 'Not sure'],
];

export const CATEGORIES = [
  'Bags',
  'Electronics',
  'IDs & Cards',
  'Keys',
  'Clothing',
  'Books & Notes',
  'Water Bottles',
  'Other',
];

export const CATEGORY_ICON = {
  'Bags': '🎒',
  'Electronics': '🎧',
  'IDs & Cards': '🪪',
  'Keys': '🔑',
  'Clothing': '🧥',
  'Books & Notes': '📚',
  'Water Bottles': '🥤',
  'Other': '📦',
};

// Found item statuses and their labels.
export const ITEM_STATUS = {
  available: 'Available',
  pending: 'Claim pending',
  approved: 'Approved – ready for pickup',
  returned: 'Returned',
  unclaimed: 'Unclaimed',
};

// Found items staff can still hand out (not yet returned or unclaimed).
export const OPEN_STATUSES = ['available', 'pending'];
