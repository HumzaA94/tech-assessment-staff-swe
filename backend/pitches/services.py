"""Services for the pitches module."""
from sqlalchemy import Float, MetaData, Table, cast, func, or_, select, text

from config import db
from pitches.constants import HIDDEN_PITCH_COLUMNS, PITCH_COLUMN_PRIORITY
from players.services import format_player_name, load_players_by_ids
from utils.pagination import paginate_select

_pitches_table = None

def get_pitches_table() -> Table:
    """Get the pitches table from the database."""
    global _pitches_table
    if _pitches_table is None:
        metadata = MetaData()
        metadata.reflect(bind=db.engine, only=["pitches"])
        _pitches_table = metadata.tables["pitches"]
    return _pitches_table


def ordered_pitch_columns() -> list[str]:
    """Return ordered list of pitch column names."""
    pitches = get_pitches_table()
    db_columns = [column.name for column in pitches.columns]
    ordered: list[str] = []

    for column in PITCH_COLUMN_PRIORITY:
        if column in ("pitcher_name", "batter_name"):
            if column not in ordered:
                ordered.append(column)
        elif column in db_columns and column not in ordered:
            ordered.append(column)

    for column in sorted(db_columns):
        if column not in ordered:
            ordered.append(column)

    return [column for column in ordered if column not in HIDDEN_PITCH_COLUMNS]


def serialize_pitches_with_names(pitch_rows: list[dict]) -> list[dict]:
    """Serialize pitch rows with player names."""
    player_ids: set[int] = set()
    for row in pitch_rows:
        for key in ("pitcher", "batter"):
            value = row.get(key)
            if value is not None and str(value).isdigit():
                player_ids.add(int(value))

    players_by_id = load_players_by_ids(player_ids)

    serialized = []
    for row in pitch_rows:
        data = dict(row)
        pitcher_id = data.get("pitcher")
        batter_id = data.get("batter")
        pitcher_key = int(pitcher_id) if pitcher_id is not None and str(pitcher_id).isdigit() else None
        batter_key = int(batter_id) if batter_id is not None and str(batter_id).isdigit() else None
        data["pitcher_name"] = format_player_name(
            players_by_id.get(pitcher_key) if pitcher_key is not None else None
        )
        data["batter_name"] = format_player_name(
            players_by_id.get(batter_key) if batter_key is not None else None
        )
        serialized.append(data)
    return serialized


def build_pitch_query(
    player_id: int | None = None,
    pitcher_id: int | None = None,
    batter_id: int | None = None,
    min_speed: float | None = None,
    max_speed: float | None = None,
    pitch_type: str | None = None,
    team: str | None = None,
) -> select:
    """Build a SQL query for retrieving pitches based on filters."""
    pitches = get_pitches_table()
    stmt = select(pitches)

    if player_id is not None:
        pid = str(player_id)
        stmt = stmt.where(or_(pitches.c.pitcher == pid, pitches.c.batter == pid))
    if pitcher_id is not None:
        stmt = stmt.where(pitches.c.pitcher == str(pitcher_id))
    if batter_id is not None:
        stmt = stmt.where(pitches.c.batter == str(batter_id))
    if min_speed is not None or max_speed is not None:
        speed = cast(pitches.c.release_speed, Float)
        stmt = stmt.where(pitches.c.release_speed.isnot(None))
        if min_speed is not None:
            stmt = stmt.where(speed >= min_speed)
        if max_speed is not None:
            stmt = stmt.where(speed <= max_speed)
    if pitch_type:
        stmt = stmt.where(pitches.c.pitch_type == pitch_type.upper())
    if team:
        team = team.upper()
        stmt = stmt.where(or_(pitches.c.home_team == team, pitches.c.away_team == team))

    return stmt.order_by(pitches.c.game_date.desc(), text("rowid DESC"))


def get_pitch_count(
    player_id: int | None = None,
    pitcher_id: int | None = None,
    batter_id: int | None = None,
    min_speed: float | None = None,
    max_speed: float | None = None,
    pitch_type: str | None = None,
    team: str | None = None,
) -> dict:
    """Get the total count of pitches matching the given filters."""
    stmt = build_pitch_query(
        player_id=player_id,
        pitcher_id=pitcher_id,
        batter_id=batter_id,
        min_speed=min_speed,
        max_speed=max_speed,
        pitch_type=pitch_type,
        team=team,
    )
    total = db.session.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    return {"total": total}


def get_pitch_columns() -> dict:
    """Get the columns for the pitches table."""
    return {"columns": ordered_pitch_columns()}


def get_pitches_page(
    page: int,
    limit: int,
    player_id: int | None = None,
    pitcher_id: int | None = None,
    batter_id: int | None = None,
    min_speed: float | None = None,
    max_speed: float | None = None,
    pitch_type: str | None = None,
    team: str | None = None,
) -> dict:
    """Get a page of pitches matching the given filters."""
    result = paginate_select(
        build_pitch_query(
            player_id=player_id,
            pitcher_id=pitcher_id,
            batter_id=batter_id,
            min_speed=min_speed,
            max_speed=max_speed,
            pitch_type=pitch_type,
            team=team,
        ),
        page,
        limit,
    )
    return {
        "total": result["total"],
        "page": result["page"],
        "limit": result["limit"],
        "total_pages": result["total_pages"],
        "count": result["count"],
        "columns": ordered_pitch_columns(),
        "pitches": serialize_pitches_with_names(result["items"]),
    }
