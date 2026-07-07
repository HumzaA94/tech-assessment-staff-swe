import React from "react";

export type SpeedFilterMode = "any" | "at_least" | "at_most" | "between";

export const SPEED_MIN = 60;
export const SPEED_MAX = 105;

interface SpeedFilterControlProps {
  mode: SpeedFilterMode;
  singleValue: number;
  rangeMin: number;
  rangeMax: number;
  onModeChange: (mode: SpeedFilterMode) => void;
  onSingleValueChange: (value: number) => void;
  onRangeMinChange: (value: number) => void;
  onRangeMaxChange: (value: number) => void;
}

function clampSpeed(value: number): number {
  return Math.min(SPEED_MAX, Math.max(SPEED_MIN, value));
}

const SpeedFilterControl: React.FC<SpeedFilterControlProps> = ({
  mode,
  singleValue,
  rangeMin,
  rangeMax,
  onModeChange,
  onSingleValueChange,
  onRangeMinChange,
  onRangeMaxChange,
}) => {
  const handleModeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onModeChange(event.target.value as SpeedFilterMode);
  };

  return (
    <div className="filter-group speed-filter-group">
      <label htmlFor="speed-mode-filter">Speed (mph)</label>
      <select
        id="speed-mode-filter"
        value={mode}
        onChange={handleModeChange}
      >
        <option value="any">Any speed</option>
        <option value="at_least">At least</option>
        <option value="at_most">At most</option>
        <option value="between">Between</option>
      </select>

      {mode === "at_least" && (
        <div className="speed-slider-row">
          <input
            type="range"
            min={SPEED_MIN}
            max={SPEED_MAX}
            step="0.5"
            value={singleValue}
            onChange={(event) =>
              onSingleValueChange(clampSpeed(Number(event.target.value)))
            }
            aria-label="Minimum speed"
          />
          <input
            type="number"
            min={SPEED_MIN}
            max={SPEED_MAX}
            step="0.5"
            value={singleValue}
            onChange={(event) =>
              onSingleValueChange(clampSpeed(Number(event.target.value)))
            }
            aria-label="Minimum speed value"
          />
          <span className="speed-value-label">≥ {singleValue} mph</span>
        </div>
      )}

      {mode === "at_most" && (
        <div className="speed-slider-row">
          <input
            type="range"
            min={SPEED_MIN}
            max={SPEED_MAX}
            step="0.5"
            value={singleValue}
            onChange={(event) =>
              onSingleValueChange(clampSpeed(Number(event.target.value)))
            }
            aria-label="Maximum speed"
          />
          <input
            type="number"
            min={SPEED_MIN}
            max={SPEED_MAX}
            step="0.5"
            value={singleValue}
            onChange={(event) =>
              onSingleValueChange(clampSpeed(Number(event.target.value)))
            }
            aria-label="Maximum speed value"
          />
          <span className="speed-value-label">≤ {singleValue} mph</span>
        </div>
      )}

      {mode === "between" && (
        <div className="speed-between-controls">
          <div className="speed-slider-row">
            <span className="speed-bound-label">Min</span>
            <input
              type="range"
              min={SPEED_MIN}
              max={SPEED_MAX}
              step="0.5"
              value={Math.min(rangeMin, rangeMax)}
              onChange={(event) =>
                onRangeMinChange(clampSpeed(Number(event.target.value)))
              }
              aria-label="Range minimum speed"
            />
            <input
              type="number"
              min={SPEED_MIN}
              max={SPEED_MAX}
              step="0.5"
              value={rangeMin}
              onChange={(event) =>
                onRangeMinChange(clampSpeed(Number(event.target.value)))
              }
              aria-label="Range minimum speed value"
            />
          </div>
          <div className="speed-slider-row">
            <span className="speed-bound-label">Max</span>
            <input
              type="range"
              min={SPEED_MIN}
              max={SPEED_MAX}
              step="0.5"
              value={Math.max(rangeMin, rangeMax)}
              onChange={(event) =>
                onRangeMaxChange(clampSpeed(Number(event.target.value)))
              }
              aria-label="Range maximum speed"
            />
            <input
              type="number"
              min={SPEED_MIN}
              max={SPEED_MAX}
              step="0.5"
              value={rangeMax}
              onChange={(event) =>
                onRangeMaxChange(clampSpeed(Number(event.target.value)))
              }
              aria-label="Range maximum speed value"
            />
          </div>
          <span className="speed-value-label">
            {Math.min(rangeMin, rangeMax)}–{Math.max(rangeMin, rangeMax)} mph
          </span>
        </div>
      )}
    </div>
  );
};

export function buildSpeedFilterParams(
  mode: SpeedFilterMode,
  singleValue: number,
  rangeMin: number,
  rangeMax: number
): { min_speed?: number; max_speed?: number } {
  switch (mode) {
    case "at_least":
      return { min_speed: singleValue };
    case "at_most":
      return { max_speed: singleValue };
    case "between":
      return {
        min_speed: Math.min(rangeMin, rangeMax),
        max_speed: Math.max(rangeMin, rangeMax),
      };
    default:
      return {};
  }
}

export default SpeedFilterControl;
