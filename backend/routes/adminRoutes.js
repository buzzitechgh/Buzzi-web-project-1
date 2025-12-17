
const express = require('express');
const router = express.Router();
const { getDashboardStats, getSystemSettings, updateSystemSettings, updateUser } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

// Dashboard Analytics
router.get('/dashboard', protect, admin, getDashboardStats);

// System Settings
router.route('/settings')
    .get(protect, admin, getSystemSettings)
    .put(protect, admin, updateSystemSettings);

// User Management (Admin Only)
router.put('/users/:id', protect, admin, updateUser);

module.exports = router;
