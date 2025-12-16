const mongoose = require('mongoose');

const systemSettingSchema = mongoose.Schema({
  // --- 1. SYSTEM & ENVIRONMENT ---
  appName: { type: String, default: 'Buzzitech Portal' },
  maintenanceMode: { type: Boolean, default: false },
  environment: { type: String, enum: ['sandbox', 'production'], default: 'sandbox' },
  supportEmail: { type: String, default: 'support@buzzitech.com' },

  // --- 2. PAYMENT INTEGRATIONS ---
  payments: {
    gateway: { type: String, enum: ['paystack', 'stripe', 'momo'], default: 'paystack' },
    currency: { type: String, default: 'GHS' },
    testMode: { type: Boolean, default: true },
    paystack: {
      publicKey: { type: String },
      secretKey: { type: String }, // Encrypted
      webhookSecret: { type: String } // Encrypted
    },
    // Extensible for other gateways
    stripe: {
      publishableKey: { type: String },
      secretKey: { type: String }
    }
  },

  // --- 3. NOTIFICATIONS (SMS) ---
  sms: {
    provider: { type: String, enum: ['africastalking', 'twilio', 'arkesel', 'console_log'], default: 'console_log' },
    senderId: { type: String, default: 'BUZZITECH' },
    apiKey: { type: String }, // Encrypted
    apiSecret: { type: String }, // Encrypted (if needed)
    rateLimit: { type: Number, default: 5 }, // SMS per minute per user
    enabled: { type: Boolean, default: true }
  },

  // --- 4. NOTIFICATIONS (EMAIL) ---
  email: {
    service: { type: String, enum: ['smtp', 'sendgrid', 'resend'], default: 'smtp' },
    fromName: { type: String, default: 'Buzzitech Alerts' },
    fromEmail: { type: String, default: 'no-reply@buzzitech.com' },
    smtp: {
      host: { type: String },
      port: { type: Number, default: 587 },
      secure: { type: Boolean, default: false },
      user: { type: String },
      pass: { type: String } // Encrypted
    },
    apiKeys: {
      sendgrid: { type: String },
      resend: { type: String }
    }
  },

  // --- 5. AUTOMATION (n8n) ---
  n8n: {
    enabled: { type: Boolean, default: false },
    authHeader: { type: String, default: 'X-Buzzitech-Auth' },
    authKey: { type: String }, // Token sent to n8n for verification
    webhooks: {
      orderCreated: { type: String },
      ticketCreated: { type: String },
      quoteRequested: { type: String }
    }
  },

  // --- 6. SECURITY & AUDIT ---
  security: {
    twoFactorEnforced: { type: Boolean, default: false },
    technicianApprovalRequired: { type: Boolean, default: true },
    sessionTimeout: { type: Number, default: 60 }, // minutes
    allowedOrigins: [{ type: String }] // CORS whitelist
  },

  // --- 7. DYNAMIC ROLES & DEPARTMENTS ---
  technicianRoles: [{ type: String }],
  departments: [{ type: String }]

}, {
  timestamps: true
});

// Singleton Pattern: We typically only want ONE document for settings
systemSettingSchema.statics.getSettings = async function() {
  const settings = await this.findOne();
  if (settings) return settings;
  return await this.create({
      technicianRoles: ["Network Engineer", "CCTV Specialist", "Software Support", "Field Technician", "System Administrator"],
      departments: ["Infrastructure", "Security", "IT Support", "Field Ops", "Networking", "General"]
  });
};

module.exports = mongoose.model('SystemSetting', systemSettingSchema);