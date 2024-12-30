import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const VerifyOTP: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [otpInput, setOtpInput] = useState('');

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
        const token = window.sessionStorage.getItem("jwt_token"); // Get JWT from sessionStorage

        const response = await fetch("http://127.0.0.1:5003/verify_otp", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ otp: otpInput, token }) // Include token
        });

        const data = await response.json();

        if (response.ok) {
            alert("OTP verified successfully! Signup complete.");
            navigate("/login");
        } else {
            setError(data.error || "OTP verification failed. Please try again.");
        }
    } catch (err) {
        console.error("Error during OTP verification:", err);
        setError("An error occurred during OTP verification. Please try again.");
    }
};


  return (
    <div style={{ padding: "20px", maxWidth: "400px", margin: "0 auto" }}>
      <h1>Verify OTP</h1>
      <p>Please check your email for the OTP and enter it below to complete your registration.</p>
      <form onSubmit={handleVerifyOTP}>
        <div>
          <label>OTP</label>
          <input
            type="text"
            value={otpInput}
            onChange={(e) => setOtpInput(e.target.value)}
            required
          />
        </div>
        <button type="submit">Verify OTP</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default VerifyOTP;