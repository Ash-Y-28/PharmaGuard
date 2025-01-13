import React from "react";
import FDAFlipCards from "./FDAFlipCards"; // Use the existing component
import "./FDASearch.css"; // Add FDA-specific styling

interface FDASearchProps {
  drugName: string;
  setDrugName: React.Dispatch<React.SetStateAction<string>>;
  results: any;
  isLoading: boolean;
  error: string | null;
  handleSearch: () => Promise<void>;
}

const FDASearch: React.FC<FDASearchProps> = ({
  drugName,
  setDrugName,
  results,
  handleSearch,
}) => {
  return (
    <div className="fda-root">
  {/* Header Section */}
  <div className="fda-header">
    <h1 className="fda-drug-search-header">Drug Information Search</h1>
    <p className="fda-paragraph">
      Explore detailed drug information as provided by the FDA, designed for advanced medical professionals.
    </p>
  </div>

  {/* Search Bar */}
  <div className="fda-search-bar">
    <input
      type="text"
      value={drugName}
      onChange={(e) => setDrugName(e.target.value)}
      placeholder="Enter a drug name"
    />
    <button onClick={handleSearch}>Search</button>
  </div>


  {/* Scrollable Cards Container */}
  <div className="fda-results-container">
  {/* Single Container for Title and Cards */}
  <h2 className="fda-results-heading">Search Results</h2>
  {Array.isArray(results) && results.length > 0 ? (
    <FDAFlipCards results={results} />
  ) : (
    <p>No drug information available for the given name.</p>
  )}
</div>
  
</div>
  );
};

export default FDASearch;
