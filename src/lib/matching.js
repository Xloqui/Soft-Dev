// Rules for suggesting which found items might match a student's lost report.
// Staff always make the final decision on the Student requests page.

function words(text) {
  return (text || '')
    .toLowerCase()
    .split(/\W+/)
    .filter(word => word.length > 3);
}

export function isPossibleMatch(lost, item) {
  if (lost.cat !== item.cat) return false;

  if (lost.color && item.color && lost.color.toLowerCase() === item.color.toLowerCase()) {
    return true;
  }

  const lostWords = words(`${lost.name} ${lost.desc}`);
  const itemWords = words(`${item.name} ${item.desc}`);
  return lostWords.some(word => itemWords.includes(word));
}
