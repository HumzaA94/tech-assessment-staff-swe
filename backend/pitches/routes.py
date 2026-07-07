"""Routes for the pitches module."""
from flask import Blueprint, jsonify, request

from pitches import services as service
from utils.pagination import parse_limit, parse_page

pitches_bp = Blueprint("pitches", __name__, url_prefix="/pitches")


def _pitch_filters() -> dict:
    """Parse pitch filters from the request query parameters."""
    return {
        "player_id": request.args.get("player_id", type=int),
        "pitcher_id": request.args.get("pitcher_id", type=int),
        "batter_id": request.args.get("batter_id", type=int),
        "min_speed": request.args.get("min_speed", type=float),
        "max_speed": request.args.get("max_speed", type=float),
        "pitch_type": request.args.get("pitch_type"),
        "team": request.args.get("team"),
    }

@pitches_bp.route("", methods=["GET"])
def get_pitches():
    """Get pitches with optional filtering by player, speed, type, or team."""
    return jsonify(
        service.get_pitches_page(
            page=parse_page(request.args.get("page")),
            limit=parse_limit(request.args.get("limit")),
            **_pitch_filters(),
        )
    ), 200

@pitches_bp.route("/count", methods=["GET"])
def get_pitch_count():
    """Return count of pitches matching the same filters as GET /pitches."""
    return jsonify(service.get_pitch_count(**_pitch_filters())), 200


@pitches_bp.route("/columns", methods=["GET"])
def get_pitch_columns():
    """Return ordered pitch column names from the database schema."""
    return jsonify(service.get_pitch_columns()), 200
