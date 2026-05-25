import { useState } from 'react';
import './CreateAssignment.css';
import { getAuth } from 'firebase/auth';

const CreateAssignment = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
  });
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [responseMessage, setResponseMessage] = useState('');

  // Handle form data change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle PDF file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
    } else {
      alert('Please upload a valid PDF file.');
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      alert('You are not logged in!');
      return;
    }

    try {
      const token = await currentUser.getIdToken();
      const formDataWithFile = new FormData();
      formDataWithFile.append('title', formData.title);
      formDataWithFile.append('description', formData.description);
      formDataWithFile.append('dueDate', formData.dueDate);
      formDataWithFile.append('instructor', currentUser.uid);

      if (pdfFile) {
        formDataWithFile.append('pdf', pdfFile);
      }

      const response = await fetch('http://localhost:8000/api/assignments/', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`, // Pass Firebase token for authentication
        },
        body: formDataWithFile,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to parse error message' }));
        setResponseMessage(`Error: ${errorData.message || 'Unknown error'}`);
        return;
      }

      const data = await response.json();
      if (data) {
        setResponseMessage('Assignment created successfully!');
      } else {
        setResponseMessage('Unexpected response format.');
      }
    } catch (error) {
      setResponseMessage(`Error: ${error instanceof Error ? error.message : 'An unknown error occurred'}`);
    }
  };

  return (
    <div className="create-assignment-container">
      <h1>Create a New Assignment</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Assignment Title:</label>
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
          <label htmlFor="dueDate">Due Date:</label>
          <input
            type="date"
            id="dueDate"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="pdf">PDF Upload (Assignment File):</label>
          <input
            type="file"
            id="pdf"
            name="pdf"
            accept="application/pdf"
            onChange={handleFileChange}
            required
          />
        </div>
        <button type="submit">Create Assignment</button>
      </form>

      {responseMessage && (
        <div className="response-message">
          {responseMessage}
        </div>
      )}
    </div>
  );
};

export default CreateAssignment;
