import { Navigate, Route, Routes } from 'react-router';
import RequireRole from './components/RequireRole.jsx';
import Toaster from './components/Toaster.jsx';
import { useStore } from './data/storeContext.js';
import AdminLayout from './layouts/AdminLayout.jsx';
import StudentLayout from './layouts/StudentLayout.jsx';
import { homeFor } from './lib/routes.js';
import Claims from './pages/admin/Claims.jsx';
import FoundItems from './pages/admin/FoundItems.jsx';
import Returns from './pages/admin/Returns.jsx';
import StudentRequests from './pages/admin/StudentRequests.jsx';
import Login from './pages/auth/Login.jsx';
import NotFound from './pages/NotFound.jsx';
import MyReports from './pages/student/MyReports.jsx';
import ReportLostItem from './pages/student/ReportLostItem.jsx';

// Which URL shows which page.
export default function App() {
  const { session } = useStore();
  const home = session ? homeFor(session.role) : '/login';

  return (
    <div className="book">
      <div className="binder" aria-hidden="true" />
      <main className="paper">
        <Routes>
          <Route path="/" element={<Navigate to={home} replace />} />
          <Route path="/login" element={session ? <Navigate to={home} replace /> : <Login />} />

          <Route
            path="/student"
            element={<RequireRole role="student"><StudentLayout /></RequireRole>}
          >
            <Route index element={<Navigate to="report" replace />} />
            <Route path="report" element={<ReportLostItem />} />
            <Route path="reports" element={<MyReports />} />
          </Route>

          <Route
            path="/admin"
            element={<RequireRole role="admin"><AdminLayout /></RequireRole>}
          >
            <Route index element={<Navigate to="found" replace />} />
            <Route path="found" element={<FoundItems />} />
            <Route path="requests" element={<StudentRequests />} />
            <Route path="claims" element={<Claims />} />
            <Route path="returns" element={<Returns />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <div className="tabs" aria-hidden="true">
        <div className="tab s" />
        <div className="tab a" />
      </div>
      <Toaster />
    </div>
  );
}
