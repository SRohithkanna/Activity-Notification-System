import { useState, useEffect, useCallback } from "react";
import { getActivities, updateActivity, deleteActivity } from "../../api";
import CreateActivityForm from "./CreateActivityForm";
import "./ActivityLog.css";

const ACTION_META = {
  CREATED: { label: "Created", color: "#00b894" },
  UPDATED: { label: "Updated", color: "#0984e3" },
  STATUS_CHANGED: { label: "Status Changed", color: "#6c5ce7" },
  LOGIN: { label: "Login", color: "#fdcb6e" },
  ASSIGNED: { label: "Assigned", color: "#e17055" },
};

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ActivityLog({ userId, users }) {
  const [activities, setActivities] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [activeFilters, setActiveFilters] = useState({});

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  const fetchActivities = useCallback(async (filters = {}, pageNum = 1) => {
    setLoading(true);
    setError(null);
    try {
      const cleanedFilters = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== ""),
      );
      const res = await getActivities({
        ...cleanedFilters,
        page: pageNum,
        limit: 10,
      });
      setActivities(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      setError("Failed to fetch activities. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivities({}, 1);
  }, [fetchActivities]);

  const handleFilter = (filters) => {
    setActiveFilters(filters);
    setPage(1);
    fetchActivities(filters, 1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchActivities(activeFilters, newPage);
  };

  // Edit handlers
  const startEdit = (activity) => {
    setEditingId(activity._id);
    setEditValue(activity.description);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  const handleUpdate = async (id) => {
    if (!editValue.trim()) return;
    setEditLoading(true);
    try {
      const res = await updateActivity(id, { description: editValue });
      // update locally — no full re-fetch needed
      setActivities((prev) =>
        prev.map((a) => (a._id === id ? res.data.data : a)),
      );
      setEditingId(null);
    } catch {
      alert("Failed to update activity.");
    } finally {
      setEditLoading(false);
    }
  };

  // Delete handler
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this activity?")) return;
    try {
      await deleteActivity(id);
      setActivities((prev) => prev.filter((a) => a._id !== id));
      setPagination((prev) => ({ ...prev, total: prev.total - 1 }));
    } catch {
      alert("Failed to delete activity.");
    }
  };

  return (
    <div className="activity-log">
      <CreateActivityForm
        userId={userId}
        users={users}
        onCreated={() => fetchActivities(activeFilters, page)}
      />

      <div className="page-header">
        <h1>Activity Log</h1>
        <span className="total-count">
          {pagination.total ?? 0} total records
        </span>
      </div>

      {loading && <div className="state-message">Loading...</div>}
      {!loading && error && <div className="state-message error">{error}</div>}
      {!loading && !error && activities.length === 0 && (
        <div className="state-message">No activities found.</div>
      )}

      {!loading && !error && activities.length > 0 && (
        <div className="table-wrapper">
          <table className="activity-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Actor</th>
                <th>Action</th>
                <th>Entity</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((activity) => {
                const meta = ACTION_META[activity.actionType] || {
                  label: activity.actionType,
                  color: "#b2bec3",
                };
                const isEditing = editingId === activity._id;

                return (
                  <tr key={activity._id}>
                    <td className="td-date">
                      {formatDate(activity.createdAt)}
                    </td>
                    <td className="td-actor">
                      <span className="actor-name">
                        {activity.actorId?.name ?? "Unknown"}
                      </span>
                      <span className="actor-email">
                        {activity.actorId?.email ?? ""}
                      </span>
                    </td>
                    <td>
                      <span
                        className="action-badge"
                        style={{ backgroundColor: meta.color }}
                      >
                        {meta.label}
                      </span>
                    </td>
                    <td className="td-entity">
                      {activity.entityType}
                      {activity.entityId && (
                        <span className="entity-id">
                          #{String(activity.entityId).slice(-6)}
                        </span>
                      )}
                    </td>

                    {/* Description — normal or edit mode */}
                    <td className="td-description">
                      {isEditing ? (
                        <div className="edit-inline">
                          <input
                            className="edit-input"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleUpdate(activity._id);
                              if (e.key === "Escape") cancelEdit();
                            }}
                            autoFocus
                          />
                          <button
                            className="btn-save"
                            onClick={() => handleUpdate(activity._id)}
                            disabled={editLoading}
                          >
                            {editLoading ? "..." : "Save"}
                          </button>
                          <button className="btn-cancel" onClick={cancelEdit}>
                            Cancel
                          </button>
                        </div>
                      ) : (
                        activity.description
                      )}
                    </td>

                    {/* Actions column */}
                    <td className="td-actions">
                      {!isEditing && (
                        <>
                          {/* Only the actor who logged this activity can edit it */}
                          {activity.actorId?._id === userId && (
                            <button
                              className="btn-edit"
                              onClick={() => startEdit(activity)}
                              title="Edit description"
                            >
                              Edit
                            </button>
                          )}
                          {activity.actorId?._id === userId && (
                            <button
                              className="btn-delete"
                              onClick={() => handleDelete(activity._id)}
                              title="Delete activity"
                            >
                              Delete
                            </button>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn-page"
            disabled={page === 1}
            onClick={() => handlePageChange(page - 1)}
          >
            ← Prev
          </button>
          <span className="page-info">
            Page {page} of {pagination.totalPages}
          </span>
          <button
            className="btn-page"
            disabled={page === pagination.totalPages}
            onClick={() => handlePageChange(page + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

export default ActivityLog;
