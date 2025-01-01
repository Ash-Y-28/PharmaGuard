import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import VerifyOTP from "./components/VerifyOTP";
import ChooseResource from "./components/ChooseResource"; // Import the ChooseResource component
import DrugSearch from "./components/DrugSearch";
import './App.css';


const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} /> {/* Redirect to login */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify_otp" element={<VerifyOTP />} />
        <Route path="/choose_resource" element={<ChooseResource />} /> {/* Add ChooseResource route */}
        <Route path="/drug_search" element={<DrugSearch />} />
      </Routes>
    </Router>
  );
};

export default App;