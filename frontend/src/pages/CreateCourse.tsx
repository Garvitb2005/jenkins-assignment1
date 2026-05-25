// src/components/CreateCourse.js
import { useState } from 'react';
import './CreateCourse.css';
import { getAuth } from "firebase/auth";

const CreateCourse = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
    price: '',
    maxStudents: '',
    category: ''
  });

  const [responseMessage, setResponseMessage] = useState('');

  // Handle form data change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e:React.FormEvent) => {
    e.preventDefault();

    // Get the token from localStorage (assuming user is authenticated)
  const auth = getAuth();
  const currentUser = auth.currentUser;

  if (!currentUser) {
    alert('You are not logged in!');
    return;
  }


    try {
      const token = await currentUser.getIdToken();
      console.log('Firebase Token:', token);
      const response = await fetch('http://localhost:8000/api/classes/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`  // Pass Firebase token for authentication
        },
        body: JSON.stringify(formData)
      });

      

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to parse error message' }));
        setResponseMessage(`Error: ${errorData.message || 'Unknown error'}`);
        return;
      }
      const data = await response.json();
      if (data) {
        setResponseMessage('Course created successfully!');
      } else {
        setResponseMessage('Unexpected response format.');
      }
    } catch (error: unknown) {
        if (error instanceof Error) {
          // Now TypeScript knows error is of type 'Error'
          setResponseMessage(`Error: ${error.message}`);
        } else {
          // Handle the case where the error is not an instance of Error
          setResponseMessage('An unknown error occurred');
        }
      }
      
  };

  return (
    <div className="create-course-container">
      <h1>Create a New Course</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Course Title:</label>
          <input 
            type="text" 
            id="title" 
            name="title" 
            value={formData.title} 
            onChange={handleChange} 
            required 
          />
        </div>
        <div>
          <label htmlFor="description">Description:</label>
          <textarea 
            id="description" 
            name="description" 
            value={formData.description} 
            onChange={handleChange} 
            required 
          ></textarea>
        </div>
        <div>
          <label htmlFor="duration">Duration (in hours):</label>
          <input 
            type="number" 
            id="duration" 
            name="duration" 
            value={formData.duration} 
            onChange={handleChange} 
            required 
          />
        </div>
        <div>
          <label htmlFor="price">Price:</label>
          <input 
            type="number" 
            id="price" 
            name="price" 
            value={formData.price} 
            onChange={handleChange} 
            required 
          />
        </div>
        <div>
          <label htmlFor="maxStudents">Max Students:</label>
          <input 
            type="number" 
            id="maxStudents" 
            name="maxStudents" 
            value={formData.maxStudents} 
            onChange={handleChange} 
            required 
          />
        </div>
        <div>
          <label htmlFor="category">Category:</label>
          <input 
            type="text" 
            id="category" 
            name="category" 
            value={formData.category} 
            onChange={handleChange} 
            required 
          />
        </div>
        <button type="submit">Create Course</button>
      </form>

      {responseMessage && (
        <div className="response-message">
          {responseMessage}
        </div>
      )}
    </div>
  );
};

export default CreateCourse;
