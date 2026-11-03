const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  actorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  actionType: {
    type: String,
    required: true,
    enum: ['CREATED', 'UPDATED', 'STATUS_CHANGED', 'LOGIN', 'ASSIGNED']
  },
  entityType: {
    type: String,
    required: true,
    trim: true
    // e.g. "Lead", "Task", "User" — intentionally a free string, not an enum,
    // so future modules can introduce new entity types without touching this schema
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false
    // nullable — e.g. a LOGIN activity has no associated record
  },
  description: {
    type: String,
    required: true,
    trim: true
    // human-readable summary, e.g. "John changed status from New to Won"
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
    // optional extra structured data, e.g. { from: "New", to: "Won" }
  }
}, {
  timestamps: true
});

// Index for common query patterns: filtering by entity, sorting by recency
activitySchema.index({ entityType: 1, entityId: 1 });
activitySchema.index({ createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);