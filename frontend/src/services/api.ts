import axios from "axios";
import {
  PitchFilterOptions,
  PitchListResponse,
  PaginationParams,
  Player,
  PlayerFilterOptions,
  PlayerListResponse,
  PlayerMetadata,
  PlayerOption,
} from "../types";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:5001",
});

export class ApiService {
  static async getPlayers(
    filters?: PlayerFilterOptions,
    pagination?: PaginationParams
  ): Promise<PlayerListResponse> {
    const { data } = await api.get<PlayerListResponse>("/players", {
      params: {
        team: filters?.team,
        position: filters?.position,
        page: pagination?.page,
        limit: pagination?.limit,
      },
      paramsSerializer: {
        indexes: null,
      },
    });
    return data;
  }

  static async getPlayerMetadata(): Promise<PlayerMetadata> {
    const { data } = await api.get<PlayerMetadata>("/players/meta");
    return data;
  }

  static async getPlayerOptions(
    search = "",
    limit = 25
  ): Promise<PlayerOption[]> {
    const { data } = await api.get<{ options: PlayerOption[] }>(
      "/players/options",
      { params: { search, limit } }
    );
    return data.options;
  }

  static async getPlayer(playerId: number): Promise<Player> {
    const { data } = await api.get<Player>(`/players/${playerId}`);
    return data;
  }

  static async getPitches(
    filters?: PitchFilterOptions,
    pagination?: PaginationParams
  ): Promise<PitchListResponse> {
    const { data } = await api.get<PitchListResponse>("/pitches", {
      params: {
        ...filters,
        page: pagination?.page,
        limit: pagination?.limit,
      },
    });
    return data;
  }

  static async getPitchCount(
    filters?: PitchFilterOptions
  ): Promise<{ total: number }> {
    const { data } = await api.get<{ total: number }>("/pitches/count", {
      params: filters,
    });
    return data;
  }

  static async healthCheck(): Promise<{ status: string }> {
    const { data } = await api.get<{ status: string }>("/health");
    return data;
  }
}

export default ApiService;
