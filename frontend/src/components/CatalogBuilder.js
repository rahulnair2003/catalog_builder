import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import "./App.css";
import SidePanel from "./SidePanel";

function CatalogBuilder() {
  const [tableData, setTableData] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [selectedCells, setSelectedCells] = useState(new Set());
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [manualSearch, setManualSearch] = useState("");

  // Load Excel Data
  useEffect(() => {
    const fetchExcelData = async () => {
      try {
        const response = await fetch("/mock_data.xlsx");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        setTableData(jsonData.slice(1));
      } catch (error) {
        console.error("Error reading Excel file:", error);
      }
    };

    fetchExcelData();
  }, []);

  useEffect(() => {
    const adjustSidePanelHeight = () => {
      const header = document.querySelector(".header");
      const sidePanel = document.querySelector(".side-panel");
      if (header && sidePanel) {
        const headerHeight = header.offsetHeight;
        sidePanel.style.top = `${headerHeight}px`;
        sidePanel.style.height = `calc(100vh - ${headerHeight}px)`;
      }
    };

    adjustSidePanelHeight();
    window.addEventListener("resize", adjustSidePanelHeight);
    return () => {
      window.removeEventListener("resize", adjustSidePanelHeight);
    };
  }, []);

  const handleCellClick = (rowIndex, cellIndex, value) => {
    if (!value || value.toString().trim() === "") return;

    const cellKey = `${rowIndex}-${cellIndex}`;
    setSelectedCells((prevSelectedCells) => {
      const newSelectedCells = new Set(prevSelectedCells);
      if (newSelectedCells.has(cellKey)) {
        newSelectedCells.delete(cellKey);
        setCatalog((prevCatalog) =>
          prevCatalog.filter((entry) => entry.cellKey !== cellKey)
        );
      } else {
        newSelectedCells.add(cellKey);
        setCatalog((prevCatalog) => [...prevCatalog, { value, cellKey }]);
      }
      return newSelectedCells;
    });
  };

  const handleManualSearchAdd = () => {
    const trimmedValue = manualSearch.trim();
    if (!trimmedValue || catalog.some((entry) => entry.value === trimmedValue)) return; 
    setCatalog((prevCatalog) => [...prevCatalog, { value: trimmedValue, cellKey: null }]);
    setManualSearch("");
  };

  const handleDelete = (entryToDelete) => {
    setCatalog((prevCatalog) =>
      prevCatalog.filter((entry) => entry !== entryToDelete)
    );

    if (entryToDelete.cellKey) {
      setSelectedCells((prevSelectedCells) => {
        const newSelectedCells = new Set(prevSelectedCells);
        newSelectedCells.delete(entryToDelete.cellKey);
        return newSelectedCells;
      });
    }
  };

  const clearCatalog = () => {
    setCatalog([]);
    setSelectedCells(new Set());
  };

  const exportCatalogToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(catalog.map((entry) => ({ Name: entry.value })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Catalog");
    XLSX.writeFile(workbook, "capitali_equipment_catalog.xlsx");
  };

  const filteredTableData =
    searchQuery.trim() === ""
      ? tableData
      : tableData.filter((row) =>
          row.some((cell) =>
            cell?.toString().toLowerCase().includes(searchQuery.toLowerCase())
          )
        );

  return (
    <div className="catalog-builder">
      {/* Header */}
      <header className="header">
        <h1 className="title">Custom Catalog Builder</h1>
        <div className="manual-add">
          <input
            type="text"
            placeholder="Search to manually add to catalog..."
            className="form-control"
            value={manualSearch}
            onChange={(e) => setManualSearch(e.target.value)}
          />
          <button onClick={handleManualSearchAdd} className="add-button">
            Add
          </button>
        </div>
        <img src="/capitali_logo.png" alt="Logo" className="header-logo" />
      </header>

      {/* Main Layout */}
      <div className="main-layout">
        {/* Side Panel */}
        <SidePanel
          isOpen={isSidePanelOpen}
          onOpen={() => setIsSidePanelOpen(true)}
          onClose={() => setIsSidePanelOpen(false)}
          addToCatalog={(item) => {
            if (catalog.some((entry) => entry.value === item.equipment_type)) {
              return;
            }

            const newItem = { value: item.equipment_type, cellKey: null };
            setCatalog((prevCatalog) => [...prevCatalog, newItem]);
          }}
        />

        {/* Main Table */}
        <div className="main-table">
          <div className="table-header">
            <h2>Similar Naming Conventions</h2>
            <input
              type="text"
              placeholder="filter table..."
              className="form-control table-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="table-wrapper">
            <table className="table table-striped">
              <thead>
                <tr>
                  {tableData[0] &&
                    tableData[0].map((header, index) => (
                      <th key={index}>{header}</th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {filteredTableData.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className={
                          selectedCells.has(`${rowIndex}-${cellIndex}`)
                            ? "selected"
                            : ""
                        }
                        onClick={() =>
                          handleCellClick(rowIndex, cellIndex, cell)
                        }
                        style={{
                          cursor:
                            cell && cell.toString().trim()
                              ? "pointer"
                              : "default",
                        }}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Current Catalog */}
        <div className="current-catalog">
          <h3>Current Catalog</h3>
          <ul>
            {catalog.map((entry, index) => (
              <li key={index} className="catalog-item">
                {entry.value}
                <button
                  className="delete-button"
                  onClick={() => handleDelete(entry)}
                >
                  &times;
                </button>
              </li>
            ))}
          </ul>
          <div className="catalog-actions">
            <button onClick={clearCatalog} className="clear-button">
              Clear
            </button>
            <button onClick={exportCatalogToExcel} className="export-button">
              Export
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CatalogBuilder;
