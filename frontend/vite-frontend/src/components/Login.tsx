import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";

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

      // Trigger the shake animation on the form
      const loginForm = document.getElementById("login-form");
      if (loginForm) {
        loginForm.classList.add("error-shake");
        setTimeout(() => loginForm.classList.remove("error-shake"), 500); // Remove class after animation
      }
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
    <>
      <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto", position: "relative", zIndex: 1 }}>
        {/* Header Section */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <h1 style={{ fontSize: "2.5rem", marginBottom: "10px" }}>PharmaGuard</h1>
          <p
            style={{
              fontSize: "1.2rem",
              color: "rgba(255, 255, 255, 0.9)", // Brighter color for visibility
              textShadow: "1px 1px 3px rgba(0, 0, 0, 0.8)",
            }}
          >
            Welcome to PharmaGuard, your trusted source for drug interaction and safety information.
          </p>
        </div>

        {/* Login Form */}
        <h2>Login</h2>
        <form onSubmit={handleLogin} id="login-form">
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
        <footer
          style={{
            marginTop: "30px",
            textAlign: "center",
            fontSize: "0.9rem",
            color: "#aaaaaa",
            borderTop: "2px solid",
            borderImage: "linear-gradient(to right, #61dafb, #007bff) 1",
            paddingTop: "10px",
          }}
        >
          <p>&copy; 2025 PharmaGuard. All rights reserved.</p>
          <div style={{ marginTop: "10px" }}>
            <a
              href="https://github.com/Ash-Y-28/PharmaGuard"
              target="_blank"
              rel="noopener noreferrer"
              style={{ margin: "0 10px", color: "#61dafb", fontSize: "1.5rem", transition: "all 0.3s ease" }}
              className="footer-icon"
            >
              <FontAwesomeIcon icon={faGithub} />
            </a>
            <a
              href="mailto:team.pharmaguard@gmail.com"
              style={{ margin: "0 10px", color: "#007bff", fontSize: "1.5rem", transition: "all 0.3s ease" }}
              className="footer-icon"
            >
              <FontAwesomeIcon icon={faEnvelope} />
            </a>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Login;
