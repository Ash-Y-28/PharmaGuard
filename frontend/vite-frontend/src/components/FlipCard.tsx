import React, { useState } from "react";
import "./FlipCard.css";

interface FlipCardProps {
  category: string;         // e.g. "Unlikely", "Likely", "Most Likely"
  drugCombination: string;  // e.g. "calcium + aspirin"
  events: string[];         // Array of event names
}

const FlipCard: React.FC<FlipCardProps> = ({
  category,
  drugCombination,
  events,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleClick = () => {
    setIsFlipped((prev) => !prev);
  };

  return (
    <div className={`flip-card ${isFlipped ? "flipped" : ""}`} onClick={handleClick}>
      <div className="flip-card-inner">
        
        {/* Front side */}
        <div className="flip-card-front">
          <h2>{category}</h2>
          <p>{drugCombination}</p>
          <p style={{ fontSize: "0.9rem" }}>Click to see events</p>
        </div>

        {/* Back side */}
        <div className="flip-card-back">
          <h2>{category} Events</h2>
          <p>{drugCombination}</p>
          <div className="events-container">
            {events && events.length > 0 ? (
              <ul>
                {events.map((ev, i) => (
                  <li key={i}>{ev}</li>
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
