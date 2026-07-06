import axios from "axios";
import {
  Pitch,
  PitchFilterOptions,
  PitchListResponse,
  PaginationParams,
  Player,
  PlayerFilterOptions,
  PlayerListResponse,
  PlayerMetadata,
  PlayerOption,
  PlayerOptionsResponse,
} from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

function assertListResponse<T>(
  data: unknown,
  key: "players" | "pitches",
  label: string
): PlayerListResponse | PitchListResponse {
  if (
    !data ||
    typeof data !== "object" ||
    !Array.isArray((data as Record<string, unknown>)[key])
  ) {
    throw new Error(
      `Invalid ${label} response. Ensure the backend is running (port 5001) and restarted after recent API changes.`
    );
  }

  const record = data as Record<string, unknown>;
    return {
      total: typeof record.total === "number" ? record.total : 0,
      page: typeof record.page === "number" ? record.page : 1,
      limit: typeof record.limit === "number" ? record.limit : 10,
      total_pages: typeof record.total_pages === "number" ? record.total_pages : 0,
      count: typeof record.count === "number" ? record.count : 0,
      [key]: record[key] as T[],
      ...(key === "pitches" && Array.isArray(record.columns)
        ? { columns: record.columns as string[] }
        : {}),
    } as unknown as PlayerListResponse | PitchListResponse;
}

function buildParams(
  filters: Record<string, string | number | string[] | undefined>
): URLSearchParams {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === "") {
      continue;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== "") {
          params.append(key, item);
        }
      });
      continue;
    }

    params.append(key, String(value));
  }

  return params;
}

export class ApiService {
  static async getPlayers(
    filters?: PlayerFilterOptions,
    pagination?: PaginationParams
  ): Promise<PlayerListResponse> {
    const response = await api.get("/players", {
      params: buildParams({
        team: filters?.team,
        position: filters?.position,
        page: pagination?.page,
        limit: pagination?.limit,
      }),
    });
    return assertListResponse<Player>(
      response.data,
      "players",
      "players"
    ) as PlayerListResponse;
  }

  static async getPlayerMetadata(): Promise<PlayerMetadata> {
    const response = await api.get<PlayerMetadata>("/players/meta");
    return response.data;
  }

  static async getPlayerOptions(
    search = "",
    limit = 25
  ): Promise<PlayerOption[]> {
    const response = await api.get<PlayerOptionsResponse>("/players/options", {
      params: buildParams({ search, limit }),
    });
    return response.data.options;
  }

  static async getPlayer(playerId: number): Promise<Player> {
    const response = await api.get<Player>(`/players/${playerId}`);
    return response.data;
  }

  static async getPitches(
    filters?: PitchFilterOptions,
    pagination?: PaginationParams
  ): Promise<PitchListResponse> {
    const response = await api.get("/pitches", {
      params: buildParams({
        player_id: filters?.player_id,
        pitcher_id: filters?.pitcher_id,
        batter_id: filters?.batter_id,
        min_speed: filters?.min_speed,
        max_speed: filters?.max_speed,
        pitch_type: filters?.pitch_type,
        team: filters?.team,
        page: pagination?.page,
        limit: pagination?.limit,
      }),
    });
    return assertListResponse<Pitch>(
      response.data,
      "pitches",
      "pitches"
    ) as PitchListResponse;
  }

  static async getPitchCount(
    filters?: PitchFilterOptions
  ): Promise<{ total: number }> {
    const response = await api.get<{ total: number }>("/pitches/count", {
      params: buildParams({
        player_id: filters?.player_id,
        pitcher_id: filters?.pitcher_id,
        batter_id: filters?.batter_id,
        min_speed: filters?.min_speed,
        max_speed: filters?.max_speed,
        pitch_type: filters?.pitch_type,
        team: filters?.team,
      }),
    });
    return response.data;
  }

  static async healthCheck(): Promise<{ status: string }> {
    const response = await api.get<{ status: string }>("/health");
    return response.data;
  }
}

export default ApiService;
