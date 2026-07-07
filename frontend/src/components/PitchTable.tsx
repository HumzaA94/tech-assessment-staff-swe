import React, { useMemo } from "react";
import { Pitch } from "../types";
import Pagination from "./Pagination";
import {
  formatCellValue,
  formatColumnLabel,
  getPitchCellValue,
  orderPitchColumns,
} from "../utils/columns";

interface PitchTableProps {
  pitches?: Pitch[];
  columns?: string[];
  total?: number;
  page?: number;
  totalPages?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPlayerSelect?: (playerId: number) => void;
  isLoading?: boolean;
  error?: string;
}

function getPitchPlayerId(pitch: Pitch, column: string): number | null {
  const rawId =
    column === "pitcher_name"
      ? pitch.pitcher
      : column === "batter_name"
        ? pitch.batter
        : null;

  if (rawId === null || rawId === undefined || rawId === "") {
    return null;
  }

  const playerId = Number(rawId);
  return Number.isFinite(playerId) ? playerId : null;
}

function renderPitchCell(
  pitch: Pitch,
  column: string,
  onPlayerSelect?: (playerId: number) => void
): React.ReactNode {
  const value = getPitchCellValue(pitch, column);
  const isPlayerName = column === "pitcher_name" || column === "batter_name";
  const playerId = isPlayerName ? getPitchPlayerId(pitch, column) : null;
  const displayValue = formatCellValue(value);

  if (column === "pitch_type" && value) {
    return <span className="pitch-type-badge">{displayValue}</span>;
  }

  if (column === "release_speed" && value) {
    return `${displayValue} mph`;
  }

  if (onPlayerSelect && isPlayerName && playerId !== null && value) {
    return (
      <button
        type="button"
        className="player-link"
        onClick={(event) => {
          event.stopPropagation();
          onPlayerSelect(playerId);
        }}
      >
        {displayValue}
      </button>
    );
  }

  return displayValue;
}

const PitchTable: React.FC<PitchTableProps> = ({
  pitches = [],
  columns,
  total = 0,
  page = 1,
  totalPages = 0,
  pageSize = 10,
  onPageChange,
  onPlayerSelect,
  isLoading = false,
  error,
}) => {
  const pitchColumns = useMemo(
    () => orderPitchColumns(columns, pitches),
    [columns, pitches]
  );

  if (isLoading && pitches.length === 0) {
    return (
      <div className="data-table-card">
        <div className="loading">Loading pitches...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="data-table-card">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  if (pitches.length === 0) {
    return (
      <div className="data-table-card">
        <div className="no-data">No pitches found.</div>
      </div>
    );
  }

  return (
    <div className="data-table-card pitch-table wide-table">
      <div className="table-card-header">
        <h2>Pitch History</h2>
      </div>

      <div className="table-container">
        <table className="data-table data-table-compact">
          <thead>
            <tr>
              {pitchColumns.map((column) => (
                <th key={column} title={column}>
                  {formatColumnLabel(column)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pitches.map((pitch, index) => (
              <tr key={`${pitch.game_date}-${pitch.pitcher}-${pitch.batter}-${index}`}>
                {pitchColumns.map((column) => {
                  const value = getPitchCellValue(pitch, column);
                  const isPlayerName =
                    column === "pitcher_name" || column === "batter_name";

                  return (
                    <td
                      key={column}
                      className={isPlayerName ? "col-player-name" : undefined}
                      title={formatCellValue(value)}
                    >
                      {renderPitchCell(pitch, column, onPlayerSelect)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {onPageChange && (
        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          pageSize={pageSize}
          onPageChange={onPageChange}
          isLoading={isLoading}
          label="pitches"
        />
      )}
    </div>
  );
};

export default PitchTable;
