import { describe, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "./App";

vi.mock("./services/api", () => ({
  default: {
    getPlayerMetadata: vi.fn().mockResolvedValue({
      teams: ["HOU", "NYY"],
      positions: ["SS", "CF"],
    }),
    getPlayers: vi.fn().mockResolvedValue({
      total: 1,
      page: 1,
      limit: 10,
      total_pages: 1,
      count: 1,
      players: [
        {
          player_id: 1,
          first_name: "Test",
          last_name: "Player",
          birthdate: "1990-01-01",
          birth_country: "USA",
          birth_state: "TX",
          height_feet: 6,
          height_inches: 1,
          weight: 200,
          team: "HOU",
          primary_position: "SS",
          throws: "R",
          bats: "R",
        },
      ],
    }),
    getPitches: vi.fn().mockResolvedValue({
      total: 1,
      page: 1,
      limit: 10,
      total_pages: 1,
      count: 1,
      pitches: [
        {
          pitch_type: "FF",
          game_date: "2025-10-01",
          pitcher: 123,
          batter: 456,
          pitcher_name: "Test Pitcher",
          batter_name: "Test Batter",
          release_speed: "97.5",
          release_spin_rate: null,
          description: "called_strike",
          events: null,
          inning: 1,
          home_team: "HOU",
          away_team: "NYY",
        },
      ],
    }),
  },
}));

describe("App Component", () => {
  test("renders dashboard heading and player data", async () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { name: /baseball player statistics/i })
    ).toBeInTheDocument();

    expect(await screen.findByText("Test")).toBeInTheDocument();
    expect(await screen.findByText("Player")).toBeInTheDocument();
    expect(await screen.findByText("Test Pitcher")).toBeInTheDocument();
    expect(await screen.findByText("97.5 mph")).toBeInTheDocument();
  });
});
