import express from 'express';
import { createAssignment, getAssignments,submitAssignment } from '../controllers/assignmentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Route to fetch all assignments (GET request)
router.get('/', getAssignments);

// Route to create a new assignment (POST request)
router.post('/', protect, authorize('instructor', 'admin'), createAssignment);

// Route to submit an assignment (POST request)
router.post('/:assignmentId/submit', protect, authorize('student'), submitAssignment);


export default router;
