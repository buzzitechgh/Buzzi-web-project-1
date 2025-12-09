const express = require('express');
const router = express.Router();
const { submitContact, submitBooking, submitQuote } = require('../controllers/formController');

router.post('/contact', submitContact);
router.post('/booking', submitBooking);
router.post('/quote', submitQuote);

module.exports = router;