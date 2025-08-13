import React from "react";
import "./FilterPanel.css";

const FilterPanel = ({ filters, onFilterChange }) => {
  return (
    <aside className="filter-panel" aria-label="Product Filters">
      {filters.map(({ id, label, options, type, selectedValues }) => (
        <div className="filter-group" key={id}>
          <h3 className="filter-title">{label}</h3>
          {type === "checkbox" &&
            options.map(({ value, name }) => (
              <label key={value} className="filter-option">
                <input
                  type="checkbox"
                  value={value}
                  checked={selectedValues.includes(value)}
                  onChange={() => onFilterChange(id, value)}
                />
                {name}
              </label>
            ))}
          {type === "range" && (
            <input
              type="range"
              min={options.min}
              max={options.max}
              value={selectedValues[0]}
              onChange={(e) => onFilterChange(id, Number(e.target.value))}
            />
          )}
        </div>
      ))}
    </aside>
  );
};

export default FilterPanel;
