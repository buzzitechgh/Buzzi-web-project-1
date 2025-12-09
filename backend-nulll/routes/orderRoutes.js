const express = require('express');
const router = express.Router();
const { addOrderItems, getOrders } = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').post(addOrderItems).get(protect, admin, getOrders);

module.exports = router;