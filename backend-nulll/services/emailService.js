const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, html) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log("Email credentials not set, skipping email.");
      return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: `"Buzzitech System" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: html,
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error(`Email error: ${error}`);
  }
};

module.exports = { sendEmail };