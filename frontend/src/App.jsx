import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { getUsers } from './api';
import ActivityLog from './components/ActivityLog/ActivityLog';
import NotificationPanel from './components/Notifications/NotificationPanel';
import NotificationBadge from './components/Notifications/NotificationBadge';
import UsersPage from './components/Users/UsersPage';
import Settings from './components/Settings/Settings';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import PrivateRoute from './components/Auth/PrivateRoute';
import './App.css';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        Activity & Notification System
      </div>

      <button
        className="hamburger"
        onClick={() => setMenuOpen((prev) => !prev)}
      >
        {menuOpen ? "✕" : "☰"}
      </button>

      <div className={`navbar-links ${menuOpen ? "open" : ""}`}>
        <Link to="/" onClick={closeMenu}>
          Activity Log
        </Link>

        <Link to="/notifications" onClick={closeMenu}>
          Notifications
          {user && <NotificationBadge userId={user._id} />}
        </Link>

        <Link to="/settings" onClick={closeMenu}>
          Settings
        </Link>

        {/* Mobile user section */}
        <div className="mobile-user">
          <span className="navbar-username">{user?.name}</span>

          <button
            className="btn-logout"
            onClick={() => {
              closeMenu();
              handleLogout();
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Desktop user section */}
      {user && (
        <div className="navbar-user desktop-user">
          <span className="navbar-username">{user.name}</span>

          <button className="btn-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}

function AppRoutes() {
  const { user } = useAuth();
  const [users, setUsers]   = useState([]);

  const fetchUsers = async () => {
    try {
      const res = await getUsers();
      setUsers(res.data.data);
    } catch {
      // silently fail
    }
  };

  useEffect(() => {
    if (user) fetchUsers();
  }, [user]);

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login"    element={!user ? <Login />    : <Navigate to="/" replace />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/" replace />} />

      {/* Protected routes */}
      <Route path="/" element={
        <PrivateRoute>
          <ActivityLog userId={user?._id} users={users} />
        </PrivateRoute>
      } />
      <Route path="/notifications" element={
        <PrivateRoute>
          <NotificationPanel userId={user?._id} />
        </PrivateRoute>
      } />
      <Route path="/users" element={
        <PrivateRoute>
          <UsersPage onUserChange={fetchUsers} />
        </PrivateRoute>
      } />
      <Route path="/settings" element={
        <PrivateRoute>
          <Settings />
        </PrivateRoute>
      } />
    </Routes>
  );
}

function App() {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      {user && <Navbar />}
      <main className={`main-content ${!user ? 'full-page' : ''}`}>
        <AppRoutes />
      </main>
    </BrowserRouter>
  );
}

export default App;