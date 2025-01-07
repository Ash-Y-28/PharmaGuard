import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './ChooseResource.css';
import GuardIcon from '../assets/security.png';

const ChooseResource: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState<string | null>(null);
  useEffect(() => {
    // Fetch the username from session storage
    const user = sessionStorage.getItem("username");
    if (user) {
      setUsername(user); // Set username if a legit user is logged in
    } else {
      setUsername("Guest"); // Default to "Guest"
    }
  });
  
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  const handleResourceClick = (resource: string) => {
    sessionStorage.setItem("selectedResource", resource);
    alert(`You selected: ${resource}`);
    navigate("/drug_search");
  };

  const handleLogout = () => {
    sessionStorage.clear();
    alert("Logged out successfully!");
    navigate("/login");
  };

  return (
    <div className="choose-resource-root">
      {/* Header Section */}
      <header className="choose-header">
      <h1 className="header-with-icon no-underline">
        Welcome to <span className="pharmaguard-text">PharmaGuard</span>
        <img src={GuardIcon} alt="PharmaGuard Icon" className="guard-icon" />
      </h1>
        <p>You are logged in. Please choose the resource to search for drug interactions.</p>
      </header>

      {/* Cards Section */}
      <section className="cards-container">
        <div
          className="resource-card"
          onClick={() => handleResourceClick("Stanford Drug Database")}
        >
          <div className="card-header">
            <h3>Stanford Drug Database <i className="fas fa-database"></i></h3>
          </div>
          <p>Access a reliable and comprehensive database of drug interactions, curated by experts.</p>
        </div>

        <div
          className="resource-card"
          onClick={() => handleResourceClick("FDA API")}
        >
          <div className="card-header">
            <h3>FDA Drug Database <i className="fas fa-globe"></i> </h3>
          </div>
          <p>Explore drug interactions and warnings directly from the FDA database with detailed insights.</p>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="choose-footer">
        <div className="user-dropdown">
          <span>👤 {username}</span>
          <ul>
            <li onClick={handleLogout}>Logout</li>
          </ul>
        </div>
        <p>&copy; 2025 PharmaGuard. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default ChooseResource;