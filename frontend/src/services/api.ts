import axios from 'axios';
import { auth } from '../config/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, User } from 'firebase/auth';

const API_URL = 'http://localhost:8000/api';

interface LoginResponse {
  user: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  token: string;
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use(async (config) => {
  try {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return config;
  }
}, (error) => {
  return Promise.reject(error);
});

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await api.post('/users/login', {
      email,
      password
    });

    if (response.data.user && response.data.token) {
      // Set default auth header for future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      return response.data;
    } else {
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.error('Login API error:', error);
    throw error;
  }
};

export const register = async (userData: any) => {
  try {
    const response = await api.post('/users/register', userData);
    return response.data;
  } catch (error) {
    console.error('Register API error:', error);
    throw error;
  }
};

export const createCourse = async (courseData: any) => {
  try {
    const response = await api.post('/courses', courseData);
    return response.data;
  } catch (error) {
    console.error('Create course API error:', error);
    throw error;
  }
};

export const createAssignment = async (assignmentData: any) => {
  try {
    const response = await api.post('/assignments', assignmentData);
    return response.data;
  } catch (error) {
    console.error('Create assignment API error:', error);
    throw error;
  }
};

export const getCourses = async () => {
  try {
    const response = await api.get('/courses');
    return response.data;
  } catch (error) {
    console.error('Get courses API error:', error);
    throw error;
  }
};

export const getAssignments = async () => {
  try {
    const response = await api.get('/assignments');
    return response.data;
  } catch (error) {
    console.error('Get assignments API error:', error);
    throw error;
  }
};

export const getClasses = async () => {
  try {
    const response = await api.get('/classes');
    return response.data;
  } catch (error) {
    console.error('Error fetching classes:', error);
    return { success: false, message: 'Failed to fetch classes' };
  }
};

export const enrollInClass = async (classId: string) => {
  try {
    console.log('Enrolling in class...');
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }
    const token = await user.getIdToken();
    const response = await api.post(`/classes/${classId}/enroll`, {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('Enroll response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error enrolling in class:', error);
    throw error;
  }
};

export const createClass = async (classData: any) => {
  try {
    console.log('Creating class...');
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }
    const token = await user.getIdToken();
    const response = await api.post('/classes', classData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('Create class response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating class:', error);
    throw error;
  }
};

export const getLectures = async (classId: string) => {
  try {
    console.log('Fetching lectures...');
    const token = localStorage.getItem('token');
    const response = await api.get(`classes/${classId}/lectures`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch lectures, status: ${response.status}`);
    }
    
    console.log('Lectures response:', response.data);
    const data = await response.data;
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const addLecture = async (classId: string, lectureData: {
  title: string;
  description: string;
  videoUrl: string;
  duration: string;
}) => {
  try {
    console.log('Adding lecture...');
    const token = localStorage.getItem('token');
    const response = await api.post(`classes/${classId}/lectures`, lectureData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to add lecture, status: ${response.status}`);
    }
    
    console.log('Add lecture response:', response.data);
    const data = await response.data;
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const updateFcmToken = async (fcmToken: string) => {
  try {
    const response = await api.post('/users/update-fcm-token', { fcmToken });
    return response.data;
  } catch (error) {
    console.error('Error updating FCM token:', error);
    throw error;
  }
};

export default api;