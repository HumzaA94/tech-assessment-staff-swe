import React, { useState } from "react";
import MultiSelectDropdown from "./MultiSelectDropdown";
import { PlayerFilterOptions } from "../types";

interface PlayerFilterControlsProps {
  onFilterChange: (filters: PlayerFilterOptions) => void;
  availableTeams?: string[];
  availablePositions?: string[];
}

const PlayerFilterControls: React.FC<PlayerFilterControlsProps> = ({
  onFilterChange,
  availableTeams = [],
  availablePositions = [],
}) => {
  const [filters, setFilters] = useState<PlayerFilterOptions>({});

  const updateFilters = (next: PlayerFilterOptions) => {
    setFilters(next);
    onFilterChange(next);
  };

  const clearFilters = () => {
    updateFilters({});
  };

  return (
    <div className="filter-controls">
      <h3>Filter Players</h3>

      <div className="filter-row">
        <MultiSelectDropdown
          id="team-filter"
          label="Team"
          options={availableTeams}
          values={filters.team}
          placeholder="All Teams"
          onChange={(team) => updateFilters({ ...filters, team })}
        />

        <MultiSelectDropdown
          id="position-filter"
          label="Position"
          options={availablePositions}
          values={filters.position}
          placeholder="All Positions"
          onChange={(position) => updateFilters({ ...filters, position })}
        />

        <button onClick={clearFilters} className="clear-filters">
          Clear Filters
        </button>
      </div>
    </div>
  );
};

export default PlayerFilterControls;
