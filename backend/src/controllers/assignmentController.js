import assignmentModel from "../models/assignmentModel.js";
import multer from 'multer';
import path from 'path';
import { getIO, getConnectedUsers } from '../app.js';
import User from '../models/userModel.js';

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage }).single('pdf');

// Function to send notifications to all students
async function notifyStudents(assignment) {
  try {
    const io = getIO();
    const connectedUsers = getConnectedUsers();
    
    console.log('Sending notification for assignment:', assignment.title);
    console.log('Connected users:', Array.from(connectedUsers.keys()));

    // Get all students with their FCM tokens
    const students = await User.find({ 
      role: 'student',
      fcmToken: { $exists: true, $ne: null }
    });
    console.log('Found students with FCM tokens:', students.length);
    
    // First, send socket notifications
    students.forEach(student => {
      const socketId = connectedUsers.get(student._id.toString());
      if (socketId) {
        console.log(`Sending socket notification to student ${student._id} via socket ${socketId}`);
        io.to(socketId).emit('new_assignment', {
          title: assignment.title,
          description: assignment.description,
          dueDate: assignment.dueDate
        });
      }
    });

    // Then broadcast to all connected clients
    io.emit('new_assignment', {
      title: assignment.title,
      description: assignment.description,
      dueDate: assignment.dueDate
    });
    
    console.log('Notifications sent successfully');
  } catch (error) {
    console.error('Error sending notifications:', error);
    console.error('Full error stack:', error.stack);
  }
}

// Controller function to create a new assignment
export async function createAssignment(req, res) {
  upload(req, res, async (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(500).json({ message: 'File upload error', error: err.message });
    }

    const { title, description, dueDate } = req.body;
    const instructor = req.user._id;

    if (!instructor) {
      return res.status(400).json({ message: 'Instructor is required.' });
    }

    const pdfUrl = req.file ? `/uploads/${req.file.filename}` : '';

    try {
      console.log('Creating new assignment:', { title, description, dueDate });
      
      const newAssignment = await assignmentModel.create({
        title,
        description,
        dueDate,
        pdfUrl,
        instructor,
      });

      console.log('Assignment created successfully:', newAssignment._id);

      // Send notifications to all students
      await notifyStudents(newAssignment);

      res.status(201).json({
        message: 'Assignment created successfully',
        assignment: newAssignment,
      });
    } catch (error) {
      console.error('Error creating assignment:', error);
      res.status(500).json({
        message: 'Error creating assignment',
        error: error.message,
      });
    }
  });
}

// Controller function to fetch all assignments
export async function getAssignments(req, res) {
  try {
    const assignments = await assignmentModel
      .find()
      .populate('instructor', 'name email');  // Populate the instructor's information

    res.status(200).json(assignments);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Error fetching assignments',
      error: error.message,
    });
  }
}

// Controller function to submit an assignment
export async function submitAssignment(req, res) {
    upload(req, res, async (err) => {
      if (err) {
        console.error('Multer error:', err); // Log the error for debugging
        return res.status(500).json({ message: 'File upload error', error: err.message });
      }
  
      const { assignmentId } = req.params;
      const studentId = req.user._id;  // Assuming the student's ID is stored in the JWT
  
      if (!studentId) {
        return res.status(400).json({ message: 'Student is required.' });
      }
  
      const fileUrl = req.file ? `/uploads/${req.file.filename}` : '';
  
      try {
        // Find the assignment and add the submission URL for the student
        const assignment = await assignmentModel.findById(assignmentId);
        if (!assignment) {
          return res.status(404).json({ message: 'Assignment not found.' });
        }
  
        // Save the submission URL for the student
        assignment.submissionUrl = fileUrl;
        await assignment.save();
  
        res.status(200).json({
          message: 'Assignment submitted successfully.',
          submissionUrl: fileUrl,
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({
          message: 'Error submitting assignment',
          error: error.message,
        });
      }
    });
  }
