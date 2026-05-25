import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';
import classModel from '../models/classModel.js';
import userModel from '../models/userModel.js'; // Import userModel

dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_kabcAk4bD3sobU',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'your_razorpay_secret'
});

export const createOrder = async (req, res) => {
  try {
    const { amount, classId } = req.body;

    // Verify class exists and user is not already enrolled
    const classDoc = await classModel.findById(classId);
    if (!classDoc) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    if (classDoc.enrolledStudents.includes(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'Already enrolled in this class'
      });
    }

    // Create Razorpay order
    const options = {
      amount: amount,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order'
    });
  }
};

export const validateOrder = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      classId
    } = req.body;

    // Verify the payment signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'your_razorpay_secret')
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    // Enroll user in the class
    const updatedClass = await classModel.findByIdAndUpdate(
      classId,
      {
        $addToSet: { enrolledStudents: req.user._id }
      },
      { new: true }
    );

    if (!updatedClass) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    // Update user's enrolledCourses
    await userModel.findByIdAndUpdate(
      req.user._id,
      {
        $addToSet: { enrolledCourses: classId }
      },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Payment verified and enrollment successful'
    });
  } catch (error) {
    console.error('Error validating order:', error);
    res.status(500).json({
      success: false,
      message: 'Error validating order'
    });
  }
};
