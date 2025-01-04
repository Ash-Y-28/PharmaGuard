import React from "react";
import { useNavigate } from "react-router-dom";
import './ChooseResource.css';

const ChooseResource: React.FC = () => {
  const navigate = useNavigate();

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
        <h1>Welcome to PharmaGuard</h1>
        <p>You are logged in. Please choose the resource to search for drug interactions.</p>
      </header>

      {/* Cards Section */}
      <section className="cards-container">
        <div
          className="resource-card"
          onClick={() => handleResourceClick("Stanford Drug Database")}
        >
          <h3>Stanford Drug Database</h3>
          <p>Access a reliable and comprehensive database of drug interactions, curated by experts.</p>
        </div>

        <div
          className="resource-card"
          onClick={() => handleResourceClick("FDA API")}
        >
          <h3>FDA Drug Database</h3>
          <p>Explore drug interactions and warnings directly from the FDA database with detailed insights.</p>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="choose-footer">
        <div className="user-dropdown">
          <span>👤 User Menu</span>
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
