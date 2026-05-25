import Razorpay from "razorpay";
import express from 'express';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { enrollInClass } from '../controllers/classController.js';
import { protect } from '../middleware/authMiddleware.js';

dotenv.config();

const router = express.Router();

router.post('/order', protect, async (req, res) => {
    try {
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });

        const { amount, classId } = req.body;
        
        // Ensure amount is a number and convert to integer
        const orderAmount = parseInt(amount);
        if (isNaN(orderAmount) || orderAmount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid amount"
            });
        }

        console.log('Creating order with amount:', orderAmount);

        const options = {
            amount: orderAmount,
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
            payment_capture: 1,
            notes: {
                classId: classId,
                userId: req.user._id
            }
        };

        console.log('Creating order with options:', options);
        const order = await razorpay.orders.create(options);
        console.log('Order created:', order);

        if (!order) {
            return res.status(500).json({
                success: false,
                message: "Error creating order"
            });
        }

        res.status(200).json({
            success: true,
            order
        });
    } catch (err) {
        console.error("Error occurred:", err);
        res.status(500).json({ 
            success: false,
            message: "Failed to create payment order",
            error: err.message 
        });
    }
});

router.post('/order/validate', protect, async (req, res) => {
    try {
        const { 
            razorpay_order_id, 
            razorpay_payment_id, 
            razorpay_signature,
            classId 
        } = req.body;

        console.log('Validating payment:', {
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
            classId: classId,
            userId: req.user._id
        });

        // Verify payment signature
        const sha = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
        sha.update(`${razorpay_order_id}|${razorpay_payment_id}`);
        const digest = sha.digest("hex");

        if (digest !== razorpay_signature) {
            console.log('Payment signature verification failed');
            return res.status(400).json({ 
                success: false,
                message: "Transaction is not legitimate" 
            });
        }

        // If payment is verified, enroll student in class
        if (!classId) {
            return res.status(400).json({
                success: false,
                message: "Class ID is required"
            });
        }

        try {
            console.log('Attempting to enroll student:', {
                classId: classId,
                userId: req.user._id
            });

            await enrollInClass({
                params: { id: classId },
                user: req.user
            }, res);

            // Don't send response here as enrollInClass will handle it
        } catch (enrollError) {
            console.error("Error enrolling student:", enrollError);
            return res.status(200).json({
                success: true,
                message: "Payment successful but enrollment failed. Please contact support.",
                orderId: razorpay_order_id,
                paymentId: razorpay_payment_id
            });
        }
    } catch (error) {
        console.error("Error in payment validation:", error);
        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                message: "Error validating payment",
                error: error.message
            });
        }
    }
});

export default router;
