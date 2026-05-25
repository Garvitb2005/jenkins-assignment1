import express from 'express';
import { createClass, getClasses, enrollInClass, addLecture, getLectures } from '../controllers/classController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getClasses)
  .post(protect, authorize('instructor'), createClass);

router.route('/:id/enroll')
  .post(protect, enrollInClass);

router.route('/:id/lectures')
  .get(protect, getLectures)
  .post(protect, authorize('instructor'), addLecture);

export default router;