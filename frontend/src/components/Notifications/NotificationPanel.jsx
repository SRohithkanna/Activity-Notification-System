import { useState, useEffect, useCallback } from "react";
import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from "../../api";
import ActivityDetailModal from "./ActivityDetailModal";
import "./Notifications.css";

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function NotificationPanel({ userId }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState(null);
  const [filter, setFilter]               = useState("all");
  const [selectedActivity, setSelectedActivity] = useState(null); // modal state

  const fetchNotifications = useCallback(async (isReadFilter) => {
    setLoading(true);
    setError(null);
    try {
      const params = { recipientId: userId };
      if (isReadFilter === "unread") params.isRead = false;
      if (isReadFilter === "read")   params.isRead = true;
      const res = await getNotifications(params);
      setNotifications(res.data.data);
    } catch {
      setError("Failed to fetch notifications.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchNotifications(filter);
  }, [filter, fetchNotifications]);

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => n._id === id ? { ...n, isRead: true } : n)
      );
    } catch {
      alert("Failed to mark as read.");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead(userId);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      alert("Failed to mark all as read.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this notification?')) return;
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch {
      alert("Failed to delete notification.");
    }
  };

  // clicking a notification opens the modal with its linked activity
  const handleNotificationClick = (notification) => {
    if (notification.activityId) {
      setSelectedActivity(notification.activityId);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="notification-panel">

      {/* Modal — only renders when an activity is selected */}
      {selectedActivity && (
        <ActivityDetailModal
          activity={selectedActivity}
          onClose={() => setSelectedActivity(null)}
        />
      )}

      <div className="panel-header">
        <div className="panel-title">
          <h1>Notifications</h1>
          {unreadCount > 0 && <span className="unread-pill">{unreadCount} unread</span>}
        </div>
        {unreadCount > 0 && (
          <button className="btn-mark-all" onClick={handleMarkAllAsRead}>
            Mark all as read
          </button>
        )}
      </div>

      <div className="filter-tabs">
        {["all", "unread", "read"].map((tab) => (
          <button key={tab}
            className={`tab-btn ${filter === tab ? "active" : ""}`}
            onClick={() => setFilter(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {loading && <div className="state-message">Loading...</div>}
      {!loading && error && <div className="state-message error">{error}</div>}
      {!loading && !error && notifications.length === 0 && (
        <div className="state-message">No notifications found.</div>
      )}

      {!loading && !error && notifications.length > 0 && (
        <div className="notification-list">
          {notifications.map((n) => (
            <div
              key={n._id}
              className={`notification-item ${!n.isRead ? "unread" : ""} ${n.activityId ? "clickable" : ""}`}
              onClick={() => handleNotificationClick(n)}
            >
              <div className="notification-content">
                <div className="notification-title">
                  {n.title}
                  {n.activityId && (
                    <span className="linked-hint">· View activity →</span>
                  )}
                </div>
                <div className="notification-message">{n.message}</div>
                <div className="notification-date">{formatDate(n.createdAt)}</div>
              </div>
              <div
                className="notification-actions"
                onClick={(e) => e.stopPropagation()} // prevent modal from opening when clicking buttons
              >
                {!n.isRead && (
                  <button className="btn-read" onClick={() => handleMarkAsRead(n._id)}>
                    Mark read
                  </button>
                )}
                <button className="btn-delete-notif" onClick={() => handleDelete(n._id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default NotificationPanel;