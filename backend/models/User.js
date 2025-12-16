const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  // Role Management
  role: { type: String, required: true, enum: ['customer', 'technician', 'admin'], default: 'customer' },
  isAdmin: { type: Boolean, default: false }, // Kept for backward compatibility
  
  // Technician Specifics
  technicianId: { type: String, unique: true, sparse: true }, // e.g., TECH-8492
  department: { type: String }, // e.g., Infrastructure, Security
  subRole: { type: String }, // e.g., Network Engineer, CCTV Specialist
  
  // Contact
  phone: { type: String },
  
  // Security & Verification
  isVerified: { type: Boolean, default: false }, // Email verification
  isApproved: { type: Boolean, default: true }, // Admin approval (False for Techs by default)
  isTwoFactorEnabled: { type: Boolean, default: false }, // User optional 2FA
  verificationImage: { type: String }, // URL to ID or Selfie
  otp: { type: String },
  otpExpires: { type: Date },
}, {
  timestamps: true
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('User', userSchema);