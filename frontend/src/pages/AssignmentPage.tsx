// AssignmentPage.tsx

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from '../config/firebase';
import './AssignmentPage.css';

interface Assignment {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  pdfUrl?: string;
  instructor?: {
    name: string;
    email: string;
  };
}

const AssignmentPage = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [file, setFile] = useState<File | null>(null); // Track file for submission
  const { user } = useAuth(); // Get user info
  const navigate = useNavigate(); // Hook to navigate

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        
        const response = await fetch('http://localhost:8000/api/assignments/', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`, // Include token in headers
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch assignments');
        }

        const data: Assignment[] = await response.json();
        setAssignments(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unexpected error occurred.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  const handleCreateAssignment = () => {
    navigate('/create-assignment'); // Navigate to create assignment page
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmitAssignment = async (assignmentId: string) => {
    if (!file) {
      alert('Please select a file to submit.');
      return;
    }

    if (!auth.currentUser) {
      alert('You are not logged in. Please log in to submit an assignment.');
      navigate('/login');
      return;
    }

    try {
      // Get a fresh token
      const token = await auth.currentUser.getIdToken(true);
      console.log('Fresh Firebase ID token obtained');

      const formData = new FormData();
      formData.append('pdf', file);

      console.log('Submitting assignment with token:', token);
      const response = await fetch(`http://localhost:8000/api/assignments/${assignmentId}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Assignment submission error:', errorData);
        throw new Error(errorData.message || 'Failed to submit assignment');
      }

      const responseData = await response.json();
      console.log('Assignment submission response:', responseData);
      alert('Assignment submitted successfully!');
      setFile(null);
      window.location.reload();
    } catch (err) {
      console.error('Error submitting assignment:', err);
      if (err instanceof Error) {
        alert(err.message);
      }
    }
  };

  if (loading) {
    return <p className="loading">Loading assignments...</p>;
  }

  if (error) {
    return <p className="error">{error}</p>;
  }

  return (
    <div className="assignment-page">
      <h1>Assignments</h1>

      {/* Show the "Create New Assignment" button only if the user is an instructor */}
      {user?.role === 'instructor' && (
        <button className="new-assignment-button" onClick={handleCreateAssignment}>
          Create New Assignment
        </button>
      )}

      {assignments.length === 0 ? (
        <p className="no-assignments">No assignments available.</p>
      ) : (
        <div className="assignment-list">
          {assignments.map((assignment) => (
            <div key={assignment._id} className="assignment-item">
              <h2>{assignment.title}</h2>
              <p>{assignment.description}</p>
              <p>
                <strong>Due Date:</strong>{' '}
                {assignment.dueDate
                  ? new Date(assignment.dueDate).toLocaleDateString()
                  : 'No due date specified'}
              </p>
              <p>
                <strong>Instructor:</strong>{' '}
                {assignment.instructor?.name || 'Unknown'} ({assignment.instructor?.email || 'No email'})
              </p>
              {assignment.pdfUrl ? (
                <a href={`http://localhost:8000${assignment.pdfUrl}`} target="_blank" rel="noopener noreferrer" className="view-pdf">
                  View Assignment
                </a>
              ) : (
                <p className="no-pdf">No PDF available for this assignment.</p>
              )}

              {/* Show the "Submit Assignment" button only if the user is a student */}
              {user?.role === 'student' && (
                <>
                  <input type="file" onChange={handleFileChange} />
                  <button
                    className="submit-assignment-button"
                    onClick={() => handleSubmitAssignment(assignment._id)}
                  >
                    Submit Assignment
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssignmentPage;
