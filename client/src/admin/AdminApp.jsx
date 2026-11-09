import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router';
import { api } from '../lib/api.js';
import Seo from '../components/Seo.jsx';
import { PageFallback } from '../components/ui.jsx';
import { ToastProvider } from './kit.jsx';
import AdminLayout from './AdminLayout.jsx';
import Login from './Login.jsx';
import Dashboard from './Dashboard.jsx';
import PropertiesAdmin from './PropertiesAdmin.jsx';
import PropertyForm from './PropertyForm.jsx';
import InquiriesAdmin from './InquiriesAdmin.jsx';
import GalleryAdmin from './GalleryAdmin.jsx';
import SettingsAdmin from './SettingsAdmin.jsx';
import Account from './Account.jsx';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined = checking, null = signed out

  useEffect(() => {
    api('/api/auth/me')
      .then((d) => setUser(d.user))
      .catch(() => setUser(null));
  }, []);

  const login = useCallback(async (email, password) => {
    const d = await api('/api/auth/login', { method: 'POST', body: { email, password } });
    setUser(d.user);
  }, []);

  const logout = useCallback(async () => {
    await api('/api/auth/logout', { method: 'POST' }).catch(() => {});
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, login, logout, setUser }), [user, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function RequireAuth({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  if (user === undefined) return <PageFallback />;
  if (!user) return <Navigate to="/admin/login" replace state={{ from: location.pathname + location.search }} />;
  return children;
}

export default function AdminApp() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Seo title="Office Admin" noindex />
        <Routes>
          <Route path="login" element={<Login />} />
          <Route
            element={
              <RequireAuth>
                <AdminLayout />
              </RequireAuth>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="properties" element={<PropertiesAdmin />} />
            <Route path="properties/new" element={<PropertyForm />} />
            <Route path="properties/:id" element={<PropertyForm />} />
            <Route path="inquiries" element={<InquiriesAdmin />} />
            <Route path="gallery" element={<GalleryAdmin />} />
            <Route path="settings" element={<SettingsAdmin />} />
            <Route path="account" element={<Account />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Route>
        </Routes>
      </ToastProvider>
    </AuthProvider>
  );
}
