"""Services for the players module."""
from sqlalchemy import func, or_

from config import db
from models import Player
from schemas import PlayerSchema
from utils.pagination import paginate

_player_schema = PlayerSchema()
_players_schema = PlayerSchema(many=True)


def format_player_name(player: Player | None) -> str | None:
    if player is None:
        return None
    return f"{player.first_name} {player.last_name}"


def load_players_by_ids(player_ids: set[int]) -> dict[int, Player]:
    if not player_ids:
        return {}
    id_values = [str(player_id) for player_id in player_ids]
    rows = Player.query.filter(Player.player_id.in_(id_values)).all()
    return {int(row.player_id): row for row in rows}


def apply_player_search(query, search: str):
    if not search:
        return query

    term = f"%{search.lower()}%"
    filters = [
        func.lower(Player.first_name).like(term),
        func.lower(Player.last_name).like(term),
    ]
    if search.isdigit():
        filters.append(Player.player_id == int(search))

    return query.filter(or_(*filters))


def build_player_query(
    teams: list[str] | None = None,
    positions: list[str] | None = None,
):
    query = Player.query
    if teams:
        query = query.filter(Player.team.in_([team.upper() for team in teams]))
    if positions:
        query = query.filter(
            Player.primary_position.in_([position.upper() for position in positions])
        )

    return query.order_by(Player.last_name, Player.first_name)


def get_player_metadata() -> dict:
    teams = [
        row[0]
        for row in db.session.query(Player.team)
        .distinct()
        .order_by(Player.team)
        .all()
    ]
    positions = [
        row[0]
        for row in db.session.query(Player.primary_position)
        .distinct()
        .order_by(Player.primary_position)
        .all()
    ]
    return {"teams": teams, "positions": positions}


def get_player_options(search: str, limit: int) -> list[dict]:
    query = apply_player_search(Player.query, search)
    players = query.order_by(Player.last_name, Player.first_name).limit(limit).all()
    return [
        {
            "player_id": player.player_id,
            "display_name": format_player_name(player),
            "team": player.team,
            "primary_position": player.primary_position,
        }
        for player in players
    ]


def get_player_by_id(player_id: int) -> Player | None:
    return db.session.get(Player, player_id)


def serialize_player(player: Player) -> dict:
    return _player_schema.dump(player)


def get_players_page(
    teams: list[str] | None,
    positions: list[str] | None,
    page: int,
    limit: int,
) -> dict:
    result = paginate(build_player_query(teams, positions), page, limit)
    return {
        "total": result["total"],
        "page": result["page"],
        "limit": result["limit"],
        "total_pages": result["total_pages"],
        "count": result["count"],
        "players": _players_schema.dump(result["items"]),
    }
