import admin from 'firebase-admin';
import fs from 'fs'
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let adminExport = null;
const createStub = () => ({
  auth: () => ({
    verifyIdToken: async () => {
      throw new Error('Firebase Admin SDK not configured');
    }
  })
});

try {
  const serviceAccountPath = join(__dirname, 'serviceAccountKey.json');
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(
      fs.readFileSync(serviceAccountPath, 'utf8')
    );

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('Firebase Admin SDK initialized');
    }
    adminExport = admin;
  } else {
    console.warn('Firebase serviceAccountKey.json not found — Firebase Admin disabled');
    adminExport = createStub();
  }
} catch (err) {
  console.warn('Error initializing Firebase Admin SDK:', err?.message || err);
  adminExport = createStub();
}

export default adminExport;
