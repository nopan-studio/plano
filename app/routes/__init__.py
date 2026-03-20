"""Blueprint registration for all route modules."""
from flask import jsonify


def register_blueprints(app):
    """Register all route blueprints with the Flask app."""
    from app.routes.projects import projects_bp
    from app.routes.tasks import tasks_bp
    from app.routes.milestones import milestones_bp
    from app.routes.changelog_routes import changelog_bp
    from app.routes.updates import updates_bp
    from app.routes.ideas import ideas_bp
    from app.routes.boards import boards_bp
    from app.routes.nodes import nodes_bp
    from app.routes.edges import edges_bp
    from app.routes.bulk import bulk_bp
    from app.routes.api_docs import api_docs_bp
    from app.routes.layout import layout_bp

    app.register_blueprint(projects_bp)
    app.register_blueprint(tasks_bp)
    app.register_blueprint(milestones_bp)
    app.register_blueprint(changelog_bp)
    app.register_blueprint(updates_bp)
    app.register_blueprint(ideas_bp)
    app.register_blueprint(boards_bp)
    app.register_blueprint(nodes_bp)
    app.register_blueprint(edges_bp)
    app.register_blueprint(bulk_bp)
    app.register_blueprint(api_docs_bp)
    app.register_blueprint(layout_bp)
