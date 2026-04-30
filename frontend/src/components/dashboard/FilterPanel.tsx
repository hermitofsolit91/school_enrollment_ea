import React, { useState, useEffect } from "react";
import { MoreHorizontal, Globe, Calendar, Users, BarChart3 } from "lucide-react";
import { COUNTRIES, COUNTRY_NAMES, type CountryName } from "../../constants/countries";
import "../../styles/dashboard.css";

interface FilterPanelProps {
  selectedCountries: CountryName[];
  selectedAge?: string;
  selectedYears: number[];
  onCountriesChange: (countries: CountryName[]) => void;
  onAgeChange?: (age: string) => void;
  onYearsChange: (years: number[]) => void;
  onAnalysisChange?: (analysisType: string) => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  selectedCountries,
  selectedAge = "all",
  selectedYears,
  onCountriesChange,
  onAgeChange,
  onYearsChange,
  onAnalysisChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  // Generate available years (2010-2023)
  useEffect(() => {
    const years = Array.from({ length: 14 }, (_, i) => 2010 + i);
    setAvailableYears(years);
  }, []);

  const ageGroups = [
    { value: "all", label: "All Ages" },
    { value: "primary", label: "Primary School" },
    { value: "secondary", label: "Secondary School" },
    { value: "tertiary", label: "Tertiary Education" },
  ];

  const analysisTypes = [
    { value: "enrollment", label: "Enrollment Trends" },
    { value: "literacy", label: "Literacy Rates" },
    { value: "completion", label: "Completion Rates" },
    { value: "gender-gap", label: "Gender Gap" },
  ];

  return (
    <aside className={`filter-panel ${isExpanded ? "expanded" : "collapsed"}`}>
      {/* Header with Toggle Button */}
      <div className="filter-header">
        {isExpanded && <h2 className="filter-title">Filters</h2>}
        <button
          className="toggle-button"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label="Toggle filter panel"
          title={isExpanded ? "Collapse filters" : "Expand filters"}
        >
          <MoreHorizontal size={24} />
        </button>
      </div>

      <div className="filter-content">
        {/* Countries Filter */}
        <div className="filter-group">
          <Globe className="filter-icon-only" size={24} aria-label="Countries" />
          {isExpanded && (
            <>
              <div className="flex justify-between items-center mb-1">
                <h3 className="filter-group-title m-0">Countries</h3>
                <button 
                  className="select-all-button"
                  onClick={() => onCountriesChange([...COUNTRY_NAMES])}
                >
                  Select All
                </button>
              </div>
              <select
                className="filter-select"
                value={selectedCountries.length === COUNTRY_NAMES.length ? "all" : (selectedCountries[0] || "")}
                onChange={(e) => {
                  if (e.target.value === "all") {
                    onCountriesChange([...COUNTRY_NAMES]);
                  } else {
                    onCountriesChange([e.target.value as CountryName]);
                  }
                }}
              >
                <option value="all">All Countries</option>
                {COUNTRIES.map((country) => (
                  <option key={country.name} value={country.name}>
                    {country.name}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>

        {/* Age Group Filter */}
        <div className="filter-group">
          <Users className="filter-icon-only" size={24} aria-label="Age Group" />
          {isExpanded && (
            <>
              <h3 className="filter-group-title">Age Group</h3>
              <select
                value={selectedAge}
                onChange={(e) => onAgeChange?.(e.target.value)}
                className="filter-select"
              >
                {ageGroups.map((group) => (
                  <option key={group.value} value={group.value}>
                    {group.label}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>

        {/* Years Filter */}
        <div className="filter-group">
          <Calendar className="filter-icon-only" size={24} aria-label="Years" />
          {isExpanded && (
            <>
              <div className="flex justify-between items-center mb-1">
                <h3 className="filter-group-title m-0">Years</h3>
                <button 
                  className="select-all-button"
                  onClick={() => onYearsChange([...availableYears])}
                >
                  Select All
                </button>
              </div>
              <select
                className="filter-select"
                value={selectedYears.length === availableYears.length ? "all" : (selectedYears[0] || "")}
                onChange={(e) => {
                  if (e.target.value === "all") {
                    onYearsChange([...availableYears]);
                  } else {
                    onYearsChange([parseInt(e.target.value)]);
                  }
                }}
              >
                <option value="all">All Years</option>
                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>

        {/* Analysis Type */}
        <div className="filter-group">
          <BarChart3 className="filter-icon-only" size={24} aria-label="Analysis Type" />
          {isExpanded && (
            <>
              <h3 className="filter-group-title">Analysis Type</h3>
              <select
                onChange={(e) => onAnalysisChange?.(e.target.value)}
                className="filter-select"
                defaultValue="enrollment"
              >
                {analysisTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>
      </div>
    </aside>
  );
};

export default FilterPanel;
