import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Signup: React.FC = () => {
  const [username, setUsername] = useState("");
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null
  );
  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([]);
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [emailExists, setEmailExists] = useState<boolean | null>(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Validate username availability
  const validateUsername = async (username: string) => {
    try {
      const response = await axios.get(
        `https://pharmaguard.onrender.com/check_username?username=${username}`
      );
      setUsernameAvailable(response.data.available);
      setUsernameSuggestions(response.data.suggestions || []);
    } catch (err) {
      console.error("Error validating username:", err);
      setUsernameAvailable(null);
    }
  };

  // Validate email availability
  const validateEmail = async (email: string) => {
    try {
      const response = await axios.get(
        `https://pharmaguard.onrender.com/check_email?email=${email}`
      );
      setEmailExists(response.data.exists);
    } catch (err) {
      console.error("Error validating email:", err);
      setEmailExists(null);
    }
  };

  // Handle signup
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
        const response = await fetch("https://pharmaguard.onrender.com/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password, email })
        });
        const data = await response.json();

        if (response.ok) {
            const token = data.token;
            console.log("JWT Token:", token);

            // Store token in sessionStorage
            window.sessionStorage.setItem("jwt_token", token);

            // Redirect to verify OTP page
            alert("OTP sent to the email.Please enter your OTP to complete signup!");
            navigate("/verify_otp");
        } else {
            setError(data.error || "Failed to register.");
        }
    } catch (err) {
        console.error("Error during register:", err);
        setError("An error occurred during registration. Please try again.");
    }
};


  return (
    <div style={{ padding: "20px", maxWidth: "400px", margin: "0 auto" }}>
      <h1>Create an Account</h1>
      <form onSubmit={handleSignup}>
        <div>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              validateUsername(e.target.value);
            }}
            required
          />
          {usernameAvailable === true && (
            <span style={{ color: "green" }}>Username is available</span>
          )}
          {usernameAvailable === false && (
            <span style={{ color: "red" }}>
              Username is taken. Suggestions:{" "}
              {usernameSuggestions.map((suggestion, index) => (
                <span key={index} style={{ marginLeft: "5px" }}>
                  {suggestion}
                </span>
              ))}
            </span>
          )}
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
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              validateEmail(e.target.value);
            }}
            required
          />
          {emailExists === true && (
            <span style={{ color: "red" }}>
              Email is already registered. Try logging in.
            </span>
          )}
          {emailExists === false && (
            <span style={{ color: "green" }}>Email is available</span>
          )}
        </div>
        <button type="submit" disabled={emailExists === true}>
          Sign Up
        </button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>
    </div>
  );
};

export default Signup;