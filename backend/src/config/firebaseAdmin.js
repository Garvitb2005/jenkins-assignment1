import admin from 'firebase-admin';
import fs from 'fs'
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize the Firebase Admin SDK
const serviceAccount = JSON.parse(
  fs.readFileSync(join(__dirname, 'serviceAccountKey.json'), 'utf8')
);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} else {
  // If already initialized, skip initialization
  admin.app();
}

export default admin;
