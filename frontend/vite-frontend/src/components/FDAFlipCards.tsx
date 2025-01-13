import React, { useState } from "react";
import "./FDAFlipCards.css";

interface FDAFlipCardsProps {
  results: { [key: string]: string }[]; // Assuming FDA results is an array of objects
}

const FDAFlipCards: React.FC<FDAFlipCardsProps> = ({ results }) => {
  const [activeCard, setActiveCard] = useState<number | null>(null);

  // Map to customize specific card titles
  const customCardTitles: { [key: string]: string } = {
    Active_ingredient: "Active Ingredient",
    Ask_doctor_or_pharmacist: "Consult a Doctor or Pharmacist",
    Boxed_warning: "Boxed Warning",
    Contraindications: "Contraindications",
    Do_not_use: "Do Not Use",
    Description: "Drug Description",
    
    // Add more custom mappings as needed
  };

  const handleCardClick = (index: number) => {
    setActiveCard(index === activeCard ? null : index); // Toggle active state
  };

  // Flatten the first object in results into an array of key-value pairs
  const cards = Object.entries(results[0]);

  // Function to format card titles
  const formatCardTitle = (key: string): string => {
    return customCardTitles[key] || key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <div className="fda-flipcards-container">
      {cards.map(([key, value], index) => (
        <div
          key={index}
          className={`fda-flipcard ${activeCard === index ? "active" : ""}`}
          onClick={() => handleCardClick(index)}
        >
          <div className="fda-flipcard-front">
            <h3>Card {index + 1}</h3>
            <p>{formatCardTitle(key)}</p>
          </div>

          {/* Only display the back if this card is active */}
          {activeCard === index && (
            <div className="fda-flipcard-back">
              <h3>{formatCardTitle(key)}</h3>
              <div className="fda-flipcard-content">
                <p>{value || "No information available"}</p>
              </div>
              <button
                className="fda-close-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveCard(null); // Close the card
                }}
              >
                Close
              </button>
            </div>
          )}
        </div>
      ))}

      {/* Add overlay to blur other cards when a card is active */}
      {activeCard !== null && (
        <div
          className="fda-overlay"
          onClick={() => setActiveCard(null)} // Close active card on overlay click
        ></div>
      )}
    </div>
  );
};

export default FDAFlipCards;
