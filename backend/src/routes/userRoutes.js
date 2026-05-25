import express from 'express';
import { register, login, updateFcmToken } from '../controllers/userController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/update-fcm-token', updateFcmToken);

export default router;