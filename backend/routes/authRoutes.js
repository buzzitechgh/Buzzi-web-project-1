const express = require('express');
const router = express.Router();
const { registerUser, loginUser, verifyEmail, verifyTwoFactorLogin, resendOtp, toggleTwoFactor, approveUser } = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify', verifyEmail);
router.post('/verify-2fa', verifyTwoFactorLogin);
router.post('/resend-otp', resendOtp);
router.put('/toggle-2fa', protect, toggleTwoFactor);
router.put('/approve/:id', protect, admin, approveUser);

module.exports = router;