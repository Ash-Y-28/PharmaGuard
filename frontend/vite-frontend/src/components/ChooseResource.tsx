import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import './ChooseResource.css';

const ChooseResource: React.FC = () => {
  const navigate = useNavigate();
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
        <h1>Welcome to PharmaGuard</h1>
        <p>You are logged in. Please choose the resource to search for drug interactions.</p>
      </header>
  
      {/* Cards Section */}
      <section className="cards-container">
        <div
          className="resource-card"
          onClick={() => handleResourceClick("Stanford Drug Database")}
        >
          <div className="card-header">
            <h3>Stanford Drug Database</h3>
            <i className="fas fa-database"></i>
          </div>
          <p>Access a reliable and comprehensive database of drug interactions, curated by experts.</p>
        </div>
  
        <div
          className="resource-card"
          onClick={() => handleResourceClick("FDA API")}
        >
          <div className="card-header">
            <h3>FDA Drug Database</h3>
            <i className="fas fa-globe"></i>
          </div>
          <p>Explore drug interactions and warnings directly from the FDA database with detailed insights.</p>
        </div>
      </section>
  
      {/* Footer Section */}
      <footer className="choose-footer">
        <div className="user-dropdown">
          <span>👤 User</span>
          <ul>
            <li onClick={handleLogout}>Logout</li>
          </ul>
        </div>
        <p>&copy; 2025 PharmaGuard. All rights reserved.</p>
      </footer>
    </div>
  );
}
export default ChooseResource;