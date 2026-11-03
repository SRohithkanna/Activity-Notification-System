import './ActivityDetailModal.css';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

const ACTION_META = {
  CREATED:        { label: 'Created',        color: '#00b894' },
  UPDATED:        { label: 'Updated',        color: '#0984e3' },
  STATUS_CHANGED: { label: 'Status Changed', color: '#6c5ce7' },
  LOGIN:          { label: 'Login',          color: '#fdcb6e' },
  ASSIGNED:       { label: 'Assigned',       color: '#e17055' }
};

function ActivityDetailModal({ activity, onClose }) {
  if (!activity) return null;

  const meta = ACTION_META[activity.actionType] || {
    label: activity.actionType, color: '#b2bec3'
  };

  return (
    // clicking the backdrop closes the modal
    <div className="modal-backdrop" onClick={onClose}>

      {/* stop clicks inside the card from closing it */}
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>

        <div className="modal-header">
          <h2>Linked Activity</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">

          <div className="detail-row">
            <span className="detail-label">Action</span>
            <span
              className="action-badge"
              style={{ backgroundColor: meta.color }}
            >
              {meta.label}
            </span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Description</span>
            <span className="detail-value">{activity.description}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Actor</span>
            <span className="detail-value">
              {activity.actorId?.name ?? 'Unknown'}
              <span className="detail-sub"> — {activity.actorId?.email}</span>
            </span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Entity Type</span>
            <span className="detail-value">{activity.entityType}</span>
          </div>

          {activity.entityId && (
            <div className="detail-row">
              <span className="detail-label">Entity ID</span>
              <span className="detail-value mono">{activity.entityId}</span>
            </div>
          )}

          {activity.metadata && Object.keys(activity.metadata).length > 0 && (
            <div className="detail-row">
              <span className="detail-label">Metadata</span>
              <span className="detail-value mono">
                {JSON.stringify(activity.metadata, null, 2)}
              </span>
            </div>
          )}

          <div className="detail-row">
            <span className="detail-label">Logged At</span>
            <span className="detail-value">{formatDate(activity.createdAt)}</span>
          </div>

        </div>
      </div>
    </div>
  );
}

export default ActivityDetailModal;