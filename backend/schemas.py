# Schemas for data validation and serialization are defined in this file.
# The player and pitch schemas are implemented for you already but feel free to add more fields or schemas as needed.

from marshmallow import Schema, fields, validate

class PlayerSchema(Schema):
    """Schema for player data validation and serialization."""

    player_id = fields.Integer(required=True)
    first_name = fields.String(required=True, validate=validate.Length(min=1, max=100))
    last_name = fields.String(required=True, validate=validate.Length(min=1, max=100))
    birthdate = fields.String(required=True)
    birth_country = fields.String(allow_none=True)
    birth_state = fields.String(allow_none=True)
    height_feet = fields.Integer(required=True, validate=validate.Range(min=4, max=8))
    height_inches = fields.Integer(
        required=True, validate=validate.Range(min=0, max=11)
    )
    weight = fields.Integer(required=True, validate=validate.Range(min=100, max=400))
    team = fields.String(required=True, validate=validate.Length(min=2, max=3))
    primary_position = fields.String(required=True)
    throws = fields.String(required=True, validate=validate.OneOf(["R", "L"]))
    bats = fields.String(required=True, validate=validate.OneOf(["R", "L", "S"]))


class PitchSchema(Schema):
    """Schema for pitch data validation and serialization."""

    # Pitch identification
    pitch_type = fields.String(allow_none=True)
    game_date = fields.String(required=True)

    # Pitcher and batter
    pitcher = fields.Integer(required=True)
    batter = fields.Integer(required=True)

    # Pitch characteristics
    release_speed = fields.String(allow_none=True)
    release_spin_rate = fields.String(allow_none=True)
    release_pos_x = fields.String(allow_none=True)
    release_pos_z = fields.String(allow_none=True)

    # Pitch location
    plate_x = fields.Float(allow_none=True)
    plate_z = fields.Float(allow_none=True)
    zone = fields.Integer(allow_none=True)

    # Pitch result
    type = fields.String(allow_none=True)  # S, B, X
    description = fields.String(allow_none=True)
    events = fields.String(allow_none=True)

    # Count and game situation
    balls = fields.Integer(allow_none=True)
    strikes = fields.Integer(allow_none=True)
    outs_when_up = fields.Integer(allow_none=True)
    inning = fields.Integer(allow_none=True)
    inning_topbot = fields.String(allow_none=True)

    # Batted ball data
    launch_speed = fields.String(allow_none=True)
    launch_angle = fields.String(allow_none=True)
    hit_distance_sc = fields.String(allow_none=True)

    # Player handedness
    stand = fields.String(allow_none=True)  # L or R
    p_throws = fields.String(allow_none=True)  # L or R

    # Teams
    home_team = fields.String(allow_none=True)
    away_team = fields.String(allow_none=True)
