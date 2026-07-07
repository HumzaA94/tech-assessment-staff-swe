"""
Main module for the Baseball API backend.
"""

from flask import Flask
from flask_cors import CORS

from config import DB_PATH, db
from health.routes import health_bp
from pitches.routes import pitches_bp
from players.routes import players_bp


def create_app() -> Flask:
    app = Flask(__name__)
    CORS(app)

    app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{DB_PATH}"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.init_app(app)

    app.register_blueprint(players_bp)
    app.register_blueprint(pitches_bp)
    app.register_blueprint(health_bp)
    return app


app = create_app()
