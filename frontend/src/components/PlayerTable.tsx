import React from "react";
import { Player } from "../types";
import Pagination from "./Pagination";
import {
  formatCellValue,
  getPlayerCellValue,
  PLAYER_COLUMNS,
} from "../utils/columns";

interface PlayerTableProps {
  players?: Player[];
  total?: number;
  page?: number;
  totalPages?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPlayerSelect?: (player: Player) => void;
  isLoading?: boolean;
  error?: string;
}

const PlayerTable: React.FC<PlayerTableProps> = ({
  players = [],
  total = 0,
  page = 1,
  totalPages = 0,
  pageSize = 10,
  onPageChange,
  onPlayerSelect,
  isLoading = false,
  error,
}) => {
  if (isLoading && players.length === 0) {
    return (
      <div className="data-table-card">
        <div className="loading">Loading players...</div>
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

  if (players.length === 0) {
    return (
      <div className="data-table-card">
        <div className="no-data">No players found.</div>
      </div>
    );
  }

  return (
    <div className="data-table-card player-table wide-table">
      <div className="table-card-header">
        <h2>Players</h2>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              {PLAYER_COLUMNS.map((column) => (
                <th key={String(column.key)} className={column.className}>
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {players.map((player) => (
              <tr
                key={player.player_id}
                className={onPlayerSelect ? "player-row-clickable" : undefined}
                onClick={
                  onPlayerSelect ? () => onPlayerSelect(player) : undefined
                }
                onKeyDown={
                  onPlayerSelect
                    ? (event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          onPlayerSelect(player);
                        }
                      }
                    : undefined
                }
                tabIndex={onPlayerSelect ? 0 : undefined}
                role={onPlayerSelect ? "button" : undefined}
              >
                {PLAYER_COLUMNS.map((column) => {
                  const value = getPlayerCellValue(player, column.key);
                  const isNameColumn =
                    column.key === "first_name" || column.key === "last_name";

                  return (
                    <td
                      key={String(column.key)}
                      className={column.className}
                    >
                      {onPlayerSelect && isNameColumn ? (
                        <span className="player-link">
                          {formatCellValue(value)}
                        </span>
                      ) : (
                        formatCellValue(value)
                      )}
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
          label="players"
        />
      )}
    </div>
  );
};

export default PlayerTable;
