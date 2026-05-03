const express = require('express');
const router = express.Router();
const { getAnalytics, getUsers, toggleUser } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.get('/analytics', protect, authorize('owner', 'admin'), getAnalytics);
router.get('/users', protect, authorize('admin'), getUsers);
router.patch('/users/:id/toggle', protect, authorize('admin'), toggleUser);

module.exports = router;
