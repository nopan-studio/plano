"""API documentation and UI routes."""
from flask import Blueprint, jsonify, render_template, redirect, url_for
from app.models import DIAGRAM_TYPES, NODE_TYPES, EDGE_TYPES

api_docs_bp = Blueprint('api_docs', __name__)


def ok(data, code=200):
    return jsonify(data), code


@api_docs_bp.route('/api', methods=['GET'])
def api_docs():
    docs = {
        "service": "Plano PM System",
        "version": "2.0",
        "diagram_types": DIAGRAM_TYPES,
        "project_statuses": ["planning", "active", "on_hold", "completed", "archived"],
        "task_statuses": ["todo", "in_progress", "review", "done"],
        "endpoints": {
            "projects": {
                "GET    /api/projects":                  "List all projects. ?status=&priority=",
                "POST   /api/projects":                  "Create project. Body: {name, status, priority, description, start_date, target_date}",
                "GET    /api/projects/:pid":              "Get project with summary stats",
                "PATCH  /api/projects/:pid":              "Update project",
                "DELETE /api/projects/:pid":              "Delete project and all related data",
                "GET    /api/projects/:pid/dashboard":    "Project dashboard with task/milestone stats + recent changes",
            },
            "tasks": {
                "GET    /api/projects/:pid/tasks":        "List tasks. ?status=&assignee=&milestone_id=",
                "POST   /api/projects/:pid/tasks":        "Create task. Body: {title, status, priority, assignee, milestone_id, due_date, tags}",
                "GET    /api/projects/:pid/tasks/:tid":   "Get task",
                "PATCH  /api/projects/:pid/tasks/:tid":   "Update task (auto-logs changes)",
                "DELETE /api/projects/:pid/tasks/:tid":   "Delete task",
                "GET    /api/projects/:pid/tasks/:tid/diff": "Get code diffs for affected files",
            },
            "milestones": {
                "GET    /api/projects/:pid/milestones":       "List milestones",
                "POST   /api/projects/:pid/milestones":       "Create milestone. Body: {name, due_date, status}",
                "GET    /api/projects/:pid/milestones/:mid":  "Get milestone",
                "PATCH  /api/projects/:pid/milestones/:mid":  "Update milestone",
                "DELETE /api/projects/:pid/milestones/:mid":  "Delete milestone",
            },
            "changelog": {
                "GET    /api/projects/:pid/changelog":   "Paginated change log. ?entity_type=&action=&page=&per_page=",
            },
            "updates": {
                "GET    /api/projects/:pid/updates":      "List progress updates. ?type=",
                "POST   /api/projects/:pid/updates":      "Post update. Body: {content, update_type, task_id?}",
                "GET    /api/projects/:pid/updates/:uid":  "Get update",
                "DELETE /api/projects/:pid/updates/:uid":  "Delete update",
            },
            "ideas": {
                "GET    /api/ideas":             "List ideas. ?project_id=&status=",
                "POST   /api/ideas":             "Create idea. Body: {title, description, project_id?, tags}",
                "GET    /api/ideas/:iid":         "Get idea",
                "PATCH  /api/ideas/:iid":         "Update idea",
                "DELETE /api/ideas/:iid":         "Delete idea",
                "POST   /api/ideas/:iid/vote":    "Upvote idea",
            },
            "boards": {
                "GET    /api/projects/:pid/boards":              "List boards for project. ?type=",
                "POST   /api/projects/:pid/boards":              "Create board under project",
                "GET    /api/projects/:pid/boards/:id":          "Get board with nodes & edges",
                "PATCH  /api/projects/:pid/boards/:id":          "Update board",
                "DELETE /api/projects/:pid/boards/:id":          "Delete board",
                "POST   /api/projects/:pid/boards/:id/duplicate": "Duplicate board",
                "POST   /api/projects/:pid/boards/:id/import-schema": "Import DB schema as nodes+edges",
                "POST   /api/projects/:pid/boards/from-template": "Create board from template",
            },
            "nodes": {
                "GET    /api/projects/:pid/boards/:id/nodes":          "List nodes",
                "POST   /api/projects/:pid/boards/:id/nodes":          "Add node",
                "GET    /api/projects/:pid/boards/:id/nodes/:nid":     "Get node",
                "PATCH  /api/projects/:pid/boards/:id/nodes/:nid":     "Update node",
                "DELETE /api/projects/:pid/boards/:id/nodes/:nid":     "Delete node",
            },
            "edges": {
                "GET    /api/projects/:pid/boards/:id/edges":          "List edges",
                "POST   /api/projects/:pid/boards/:id/edges":          "Add edge (validates type)",
                "GET    /api/projects/:pid/boards/:id/edges/:eid":     "Get edge",
                "PATCH  /api/projects/:pid/boards/:id/edges/:eid":     "Update edge",
                "DELETE /api/projects/:pid/boards/:id/edges/:eid":     "Delete edge",
            },
            "bulk": {
                "POST /api/projects/:pid/boards/:id/bulk": "Apply multiple ops atomically",
            },
            "templates": {
                "available": [
                    "sprint_planning", "release_pipeline", "bug_triage",
                    "feature_request", "onboarding",
                ],
            },
        },
        "node_types": NODE_TYPES,
        "edge_types": EDGE_TYPES,
    }
    return ok(docs)


# ─── UI Routes ────────────────────────────────────────────────────────────────

@api_docs_bp.route('/')
@api_docs_bp.route('/project/<int:pid>')
def root(pid=None):
    """Serve the dashboard SPA at the root /."""
    return render_template('dashboard.html')

@api_docs_bp.route('/dashboard')
@api_docs_bp.route('/dashboard/<int:pid>')
def dashboard_redirect(pid=None):
    """Redirect legacy dashboard routes to root."""
    return redirect('/')


@api_docs_bp.route('/project/<int:pid>/editor')
@api_docs_bp.route('/project/<int:pid>/editor/<int:did>')
def index(pid, did=None):
    return render_template('index.html')


@api_docs_bp.route('/tester')
def tester():
    return render_template('tester.html')


# Removed /dashboard routes (now handled by root)


# ─── Health Check ─────────────────────────────────────────────────────────────

@api_docs_bp.route('/health', methods=['GET'])
def health():
    try:
        from app import db
        db.session.execute(db.text('SELECT 1'))
        return ok({'status': 'ok', 'db': 'ok'})
    except Exception as ex:
        return jsonify({'status': 'error', 'detail': str(ex)}), 500
