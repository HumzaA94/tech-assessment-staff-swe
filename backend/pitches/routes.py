"""Routes for the pitches module."""
from flask import Blueprint, jsonify
from models.pitches import Pitch
from schemas import PitchSchema

pitches_bp = Blueprint("pitches", __name__, url_prefix="/pitches")


@pitches_bp.route("", methods=["GET"])
def get_pitches():
    """
    Get all pitches or filter by various fields such as player, team, date, etc.
    """
    # TODO: Implement pitch retrieval with optional filtering
    # Below is a simple example returning a subset of pitches
    pitches = Pitch.query.limit(1000).all()
    schema = PitchSchema(many=True)
    result = schema.dump(pitches)

    return jsonify(result), 200
