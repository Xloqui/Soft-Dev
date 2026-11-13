// Rules for suggesting which found items might match a student's lost report.
// Each found item gets a score; higher means a more likely match.
// Staff always make the final decision on the Student requests page.
//
// Points:
//   Same category ............................ +2  (required to be suggested)
//   Same color ............................... +3  (similar color, e.g. "blue" / "dark blue": +2)
//   Shared words in name/description ......... +1 each, up to +3
//   Similar place (shared location words) .... +2
//   Found 0–3 days after it was lost ......... +3
//   Found 4–7 days after ..................... +2
//   Found more than 7 days after ............. +1
//   Found BEFORE it was lost ................. never suggested, listed last
//
// An item is "Suggested" when it is the same category and scores at least SUGGEST_AT.
// (Same category + found soon after is only 5, so at least one detail must also match.)

export const SUGGEST_AT = 6;

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

// Common words that don't help tell places apart.
const PLACE_STOPWORDS = new Set([
  'the', 'and', 'near', 'floor', 'room', 'building', 'bldg', 'area', 'inside', 'outside',
  'beside', 'front', 'back', 'side', 'campus', 'hall', '1st', '2nd', '3rd', '4th', '5th',
]);

// Common words that don't help tell items apart.
const COMMON_WORDS = new Set([
  'with', 'from', 'that', 'this', 'have', 'some', 'very', 'also', 'item', 'thing', 'color', 'colour',
]);

function words(text, minLength = 4) {
  return (text || '')
    .toLowerCase()
    .split(/\W+/)
    .filter(word => word.length >= minLength && !COMMON_WORDS.has(word));
}

function placeWords(text) {
  return words(text, 3).filter(word => !PLACE_STOPWORDS.has(word));
}

function sharedCount(a, b) {
  const setB = new Set(b);
  return new Set(a.filter(word => setB.has(word))).size;
}

function scoreColor(lostColor, itemColor) {
  const a = (lostColor || '').trim().toLowerCase();
  const b = (itemColor || '').trim().toLowerCase();
  if (!a || !b) return { points: 0 };
  if (a === b) return { points: 3, reason: 'same color' };
  if (a.includes(b) || b.includes(a)) return { points: 2, reason: 'similar color' };
  return { points: 0 };
}

function scoreDate(lostDate, foundDate) {
  const lostTime = new Date(lostDate).getTime();
  const foundTime = new Date(foundDate).getTime();
  if (Number.isNaN(lostTime) || Number.isNaN(foundTime)) return { points: 0 };

  // Allow 1 hour of slack, since students often guess the time they lost something.
  const diff = foundTime - lostTime;
  if (diff < -HOUR) return { points: 0, impossible: true, reason: 'found before it was lost' };

  const days = Math.max(0, Math.floor(diff / DAY));
  const when = days === 0 ? 'found the same day' : `found ${days} day${days > 1 ? 's' : ''} after`;

  if (days <= 3) return { points: 3, reason: when };
  if (days <= 7) return { points: 2, reason: when };
  return { points: 1, reason: when };
}

// Scores one found item against one lost report.
// Returns { score, reasons, suggested, impossible }.
export function scoreMatch(lost, item) {
  if (lost.cat !== item.cat) {
    return { score: 0, reasons: [], suggested: false, impossible: false };
  }

  let score = 2;
  const reasons = ['same category'];

  const color = scoreColor(lost.color, item.color);
  score += color.points;
  if (color.reason) reasons.push(color.reason);

  const sharedWords = sharedCount(words(`${lost.name} ${lost.desc}`), words(`${item.name} ${item.desc}`));
  if (sharedWords) {
    score += Math.min(sharedWords, 3);
    reasons.push(`${sharedWords} matching word${sharedWords > 1 ? 's' : ''}`);
  }

  if (sharedCount(placeWords(lost.loc), placeWords(item.loc))) {
    score += 2;
    reasons.push('similar place');
  }

  const date = scoreDate(lost.date, item.date);
  score += date.points;
  if (date.reason) reasons.push(date.reason);

  if (date.impossible) {
    return { score: -1, reasons, suggested: false, impossible: true };
  }

  return { score, reasons, suggested: score >= SUGGEST_AT, impossible: false };
}

// Scores every found item and sorts them best match first.
// Ties go to the item found closest to when it was lost.
export function rankMatches(lost, items) {
  const lostTime = new Date(lost.date).getTime() || 0;

  return items
    .map(item => ({ item, ...scoreMatch(lost, item) }))
    .sort((a, b) => b.score - a.score
      || Math.abs(a.item.date - lostTime) - Math.abs(b.item.date - lostTime));
}
