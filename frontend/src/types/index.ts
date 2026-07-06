export interface Player {
  player_id: number;
  first_name: string;
  last_name: string;
  birthdate: string;
  birth_country: string | null;
  birth_state: string | null;
  height_feet: number;
  height_inches: number;
  weight: number;
  team: string;
  primary_position: string;
  throws: string;
  bats: string;
}

export type Pitch = Record<string, string | number | null | undefined> & {
  game_date: string;
  pitcher: number | string;
  batter: number | string;
  pitcher_name?: string | null;
  batter_name?: string | null;
};

export interface PlayerOption {
  player_id: number;
  display_name: string;
  team: string;
  primary_position: string;
}

export interface PlayerOptionsResponse {
  options: PlayerOption[];
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  count: number;
}

export interface PlayerFilterOptions {
  team?: string[];
  position?: string[];
}

export interface PitchFilterOptions {
  player_id?: number;
  pitcher_id?: number;
  batter_id?: number;
  min_speed?: number;
  max_speed?: number;
  pitch_type?: string;
  team?: string;
}

export interface PlayerListResponse extends PaginatedResponse {
  players: Player[];
}

export interface PitchListResponse extends PaginatedResponse {
  pitches: Pitch[];
  columns?: string[];
}

export interface PlayerMetadata {
  teams: string[];
  positions: string[];
}

export const DEFAULT_PAGE_SIZE = 10;
