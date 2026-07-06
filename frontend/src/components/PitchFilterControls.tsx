import React, { useState, ChangeEvent, FormEvent } from "react";
import { PitchFilterOptions } from "../types";
import SearchablePlayerSelect from "./SearchablePlayerSelect";
import SpeedFilterControl, {
  SpeedFilterMode,
  buildSpeedFilterParams,
} from "./SpeedFilterControl";

interface PitchFilterControlsProps {
  onFilterChange: (filters: PitchFilterOptions) => void;
  availableTeams?: string[];
}

const PitchFilterControls: React.FC<PitchFilterControlsProps> = ({
  onFilterChange,
  availableTeams = [],
}) => {
  const [filters, setFilters] = useState<PitchFilterOptions>({});
  const [playerName, setPlayerName] = useState("");
  const [pitcherName, setPitcherName] = useState("");
  const [batterName, setBatterName] = useState("");
  const [speedMode, setSpeedMode] = useState<SpeedFilterMode>("any");
  const [speedSingle, setSpeedSingle] = useState(95);
  const [speedRangeMin, setSpeedRangeMin] = useState(90);
  const [speedRangeMax, setSpeedRangeMax] = useState(100);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const { min_speed: _min, max_speed: _max, ...rest } = filters;
    onFilterChange({
      ...rest,
      ...buildSpeedFilterParams(
        speedMode,
        speedSingle,
        speedRangeMin,
        speedRangeMax
      ),
    });
  };

  const handleSelectChange =
    (field: "pitch_type" | "team") =>
    (event: ChangeEvent<HTMLSelectElement>) => {
      const value = event.target.value || undefined;
      setFilters((current) => ({ ...current, [field]: value }));
    };

  const handlePlayerChange = (playerId?: number, displayName?: string) => {
    setFilters((current) => ({
      ...current,
      player_id: playerId,
      pitcher_id: undefined,
      batter_id: undefined,
    }));
    setPlayerName(displayName ?? "");
    if (playerId !== undefined) {
      setPitcherName("");
      setBatterName("");
    }
  };

  const handlePitcherChange = (playerId?: number, displayName?: string) => {
    setFilters((current) => ({
      ...current,
      pitcher_id: playerId,
      player_id: undefined,
    }));
    setPitcherName(displayName ?? "");
    if (playerId !== undefined) {
      setPlayerName("");
    }
  };

  const handleBatterChange = (playerId?: number, displayName?: string) => {
    setFilters((current) => ({
      ...current,
      batter_id: playerId,
      player_id: undefined,
    }));
    setBatterName(displayName ?? "");
    if (playerId !== undefined) {
      setPlayerName("");
    }
  };

  const clearFilters = () => {
    setFilters({});
    setPlayerName("");
    setPitcherName("");
    setBatterName("");
    setSpeedMode("any");
    setSpeedSingle(95);
    setSpeedRangeMin(90);
    setSpeedRangeMax(100);
    onFilterChange({});
  };

  return (
    <div className="filter-controls">
      <h3>Filter Pitches</h3>
      <p className="filter-hint">
        Use <strong>Player (threw or saw)</strong> for all pitches involving a
        player. Use Pitcher or Batter for role-specific searches.
      </p>

      <form className="pitch-filter-form" onSubmit={handleSubmit}>
        <SearchablePlayerSelect
          id="player-filter"
          label="Player (threw or saw):"
          value={filters.player_id}
          displayValue={playerName}
          onChange={handlePlayerChange}
          placeholder="Search any player..."
        />

        <SearchablePlayerSelect
          id="pitcher-filter"
          label="Pitcher only:"
          value={filters.pitcher_id}
          displayValue={pitcherName}
          onChange={handlePitcherChange}
          placeholder="Search pitcher name..."
        />

        <SearchablePlayerSelect
          id="batter-filter"
          label="Batter only:"
          value={filters.batter_id}
          displayValue={batterName}
          onChange={handleBatterChange}
          placeholder="Search batter name..."
        />

        <SpeedFilterControl
          mode={speedMode}
          singleValue={speedSingle}
          rangeMin={speedRangeMin}
          rangeMax={speedRangeMax}
          onModeChange={setSpeedMode}
          onSingleValueChange={setSpeedSingle}
          onRangeMinChange={setSpeedRangeMin}
          onRangeMaxChange={setSpeedRangeMax}
        />

        <div className="filter-group">
          <label htmlFor="pitch-type-filter">Pitch Type:</label>
          <select
            id="pitch-type-filter"
            value={filters.pitch_type || ""}
            onChange={handleSelectChange("pitch_type")}
          >
            <option value="">All Types</option>
            <option value="FF">FF (Four-seam)</option>
            <option value="SL">SL (Slider)</option>
            <option value="CU">CU (Curveball)</option>
            <option value="CH">CH (Changeup)</option>
            <option value="SI">SI (Sinker)</option>
            <option value="FC">FC (Cutter)</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="pitch-team-filter">Game Team:</label>
          <select
            id="pitch-team-filter"
            value={filters.team || ""}
            onChange={handleSelectChange("team")}
          >
            <option value="">All Teams</option>
            {availableTeams.map((team) => (
              <option key={team} value={team}>
                {team}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-actions">
          <button type="submit" className="apply-filters">
            Apply Filters
          </button>
          <button type="button" onClick={clearFilters} className="clear-filters">
            Clear Filters
          </button>
        </div>
      </form>
    </div>
  );
};

export default PitchFilterControls;
