const { sendEmail } = require('../services/emailService');

const submitContact = async (req, res) => {
  const { name, email, phone, service, message } = req.body;
  
  await sendEmail(
    process.env.ADMIN_EMAIL,
    `New Contact: ${name}`,
    `<p>From: ${name} (${email})</p><p>Phone: ${phone}</p><p>Service: ${service}</p><p>${message}</p>`
  );

  res.json({ success: true, message: 'Message Sent' });
};

const submitBooking = async (req, res) => {
  const { name, email, phone, date, time, serviceType } = req.body;
  
  await sendEmail(
    process.env.ADMIN_EMAIL,
    `Booking Request: ${serviceType}`,
    `<p>Client: ${name}</p><p>Date: ${date} at ${time}</p><p>Phone: ${phone}</p>`
  );

  res.json({ success: true, message: 'Booking Submitted' });
};

const submitQuote = async (req, res) => {
  // Logic to save quote to DB could go here
  const { name, email, serviceType, grandTotal } = req.body;
  
  await sendEmail(
    process.env.ADMIN_EMAIL,
    `Quote Request: ${serviceType}`,
    `<p>Client: ${name}</p><p>Total Est: GHS ${grandTotal}</p>`
  );

  res.json({ success: true, message: 'Quote Request Received', data: req.body });
};

module.exports = { submitContact, submitBooking, submitQuote };