""" Routes for the players module."""
from flask import Blueprint, jsonify, request

from players import services as service
from utils.pagination import parse_limit, parse_page

players_bp = Blueprint("players", __name__, url_prefix="/players")


@players_bp.route("", methods=["GET"])
def get_players():
    """Get all players or filter by team/position."""
    return jsonify(
        service.get_players_page(
            teams=request.args.getlist("team") or None,
            positions=request.args.getlist("position") or None,
            page=parse_page(request.args.get("page")),
            limit=parse_limit(request.args.get("limit")),
        )
    ), 200

@players_bp.route("/meta", methods=["GET"])
def get_player_metadata():
    """Return distinct teams and positions for filter dropdowns."""
    return jsonify(service.get_player_metadata()), 200


@players_bp.route("/options", methods=["GET"])
def get_player_options():
    """Return lightweight player options for searchable dropdowns."""
    search = request.args.get("search", "").strip()
    limit = parse_limit(request.args.get("limit"))
    return jsonify({"options": service.get_player_options(search, limit)}), 200


@players_bp.route("/<int:player_id>", methods=["GET"])
def get_player(player_id: int):
    """Get a single player by ID."""
    player = service.get_player_by_id(player_id)
    if player is None:
        return jsonify({"error": "Player not found"}), 404
    return jsonify(service.serialize_player(player)), 200
