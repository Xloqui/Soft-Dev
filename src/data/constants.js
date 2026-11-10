// Images live in public/assets/, so they are referenced from the site root.
export const SEAL = '/assets/cit-seal.png';
export const WILD = '/assets/wildcats.jpg';

// Notifications addressed to this "owner" go to the staff dashboard.
export const STAFF_MAILBOX = '#staff';

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
