import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function SidePanel({ isOpen, onClose, onOpen, addToCatalog }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const fetchMatches = async () => {
        try {
          
          const response = await axios.post("http://127.0.0.1:8000/api/smart_lookup/", {
            equipment_type: searchQuery,
          });
          setResults(response.data);
        } catch (error) {
          console.error("Error fetching matches:", error);
          setResults([]);
        }
      };
      fetchMatches();
    } else {
      setResults([]);
    }
  }, [searchQuery]);

  return (
    <div
      className={`side-panel ${isOpen ? "open" : "collapsed"}`}
      onClick={() => !isOpen && onOpen()}
    >
      {isOpen ? (
        <>
          <button
            className="close-button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          >
            &times;
          </button>
          <h3>ECRI Smart Lookup</h3>
          <div className="smart-lookup">
            <input
              type="text"
              placeholder="Search for equipment type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="smart-lookup-input"
            />
            <ul className="lookup-results">
              {results.length > 0 ? (
                results.map((result, index) => (
                  <li
                    key={index}
                    onClick={() => addToCatalog(result)}
                    className="result-item"
                  >
                    <span>{result.equipment_type}</span>
                    <span
                      style={{
                        color:
                          result.confidence > 80
                            ? "green"
                            : result.confidence >= 50
                            ? "orange"
                            : "red",
                        fontWeight: "bold",
                      }}
                    >
                      {Math.round(result.confidence)}%
                    </span>
                  </li>
                ))
              ) : (
                <li>No matches found</li>
              )}
            </ul>
          </div>
        </>
      ) : (
        <p className="collapsed-text">Smart Lookup</p>
      )}
    </div>
  );
}

export default SidePanel;
