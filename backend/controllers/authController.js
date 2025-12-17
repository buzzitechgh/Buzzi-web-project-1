
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // Needed for dummy check
const { sendVerificationEmail, sendWelcomeEmail, sendEmail } = require('../services/emailService');
const SystemSetting = require('../models/SystemSetting');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register a new user (Customer or Technician)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password, phone, role, department, subRole, verificationImage } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Generate Verification Code (OTP)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    // Generate Technician ID if applicable
    let technicianId = undefined;
    let isApproved = true; // Customers are auto-approved

    if (role === 'technician') {
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        technicianId = `TECH-${randomNum}`;
        isApproved = false; // Technicians require Admin Approval
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: role || 'customer',
      department: role === 'technician' ? department : undefined,
      subRole: role === 'technician' ? subRole : undefined,
      technicianId,
      verificationImage,
      otp,
      otpExpires,
      isVerified: false, // Must verify email first
      isApproved: isApproved,
      isTwoFactorEnabled: false
    });

    if (user) {
      // Send Verification Email
      const emailSent = await sendVerificationEmail(user.email, otp, user.name);
      
      if (!emailSent) {
          return res.status(201).json({ 
              success: true, 
              message: 'Account created, but failed to send email. Please check server logs.',
              requiresVerification: true,
              email: user.email 
          });
      }

      res.status(201).json({
        success: true,
        message: 'Verification code sent to email.',
        requiresVerification: true,
        email: user.email
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Verify OTP and Activate Account
// @route   POST /api/auth/verify
// @access  Public
const verifyEmail = async (req, res) => {
    const { email, code } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            // Return generic error for security
            return res.status(400).json({ message: 'Invalid verification details' });
        }

        if (user.isVerified) {
            return res.status(200).json({ success: true, message: 'User already verified. Please login.' });
        }

        if (user.otp !== code || user.otpExpires < Date.now()) {
            return res.status(400).json({ message: 'Invalid or expired verification code' });
        }

        // Activate User Email
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        // Check Approval Status
        if (user.role === 'technician' && !user.isApproved) {
             return res.status(200).json({
                success: true,
                message: 'Email Verified! Account is pending Admin Approval.',
                isPendingApproval: true
            });
        }

        // Send Welcome Email if fully approved
        await sendWelcomeEmail(user.email, user.name, user.role, user.technicianId);

        res.json({
            success: true,
            message: 'Email Verified Successfully!',
            token: generateToken(user._id),
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                technicianId: user.technicianId,
                isTwoFactorEnabled: user.isTwoFactorEnabled
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Verification Error' });
    }
};

// @desc    Verify 2FA OTP and Login
// @route   POST /api/auth/verify-2fa
// @access  Public
const verifyTwoFactorLogin = async (req, res) => {
    const { email, code } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) return res.status(400).json({ message: 'Invalid details' });

        if (user.otp !== code || user.otpExpires < Date.now()) {
            return res.status(400).json({ message: 'Invalid or expired 2FA code' });
        }

        // Clear OTP
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isAdmin: user.isAdmin || user.role === 'admin',
            technicianId: user.technicianId,
            isTwoFactorEnabled: user.isTwoFactorEnabled,
            token: generateToken(user._id),
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
const resendOtp = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        // Don't reveal if user exists
        if (!user) return res.status(200).json({ success: true, message: 'If this email exists, a code has been sent.' });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otpExpires = new Date(Date.now() + 15 * 60 * 1000);
        await user.save();

        await sendVerificationEmail(user.email, otp, user.name);
        res.json({ success: true, message: 'New code sent.' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    // Timing Attack Mitigation: Always compare password, even if user null
    if (!user) {
        // Dummy comparison to consume time similar to a real comparison
        await bcrypt.compare(password, '$2a$10$abcdefghijklmnopqrstuvwxyz123456');
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (await user.matchPassword(password)) {
      
      // 1. Check Email Verification
      if (!user.isVerified) {
          const otp = Math.floor(100000 + Math.random() * 900000).toString();
          user.otp = otp;
          user.otpExpires = new Date(Date.now() + 15 * 60 * 1000);
          await user.save();
          await sendVerificationEmail(user.email, otp, user.name);

          return res.status(403).json({ 
              message: 'Account not verified. Code sent.', 
              requiresVerification: true,
              email: user.email 
          });
      }

      // 2. Check Admin Approval (Technicians)
      if (user.role === 'technician' && !user.isApproved) {
          return res.status(403).json({
              message: 'Your account is pending Admin Approval. Please contact support.',
              isPendingApproval: true
          });
      }

      // Check System Settings for Global 2FA Enforcement
      const settings = await SystemSetting.getSettings();
      const is2FAEnforced = settings.security.twoFactorEnforced;

      // 3. Check Two-Factor Authentication (Personal OR Global)
      if (user.isTwoFactorEnabled || is2FAEnforced) {
          const otp = Math.floor(100000 + Math.random() * 900000).toString();
          user.otp = otp;
          user.otpExpires = new Date(Date.now() + 15 * 60 * 1000);
          await user.save();
          await sendVerificationEmail(user.email, otp, user.name);

          return res.status(200).json({
              success: true,
              requiresTwoFactor: true,
              message: '2FA Enabled. Verification code sent.',
              email: user.email
          });
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isAdmin: user.isAdmin || user.role === 'admin',
        technicianId: user.technicianId,
        isTwoFactorEnabled: user.isTwoFactorEnabled,
        verificationImage: user.verificationImage,
        phone: user.phone,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Toggle 2FA
// @route   PUT /api/auth/toggle-2fa
// @access  Private
const toggleTwoFactor = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.isTwoFactorEnabled = !user.isTwoFactorEnabled;
        await user.save();

        res.json({ 
            success: true, 
            isTwoFactorEnabled: user.isTwoFactorEnabled, 
            message: `Two-Factor Authentication ${user.isTwoFactorEnabled ? 'Enabled' : 'Disabled'}` 
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Approve a Technician
// @route   PUT /api/auth/approve/:id
// @access  Private (Admin)
const approveUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.isApproved = true;
        await user.save();

        // Send Email Notification
        await sendEmail(
            user.email,
            "Account Approved - Buzzitech",
            `<p>Hello ${user.name},</p><p>Your technician account has been <strong>approved</strong> by the administrator.</p><p>You can now log in to the Technician Portal.</p>`
        );

        res.json({ success: true, message: 'User approved successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update User Profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    
    // Check if email is being updated and is unique
    if (req.body.email && req.body.email !== user.email) {
        const userExists = await User.findOne({ email: req.body.email });
        if (userExists) {
            return res.status(400).json({ message: 'Email already in use' });
        }
        user.email = req.body.email;
    }

    if (req.body.verificationImage) {
        user.verificationImage = req.body.verificationImage;
    }
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      phone: updatedUser.phone,
      technicianId: updatedUser.technicianId,
      verificationImage: updatedUser.verificationImage,
      isTwoFactorEnabled: updatedUser.isTwoFactorEnabled,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

module.exports = { registerUser, verifyEmail, verifyTwoFactorLogin, resendOtp, loginUser, toggleTwoFactor, approveUser, updateUserProfile };
