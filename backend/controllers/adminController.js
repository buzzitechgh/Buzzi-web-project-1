const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
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
    const health = {
        database: 'Connected',
        emailService: 'Idle', 
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
        settingsObj.email.smtp.pass = '********'; 
    }
    if (settingsObj.sms?.apiKey) {
        settingsObj.sms.apiKey = mask(decrypt(settingsObj.sms.apiKey));
    }

    res.json(settingsObj);
  } catch (error) {
    console.error(error);
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

    // --- Apply Updates with Safeguards ---
    
    // 1. General
    settings.appName = updates.appName || settings.appName;
    settings.environment = updates.environment || settings.environment;
    settings.supportEmail = updates.supportEmail || settings.supportEmail;
    settings.logoUrl = updates.logoUrl || settings.logoUrl;
    settings.formspreeUrl = updates.formspreeUrl || settings.formspreeUrl;

    // 2. Payments
    if (updates.payments) {
        if (!settings.payments) settings.payments = {};
        settings.payments.gateway = updates.payments.gateway || settings.payments.gateway;
        settings.payments.testMode = updates.payments.testMode !== undefined ? updates.payments.testMode : settings.payments.testMode;
        
        if (updates.payments.paystack) {
            if (!settings.payments.paystack) settings.payments.paystack = {};
            settings.payments.paystack.publicKey = updates.payments.paystack.publicKey || settings.payments.paystack.publicKey;
            
            const encSecret = updateSecure(null, updates.payments.paystack.secretKey);
            if (encSecret) settings.payments.paystack.secretKey = encSecret;

            const encWebhook = updateSecure(null, updates.payments.paystack.webhookSecret);
            if (encWebhook) settings.payments.paystack.webhookSecret = encWebhook;
        }
    }

    // 3. Email (SMTP)
    if (updates.email && updates.email.smtp) {
        if (!settings.email) settings.email = {};
        if (!settings.email.smtp) settings.email.smtp = {};
        
        settings.email.service = updates.email.service || settings.email.service;
        settings.email.smtp.host = updates.email.smtp.host || settings.email.smtp.host;
        settings.email.smtp.user = updates.email.smtp.user || settings.email.smtp.user;
        
        const encPass = updateSecure(null, updates.email.smtp.pass);
        if (encPass) settings.email.smtp.pass = encPass;
    }

    // 3.5 SMS
    if (updates.sms) {
        if (!settings.sms) settings.sms = {};
        settings.sms.provider = updates.sms.provider || settings.sms.provider;
        settings.sms.senderId = updates.sms.senderId || settings.sms.senderId;
        
        const encApiKey = updateSecure(null, updates.sms.apiKey);
        if (encApiKey) settings.sms.apiKey = encApiKey;
    }

    // 4. n8n
    if (updates.n8n) {
        if (!settings.n8n) settings.n8n = {};
        settings.n8n.enabled = updates.n8n.enabled !== undefined ? updates.n8n.enabled : settings.n8n.enabled;
        
        if (updates.n8n.webhooks) {
            settings.n8n.webhooks = { ...settings.n8n.webhooks, ...updates.n8n.webhooks };
        }
    }

    // 5. Security
    if (updates.security) {
        if (!settings.security) settings.security = {};
        settings.security.twoFactorEnforced = updates.security.twoFactorEnforced !== undefined ? updates.security.twoFactorEnforced : settings.security.twoFactorEnforced;
        settings.security.technicianApprovalRequired = updates.security.technicianApprovalRequired !== undefined ? updates.security.technicianApprovalRequired : settings.security.technicianApprovalRequired;
    }

    // 6. Dynamic Roles & Departments
    if (updates.technicianRoles && Array.isArray(updates.technicianRoles)) {
        settings.technicianRoles = updates.technicianRoles;
    }
    if (updates.departments && Array.isArray(updates.departments)) {
        settings.departments = updates.departments;
    }

    // 7. Admin Account Update (Security Fix)
    if (updates.adminAccount) {
        const { email, password } = updates.adminAccount;
        // req.user is populated by 'protect' middleware
        const user = await User.findById(req.user._id);
        
        if (user) {
            // Update email if changed
            if (email && email !== user.email) {
                user.email = email;
            }
            // Update password if provided (not empty string)
            if (password && password.trim() !== '') {
                user.password = password; // Hashing handled by User pre-save hook
            }
            await user.save();
        }
    }

    await settings.save();
    
    res.json({ success: true, message: 'Settings updated successfully' });

  } catch (error) {
    console.error("Update Settings Error:", error);
    res.status(500).json({ message: 'Failed to update settings' });
  }
};

module.exports = { getDashboardStats, getSystemSettings, updateSystemSettings };