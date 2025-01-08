import React, { useState } from "react";
import "./DrugSearch.css"; // Keep your existing styles here
import FlipCard from "./FlipCard"; // Import the FlipCard component

const DrugSearch: React.FC = () => {
  // State for the two-drug approach (Stanford)
  const [drug1, setDrug1] = useState("");
  const [drug2, setDrug2] = useState("");

  // State for the single-drug approach (FDA)
  const [drugName, setDrugName] = useState("");

  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Which resource did the user pick in the previous step?
  const selectedResource = sessionStorage.getItem("selectedResource");

  // Function to handle the API call
  const handleSearch = async () => {
    setError(null);
    setResults(null);

    try {
      let url = "";

      if (selectedResource === "Stanford Drug Database") {
        // Validate we have both drug1 and drug2
        if (!drug1.trim() || !drug2.trim()) {
          setError("Please enter both Drug 1 and Drug 2.");
          return;
        }
        url = `http://127.0.0.1:5003/drug_interactions?drug1=${drug1}&drug2=${drug2}`;
      } else if (selectedResource === "FDA API") {
        if (!drugName.trim()) {
          setError("Please enter a drug name for FDA search.");
          return;
        }
        url = `http://127.0.0.1:5003/fda_interactions?drug_name=${drugName}`;
      } else {
        setError("No resource selected or unrecognized resource.");
        return;
      }

      const response = await fetch(url);
      const data = await response.json();
      console.log("API Response:", data);

      if (response.ok) {
        setResults(data);
      } else {
        setError(data.error || "Failed to fetch drug interactions.");
      }
    } catch (err) {
      console.error("Error fetching drug interactions:", err);
      setError("An error occurred while fetching data.");
    }
  };

  // Helper to combine multiple combos in a category into one array of events
  const collectEvents = (categoryObj: any): string[] => {
    if (!categoryObj || Object.keys(categoryObj).length === 0) {
      return [];
    }

    let allEvents: string[] = [];
    Object.values(categoryObj).forEach((eventString) => {
      const splitted = (eventString as string).split(",").map((e) => e.trim());
      allEvents = [...allEvents, ...splitted];
    });

    // Remove duplicates
    allEvents = Array.from(new Set(allEvents));
    return allEvents;
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Drug Interaction Search</h1>

      {/* Inputs for Stanford vs. FDA */}
      {selectedResource === "Stanford Drug Database" && (
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ marginRight: "0.5rem" }}>Drug 1:</label>
          <input
            type="text"
            value={drug1}
            onChange={(e) => setDrug1(e.target.value)}
            placeholder="Enter first drug"
            style={{ marginRight: "1rem" }}
          />

          <label style={{ marginRight: "0.5rem" }}>Drug 2:</label>
          <input
            type="text"
            value={drug2}
            onChange={(e) => setDrug2(e.target.value)}
            placeholder="Enter second drug"
          />
        </div>
      )}

      {selectedResource === "FDA API" && (
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ marginRight: "0.5rem" }}>Drug Name:</label>
          <input
            type="text"
            value={drugName}
            onChange={(e) => setDrugName(e.target.value)}
            placeholder="Enter a drug name"
          />
        </div>
      )}

      <button onClick={handleSearch}>Search</button>

      {/* Display error messages */}
      {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}

      {/* ------------------ STANFORD RESULTS (two-drug) ------------------ */}
      {results && selectedResource === "Stanford Drug Database" && !results.ai_fallback && (
        <div className="stanford-results-container" style={{ display: "flex", gap: "1rem" }}>
          {/* Flip Card for UNLIKELY */}
          <FlipCard
            category="Unlikely"
            drugCombination={`${drug1} + ${drug2}`}
            events={collectEvents(results.unlikely)}
          />

          {/* Flip Card for LIKELY */}
          <FlipCard
            category="Likely"
            drugCombination={`${drug1} + ${drug2}`}
            events={collectEvents(results.likely)}
          />

          {/* Flip Card for MOST LIKELY */}
          <FlipCard
            category="Most Likely"
            drugCombination={`${drug1} + ${drug2}`}
            events={collectEvents(results.most_likely)}
          />
        </div>
      )}

      {/* ------------------ AI FALLBACK RESULTS ------------------ */}
      {results && results.ai_fallback && (
        <div className="ai-fallback-container" style={{ display: "flex", gap: "1rem" }}>
          {/* Card explaining AI fallback */}
          <FlipCard
            category="AI Explanation"
            drugCombination=""
            events={[
              "Unfortunately, the database does not have information about these drugs.",
              "Let’s see what Doctor AI has to say about these drugs taken together."
            ]}
          />

          {/* Card for AI-generated 'most likely' events */}
          <FlipCard
            category="Most Likely (AI)"
            drugCombination={`${drug1} + ${drug2}`}
            events={results.data?.most_likely || ["No events found."]}
          />
        </div>
      )}

      {/* ------------------ FDA RESULTS (single-drug) ------------------ */}
      {results && selectedResource === "FDA API" && (
        <div style={{ marginTop: "2rem" }}>
          <h2>FDA Results:</h2>
          <pre>{JSON.stringify(results, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default DrugSearch;
