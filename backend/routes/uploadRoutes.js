
const express = require('express');
const router = express.Router();
const multer = require('multer');
const admin = require('firebase-admin');
const path = require('path');

// --- FIREBASE CONFIGURATION ---
// In production, use Environment Variables for these credentials!
// For simplicity in this step, we assume ENV variables are set on Render.
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
};

// Initialize Firebase only if credentials exist
let bucket;
try {
    if (serviceAccount.project_id) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            storageBucket: `${serviceAccount.project_id}.appspot.com` // Assumes default bucket naming
        });
        bucket = admin.storage().bucket();
        console.log("Firebase Storage Initialized");
    } else {
        console.warn("Firebase credentials missing. Image uploads will fail in production.");
    }
} catch (error) {
    console.error("Firebase Init Error:", error);
}

// Multer in Memory (Don't save to disk, keep in RAM to upload to Firebase)
const storage = multer.memoryStorage();

function checkFileType(file, cb) {
    const filetypes = /jpg|jpeg|png|webp|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) return cb(null, true);
    cb(new Error('Images only!'));
}

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: function(req, file, cb) { checkFileType(file, cb); }
});

router.post('/', upload.single('image'), async (req, res) => {
    if(!req.file) return res.status(400).send({ message: 'No file uploaded' });

    // Fallback if Firebase isn't set up (Dev mode)
    if (!bucket) {
        return res.status(500).json({ message: "Storage not configured (Firebase env vars missing)" });
    }

    try {
        const filename = `images/${Date.now()}-${req.file.originalname}`;
        const blob = bucket.file(filename);
        
        const blobStream = blob.createWriteStream({
            metadata: { contentType: req.file.mimetype }
        });

        blobStream.on('error', (err) => {
            res.status(500).send({ message: err.message });
        });

        blobStream.on('finish', async () => {
            // Make file public
            await blob.makePublic();
            // Construct public URL
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
            res.send({
                message: 'Image uploaded successfully',
                image: publicUrl
            });
        });

        blobStream.end(req.file.buffer);

    } catch (error) {
        res.status(500).send({ message: "Upload failed: " + error.message });
    }
});

module.exports = router;
