import { FormEvent, useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config/firebase";
import "./Register.css";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // Register user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      // Get the Firebase ID Token
      const token = await user.getIdToken();
      console.log(token);
      console.log(
        "DEBUG: Firebase idToken (truncated):",
        token?.slice?.(0, 50),
      );

      // Send the registration data (including firebaseUid) to the backend
      const apiBase =
        (import.meta as any).env?.VITE_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiBase}/api/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Pass the token in the correct format
        },
        body: JSON.stringify({
          firebaseUid: user.uid, // Pass Firebase UID from the user object
          name,
          email,
          password,
          role: "student", // Default role
        }),
      });

      // Check if the response is okay
      console.log("DEBUG: backend /register response status:", response.status);
      const resBody = await response.json().catch(() => null);
      console.log("DEBUG: backend /register response body:", resBody);
      if (!response.ok) {
        throw new Error(`Backend error: ${response.statusText}`);
      }

      setSuccess("User registered successfully!");
      // Navigate to home immediately and stay there (no further redirect)
      navigate("/");
    } catch (err) {
      if (err instanceof Error) {
        setError(`Error: ${err.message}`);
      } else {
        setError("An unknown error occurred during registration");
      }
    } finally {
      setLoading(false); // Stop the loading spinner after completion
    }
  };

  return (
    <div className="register-container">
      <form onSubmit={handleRegister} className="register-form">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input-field"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-field"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-field"
          required
        />
        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
      </form>
    </div>
  );
};

export default Register;
