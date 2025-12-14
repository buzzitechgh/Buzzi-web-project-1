const express = require('express');
const router = express.Router();
const { getKnowledgeBase, addKnowledgeEntry, deleteKnowledgeEntry, uploadKnowledgeBase } = require('../controllers/knowledgeController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(getKnowledgeBase)
    .post(protect, admin, addKnowledgeEntry);

router.route('/:id')
    .delete(protect, admin, deleteKnowledgeEntry);

router.post('/upload', protect, admin, uploadKnowledgeBase);

module.exports = router;