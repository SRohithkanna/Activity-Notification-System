const express = require('express');
const router = express.Router();
const {
  createActivity,
  getActivities,
  getActivityById,
  updateActivity,
  deleteActivity
} = require('../controllers/activityController');
const protect = require('../middleware/authMiddleware');

router.use(protect); // applies to all routes below

router.post('/', createActivity);
router.get('/', getActivities);
router.get('/:id', getActivityById);
router.patch('/:id', updateActivity);
router.delete('/:id', deleteActivity);

module.exports = router;