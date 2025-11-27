# Backend Implementation

The running application is a React SPA with a mocked service layer for demonstration purposes. 
Below is the **Node.js + Express** backend code and **MongoDB** schema you requested for a production environment.

## Folder Structure

```
backend/
├── src/
│   ├── config/
│   │   └── db.js
│   ├── models/
│   │   ├── Contact.js
│   │   ├── Appointment.js
│   │   └── Quote.js
│   ├── routes/
│   │   └── api.js
│   ├── services/
│   │   └── emailService.js
│   └── server.js
├── .env
└── package.json
```

## 1. Setup (package.json)
```json
{
  "name": "buzzitech-backend",
  "version": "1.0.0",
  "main": "src/server.js",
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "express": "^4.18.2",
    "mongoose": "^7.0.3",
    "nodemailer": "^6.9.1"
  }
}
```

## 2. Environment Variables (.env)
Create a `.env` file in the root directory. 
**Important:** For Gmail, use an [App Password](https://support.google.com/accounts/answer/185833), not your login password.

```env
PORT=5000
MONGO_URI=mongodb+srv://youruser:yourpassword@cluster0.mongodb.net/buzzitech?retryWrites=true&w=majority
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_USER=buzzitechgh@gmail.com
EMAIL_PASS=your_gmail_app_password_here
ADMIN_EMAIL=buzzitechgh@gmail.com
```

## 3. Database Config (src/config/db.js)
```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
```

## 4. Email Service (src/services/emailService.js)

```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT, // 465 for SSL, 587 for TLS
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Buzzitech Notifications" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: html,
    });
    console.log("Message sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending email: ", error);
    return false;
  }
};

module.exports = { sendEmail };
```

## 5. Schemas (src/models/)

**Contact.js**
```javascript
const mongoose = require('mongoose');
const ContactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  service: { type: String },
  message: { type: String, required: true },
  date: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Contact', ContactSchema);
```

**Appointment.js**
```javascript
const mongoose = require('mongoose');
const AppointmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  serviceType: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  status: { type: String, default: 'Pending' }, // Pending, Confirmed, Completed
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Appointment', AppointmentSchema);
```

**Quote.js**
```javascript
const mongoose = require('mongoose');
const QuoteSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  serviceType: { type: String, required: true },
  description: { type: String, required: true },
  budget: { type: String },
  timeline: { type: String },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Quote', QuoteSchema);
```

## 6. Server & Routes (src/server.js)

```javascript
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { sendEmail } = require('./services/emailService');

// Models
const Contact = require('./models/Contact');
const Appointment = require('./models/Appointment');
const Quote = require('./models/Quote');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// DB Connection
connectDB();

// --- API Endpoints ---

// 1. Submit Contact Form
app.post('/api/submit-contact-form', async (req, res) => {
  try {
    const newContact = new Contact(req.body);
    await newContact.save();

    // Notify Admin
    await sendEmail(
      process.env.ADMIN_EMAIL,
      `New Contact: ${req.body.name}`,
      `<p><strong>From:</strong> ${req.body.name} (${req.body.email})</p>
       <p><strong>Phone:</strong> ${req.body.phone}</p>
       <p><strong>Message:</strong> ${req.body.message}</p>`
    );

    res.status(201).json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 2. Book Appointment
app.post('/api/book-appointment', async (req, res) => {
  try {
    const newAppointment = new Appointment(req.body);
    await newAppointment.save();

    // 1. Notify Admin
    await sendEmail(
      process.env.ADMIN_EMAIL,
      `New Appointment: ${req.body.name}`,
      `<h2>Appointment Request</h2>
       <p><strong>Client:</strong> ${req.body.name} (${req.body.phone})</p>
       <p><strong>Service:</strong> ${req.body.serviceType}</p>
       <p><strong>Date/Time:</strong> ${req.body.date} at ${req.body.time}</p>`
    );

    // 2. Confirmation to Customer
    await sendEmail(
      req.body.email,
      `Booking Confirmation - Buzzitech`,
      `<p>Dear ${req.body.name},</p>
       <p>We have received your appointment request for <strong>${req.body.serviceType}</strong> on <strong>${req.body.date}</strong>.</p>
       <p>Our team will contact you shortly to confirm details.</p>
       <p>Best regards,<br>Buzzitech IT Solutions</p>`
    );

    res.status(201).json({ success: true, message: 'Appointment booked successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 3. Request Quotation
app.post('/api/request-quotation', async (req, res) => {
  try {
    const newQuote = new Quote(req.body);
    await newQuote.save();

    // 1. Notify Admin
    await sendEmail(
      process.env.ADMIN_EMAIL,
      `New Quote Request: ${req.body.serviceType}`,
      `<h2>Quote Details</h2>
       <p><strong>Client:</strong> ${req.body.name}</p>
       <p><strong>Budget:</strong> GHS ${req.body.budget}</p>
       <p><strong>Description:</strong> ${req.body.description}</p>`
    );

    // 2. Confirmation to Customer
    await sendEmail(
      req.body.email,
      `Quote Request Received - Buzzitech`,
      `<p>Dear ${req.body.name},</p>
       <p>Thank you for requesting a quote for <strong>${req.body.serviceType}</strong>.</p>
       <p>Your request has been logged. We will review the details and send a formal proposal shortly.</p>
       <p><em>(An automated estimate invoice may have been downloaded in your browser).</em></p>
       <p>Best regards,<br>Buzzitech IT Solutions</p>`
    );

    res.status(201).json({ success: true, message: 'Quote request received' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

## Deployment Steps
1. Set up a MongoDB Atlas cluster.
2. Deploy this Node.js code to Render, Heroku, or AWS.
3. Update `.env` with your real Gmail App Password and DB connection string.
4. Update the Frontend `api.ts` to use `fetch('https://your-backend.com/api/...')` instead of the simulated delay.
