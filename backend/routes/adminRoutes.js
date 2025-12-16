const express = require('express');
const router = express.Router();
const { getDashboardStats, getSystemSettings, updateSystemSettings } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

// Dashboard Analytics
router.get('/dashboard', protect, admin, getDashboardStats);

// System Settings
router.route('/settings')
    .get(protect, admin, getSystemSettings)
    .put(protect, admin, updateSystemSettings);

module.exports = router;