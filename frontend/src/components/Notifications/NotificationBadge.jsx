
import { useState, useEffect } from 'react';
import { getUnreadCount } from '../../api';
import './Notifications.css';

function NotificationBadge({ userId }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!userId) return;

    const fetchCount = async () => {
      try {
        const res = await getUnreadCount(userId);
        setCount(res.data.count);
      } catch (err) {
        // silently fail — badge not showing is better than crashing the navbar
      }
    };

    fetchCount(); // fetch immediately on mount

    // Poll every 30 seconds — this is our "real-time" substitute
    const interval = setInterval(fetchCount, 30000);

    // Cleanup: stop polling when component unmounts
    return () => clearInterval(interval);
  }, [userId]);

  if (count === 0) return null; // hide badge entirely when nothing unread

  return (
    <span className="notification-badge">
      {count > 99 ? '99+' : count}
    </span>
  );
}

export default NotificationBadge;