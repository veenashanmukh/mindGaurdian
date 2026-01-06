import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser, loginUser, usernameExists } from "../services/authService";
import { useUser } from "../context/UserContext";
import "../styles/AuthPage.css";

// ============================================================
// Authentication Page - Anonymous Username/Password
// ============================================================
// Purpose: Login and registration UI for anonymous users
// Features: Username uniqueness check, password validation
// Note: No email required — truly anonymous experience
// ============================================================

export default function AuthPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [usernameCheckLoading, setUsernameCheckLoading] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);

  const { setUser } = useUser();
  const navigate = useNavigate();

  // Check username availability in real-time (register mode only)
  const handleUsernameChange = async (e) => {
    const newUsername = e.target.value;
    setUsername(newUsername);
    setError("");

    if (isRegister && newUsername.length >= 3) {
      setUsernameCheckLoading(true);
      try {
        const exists = await usernameExists(newUsername);
        setUsernameAvailable(!exists);
      } catch (err) {
        setUsernameAvailable(null);
      } finally {
        setUsernameCheckLoading(false);
      }
    } else {
      setUsernameAvailable(null);
    }
  };

  // Validate inputs
  const validateInputs = () => {
    if (!username.trim()) {
      setError("Username is required");
      return false;
    }
    if (username.length < 3) {
      setError("Username must be at least 3 characters");
      return false;
    }
    if (!password) {
      setError("Password is required");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    if (isRegister && password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    if (isRegister && usernameAvailable === false) {
      setError("Username is already taken");
      return false;
    }
    return true;
  };

  // Handle registration
  const handleRegister = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    setError("");
    try {
      const result = await registerUser(username, password);
      if (result.success) {
        setUser(result.user);
        navigate("/dashboard");
      } else {
        setError(result.error || "Registration failed");
      }
    } catch (err) {
      setError(err.message || "Registration error");
    } finally {
      setLoading(false);
    }
  };

  // Handle login
  const handleLogin = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    setError("");
    try {
      const result = await loginUser(username, password);
      if (result.success) {
        setUser(result.user);
        navigate("/dashboard");
      } else {
        setError(result.error || "Login failed");
      }
    } catch (err) {
      setError(err.message || "Login error");
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isRegister) {
      handleRegister();
    } else {
      handleLogin();
    }
  };

  // Toggle between login and register modes
  const toggleMode = () => {
    setIsRegister(!isRegister);
    setUsername("");
    setPassword("");
    setConfirmPassword("");
    setError("");
    setUsernameAvailable(null);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Logo/Header */}
        <div className="auth-header">
          <h1>🧠 mindGuardian</h1>
          <p>Your Personal Mental Health Companion</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          {/* Username Input */}
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <div className="input-wrapper">
              <input
                id="username"
                type="text"
                placeholder="Choose a unique username"
                value={username}
                onChange={handleUsernameChange}
                disabled={loading}
                minLength={3}
                maxLength={20}
                autoFocus
              />
              {isRegister && usernameCheckLoading && <span className="check-indicator">✓ Checking...</span>}
              {isRegister && usernameAvailable === true && (
                <span className="check-indicator available">✓ Available</span>
              )}
              {isRegister && usernameAvailable === false && (
                <span className="check-indicator taken">✗ Taken</span>
              )}
            </div>
          </div>

          {/* Password Input */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter a strong password (6+ chars)"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              disabled={loading}
              minLength={6}
            />
          </div>

          {/* Confirm Password (Register Only) */}
          {isRegister && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError("");
                }}
                disabled={loading}
                minLength={6}
              />
            </div>
          )}

          {/* Error Message */}
          {error && <div className="error-message">{error}</div>}

          {/* Submit Button */}
          <button type="submit" className="submit-btn" disabled={loading || (isRegister && usernameAvailable === false)}>
            {loading ? "Processing..." : isRegister ? "Create Account" : "Login"}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="auth-toggle">
          <p>
            {isRegister ? "Already have an account?" : "New to mindGuardian?"}
            <button type="button" onClick={toggleMode} disabled={loading} className="toggle-btn">
              {isRegister ? "Login" : "Create Account"}
            </button>
          </p>
        </div>

        {/* Anonymous Note */}
        <div className="auth-note">
          <p>🔐 Your username keeps you anonymous. No email, no tracking.</p>
        </div>
      </div>
    </div>
  );
}
