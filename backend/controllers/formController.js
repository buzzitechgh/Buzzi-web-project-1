const { sendEmail } = require('../services/emailService');
const SystemSetting = require('../models/SystemSetting');

const submitContact = async (req, res) => {
  const { name, email, phone, service, message } = req.body;
  
  // 1. Send Email Notification (Standard)
  await sendEmail(
    process.env.ADMIN_EMAIL,
    `New Contact: ${name}`,
    `<p>From: ${name} (${email})</p><p>Phone: ${phone}</p><p>Service: ${service}</p><p>${message}</p>`
  );

  // 2. Trigger Webhook (If Configured)
  try {
      const settings = await SystemSetting.getSettings();
      let webhookUrl = null;

      // Determine appropriate webhook based on service type
      if (service === 'Quick Callback' && settings.n8n?.webhooks?.callbackRequested) {
          webhookUrl = settings.n8n.webhooks.callbackRequested;
      } else if (service === 'Technical Support' && settings.n8n?.webhooks?.ticketCreated) {
          webhookUrl = settings.n8n.webhooks.ticketCreated;
      }

      if (webhookUrl) {
          // Use fetch to post data to the webhook
          // Assuming Node 18+ for global fetch, otherwise logic would need 'axios' or 'http'
          if (typeof fetch !== 'undefined') {
              await fetch(webhookUrl, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ name, email, phone, service, message, timestamp: new Date() })
              }).catch(err => console.error("Webhook trigger failed:", err.message));
          } else {
              console.warn("Global fetch not available to trigger webhook. Please upgrade Node.js.");
          }
      }
  } catch (err) {
      console.error("Error triggering webhook:", err);
      // Don't fail the request if webhook fails, just log it
  }

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