import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import "./Login.css";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config/firebase";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Firebase sign-in
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const firebaseUser = userCredential.user;

      // Get Firebase ID token
      const idToken = await firebaseUser.getIdToken();
      console.log(
        "DEBUG: Firebase idToken (truncated):",
        idToken?.slice?.(0, 50),
      );

      // Send token to backend
      const response = await fetch("http://localhost:8000/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ email }),
      });

      console.log("DEBUG: backend /login response status:", response.status);
      if (!response.ok) {
        throw new Error("Login failed");
      }

      const data = await response.json();
      console.log("DEBUG: backend /login response body:", data);
      console.log("Login response:", data);

      // Store user data
      const userData = {
        _id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role,
      };

      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", idToken);

      // Update auth context
      setUser(userData);

      // Show success message
      toast.success("Login successful!");

      // Navigate to home immediately, then after 5s redirect to role destination if different
      const destination =
        userData.role === "instructor" ? "/create-course" : "/";
      navigate("/");
      if (destination !== "/") {
        setTimeout(() => navigate(destination), 5000);
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Login failed");
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
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
        <button type="submit" className="submit-btn">
          Login
        </button>
        <div className="redirect-container">
          <span>Don't have an account? </span>
          <a href="/register" className="redirect-link">
            Register
          </a>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
