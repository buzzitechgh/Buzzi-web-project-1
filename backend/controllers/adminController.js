
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
    const totalUsers = await User.countDocuments({ role: 'customer' });
    const totalOrders = await Order.countDocuments();
    const activeTechnicians = await User.countDocuments({ role: 'technician', isApproved: true });
    
    // 2. Critical Operational Stats
    const pendingOrders = await Order.countDocuments({ status: 'Pending' });
    const lowStockCount = await Product.countDocuments({ stock: { $lte: 5 } });
    
    // 3. Revenue Calculation (Completed Orders)
    const revenueAgg = await Order.aggregate([
      { $match: { isPaid: true } }, // Consider all paid orders for revenue
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

    // 4. Monthly Revenue Graph Data (Real-time)
    const currentYear = new Date().getFullYear();
    const monthlyRevenue = await Order.aggregate([
      { 
        $match: { 
          isPaid: true,
          createdAt: { 
            $gte: new Date(`${currentYear}-01-01`), 
            $lte: new Date(`${currentYear}-12-31`) 
          }
        } 
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          total: { $sum: "$total" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // Format graph data for frontend (ensure all 12 months exist or mapped correctly)
    // Frontend expects array of numbers. We will send the raw aggregation for flexibility.

    // 5. Recent Activity (Latest 5 Orders)
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('orderId customer total status createdAt')
      .lean();

    // 6. System Health & Mock Data for Missing Modules
    // (Quotes and Remote Sessions don't have DB models in this frozen backend)
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
        technicians: activeTechnicians,
        pendingOrders: pendingOrders,
        lowStock: lowStockCount,
        generatedQuotes: 12, // Mocked as no Quote DB model exists
        remoteSessions: 3,   // Mocked as no Session DB model exists
        loggedInUsers: Math.floor(Math.random() * 5) + 1 // Mock real-time user count
      },
      charts: {
        revenue: monthlyRevenue
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

// @desc    Update any user profile by Admin
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      // AUDIT LOGGING: Record the action before saving
      const changes = [];
      if (req.body.role && req.body.role !== user.role) changes.push(`Role: ${user.role} -> ${req.body.role}`);
      if (req.body.status && req.body.status !== user.status) changes.push(`Status: ${user.status} -> ${req.body.status}`);
      if (req.body.email && req.body.email !== user.email) changes.push(`Email: ${user.email} -> ${req.body.email}`);
      if (req.body.password && req.body.password.trim() !== '') changes.push('Password Changed');
      
      if (changes.length > 0) {
          console.log(`[AUDIT] Admin ${req.user.email} updated User ${user.email} (${user._id}). Changes: ${changes.join(', ')}`);
      }

      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.role = req.body.role || user.role;
      user.status = req.body.status || user.status;
      if (req.body.phone) user.phone = req.body.phone;
      
      if (req.body.isApproved !== undefined) {
          user.isApproved = req.body.isApproved;
      }

      if (req.body.password && req.body.password.trim() !== '') {
          user.password = req.body.password; // Hash handled by model hook
      }

      const updatedUser = await user.save();
      res.json({
        success: true,
        user: {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          status: updatedUser.status
        }
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Update failed', error: error.message });
  }
};

module.exports = { getDashboardStats, getSystemSettings, updateSystemSettings, updateUser };
