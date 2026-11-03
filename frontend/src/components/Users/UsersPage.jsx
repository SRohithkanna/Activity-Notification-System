import { useState, useEffect } from 'react';
import { createUser, getUsers } from '../../api';
import './Users.css';

function UsersPage({ onUserChange }) {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [success, setSuccess] = useState(false);
  const [form, setForm]       = useState({ name: '', email: '' });

  const fetchUsers = async () => {
    try {
      const res = await getUsers();
      setUsers(res.data.data);
    } catch {
      // silently fail on list fetch
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      setError('Name and email are required.');
      return;
    }

    setLoading(true);
    try {
      await createUser(form);
      setForm({ name: '', email: '' });
      setSuccess(true);
      await fetchUsers();
      onUserChange(); // notify App.jsx to re-fetch users for dropdowns
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="users-page">

      {/* Create User Form */}
      <div className="create-form-card">
        <h2 className="form-title">Add New User</h2>

        {error   && <div className="form-alert error">{error}</div>}
        {success && <div className="form-alert success">User created successfully.</div>}

        <form onSubmit={handleSubmit} className="create-form">
          <div className="form-row">
            <div className="form-group">
              <label>Name <span className="required">*</span></label>
              <input
                type="text"
                name="name"
                placeholder="e.g. Rohith Kanna"
                value={form.name}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Email <span className="required">*</span></label>
              <input
                type="email"
                name="email"
                placeholder="e.g. rohith@example.com"
                value={form.email}
                onChange={handleChange}
              />
            </div>
          </div>
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create User'}
          </button>
        </form>
      </div>

      {/* Users List */}
      <div className="page-header">
        <h1>All Users</h1>
        <span className="total-count">{users.length} users</span>
      </div>

      {users.length === 0 && (
        <div className="state-message">No users yet. Create one above.</div>
      )}

      {users.length > 0 && (
        <div className="users-table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>User ID</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td className="td-name">{user.name}</td>
                  <td className="td-email">{user.email}</td>
                  <td>
                    <span className="user-id-chip">{user._id}</span>
                  </td>
                  <td className="td-date">
                    {new Date(user.createdAt).toLocaleDateString('en-IN', {
                      day: '2-digit', month: 'short', year: 'numeric'
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}

export default UsersPage;