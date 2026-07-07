"""
Configuration for the backend.
"""
from config import db

class Pitch(db.Model):
    """SQLAlchemy model for pitch data."""

    __tablename__ = "pitches"

    rowid = db.Column(db.Integer, primary_key=True, autoincrement=True)

    # Pitch identification
    pitch_type = db.Column(db.String,  nullable=True)
    game_date = db.Column(db.String, nullable=False)

    # Pitcher and batter
    pitcher = db.Column(db.Integer, nullable=False)
    batter = db.Column(db.Integer, nullable=False)

    # Pitch characteristics
    release_speed = db.Column(db.String, nullable=True)
    release_spin_rate = db.Column(db.String, nullable=True)
    release_pos_x = db.Column(db.String, nullable=True)
    release_pos_z = db.Column(db.String, nullable=True)

    # Pitch location
    plate_x = db.Column(db.Float, nullable=True)
    plate_z = db.Column(db.Float, nullable=True)
    zone = db.Column(db.Integer, nullable=True)

    # Pitch result
    type = db.Column(db.String, nullable=True)  # S, B, X
    description = db.Column(db.String, nullable=True)
    events = db.Column(db.String, nullable=True)

    # Count and game situation
    balls = db.Column(db.Integer, nullable=True)
    strikes = db.Column(db.Integer, nullable=True)
    outs_when_up = db.Column(db.Integer, nullable=True)
    inning = db.Column(db.Integer, nullable=True)
    inning_topbot = db.Column(db.String, nullable=True)

    # Batted ball data
    launch_speed = db.Column(db.String, nullable=True)
    launch_angle = db.Column(db.String, nullable=True)
    hit_distance_sc = db.Column(db.String, nullable=True)

    # Player handedness
    stand = db.Column(db.String, nullable=True)  # L or R
    p_throws = db.Column(db.String, nullable=True)  # L or R

    # Teams
    home_team = db.Column(db.String, nullable=True)
    away_team = db.Column(db.String, nullable=True)
