import React, { useCallback, useEffect, useState } from "react";
import "./App.css";
import PitchFilterControls from "./components/PitchFilterControls";
import PitchTable from "./components/PitchTable";
import PlayerDetailPage from "./components/PlayerDetailPage";
import PlayerFilterControls from "./components/PlayerFilterControls";
import PlayerTable from "./components/PlayerTable";
import ApiService from "./services/api";
import {
  DEFAULT_PAGE_SIZE,
  Pitch,
  PitchFilterOptions,
  Player,
  PlayerFilterOptions,
} from "./types";

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}

const App: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [playerTotal, setPlayerTotal] = useState(0);
  const [playerPage, setPlayerPage] = useState(1);
  const [playerTotalPages, setPlayerTotalPages] = useState(0);
  const [playerFilters, setPlayerFilters] = useState<PlayerFilterOptions>({});
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(true);
  const [playerError, setPlayerError] = useState("");

  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [pitchColumns, setPitchColumns] = useState<string[]>([]);
  const [pitchTotal, setPitchTotal] = useState(0);
  const [pitchPage, setPitchPage] = useState(1);
  const [pitchTotalPages, setPitchTotalPages] = useState(0);
  const [pitchFilters, setPitchFilters] = useState<PitchFilterOptions>({});
  const [isLoadingPitches, setIsLoadingPitches] = useState(true);
  const [pitchError, setPitchError] = useState("");

  const [availableTeams, setAvailableTeams] = useState<string[]>([]);
  const [availablePositions, setAvailablePositions] = useState<string[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const metadata = await ApiService.getPlayerMetadata();
        setAvailableTeams(metadata.teams);
        setAvailablePositions(metadata.positions);
      } catch (error) {
        console.error("Failed to load metadata", error);
      }
    };

    loadMetadata();
  }, []);

  const loadPlayers = useCallback(
    async (filters: PlayerFilterOptions, page: number) => {
      setIsLoadingPlayers(true);
      setPlayerError("");

      try {
        const response = await ApiService.getPlayers(filters, {
          page,
          limit: DEFAULT_PAGE_SIZE,
        });
        setPlayers(response.players);
        setPlayerTotal(response.total);
        setPlayerPage(response.page);
        setPlayerTotalPages(response.total_pages);
      } catch (error) {
        setPlayers([]);
        setPlayerTotal(0);
        setPlayerTotalPages(0);
        setPlayerError(getErrorMessage(error, "Failed to load players"));
      } finally {
        setIsLoadingPlayers(false);
      }
    },
    []
  );

  const loadPitches = useCallback(
    async (filters: PitchFilterOptions, page: number) => {
      setIsLoadingPitches(true);
      setPitchError("");

      try {
        const response = await ApiService.getPitches(filters, {
          page,
          limit: DEFAULT_PAGE_SIZE,
        });
        setPitches(response.pitches);
        if (response.columns?.length) {
          setPitchColumns(response.columns);
        }
        setPitchTotal(response.total);
        setPitchPage(response.page);
        setPitchTotalPages(response.total_pages);
      } catch (error) {
        setPitches([]);
        setPitchTotal(0);
        setPitchTotalPages(0);
        setPitchError(getErrorMessage(error, "Failed to load pitches"));
      } finally {
        setIsLoadingPitches(false);
      }
    },
    []
  );

  useEffect(() => {
    loadPlayers(playerFilters, playerPage);
  }, [loadPlayers, playerFilters, playerPage]);

  useEffect(() => {
    loadPitches(pitchFilters, pitchPage);
  }, [loadPitches, pitchFilters, pitchPage]);

  const handlePlayerFilterChange = (filters: PlayerFilterOptions) => {
    setPlayerFilters(filters);
    setPlayerPage(1);
  };

  const handlePitchFilterChange = (filters: PitchFilterOptions) => {
    setPitchFilters(filters);
    setPitchPage(1);
  };

  if (selectedPlayerId !== null) {
    return (
      <PlayerDetailPage
        playerId={selectedPlayerId}
        onBack={() => setSelectedPlayerId(null)}
        onPlayerSelect={(playerId) => setSelectedPlayerId(playerId)}
      />
    );
  }

  return (
    <div className="App">
      <header>
        <h1>Baseball Player Statistics</h1>
        <p>Explore player statistics</p>
      </header>

      <main>
        <section className="filter-section">
          <PlayerFilterControls
            onFilterChange={handlePlayerFilterChange}
            availableTeams={availableTeams}
            availablePositions={availablePositions}
          />
        </section>

        <section className="data-section">
          <PlayerTable
            players={players}
            total={playerTotal}
            page={playerPage}
            totalPages={playerTotalPages}
            pageSize={DEFAULT_PAGE_SIZE}
            onPageChange={setPlayerPage}
            onPlayerSelect={(player) => setSelectedPlayerId(player.player_id)}
            isLoading={isLoadingPlayers}
            error={playerError}
          />
        </section>

        <section className="filter-section">
          <PitchFilterControls
            onFilterChange={handlePitchFilterChange}
            availableTeams={availableTeams}
          />
        </section>

        <section className="data-section">
          <PitchTable
            pitches={pitches}
            columns={pitchColumns}
            total={pitchTotal}
            page={pitchPage}
            totalPages={pitchTotalPages}
            pageSize={DEFAULT_PAGE_SIZE}
            onPageChange={setPitchPage}
            onPlayerSelect={(playerId) => setSelectedPlayerId(playerId)}
            isLoading={isLoadingPitches}
            error={pitchError}
          />
        </section>
      </main>

      <footer>
        <p>Houston Astros - Staff Software Engineer Assessment</p>
      </footer>
    </div>
  );
};

export default App;
