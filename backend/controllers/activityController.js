const Activity = require("../models/Activity");
const Notification = require("../models/Notification");

// POST /api/activities — log a new activity + optionally notify a recipient
exports.createActivity = async (req, res) => {
  try {
    const {
      actorId,
      actionType,
      entityType,
      entityId,
      description,
      metadata,
      notifyUserId, // optional — if present, auto-create a notification
    } = req.body;

    if (!actorId || !actionType || !entityType || !description) {
      return res.status(400).json({
        success: false,
        message:
          "actorId, actionType, entityType, and description are required",
      });
    }

    // Step 1: create the activity
    const activity = await Activity.create({
      actorId,
      actionType,
      entityType,
      entityId: entityId || null,
      description,
      metadata: metadata || {},
    });

    // Step 2: handle notifications
    let notification = null;
    let notifications = [];

    if (notifyUserId) {
      const titleMap = {
        CREATED: "New Record Created",
        UPDATED: "Record Updated",
        STATUS_CHANGED: "Status Changed",
        LOGIN: "User Login Detected",
        ASSIGNED: "You Have Been Assigned",
      };

      const notifData = {
        activityId: activity._id,
        title: titleMap[actionType] || "New Activity",
        message: description,
      };

      if (notifyUserId === "ALL") {
        // fetch all users and create a notification for each
        const User = require("../models/User");
        const allUsers = await User.find({}, "_id");
        notifications = await Notification.insertMany(
          allUsers.map((u) => ({ ...notifData, recipientId: u._id })),
        );
      } else {
        // single recipient
        notification = await Notification.create({
          ...notifData,
          recipientId: notifyUserId,
        });
        notifications = [notification];
      }
    }

    res.status(201).json({
      success: true,
      data: {
        activity,
        notifications,
      },
    });

    res.status(201).json({
      success: true,
      data: {
        activity,
        notification, // null if no recipient was specified, object if notification was created
      },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: error.message });
    }
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// GET /api/activities — list with filtering, search, pagination (unchanged)
exports.getActivities = async (req, res) => {
  try {
    const {
      actionType,
      entityType,
      entityId,
      search,
      from,
      to,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};
    if (actionType) filter.actionType = actionType;
    if (entityType) filter.entityType = entityType;
    if (entityId) filter.entityId = entityId;

    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    if (search) filter.description = { $regex: search, $options: "i" };

    const skip = (Number(page) - 1) * Number(limit);

    const [activities, total] = await Promise.all([
      Activity.find(filter)
        .populate("actorId", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Activity.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: activities,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// GET /api/activities/:id (unchanged)
exports.getActivityById = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id).populate(
      "actorId",
      "name email",
    );

    if (!activity) {
      return res
        .status(404)
        .json({ success: false, message: "Activity not found" });
    }

    res.status(200).json({ success: true, data: activity });
  } catch (error) {
    if (error.name === "CastError") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid activity ID" });
    }
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
// PATCH /api/activities/:id — edit description only
exports.updateActivity = async (req, res) => {
  try {
    const { description } = req.body;

    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Description is required'
      });
    }

    const activity = await Activity.findByIdAndUpdate(
      req.params.id,
      { description },
      { new: true }
    ).populate('actorId', 'name email');

    if (!activity) {
      return res.status(404).json({ success: false, message: 'Activity not found' });
    }

    res.status(200).json({ success: true, data: activity });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid activity ID' });
    }
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// DELETE /api/activities/:id
exports.deleteActivity = async (req, res) => {
  try {
    const activity = await Activity.findByIdAndDelete(req.params.id);

    if (!activity) {
      return res.status(404).json({ success: false, message: 'Activity not found' });
    }

    res.status(200).json({ success: true, message: 'Activity deleted successfully' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid activity ID' });
    }
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};