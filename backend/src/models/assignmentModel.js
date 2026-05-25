import mongoose from "mongoose";

// Define the Assignment schema
const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    dueDate: {
      type: String,
      required: true,
    },
    pdfUrl: {
      type: String, // URL or path to the uploaded PDF
      required: false,
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Reference to the User model (Instructor)
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Create the Assignment model
const assignmentModel = mongoose.model('Assignment', assignmentSchema);

export default assignmentModel