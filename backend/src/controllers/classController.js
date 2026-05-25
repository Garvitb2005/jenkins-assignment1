import classModel from '../models/classModel.js';
import userModel from '../models/userModel.js';
import mongoose from 'mongoose';

export async function createClass(req, res) {
  try {
    console.log("User in createClass:", req.user);
    if (!req.user || !req.user._id) {
      return res.status(400).send({ message: "Instructor ID is missing or invalid" });
    }
    const data = {
      ...req.body,
      instructor: req.user._id,
    };

    console.log("Data being sent to create class:", data);

    const newClass = await classModel.create(data);
    res.status(201).send({ success: true, data: newClass });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function getClasses(req, res) {
  try {
    console.log('Fetching all classes');
    const classes = await classModel.find()
      .populate({
        path: 'instructor',
        select: 'name email',
        model: 'User'
      })
      .sort({ createdAt: -1 });

    // Map classes to ensure consistent instructor data
    const formattedClasses = classes.map(classItem => {
      const { _doc } = classItem;
      return {
        ..._doc,
        instructor: _doc.instructor || {
          name: 'Not assigned',
          email: ''
        }
      };
    });

    console.log(`Found ${classes.length} classes`);
    return res.status(200).json({
      success: true,
      data: formattedClasses
    });
  } catch (error) {
    console.error('Error in getClasses:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

export async function enrollInClass(req, res) {
  try {
    const classId = req.params.id;
    const userId = req.user._id;

    console.log('Enrolling user in class:', { classId, userId });

    const classToEnroll = await classModel.findById(classId);
    const user = await userModel.findById(userId);

    if (!classToEnroll) {
      console.log('Class not found:', classId);
      return res.status(404).json({ 
        success: false, 
        message: 'Class not found' 
      });
    }

    if (!user) {
      console.log('User not found:', userId);
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Check if user is already enrolled
    if (classToEnroll.enrolledStudents.includes(userId)) {
      console.log('User already enrolled:', userId);
      return res.status(200).json({ 
        success: true, 
        message: 'Already enrolled in this class',
        isEnrolled: true
      });
    }

    if (classToEnroll.enrolledStudents.length >= classToEnroll.maxStudents) {
      console.log('Class is full:', classId);
      return res.status(400).json({ 
        success: false, 
        message: 'Class is full' 
      });
    }

    // Update class
    classToEnroll.enrolledStudents.push(userId);
    await classToEnroll.save();

    // Update user
    user.enrolledCourses = user.enrolledCourses || []; // Ensure array exists
    user.enrolledCourses.push(classId);
    await user.save();

    console.log('Successfully enrolled user:', { classId, userId });
    return res.status(200).json({ 
      success: true, 
      message: 'Successfully enrolled in class',
      isEnrolled: true
    });
  } catch (error) {
    console.error('Error in enrollInClass:', error);
    // If there's an error, try to rollback the changes
    try {
      if (classId && userId) {
        await classModel.updateOne(
          { _id: classId },
          { $pull: { enrolledStudents: userId } }
        );
        await userModel.updateOne(
          { _id: userId },
          { $pull: { enrolledCourses: classId } }
        );
      }
    } catch (rollbackError) {
      console.error('Error during rollback:', rollbackError);
    }
    return res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
}

export async function getEnrolledClasses(req, res) {
  try {
    const userId = req.user._id;
    console.log('Fetching enrolled classes for user:', userId);

    const user = await userModel
      .findById(userId)
      .populate({
        path: 'enrolledCourses',
        populate: {
          path: 'instructor',
          select: 'name email',
          model: 'User'
        }
      });

    if (!user) {
      console.log('User not found:', userId);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Map enrolled classes to ensure consistent instructor data
    const formattedClasses = (user.enrolledCourses || []).map(classItem => {
      const { _doc } = classItem;
      return {
        ..._doc,
        instructor: _doc.instructor || {
          name: 'Not assigned',
          email: ''
        }
      };
    });

    console.log(`Found ${formattedClasses.length} enrolled classes`);
    return res.status(200).json({
      success: true,
      data: formattedClasses
    });
  } catch (error) {
    console.error('Error in getEnrolledClasses:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

export async function addLecture(req, res) {
  try {
    const classId = req.params.id;
    const lecture = req.body;

    const updatedClass = await classModel.findByIdAndUpdate(
      classId,
      { $push: { lectures: lecture } },
      { new: true, runValidators: true }
    );

    if (!updatedClass) {
      return res.status(404).send({ success: false, message: 'Class not found' });
    }

    res.status(200).send({ 
      success: true, 
      message: 'Lecture added successfully',
      data: updatedClass.lectures[updatedClass.lectures.length - 1]
    });
  } catch (error) {
    console.error('Error in addLecture:', error);
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function getLectures(req, res) {
  try {
    const classId = req.params.id;
    const userId = req.user._id;

    const classDoc = await classModel.findById(classId);
    
    if (!classDoc) {
      return res.status(404).send({ success: false, message: 'Class not found' });
    }

    // Check if user is enrolled in the class
    if (!classDoc.enrolledStudents.includes(userId) && 
        classDoc.instructor.toString() !== userId.toString()) {
      return res.status(403).send({ 
        success: false, 
        message: 'You must be enrolled in this class to view lectures' 
      });
    }

    res.status(200).send({ 
      success: true, 
      data: classDoc.lectures 
    });
  } catch (error) {
    console.error('Error in getLectures:', error);
    res.status(400).json({ success: false, message: error.message });
  }
}
