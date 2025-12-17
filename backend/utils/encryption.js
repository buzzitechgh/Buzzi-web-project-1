
const crypto = require('crypto');

let ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

// Safeguard: Ensure key is 32 bytes for AES-256
if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
    if (process.env.NODE_ENV === 'production') {
        throw new Error("CRITICAL SECURITY ERROR: ENCRYPTION_KEY must be exactly 32 characters in production.");
    }
    console.warn("⚠️ Warning: ENCRYPTION_KEY is missing or invalid. Using insecure dev fallback.");
    ENCRYPTION_KEY = '12345678901234567890123456789012';
}

const IV_LENGTH = 16;

function encrypt(text) {
  if (!text) return null;
  try {
    let iv = crypto.randomBytes(IV_LENGTH);
    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  } catch (error) {
    console.error("Encryption failed:", error);
    return null;
  }
}

function decrypt(text) {
  if (!text) return null;
  try {
    let textParts = text.split(':');
    if (textParts.length < 2) return null;
    let iv = Buffer.from(textParts.shift(), 'hex');
    let encryptedText = Buffer.from(textParts.join(':'), 'hex');
    let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    console.error("Decryption failed:", error);
    return null;
  }
}

// Helper to mask secrets for frontend display (e.g., "sk_test_...45a")
function mask(text) {
  if (!text) return '';
  if (text.length <= 8) return '********';
  return text.substring(0, 4) + '********' + text.substring(text.length - 4);
}

module.exports = { encrypt, decrypt, mask };
