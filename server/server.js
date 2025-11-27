const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// --- SMTP Configuration (Direct Connect to Gmail) ---
// Note: You must generate an 'App Password' in your Google Account settings 
// if you have 2-Step Verification enabled. Use that instead of your normal password.
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'buzzitechgh@gmail.com',
    pass: process.env.EMAIL_APP_PASSWORD // Set this in your .env file
  }
});

const MY_EMAIL = 'buzzitechgh@gmail.com';

// Verify SMTP connection on startup
transporter.verify(function (error, success) {
  if (error) {
    console.log('SMTP Connection Error:', error);
  } else {
    console.log('Server is ready to send emails via Gmail');
  }
});

// --- Helper to Send Email ---
const sendNotification = async (subject, htmlContent, replyTo) => {
  const mailOptions = {
    from: `"Buzzitech Web" <${MY_EMAIL}>`,
    to: MY_EMAIL, // Send to yourself
    replyTo: replyTo, // Allow you to reply directly to the client
    subject: subject,
    html: htmlContent
  };
  return transporter.sendMail(mailOptions);
};

// --- Routes ---

// 1. Contact Form
app.post('/api/contact', async (req, res) => {
  const { name, email, phone, service, message } = req.body;
  
  try {
    await sendNotification(
      `New Contact: ${name} - ${service}`,
      `
      <h3>New Message from Website</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Service Interest:</strong> ${service}</p>
      <br/>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
      `,
      email
    );
    res.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to send email' });
  }
});

// 2. Booking Request
app.post('/api/booking', async (req, res) => {
  const { name, email, phone, date, time, serviceType } = req.body;

  try {
    await sendNotification(
      `New Booking: ${serviceType} - ${date}`,
      `
      <h3>Appointment Request</h3>
      <p><strong>Client:</strong> ${name}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Email:</strong> ${email}</p>
      <br/>
      <p><strong>Service:</strong> ${serviceType}</p>
      <p><strong>Requested Date:</strong> ${date}</p>
      <p><strong>Requested Time:</strong> ${time}</p>
      `,
      email
    );
    res.json({ success: true, message: 'Booking request sent' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to send booking' });
  }
});

// 3. Quote Request
app.post('/api/quote', async (req, res) => {
  const { name, email, phone, serviceType, description, budget, timeline } = req.body;

  try {
    await sendNotification(
      `Quote Request: ${serviceType}`,
      `
      <h3>Quotation Request</h3>
      <p><strong>Client:</strong> ${name}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Email:</strong> ${email}</p>
      <br/>
      <p><strong>Service Type:</strong> ${serviceType}</p>
      <p><strong>Budget:</strong> GHS ${budget}</p>
      <p><strong>Timeline:</strong> ${timeline}</p>
      <br/>
      <p><strong>Description:</strong></p>
      <p>${description}</p>
      `,
      email
    );
    res.json({ success: true, message: 'Quote request sent' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to send quote' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});