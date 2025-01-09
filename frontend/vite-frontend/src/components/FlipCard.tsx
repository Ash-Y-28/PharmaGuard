import React, { useState } from "react";
import "./DrugSearch.css";

interface FlipCardProps {
  category: string;         
  drugCombination: string;  
  events: { event: string; severity: string }[]; 
  severity?: string;         
}

const FlipCard: React.FC<FlipCardProps> = ({ category, drugCombination, events, severity }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleClick = () => {
    setIsFlipped((prev) => !prev);
  };

  const getSeverityColor = () => {
    switch (severity?.toLowerCase()) {
      case "low":
        return "green";
      case "medium":
        return "orange";
      case "high":
        return "red";
      default:
        return "gray";
    }
  };

  return (
    <div
      className={`flip-card ${isFlipped ? "flipped" : ""}`}
      onClick={handleClick}
      style={{ borderColor: getSeverityColor(), borderWidth: "2px", borderStyle: "solid" }}
    >
      <div className="flip-card-inner">
        <div className="flip-card-front">
          <h2>{category}</h2>
          <p>{drugCombination}</p>
          <p style={{ fontSize: "0.9rem" }}>Click to see events</p>
        </div>

        <div className="flip-card-back">
          <h2>
            {category} Events
            <span
              style={{
                fontSize: "0.8rem",
                marginLeft: "10px",
                color: getSeverityColor(),
              }}
            >
              ({severity?.toUpperCase()})
            </span>
          </h2>
          <div className="events-container">
            {events && events.length > 0 ? (
              <ul>
                {events.map((ev, i) => (
                  <li key={i} style={{ color: getSeverityColor() }}>
                    {ev.event}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No events found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlipCard;
