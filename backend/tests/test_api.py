import pytest
import os
import sys

from main import app, db, Player, Pitch


@pytest.fixture
def client():
    """Create a test client for the Flask application."""

    # Point to the actual baseball database for now
    app.config["TESTING"] = True
    baseball_db_path = os.path.join(
        os.path.dirname(__file__), "..", "data", "baseball.db"
    )
    app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{baseball_db_path}"

    with app.test_client() as client:
        with app.app_context():
            yield client


class TestHealthCheck:
    """Test the health check endpoint."""

    def test_health_check(self, client):
        """Test that health check returns 200 status."""
        response = client.get("/health")
        assert response.status_code == 200
        assert response.get_json() == {"status": "healthy"}


class TestPlayerAPI:
    """Test player-related API endpoints."""

    def test_get_all_players(self, client):
        """Test getting all players."""
        response = client.get("/players")
        assert response.status_code == 200
        data = response.get_json()
        assert "players" in data
        assert "total" in data
        assert "page" in data
        assert "total_pages" in data
        assert len(data["players"]) > 0
        assert data["total"] >= len(data["players"])

    def test_filter_players_by_team(self, client):
        """Test filtering players by team."""
        sample_team = db.session.query(Player.team).first()[0]
        response = client.get(f"/players?team={sample_team}")
        assert response.status_code == 200
        data = response.get_json()
        assert all(player["team"] == sample_team for player in data["players"])

    def test_filter_players_by_position(self, client):
        """Test filtering players by position."""
        sample_position = db.session.query(Player.primary_position).first()[0]
        response = client.get(f"/players?position={sample_position}")
        assert response.status_code == 200
        data = response.get_json()
        assert all(
            player["primary_position"] == sample_position
            for player in data["players"]
        )

    def test_get_player_by_id(self, client):
        """Test getting a specific player by ID."""
        player = Player.query.first()
        response = client.get(f"/players/{player.player_id}")
        assert response.status_code == 200
        data = response.get_json()
        assert int(data["player_id"]) == int(player.player_id)

    def test_get_nonexistent_player(self, client):
        """Test getting a player that doesn't exist."""

        response = client.get("/players/999999999")
        assert response.status_code == 404
        assert response.get_json()["error"] == "Player not found"

    def test_players_pagination(self, client):
        """Test pagination for players."""
        response = client.get("/players?page=1&limit=10")
        assert response.status_code == 200
        data = response.get_json()
        assert data["page"] == 1
        assert data["limit"] == 10
        assert len(data["players"]) <= 10
        assert data["total_pages"] == (data["total"] + 9) // 10

    def test_filter_players_by_multiple_teams(self, client):
        """Test filtering players by team."""
        teams = [
            row[0]
            for row in db.session.query(Player.team).distinct().limit(2).all()
        ]
        query = "&".join(f"team={team}" for team in teams)
        response = client.get(f"/players?{query}")
        assert response.status_code == 200
        data = response.get_json()
        assert len(data["players"]) > 0
        assert all(player["team"] in teams for player in data["players"])

    def test_filter_players_by_multiple_positions(self, client):
        """Test filtering players by multiple positions."""
        positions = [
            row[0]
            for row in db.session.query(Player.primary_position).distinct().limit(2).all()
        ]
        query = "&".join(f"position={position}" for position in positions)
        response = client.get(f"/players?{query}")
        assert response.status_code == 200
        data = response.get_json()
        assert len(data["players"]) > 0
        assert all(
            player["primary_position"] in positions for player in data["players"]
        )

    def test_get_player_metadata(self, client):
        """Test getting player metadata."""
        response = client.get("/players/meta")
        assert response.status_code == 200
        data = response.get_json()
        assert len(data["teams"]) > 0
        assert len(data["positions"]) > 0

    def test_search_player_options(self, client):
        """Test searching player options."""
        player = Player.query.first()
        response = client.get(f"/players/options?search={player.last_name[:3]}")
        assert response.status_code == 200
        data = response.get_json()
        assert len(data["options"]) > 0
        assert "display_name" in data["options"][0]


class TestPitchAPI:
    """Test pitch-related API endpoints."""

    def test_get_pitches(self, client):
        """Test getting pitches."""
        response = client.get("/pitches")
        assert response.status_code == 200
        data = response.get_json()
        assert "pitches" in data
        assert "page" in data
        assert len(data["pitches"]) > 0
        assert "pitcher_name" in data["pitches"][0]
        assert "batter_name" in data["pitches"][0]
        assert data["pitches"][0]["pitcher_name"] is not None
        assert data["pitches"][0]["batter_name"] is not None
        assert "pitcher" not in data["columns"]
        assert "batter" not in data["columns"]

    def test_pitches_pagination(self, client):
        """Test pagination for pitches."""
        response = client.get("/pitches?page=2&limit=5")
        assert response.status_code == 200
        data = response.get_json()
        assert data["page"] == 2
        assert data["limit"] == 5
        assert len(data["pitches"]) <= 5

    def test_filter_pitches_by_min_speed(self, client):
        """Test filtering pitches by minimum speed."""
        response = client.get("/pitches?min_speed=95")
        assert response.status_code == 200
        data = response.get_json()
        for pitch in data["pitches"]:
            assert pitch["release_speed"] is not None
            assert float(pitch["release_speed"]) >= 95

    def test_filter_pitches_by_max_speed(self, client):
        """Test filtering pitches by maximum speed."""
        response = client.get("/pitches?max_speed=80")
        assert response.status_code == 200
        data = response.get_json()
        for pitch in data["pitches"]:
            assert pitch["release_speed"] is not None
            assert float(pitch["release_speed"]) <= 80

    def test_filter_pitches_by_speed_range(self, client):
        """Test filtering pitches by speed range."""
        response = client.get("/pitches?min_speed=90&max_speed=95")
        assert response.status_code == 200
        data = response.get_json()
        for pitch in data["pitches"]:
            speed = float(pitch["release_speed"])
            assert 90 <= speed <= 95

    def test_filter_pitches_by_player_involvement(self, client):
        """Test filtering pitches by player involvement."""
        player = Player.query.first()
        player_id = int(player.player_id)
        response = client.get(f"/pitches?player_id={player_id}&limit=50")
        assert response.status_code == 200
        data = response.get_json()
        assert data["total"] > 0
        for pitch in data["pitches"]:
            assert int(pitch["pitcher"]) == player_id or int(pitch["batter"]) == player_id

    def test_pitch_count_matches_filters(self, client):
        """Test that the pitch count matches the filters."""
        list_response = client.get("/pitches?min_speed=95")
        count_response = client.get("/pitches/count?min_speed=95")
        assert list_response.status_code == 200
        assert count_response.status_code == 200
        assert count_response.get_json()["total"] == list_response.get_json()["total"]

    def test_pitches_return_full_db_columns(self, client):
        """Test that the pitches return the full database columns."""
        response = client.get("/pitches?limit=1")
        assert response.status_code == 200
        data = response.get_json()
        assert "columns" in data
        assert len(data["columns"]) > 50
        assert "game_pk" in data["columns"]
        pitch = data["pitches"][0]
        assert "game_pk" in pitch
        assert "release_extension" in pitch

    def test_get_pitch_columns(self, client):
        """Test getting pitch columns."""
        response = client.get("/pitches/columns")
        assert response.status_code == 200
        data = response.get_json()
        assert len(data["columns"]) > 50
        assert data["columns"][0] == "game_date"
        assert "pitcher_name" in data["columns"]
