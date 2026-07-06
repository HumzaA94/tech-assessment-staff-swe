from flask import Blueprint, jsonify
from models.players import Player
from schemas import PlayerSchema


players_bp = Blueprint("players", __name__, url_prefix="/players")

@players_bp.route("", methods=["GET"])
def get_players():
    """
    Get all players or filter by team/position.
    """
    # TODO: Implement player retrieval with optional filtering
    # Below is a simple example returning a subset of players
    pitches = Player.query.limit(1000).all()
    schema = PlayerSchema(many=True)
    result = schema.dump(pitches)
    return jsonify(result), 200
