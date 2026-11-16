// Figures out how a student's claim and lost-item report are doing.
//
// A claim's status can lag behind the found item's status (for example when staff
// change the item to "Approved" or "Returned" from the Found items list instead of
// the Claims page). So we read both, and the item's status wins when it is further along.

// The real status of one claim: 'pending' | 'approved' | 'rejected' | 'returned'.
export function claimStatus(claim, claims, item) {
  if (!item) return claim.status;

  const someoneElseApproved = claims.some(c => c.itemId === claim.itemId && c.id !== claim.id && c.status === 'approved');

  if (claim.status === 'pending' && !someoneElseApproved && (item.status === 'approved' || item.status === 'returned')) {
    return item.status;
  }
  if (claim.status === 'approved' && item.status === 'returned') return 'returned';
  return claim.status;
}

// Where a lost-item report stands, as a pill status + label.
// Returns { status, label, locked } - `locked` means the report can no longer be removed.
export function reportStage(report, claims, items) {
  const matched = report.matched || [];
  const mine = claims
    .filter(c => c.ownerId === report.ownerId && matched.includes(c.itemId))
    .map(c => claimStatus(c, claims, items.find(i => i.id === c.itemId)));

  if (mine.includes('returned')) return { status: 'returned', label: 'Returned to you', locked: true };
  if (mine.includes('approved')) return { status: 'approved', label: 'Ready for pickup', locked: true };
  if (mine.includes('pending')) return { status: 'pending', label: 'Claim under review', locked: true };
  if (report.status === 'matched') return { status: 'available', label: 'Staff found a match', locked: false };
  return { status: 'pending', label: 'Waiting for staff', locked: false };
}
