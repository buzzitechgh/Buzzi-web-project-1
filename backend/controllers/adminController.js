const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
// Assuming Message/Ticket model exists, otherwise using placeholder logic
const SystemSetting = require('../models/SystemSetting');
const { encrypt, decrypt, mask } = require('../utils/encryption');

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    // 1. Aggregates for high-level stats
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    const activeTechnicians = await User.countDocuments({ role: 'technician', isApproved: true });
    
    // 2. Revenue Calculation (Completed Orders)
    const revenueAgg = await Order.aggregate([
      { $match: { status: 'Completed', isPaid: true } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

    // 3. Status Breakdown (for Charts)
    const orderStatusCounts = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // 4. Recent Activity (Latest 5 Orders)
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('orderId customer total status createdAt')
      .lean();

    // 5. System Health Check
    // In production, check Redis/Queue status here
    const health = {
        database: 'Connected',
        emailService: 'Idle', // Placeholder logic
        paymentGateway: 'Operational'
    };

    res.json({
      overview: {
        users: totalUsers,
        orders: totalOrders,
        revenue: totalRevenue,
        technicians: activeTechnicians
      },
      charts: {
        orderStatus: orderStatusCounts
      },
      activity: recentOrders,
      health
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Dashboard data fetch failed' });
  }
};

// @desc    Get System Settings (Masked)
// @route   GET /api/admin/settings
// @access  Private/Admin
const getSystemSettings = async (req, res) => {
  try {
    const settings = await SystemSetting.getSettings();
    const settingsObj = settings.toObject();

    // SECURITY: Mask sensitive fields before sending to frontend
    if (settingsObj.payments?.paystack?.secretKey) {
        settingsObj.payments.paystack.secretKey = mask(decrypt(settingsObj.payments.paystack.secretKey));
    }
    if (settingsObj.payments?.paystack?.webhookSecret) {
        settingsObj.payments.paystack.webhookSecret = mask(decrypt(settingsObj.payments.paystack.webhookSecret));
    }
    if (settingsObj.email?.smtp?.pass) {
        settingsObj.email.smtp.pass = '********'; // Never show SMTP pass
    }
    // Mask other keys similarly...

    res.json(settingsObj);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch settings' });
  }
};

// @desc    Update System Settings
// @route   PUT /api/admin/settings
// @access  Private/Admin
const updateSystemSettings = async (req, res) => {
  try {
    const updates = req.body;
    const settings = await SystemSetting.getSettings();

    // Helper: Update encrypted field only if changed (not masked value)
    const updateSecure = (path, value) => {
        if (value && !value.includes('****')) {
            return encrypt(value);
        }
        return undefined; // Keep existing if masked
    };

    // --- Apply Updates ---
    
    // 1. General
    settings.appName = updates.appName || settings.appName;
    settings.environment = updates.environment || settings.environment;

    // 2. Payments
    if (updates.payments) {
        settings.payments.gateway = updates.payments.gateway;
        settings.payments.testMode = updates.payments.testMode;
        
        if (updates.payments.paystack) {
            settings.payments.paystack.publicKey = updates.payments.paystack.publicKey;
            
            const encSecret = updateSecure(null, updates.payments.paystack.secretKey);
            if (encSecret) settings.payments.paystack.secretKey = encSecret;

            const encWebhook = updateSecure(null, updates.payments.paystack.webhookSecret);
            if (encWebhook) settings.payments.paystack.webhookSecret = encWebhook;
        }
    }

    // 3. Email (SMTP)
    if (updates.email && updates.email.smtp) {
        settings.email.service = updates.email.service;
        settings.email.smtp.host = updates.email.smtp.host;
        settings.email.smtp.user = updates.email.smtp.user;
        
        const encPass = updateSecure(null, updates.email.smtp.pass);
        if (encPass) settings.email.smtp.pass = encPass;
    }

    // 3.5 SMS
    if (updates.sms) {
        settings.sms.provider = updates.sms.provider;
        settings.sms.senderId = updates.sms.senderId;
        
        const encApiKey = updateSecure(null, updates.sms.apiKey);
        if (encApiKey) settings.sms.apiKey = encApiKey;
    }

    // 4. n8n
    if (updates.n8n) {
        settings.n8n.enabled = updates.n8n.enabled;
        settings.n8n.webhooks = updates.n8n.webhooks;
    }

    await settings.save();
    
    // Emit event or clear cache here if using Redis
    res.json({ success: true, message: 'Settings updated successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update settings' });
  }
};

module.exports = { getDashboardStats, getSystemSettings, updateSystemSettings };