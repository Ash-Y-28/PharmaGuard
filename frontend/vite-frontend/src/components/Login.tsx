import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Loading state for login
  const [guestLoading, setGuestLoading] = useState(false); // Loading state for guest login
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true); // Start loading animation for login

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const response = await axios.post(
        "http://127.0.0.1:5003/login",
        { username, password },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.status === 200) {
        const token = response.data.token;

        // Store the JWT in sessionStorage
        window.sessionStorage.setItem("jwt_token", token);

        // Navigate to choose_resource
        navigate("/choose_resource");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Login failed. Please try again.");
    } finally {
      setLoading(false); // Stop loading animation
    }
  };

  const handleGuestLogin = async () => {
    setError("");
    setGuestLoading(true); // Start loading animation for guest login

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const response = await axios.post(
        "http://127.0.0.1:5003/guest_login",
        {},
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.status === 200) {
        const token = response.data.token;

        // Store the JWT in sessionStorage
        window.sessionStorage.setItem("jwt_token", token);

        // Navigate to choose_resource
        navigate("/choose_resource");
      }
    } catch (err: any) {
      setError("Guest login failed. Please try again.");
    } finally {
      setGuestLoading(false); // Stop loading animation
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      {/* Header Section */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <h1 style={{ fontSize: "2.5rem", marginBottom: "10px" }}>PharmaGuard</h1>
        <p style={{ fontSize: "1.2rem", color: "#555" }}>
          Welcome to PharmaGuard, your trusted source for drug interaction and safety information.
        </p>
      </div>

      {/* Login Form */}
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="primary" disabled={loading}>
          {loading ? <div className="spinner"></div> : "Login"}
        </button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>

      <button
        onClick={handleGuestLogin}
        className="secondary"
        disabled={guestLoading}
        style={{
          marginTop: "10px",
          padding: "10px 20px",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        {guestLoading ? <div className="spinner"></div> : "Guest Login"}
      </button>
      <p style={{ marginTop: "10px" }}>
        Don't have an account? <Link to="/signup">Sign up here</Link>
      </p>

      {/* Footer Section */}
      <footer style={{ marginTop: "30px", textAlign: "center", fontSize: "0.9rem", color: "#888" }}>
        &copy; 2024 PharmaGuard. All rights reserved.
      </footer>
    </div>
  );
};

export default Login;
