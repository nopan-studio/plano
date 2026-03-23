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
    from app.events import event_bus
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
    socketio = event_bus.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    from flask import request

    @app.before_request
    def log_mcp_tool():
        tool_name = request.headers.get('X-Plano-Tool')
        if tool_name:
            event_bus.broadcast('mcp_tool_call', {
                'tool': tool_name,
                'method': request.method,
                'path': request.path
            })
        
        # Also broadcast a generic 'system_change' for any mutation
        if request.method in ['POST', 'PUT', 'PATCH', 'DELETE']:
            event_bus.broadcast('system_change', {
                'method': request.method,
                'path': request.path,
                'tool': tool_name
            })
        
    @app.after_request
    def log_mcp_finish(response):
        tool_name = request.headers.get('X-Plano-Tool')
        if tool_name:
            event_bus.broadcast('mcp_tool_finish', {
                'tool': tool_name,
                'status': response.status_code
            })
        return response

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
