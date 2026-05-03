const express = require('express');
const router = express.Router();
const { createOrder, getOrder, getMyOrders, getCanteenOrders, updateStatus } = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('student'), createOrder);
router.get('/my', protect, getMyOrders);
router.get('/canteen', protect, authorize('owner', 'admin'), getCanteenOrders);
router.get('/:id', protect, getOrder);
router.put('/:id/status', protect, authorize('owner', 'admin'), updateStatus);

module.exports = router;
