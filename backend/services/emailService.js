const nodemailer = require('nodemailer');

// Ensure Environment variables are loaded
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("⚠️ WARNING: EMAIL_USER or EMAIL_PASS not set in .env file. Emails will not send.");
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generic Send Function
const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"Buzzitech System" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: html,
    });
    console.log(`✅ Email sent successfully to ${to}`);
    return true;
  } catch (error) {
    console.error(`❌ Email error: ${error.message}`);
    return false;
  }
};

// Send OTP Verification Code
const sendVerificationEmail = async (to, code, name) => {
    const subject = "Verify Your Buzzitech Account";
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #002855; text-align: center;">Verify Your Email</h2>
        <p>Hello <strong>${name}</strong>,</p>
        <p>Thank you for registering with Buzzitech IT Solutions. Please use the verification code below to activate your account:</p>
        <div style="background-color: #f3f4f6; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
          <h1 style="color: #00AEEF; letter-spacing: 5px; margin: 0;">${code}</h1>
        </div>
        <p>This code will expire in 15 minutes.</p>
        <p style="font-size: 12px; color: #888;">If you did not request this, please ignore this email.</p>
      </div>
    `;
    return await sendEmail(to, subject, html);
};

// Send Welcome Email (After Verification)
const sendWelcomeEmail = async (to, name, role, techId = null) => {
    const subject = "Welcome to Buzzitech!";
    let specificContent = `<p>We are excited to have you on board. You can now access your dashboard to track orders and request services.</p>`;
    
    if (role === 'technician') {
        specificContent = `
          <p>You have successfully registered as a <strong>Technician</strong>.</p>
          <div style="background-color: #e6fffa; border: 1px solid #b2f5ea; padding: 15px; border-radius: 5px; color: #234e52;">
             <strong>Your Technician Identity Code:</strong> <span style="font-size: 1.2em; font-weight: bold;">${techId}</span>
          </div>
          <p>Please use this ID for all official field reports and job verification.</p>
        `;
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #002855;">Welcome, ${name}! 🎉</h2>
        ${specificContent}
        <br/>
        <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/login" style="background-color: #002855; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Login to Dashboard</a>
        <p style="margin-top: 30px; font-size: 12px; color: #888;">&copy; ${new Date().getFullYear()} Buzzitech IT Solutions</p>
      </div>
    `;
    return await sendEmail(to, subject, html);
};

module.exports = { sendEmail, sendVerificationEmail, sendWelcomeEmail };