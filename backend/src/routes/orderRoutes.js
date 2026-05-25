import express from 'express';
import { createOrder, validateOrder } from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createOrder);
router.post('/validate', protect, validateOrder);

export default router;
