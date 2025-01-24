import React, { useState, useEffect } from "react";
import "./DrugSearch.css"; // Keep your existing styles here
import FlipCard from "./FlipCard"; // Import the FlipCard component
import FDAFlipCards from "./FDAFlipCards";

const DrugSearch: React.FC = () => {
  const [drug1, setDrug1] = useState("");
  const [drug2, setDrug2] = useState("");
  const [drugName, setDrugName] = useState("");
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSearchBars, setShowSearchBars] = useState(false);
  const [isHiding, setIsHiding] = useState(false); // For smooth disappearance
  const [username, setUsername] = useState<string | null>("Guest");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const user = sessionStorage.getItem("username");
    setUsername(user ? user : "Guest");
  }, []);

  const handleLogout = () => {
    sessionStorage.clear();
    alert("Logged out successfully!");
    window.location.href = "/login";
  };

  const selectedResource = sessionStorage.getItem("selectedResource");

  const handleSearch = async () => {
    setError(null);
    setResults(null);
    setIsLoading(true);

    try {
      let url = "";

      if (selectedResource === "Stanford Drug Database") {
        if (!drug1.trim() || !drug2.trim()) {
          setError("Please enter both Drug 1 and Drug 2.");
          setIsLoading(false);
          return;
        }
        url = `https://pharmaguard.onrender.com/drug_interactions?drug1=${drug1}&drug2=${drug2}`;
      } else if (selectedResource === "FDA API") {
        if (!drugName.trim()) {
          setError("Please enter a drug name for FDA search.");
          setIsLoading(false);
          return;
        }
        url = `https://pharmaguard.onrender.com/fda_interactions?drug_name=${drugName}`;
      } else {
        setError("No resource selected or unrecognized resource.");
        setIsLoading(false);
        return;
      }

      const response = await fetch(url);
      const data = await response.json();
      console.log("API Response:", data);

      if (response.ok) {
        if (selectedResource === "FDA API" && (!data || (Array.isArray(data) && data.length === 0))) {
          setError("No drug found for the given name.");
          setResults(null);
        }else{
        setResults(data);

        // Smoothly hide the search bar
        setIsHiding(true);
        setTimeout(() => {
          setIsHiding(false);
          setShowSearchBars(false);
        }, 500); // Match the duration of the CSS transition
        }
      } else {
        setError(data.error || "Failed to fetch drug interactions.");
      }
    } catch (err) {
      console.error("Error fetching drug interactions:", err);
      setError("An error occurred while fetching data.");
    } finally {
      setIsLoading(false);
    }
  };

  const collectEventsWithSeverity = (categoryObj: any): { event: string; severity: string }[] => {
    if (!categoryObj || Object.keys(categoryObj).length === 0) {
      return [];
    }

    let allEvents: { event: string; severity: string }[] = [];
    Object.entries(categoryObj).forEach(([, details]: any) => {
      const events = details.events.split(",").map((e: string) => e.trim());
      const severity = details.severity;

      events.forEach((event: string) => {
        allEvents.push({ event, severity });
      });
    });

    return allEvents;
  };

  const handleSearchIconClick = () => {
    setShowSearchBars(true);
  };

  return (
    <div
        className={`drug-search-root ${
          selectedResource === "FDA API" ? "fda-margin-top" : ""
        }`}
>
      <h1 className="drug-search-header">
        {selectedResource === "Stanford Drug Database"
        ? "Drug Interaction Search"
        : selectedResource === "FDA API"
        ? "Drug Information Search"
        : "Drug Search"}
     </h1>
     <p className="risk-indicator-text">
      {selectedResource === "Stanford Drug Database"
      ? "Event colors highlight risk: green for low occurrence, yellow for moderate, and red for high likelihood based on reports."
      : selectedResource === "FDA API"
      ? "Explore detailed drug information as provided by the FDA, designed for advanced medical professionals seeking comprehensive insights into medications and their clinical implications."
      : ""}
    </p>
      
    {!showSearchBars && (
  <div className="fda-search-icon-wrapper">
    <div
      className={`search-icon-container ${
        selectedResource === "FDA API" ? "fda-search-icon" : ""
      }`}
      onClick={handleSearchIconClick}
    >
      🔍
    </div>
  </div>
)}

      {showSearchBars && (
        <div className={`search-container ${isHiding ? "hide" : ""}`}>
          {selectedResource === "Stanford Drug Database" && (
            <>
              <label>Drug 1:</label>
              <input
                type="text"
                value={drug1}
                onChange={(e) => setDrug1(e.target.value)}
                placeholder="Enter first drug"
              />
              <label>Drug 2:</label>
              <input
                type="text"
                value={drug2}
                onChange={(e) => setDrug2(e.target.value)}
                placeholder="Enter second drug"
              />
            </>
          )}

          {selectedResource === "FDA API" && (
            <>
              <label>Drug Name:</label>
              <input
                type="text"
                value={drugName}
                onChange={(e) => setDrugName(e.target.value)}
                placeholder="Enter a drug name"
              />
            </>
          )}


          <button onClick={handleSearch}>Search</button>
        </div>
      )}

      {/* Stanford Results */}
      {results && selectedResource === "Stanford Drug Database" && !results.ai_fallback && (
        <div className="stanford-results-container">
          {["unlikely", "likely", "most_likely"].map((category, index) => (
            <div
              key={category}
              style={{ animationDelay: `${index * 0.3}s` }}
              className="flip-card-container"
            >
              <FlipCard
                category={category.replace("_", " ").charAt(0).toUpperCase() + category.replace("_", " ").slice(1)}
                drugCombination={`${drug1} + ${drug2}`}
                events={collectEventsWithSeverity(results[category])}
                severity={category === "unlikely" ? "low" : category === "likely" ? "medium" : "high"}
              />
            </div>
          ))}
        </div>
      )}

{/* FDA Results */}
{/* FDA Results */}
{/* FDA Results */}
{/* FDA Results */}
{results && selectedResource === "FDA API" && (
    <div className="fda-results-container">
      {Array.isArray(results) && results.length > 0 ? (
        <FDAFlipCards results={results} />
      ) : (
        <p>No drug information available for the given name.</p>
      )}
    </div>
)}


      {isLoading && (
        <div className="loader-container">
          <div className="loader"></div>
        </div>
      )}

      {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}

      {results && results.ai_fallback && (
        <div className="ai-fallback-container">
          <FlipCard
            category="AI Explanation"
            drugCombination=""
            events={[
              { event: (results.text_summary || "No summary available.")
                .replace(/Here Is The JSON Format Of The Significant Interactions:/gi, "")
                .replace(/Here Is The Formatted JSON Response:/gi, "")
                .replace(/```Json/gi, "")
                .replace(/```/gi, "")
                .trim(),
                severity: "low" },
              { event: results.disclaimer || "AI disclaimer not available.", severity: "low" },
            ]}
            className="ai-explanation-card ai-brain-card"
            severity="low"
          />
          <FlipCard
            category="Most Likely"
            drugCombination=""
            events={
              results.data?.most_likely?.map((event: string) => ({ event, severity: "high" })) || [
                { event: "No events found.", severity: "low" },
              ]
            }
            severity="high"
          />
        </div>
      )}

      <footer className="choose-footer">
        <div className="user-info">
          <span>👤 {username}</span>
          <div className="logout-circle" title="Logout" onClick={handleLogout}>
            <i className="fas fa-power-off"></i>
          </div>
        </div>
        <p>&copy; 2025 PharmaGuard. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default DrugSearch;