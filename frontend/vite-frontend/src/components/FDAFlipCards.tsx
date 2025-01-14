import React, { useState, useRef, useEffect } from "react";
import "./FDAFlipCards.css";

interface FDAFlipCardsProps {
  results: { [key: string]: string }[]; // Assuming FDA results is an array of objects
}

const FDAFlipCards: React.FC<FDAFlipCardsProps> = ({ results }) => {
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Map to customize specific card titles
  const customCardTitles: { [key: string]: string } = {
    Active_ingredient: "Active Ingredient",
    Ask_doctor_or_pharmacist: "Consult a Doctor or Pharmacist",
    Boxed_warning: "Boxed Warning",
    Contraindications: "Contraindications",
    Do_not_use: "Do Not Use",
    Description: "Drug Description",
    
  };

  useEffect(() => {
    if (activeCard !== null && cardRefs.current[activeCard]) {
      cardRefs.current[activeCard]?.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
    }
  }, [activeCard]);

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
          onClick={(e) => {
            e.stopPropagation(); // Prevent unwanted bubbling
            handleCardClick(index);
          }}
          ref={(el) => (cardRefs.current[index] = el)} // Attach ref to each card
        >
          <div className="fda-flipcard-front">
            <p>{formatCardTitle(key)}</p> {/* Front card title formatting */}
          </div>

          {/* Only display the back if this card is active */}
          {activeCard === index && (
            <div className="fda-flipcard-back" ref={(el) => (cardRefs.current[index] = el)} >
              {/* Close button in the top-left corner */}
              <h3>{formatCardTitle(key)}</h3> {/* Back card title formatting */}
              <div className="fda-flipcard-content">
              <p>{value || "No information available from the FDA"}</p>
              </div>
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
