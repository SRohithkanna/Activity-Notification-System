import { useState } from "react";
import { createActivity } from "../../api";

const ACTION_TYPES = [
  "CREATED",
  "UPDATED",
  "STATUS_CHANGED",
  "LOGIN",
  "ASSIGNED",
];

function CreateActivityForm({ userId, users, onCreated }) {
  const [form, setForm] = useState({
    actionType: "LOGIN",
    entityType: "",
    entityId: "",
    description: "",
    metadata: "",
    notifyUserId: "", // empty = no notification
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.actionType || !form.entityType || !form.description) {
      setError("Action type, entity type, and description are required.");
      return;
    }

    let parsedMetadata = {};
    if (form.metadata.trim()) {
      try {
        parsedMetadata = JSON.parse(form.metadata);
      } catch {
        setError(
          'Metadata must be valid JSON. Example: {"from":"New","to":"Won"}',
        );
        return;
      }
    }

    setLoading(true);
    try {
      await createActivity({
        actorId: userId,
        actionType: form.actionType,
        entityType: form.entityType,
        entityId: form.entityId || undefined,
        description: form.description,
        metadata: parsedMetadata,
        notifyUserId: form.notifyUserId || undefined, // only sent if selected
      });

      setForm({
        actionType: "LOGIN",
        entityType: "",
        entityId: "",
        description: "",
        metadata: "",
        notifyUserId: "",
      });

      setSuccess(true);
      onCreated();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to log activity.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-form-card">
      <h2 className="form-title">Log New Activity</h2>

      {error && <div className="form-alert error">{error}</div>}
      {success && (
        <div className="form-alert success">Activity logged successfully.</div>
      )}

      <form onSubmit={handleSubmit} className="create-form">
        <div className="form-row">
          <div className="form-group">
            <label>
              Action Type <span className="required">*</span>
            </label>
            <select
              name="actionType"
              value={form.actionType}
              onChange={handleChange}
            >
              {ACTION_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>
              Entity Type <span className="required">*</span>
            </label>
            <input
              type="text"
              name="entityType"
              placeholder="e.g. Lead, Task, User"
              value={form.entityType}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group full-width">
          <label>
            Description <span className="required">*</span>
          </label>
          <input
            type="text"
            name="description"
            placeholder="e.g. Rohith changed status from New to Won"
            value={form.description}
            onChange={handleChange}
          />
        </div>

        {/* Notify recipient dropdown */}
        <div className="form-group full-width">
          <label>
            Notify User{" "}
            <span className="optional">(optional — sends a notification)</span>
          </label>
          <select
            name="notifyUserId"
            value={form.notifyUserId}
            onChange={handleChange}
          >
            <option value="">— Don't notify anyone —</option>
            <option value="ALL">Notify All Users</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name} ({u.email})
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? "Logging..." : "Log Activity"}
        </button>
      </form>
    </div>
  );
}

export default CreateActivityForm;
