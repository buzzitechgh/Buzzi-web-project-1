
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Ensure 'images' directory exists
const uploadDir = path.join(__dirname, '../images');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination(req, file, cb) {
        // Save to the 'images' folder
        cb(null, 'images/');
    },
    filename(req, file, cb) {
        // Generate a random filename to prevent overwriting and malicious naming
        const randomName = crypto.randomBytes(16).toString('hex');
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${file.fieldname}-${randomName}${ext}`);
    }
});

// Check file type
function checkFileType(file, cb) {
    const filetypes = /jpg|jpeg|png|webp|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Images only!'));
    }
}

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB Limit
    fileFilter: function(req, file, cb) {
        checkFileType(file, cb);
    }
});

router.post('/', upload.single('image'), (req, res) => {
    if(!req.file) {
        return res.status(400).send({ message: 'No file uploaded' });
    }
    
    // Construct URL path pointing to the new /images static route
    const imagePath = `/images/${req.file.filename}`;
    
    res.send({
        message: 'Image uploaded successfully',
        image: imagePath
    });
});

module.exports = router;
