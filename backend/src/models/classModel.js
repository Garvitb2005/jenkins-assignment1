import mongoose from 'mongoose';

const classSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a class title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide a class description']
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  duration: {
    type: String,
    required: [true, 'Please provide class duration']
  },
  price: {
    type: Number,
    required: [true, 'Please provide class price']
  },
  maxStudents: {
    type: Number,
    required: [true, 'Please provide maximum number of students']
  },
  enrolledStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  lectures: [{
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    videoUrl: {
      type: String,
      required: true
    },
    duration: {
      type: String,
      required: true
    }
  }],
  category: {
    type: String,
    required: [true, 'Please provide a category']
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed'],
    default: 'upcoming'
  }
}, {
  timestamps: true
});

const classModel = mongoose.model('Class', classSchema);
export default classModel;