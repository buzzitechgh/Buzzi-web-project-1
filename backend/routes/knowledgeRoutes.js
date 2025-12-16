const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getKnowledgeBase, addKnowledgeEntry, deleteKnowledgeEntry, uploadKnowledgeBase } = require('../controllers/knowledgeController');
const { protect, admin } = require('../middleware/authMiddleware');

// Configure Multer for File Uploads
const uploadDir = path.join(__dirname, '../uploads/temp');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, uploadDir);
    },
    filename(req, file, cb) {
        cb(null, `kb-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    fileFilter: function(req, file, cb) {
        const filetypes = /json|pdf|doc|docx/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        
        if (extname) {
            return cb(null, true);
        } else {
            cb('Error: Only JSON, PDF, and DOCX files are allowed!');
        }
    }
});

router.route('/')
    .get(getKnowledgeBase)
    .post(protect, admin, addKnowledgeEntry);

router.route('/:id')
    .delete(protect, admin, deleteKnowledgeEntry);

router.post('/upload', protect, admin, upload.single('file'), uploadKnowledgeBase);

module.exports = router;