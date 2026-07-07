import React, { useCallback, useEffect, useState } from "react";
import PitchTable from "./PitchTable";
import ApiService from "../services/api";
import { DEFAULT_PAGE_SIZE, Pitch, Player } from "../types";
import {
  formatCellValue,
  getPlayerCellValue,
  PLAYER_COLUMNS,
} from "../utils/columns";

interface PlayerDetailPageProps {
  playerId: number;
  onBack: () => void;
  onPlayerSelect?: (playerId: number) => void;
}

function formatName(player: Player): string {
  return `${player.first_name} ${player.last_name}`;
}

const PlayerDetailPage: React.FC<PlayerDetailPageProps> = ({
  playerId,
  onBack,
  onPlayerSelect,
}) => {
  const [player, setPlayer] = useState<Player | null>(null);
  const [playerError, setPlayerError] = useState("");
  const [isLoadingPlayer, setIsLoadingPlayer] = useState(true);

  const [pitchesThrown, setPitchesThrown] = useState(0);
  const [pitchesSeen, setPitchesSeen] = useState(0);
  const [pitchesTotal, setPitchesTotal] = useState(0);

  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [pitchColumns, setPitchColumns] = useState<string[]>([]);
  const [pitchPage, setPitchPage] = useState(1);
  const [pitchTotalPages, setPitchTotalPages] = useState(0);
  const [isLoadingPitches, setIsLoadingPitches] = useState(true);
  const [pitchError, setPitchError] = useState("");

  useEffect(() => {
    const loadPlayer = async () => {
      setIsLoadingPlayer(true);
      setPlayerError("");
      try {
        const data = await ApiService.getPlayer(playerId);
        setPlayer(data);
      } catch (error) {
        setPlayer(null);
        setPlayerError(
          error instanceof Error ? error.message : "Failed to load player"
        );
      } finally {
        setIsLoadingPlayer(false);
      }
    };

    const loadStats = async () => {
      try {
        const [thrown, seen, total] = await Promise.all([
          ApiService.getPitchCount({ pitcher_id: playerId }),
          ApiService.getPitchCount({ batter_id: playerId }),
          ApiService.getPitchCount({ player_id: playerId }),
        ]);
        setPitchesThrown(thrown.total);
        setPitchesSeen(seen.total);
        setPitchesTotal(total.total);
      } catch (error) {
        console.error("Failed to load pitch stats", error);
      }
    };

    loadPlayer();
    loadStats();
    setPitchPage(1);
  }, [playerId]);

  const loadPitches = useCallback(async () => {
    setIsLoadingPitches(true);
    setPitchError("");
    try {
      const response = await ApiService.getPitches(
        { player_id: playerId },
        { page: pitchPage, limit: DEFAULT_PAGE_SIZE }
      );
      setPitches(response.pitches);
      if (response.columns?.length) {
        setPitchColumns(response.columns);
      }
      setPitchTotalPages(response.total_pages);
    } catch (error) {
      setPitches([]);
      setPitchTotalPages(0);
      setPitchError(
        error instanceof Error ? error.message : "Failed to load pitches"
      );
    } finally {
      setIsLoadingPitches(false);
    }
  }, [playerId, pitchPage]);

  useEffect(() => {
    loadPitches();
  }, [loadPitches]);

  if (isLoadingPlayer) {
    return (
      <div className="App">
        <main>
          <div className="loading">Loading player...</div>
        </main>
      </div>
    );
  }

  if (playerError || !player) {
    return (
      <div className="App">
        <main>
          <button type="button" className="back-button" onClick={onBack}>
            ← Back to all players
          </button>
          <div className="error">{playerError || "Player not found"}</div>
        </main>
      </div>
    );
  }

  return (
    <div className="App">
      <header>
        <button type="button" className="back-button" onClick={onBack}>
          ← Back to all players
        </button>
        <h1>{formatName(player)}</h1>
        <p>
          {player.team} · {player.primary_position}
        </p>
      </header>

      <main>
        <section className="player-detail-card">
          <h2>Player Info</h2>
          <p className="table-count-summary">
            All <strong>{PLAYER_COLUMNS.length}</strong> database fields
          </p>
          <dl className="player-detail-grid">
            {PLAYER_COLUMNS.map((column) => (
              <div key={String(column.key)}>
                <dt>{column.label}</dt>
                <dd>{formatCellValue(getPlayerCellValue(player, column.key))}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="player-stats-row">
          <div className="stat-card">
            <span className="stat-value">{pitchesThrown.toLocaleString()}</span>
            <span className="stat-label">Pitches thrown</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{pitchesSeen.toLocaleString()}</span>
            <span className="stat-label">Pitches seen</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{pitchesTotal.toLocaleString()}</span>
            <span className="stat-label">Total involved</span>
          </div>
        </section>

        <section className="data-section">
          <PitchTable
            pitches={pitches}
            columns={pitchColumns}
            total={pitchesTotal}
            page={pitchPage}
            totalPages={pitchTotalPages}
            pageSize={DEFAULT_PAGE_SIZE}
            onPageChange={setPitchPage}
            onPlayerSelect={onPlayerSelect}
            isLoading={isLoadingPitches}
            error={pitchError}
          />
        </section>
      </main>
    </div>
  );
};

export default PlayerDetailPage;
