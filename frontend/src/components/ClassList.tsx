import React, { useEffect, useState } from 'react';
import { getClasses } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import ClassCard from './ClassCard';
import { useNavigate } from 'react-router-dom';
import { auth } from '../config/firebase';

interface Class {
  _id: string;
  title: string;
  description: string;
  instructor: {
    name: string;
    email: string;
  };
  duration: string;
  price: number;
  maxStudents: number;
  enrolledStudents: string[];
  category: string;
  status: string;
}

const ClassList: React.FC = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated, firebaseUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await getClasses();
      console.log('Fetched classes:', response);
      if (response.success) {
        setClasses(response.data || []);
      } else {
        toast.error('Failed to fetch classes');
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error('Failed to fetch classes');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (classItem: Class) => {
    if (!user || !isAuthenticated) {
      console.log('User not logged in, redirecting to login page');
      navigate('/login');
      return;
    }

    if (classItem.enrolledStudents.includes(user._id)) {
      toast.error('You are already enrolled in this course');
      return;
    }

    try {
      // Get the ID token from Firebase user
      if (!firebaseUser) {
        console.log('Firebase user not found, redirecting to login');
        navigate('/login');
        return;
      }

      const idToken = await firebaseUser.getIdToken();
      console.log('ID Token available:', !!idToken);

      // Create order for Razorpay
      const orderResponse = await fetch('http://localhost:8000/api/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          amount: Math.round(classItem.price * 100), // Convert to smallest currency unit (paise)
          classId: classItem._id
        })
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.message || 'Failed to create payment order');
      }

      const { success, order } = await orderResponse.json();
      if (!success || !order) {
        throw new Error('Failed to create payment order');
      }

      // Initialize Razorpay payment
      const options = {
        key: "rzp_test_kabcAk4bD3sobU",
        amount: order.amount,
        currency: order.currency,
        name: "ClassPlus",
        description: `Payment for ${classItem.title}`,
        order_id: order.id,
        handler: async function (response: any) {
          try {
            // Validate payment and complete enrollment
            const validationResponse = await fetch('http://localhost:8000/api/order/validate', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
              },
              body: JSON.stringify({
                ...response,
                classId: classItem._id
              })
            });

            const validationData = await validationResponse.json();
            
            if (validationData.success) {
              toast.success('Successfully enrolled in course!');
              // Refresh class list
              fetchClasses();
            } else {
              throw new Error(validationData.message || 'Payment validation failed');
            }
          } catch (error) {
            console.error('Error in payment validation:', error);
            toast.error('Failed to validate payment. Please contact support.');
          }
        },
        prefill: {
          name: user.name,
          email: user.email
        },
        theme: {
          color: "#4F46E5"
        }
      };

      // Initialize Razorpay
      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();

    } catch (error: any) {
      console.error('Error in payment process:', error);
      toast.error(error.message || 'Failed to process payment');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {user?.role === 'instructor' && (
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => navigate('/createCourse')}
            className="inline-flex items-center px-6 py-3 rounded-lg font-medium bg-indigo-500 text-white hover:bg-indigo-600 transition-colors duration-200"
          >
            Create New Course
          </button>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((classItem) => (
          <ClassCard
            key={classItem._id}
            classItem={classItem}
            onEnroll={() => handleEnroll(classItem)}
            isAuthenticated={isAuthenticated}
          />
        ))}
      </div>
    </div>
  );
};

export default ClassList;
