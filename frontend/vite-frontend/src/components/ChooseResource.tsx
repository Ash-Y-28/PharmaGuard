import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ChooseResource: React.FC = () => {
  const [resource, setResource] = useState("Stanford Drug Database");
  const navigate = useNavigate();

  const handleContinue = () => {
    // Store the selected resource and navigate to the next page
    sessionStorage.setItem("selectedResource", resource);
    alert(`You selected: ${resource}`);
    // Navigate to the next page where the resource will be used
    navigate("/next_page"); // Update this to your next page route
  };

  const handleLogout = () => {
    // Clear session storage or any other user data
    sessionStorage.clear();
    alert("Logged out successfully!");
    navigate("/login"); // Redirect to the login page
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h1>Welcome to PharmaGuard</h1>
      <p>You are logged in. Please choose the resource to search for drug interactions.</p>
      
      <div style={{ marginBottom: "20px" }}>
        <label htmlFor="resource" style={{ marginRight: "10px" }}>
          Choose Resource:
        </label>
        <select
          id="resource"
          value={resource}
          onChange={(e) => setResource(e.target.value)}
          style={{ padding: "5px", borderRadius: "5px" }}
        >
          <option value="Stanford Drug Database">Stanford Drug Database</option>
          <option value="FDA API">FDA Drug Database</option>
        </select>
        <button
          onClick={handleContinue}
          style={{
            marginLeft: "10px",
            backgroundColor: "#007BFF",
            color: "white",
            border: "none",
            padding: "5px 10px",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Continue
        </button>
      </div>

      <button
        onClick={handleLogout}
        style={{
          backgroundColor: "red",
          color: "white",
          border: "none",
          padding: "5px 10px",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Logout
      </button>
    </div>
  );
};

export default ChooseResource;
