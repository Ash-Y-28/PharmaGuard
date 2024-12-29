import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const VerifyOTP: React.FC = () => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post("http://127.0.0.1:5003/verify_otp", {
        otp,
      });

      if (response.status === 200) {
        alert("OTP verified successfully! Signup complete.");
        navigate("/login");
      }
    } catch (err: any) {
      setError(err.response?.data || "OTP verification failed. Please try again.");
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "400px", margin: "0 auto" }}>
      <h1>Verify OTP</h1>
      <p>Please check your email for the OTP and enter it below to complete your registration.</p>
      <form onSubmit={handleVerifyOTP}>
        <div>
          <label>Enter OTP</label>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
        </div>
        <button type="submit">Verify</button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>
    </div>
  );
};

export default VerifyOTP;
