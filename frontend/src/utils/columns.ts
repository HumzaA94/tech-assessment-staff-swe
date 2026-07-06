import { Pitch, Player } from "../types";

export interface ColumnDef<T> {
  key: keyof T | string;
  label: string;
  className?: string;
}

export function formatColumnLabel(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatCellValue(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "—";
  }
  return String(value);
}

export const PLAYER_COLUMNS: ColumnDef<Player>[] = [
  { key: "player_id", label: "ID", className: "col-id" },
  { key: "first_name", label: "First Name", className: "col-name" },
  { key: "last_name", label: "Last Name", className: "col-name" },
  { key: "birthdate", label: "Birthdate", className: "col-date" },
  { key: "birth_country", label: "Birth Country", className: "col-birth" },
  { key: "birth_state", label: "Birth State", className: "col-birth" },
  { key: "height_feet", label: "Height (ft)", className: "col-height" },
  { key: "height_inches", label: "Height (in)", className: "col-height" },
  { key: "weight", label: "Weight (lbs)", className: "col-weight" },
  { key: "team", label: "Team", className: "col-team" },
  { key: "primary_position", label: "Position", className: "col-position" },
  { key: "throws", label: "Throws", className: "col-bats" },
  { key: "bats", label: "Bats", className: "col-bats" },
];

const PITCH_COLUMN_PRIORITY = [
  "game_date",
  "home_team",
  "away_team",
  "pitch_type",
  "pitch_name",
  "pitcher_name",
  "batter_name",
  "release_speed",
  "release_spin_rate",
  "release_extension",
  "release_pos_x",
  "release_pos_y",
  "release_pos_z",
  "plate_x",
  "plate_z",
  "zone",
  "type",
  "description",
  "events",
  "balls",
  "strikes",
  "outs_when_up",
  "inning",
  "inning_topbot",
  "stand",
  "p_throws",
  "launch_speed",
  "launch_angle",
  "hit_distance_sc",
];

const HIDDEN_PITCH_COLUMNS = new Set(["pitcher", "batter"]);

export function orderPitchColumns(
  apiColumns: string[] | undefined,
  pitches: Pitch[]
): string[] {
  const discovered = new Set<string>();

  if (apiColumns?.length) {
    apiColumns.forEach((column) => discovered.add(column));
  }

  pitches.forEach((pitch) => {
    Object.keys(pitch).forEach((column) => discovered.add(column));
  });

  const ordered: string[] = [];
  for (const column of PITCH_COLUMN_PRIORITY) {
    if (discovered.has(column)) {
      ordered.push(column);
      discovered.delete(column);
    }
  }

  return [...ordered, ...Array.from(discovered).sort()].filter(
    (column) => !HIDDEN_PITCH_COLUMNS.has(column)
  );
}

export function getPlayerCellValue(
  player: Player,
  key: keyof Player | string
): unknown {
  return player[key as keyof Player];
}

export function getPitchCellValue(pitch: Pitch, key: string): unknown {
  return pitch[key];
}
