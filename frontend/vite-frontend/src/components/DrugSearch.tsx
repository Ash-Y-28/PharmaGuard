import React, { useState } from "react";

const DrugSearch: React.FC = () => {
  const [drugName, setDrugName] = useState(""); // State to track the input drug name
  const [results, setResults] = useState<any>(null); // State to store API results
  const [error, setError] = useState<string | null>(null); // State to store error messages
  const selectedResource = sessionStorage.getItem("selectedResource"); // Get the selected resource from sessionStorage ('local' or 'FDA')

  // Function to handle API call and fetch data
  const handleSearch = async () => {
    setError(null);
    setResults(null);

    if (!drugName.trim()) {
      setError("Please enter a drug name."); // Handle empty input
      return;
    }

    try {
      const url =
        selectedResource === "FDA API"
          ? `http://127.0.0.1:5003/fda_interactions?drug_name=${drugName}`
          : `http://127.0.0.1:5003/drug_interactions?drug_name=${drugName}`;

      const response = await fetch(url); // Fetch data from Flask API
      const data = await response.json();

      console.log("API Response:", data); // Debug: Log API response to check structure

      if (response.ok) {
        // For local data, categorize PRR
        if (selectedResource === "Stanford Drug Database" && data) {
          setResults(data); // Store results for local database
        } else {
          setResults(data); // Store results for FDA API
        }
      } else {
        setError(data.error || "Failed to fetch drug interactions."); // Handle API errors
      }
    } catch (err) {
      console.error("Error fetching drug interactions:", err); // Debug: Log fetch errors
      setError("An error occurred while fetching data."); // Display user-friendly error message
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Drug Interaction Search</h1>

      {/* Input Field */}
      <input
        type="text"
        value={drugName}
        onChange={(e) => setDrugName(e.target.value)} // Update state on input change
        placeholder="Enter a drug name"
      />
      <button onClick={handleSearch}>Search</button>

      {/* Display Error Messages */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Display Results */}
      {results && selectedResource === "Stanford Drug Database" && (
        <>
          <h2>Most Likely:</h2>
          <ul>
            {/* Handle undefined or empty 'mostLikely' */}
            {results.most_likely?.length ? (
              results.most_likely.map((item: any, index: number) => (
                <li key={index}>
                  {item.drug1} + {item.drug2}: {item.event_name}
                </li>
              ))
            ) : (
              <li>No results found</li> // Display fallback if no data exists
            )}
          </ul>

          <h2>Likely:</h2>
          <ul>
            {/* Handle undefined or empty 'likely' */}
            {results.likely?.length ? (
              results.likely.map((item: any, index: number) => (
                <li key={index}>
                  {item.drug1} + {item.drug2}: {item.event_name}
                </li>
              ))
            ) : (
              <li>No results found</li> // Display fallback if no data exists
            )}
          </ul>

          <h2>Unlikely:</h2>
          <ul>
            {/* Handle undefined or empty 'unlikely' */}
            {results.unlikely?.length ? (
              results.unlikely.map((item: any, index: number) => (
                <li key={index}>
                  {item.drug1} + {item.drug2}: {item.event_name}
                </li>
              ))
            ) : (
              <li>No results found</li> // Display fallback if no data exists
            )}
          </ul>
        </>
      )}

      {results && selectedResource === "FDA API" && (
        <div>
          <h2>Results:</h2>
          <pre>{JSON.stringify(results, null, 2)}</pre> {/* Pretty-print FDA API results */}
        </div>
      )}
    </div>
  );
};

export default DrugSearch;
