export default {
  port: process.env.PORT || 8000,
  firebase: {
    serviceAccountPath: process.env.FIREBASE_SERVICE_ACCOUNT_PATH || '../config/firebaseServiceAccount.json'
  }
};
