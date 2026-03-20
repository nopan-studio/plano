"""
Plano application factory.
Copyright (C) 2026 nopan-studio
Licensed under GNU General Public License v3.0.
"""
from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

db = SQLAlchemy()


def create_app(config_class=None):
    """Create and configure the Flask application."""
    app = Flask(__name__, template_folder='../templates',
                static_folder='../static', static_url_path='/static')

    # Load configuration
    if config_class:
        app.config.from_object(config_class)
    else:
        from config import Config
        app.config.from_object(Config)

    # Initialize extensions
    db.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # JSON error handlers
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({'error': 'not found'}), 404

    @app.errorhandler(405)
    def method_not_allowed(e):
        return jsonify({'error': 'method not allowed'}), 405

    @app.errorhandler(500)
    def internal_error(e):
        db.session.rollback()
        return jsonify({'error': 'internal server error', 'detail': str(e)}), 500

    # Register blueprints
    from app.routes import register_blueprints
    register_blueprints(app)

    # Create tables
    with app.app_context():
        from app import models  # noqa: F401 — ensure models are imported
        db.create_all()

    return app
