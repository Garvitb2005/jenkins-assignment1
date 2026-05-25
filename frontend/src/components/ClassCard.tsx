import React from 'react';
import { useAuth } from '../context/AuthContext';

interface ClassCardProps {
  classItem: {
    _id: string;
    title: string;
    description: string;
    instructor: {
      name: string;
      email: string;
    } | null;
    duration: string;
    price: number;
    maxStudents: number;
    enrolledStudents: string[];
    category: string;
    status: string;
  };
  onEnroll: (classId: string) => void;
  isAuthenticated: boolean;
}

const ClassCard: React.FC<ClassCardProps> = ({
  classItem,
  onEnroll,
  isAuthenticated,
}) => {
  const { user } = useAuth();
  const {
    _id,
    title,
    description,
    instructor,
    duration,
    price,
    maxStudents,
    enrolledStudents = [],
    category,
  } = classItem;

  const isEnrolled = user && enrolledStudents.includes(user._id);

  const handleButtonClick = () => {
    if (!isEnrolled) {
      onEnroll(_id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          <span className="px-2 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800">
            {category}
          </span>
        </div>
        <p className="text-gray-600 mb-4">{description}</p>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500">Instructor</p>
            <p className="font-medium text-gray-800">{instructor?.name || 'Not assigned'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Duration</p>
            <p className="font-medium text-gray-800">{duration}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Enrolled</p>
            <p className="font-medium text-gray-800">{enrolledStudents.length}/{maxStudents}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Price</p>
            <p className="font-medium text-gray-800">₹{price}</p>
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={handleButtonClick}
            disabled={isEnrolled || !isAuthenticated}
            className={`w-full py-2 px-4 rounded-md font-medium transition-colors duration-200 ${
              isEnrolled
                ? 'bg-green-500 text-white cursor-default'
                : isAuthenticated
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isEnrolled ? 'Enrolled' : isAuthenticated ? 'Enroll Now' : 'Login to Enroll'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClassCard;
