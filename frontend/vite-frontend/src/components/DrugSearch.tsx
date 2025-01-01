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
        setResults(data); // Store results for both local and FDA data
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

      {/* Display Results for Stanford Drug Database */}
      {results && selectedResource === "Stanford Drug Database" && (
        <>
          <h2>Most Likely:</h2>
          <ul>
            {/* Iterate over the grouped data for 'most_likely' */}
            {results.most_likely ? (
              Object.entries(results.most_likely).map(([combination, events], index) => (
                <li key={index}>
                  {combination} ({events as string})
                </li>
              ))
            ) : (
              <li>No results found</li>
            )}
          </ul>

          <h2>Likely:</h2>
          <ul>
            {/* Iterate over the grouped data for 'likely' */}
            {results.likely ? (
              Object.entries(results.likely).map(([combination, events], index) => (
                <li key={index}>
                  {combination} ({events as string})
                </li>
              ))
            ) : (
              <li>No results found</li>
            )}
          </ul>

          <h2>Unlikely:</h2>
          <ul>
            {/* Iterate over the grouped data for 'unlikely' */}
            {results.unlikely ? (
              Object.entries(results.unlikely).map(([combination, events], index) => (
                <li key={index}>
                  {combination} ({events as string})
                </li>
              ))
            ) : (
              <li>No results found</li>
            )}
          </ul>
        </>
      )}

      {/* Display Results for FDA API */}
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
