import React, { useEffect, useState } from "react";
import "./DrugSearch.css";

interface FlipCardProps {
  category: string;         
  drugCombination: string;  
  events: { event: string; severity: string }[]; 
  severity?: string;       
  className?: string; // Add this line  
}

const FlipCard: React.FC<FlipCardProps> = ({ category, drugCombination, events, severity, className }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  const handleClick = () => {
    setIsFlipped((prev) => !prev);
  };

  const getSeverityClass = () => {
    switch (severity?.toLowerCase()) {
      case "low":
        return "severity-low";
      case "medium":
        return "severity-medium";
      case "high":
        return "severity-high";
      default:
        return "severity-default";
    }
  };

  const getCategoryIcon = () => {
    switch (category.toLowerCase()) {
      case "unlikely":
        return "fas fa-ban"; // Font Awesome Thumbs Up
      case "likely":
        return "fas fa-balance-scale"; // Font Awesome Exclamation Circle
      case "most likely":
        return "fas fa-ambulance"; // Font Awesome Thumbs Down
      case "ai explanation": // Add this case
        return "fas fa-robot"; // Brain icon
      default:
        return ""; // Fallback
    }
  };

  // Function to format the drug combination
  const formatDrugCombination = (combination: string) => {
    return combination
      .split(" + ")
      .map(
        (drug) =>
          drug.charAt(0).toUpperCase() + drug.slice(1).toLowerCase()
      )
      .join(" + ");
  };

  return (
    <div
    className={`flip-card ${isFlipped ? "flipped" : ""} ${getSeverityClass()} ${
      isFlipped ? "flipped-shadow" : ""
    } ${className || ""}`}
      data-border={category.toLowerCase().replace(" ", "-")}
      onClick={handleClick}
    >
      <div className="flip-card-inner">
        <div className="flip-card-front">
          <h2>
            {category}
            <i className={`${getCategoryIcon()} category-icon ${category.toLowerCase().replace(" ", "-")}`}></i>
          </h2>
          <p className="drug-combination">{formatDrugCombination(drugCombination)}</p>
          <p className="flip-card-instruction">Click to see events</p>
        </div>
  
        <div className="flip-card-back">
          <h2>
            {category} Events
            <span className={`severity-badge ${getSeverityClass()}`}>
              ({severity?.toUpperCase()})
            </span>
          </h2>
          <div className="events-container">
            {events && events.length > 0 ? (
              <ul>
                {events.map((ev, i) => (
                  <li key={i} className={`event-item ${getSeverityClass()}`}>
                    {ev.event}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-events">No events found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlipCard;
