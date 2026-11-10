// The first page each role sees after logging in.
export function homeFor(role) {
  return role === 'admin' ? '/admin/found' : '/student/report';
}
