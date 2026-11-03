const Notification = require('../models/Notification');

// POST /api/notifications — create a new notification
exports.createNotification = async (req, res) => {
  try {
    const { recipientId, activityId, title, message } = req.body;

    if (!recipientId || !title || !message) {
      return res.status(400).json({
        success: false,
        message: 'recipientId, title, and message are required'
      });
    }

    const notification = await Notification.create({
      recipientId,
      activityId: activityId || null,
      title,
      message
    });

    res.status(201).json({ success: true, data: notification });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// GET /api/notifications — list notifications for a recipient, with optional isRead filter
exports.getNotifications = async (req, res) => {
  try {
    const { recipientId, isRead, page = 1, limit = 20 } = req.query;

    if (!recipientId) {
      return res.status(400).json({ success: false, message: 'recipientId is required' });
    }

    const filter = { recipientId };
    if (isRead !== undefined) {
      filter.isRead = isRead === 'true'; // query params arrive as strings
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [notifications, total] = await Promise.all([
      Notification.find(filter)
        .populate({
    path: 'activityId',
    populate: {
      path: 'actorId',
      select: 'name email'
    }
  }) // full activity details if linked
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Notification.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      data: notifications,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// GET /api/notifications/unread-count — badge counter
exports.getUnreadCount = async (req, res) => {
  try {
    const { recipientId } = req.query;

    if (!recipientId) {
      return res.status(400).json({ success: false, message: 'recipientId is required' });
    }

    const count = await Notification.countDocuments({ recipientId, isRead: false });

    res.status(200).json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// PATCH /api/notifications/:id/read — mark one notification as read
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true } // return the updated document, not the original
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid notification ID' });
    }
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// PATCH /api/notifications/read-all — mark all of a recipient's notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    const { recipientId } = req.body;

    if (!recipientId) {
      return res.status(400).json({ success: false, message: 'recipientId is required' });
    }

    const result = await Notification.updateMany(
      { recipientId, isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} notification(s) marked as read`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
// DELETE /api/notifications/:id
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.status(200).json({ success: true, message: 'Notification deleted successfully' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid notification ID' });
    }
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};