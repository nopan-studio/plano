#!/usr/bin/env python3
"""
Plano PM (v2.0)
==============================
Copyright (C) 2026 nopan-studio

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.
"""

import json
import subprocess
import sys
import time
import os
import signal
import atexit
import inspect
from pathlib import Path
from urllib.request import urlopen, Request
from urllib.error import URLError

from mcp.server.fastmcp import FastMCP

# ─── Configuration ─────────────────────────────────────────────────────────────

PROJECT_DIR = Path(__file__).resolve().parent
DEFAULT_PORT = 5000
BASE_URL = f"http://127.0.0.1:{DEFAULT_PORT}"
HEALTH_URL = f"{BASE_URL}/health"

# ─── Flask lifecycle helpers ───────────────────────────────────────────────────

_flask_proc: subprocess.Popen | None = None


def _is_server_running() -> bool:
    """Check if the Flask server is responding."""
    try:
        req = Request(HEALTH_URL)
        resp = urlopen(req, timeout=3)
        data = json.loads(resp.read())
        return data.get("status") == "ok"
    except Exception:
        return False


def _ensure_server():
    """Start the Flask server if it isn't already running."""
    global _flask_proc
    if _is_server_running():
        return

    venv_python = PROJECT_DIR / "venv" / "bin" / "python"
    if not venv_python.exists():
        venv_python = PROJECT_DIR / ".venv" / "bin" / "python"
    if not venv_python.exists():
        venv_python = Path(sys.executable)

    _flask_proc = subprocess.Popen(
        [str(venv_python), "run.py", "--port", str(DEFAULT_PORT)],
        cwd=str(PROJECT_DIR),
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )

    for _ in range(30):
        time.sleep(0.5)
        if _is_server_running():
            return
    raise RuntimeError(
        f"Plano server failed to start on port {DEFAULT_PORT} after 15s"
    )


def _shutdown_server():
    """Kill the managed Flask process on exit."""
    global _flask_proc
    if _flask_proc and _flask_proc.poll() is None:
        _flask_proc.terminate()
        try:
            _flask_proc.wait(timeout=5)
        except subprocess.TimeoutExpired:
            _flask_proc.kill()


atexit.register(_shutdown_server)


# ─── HTTP helpers ──────────────────────────────────────────────────────────────


def _api(method: str, path: str, body: dict | None = None, tool_name: str | None = None) -> dict:
    """Make an HTTP request to the Flask API and return parsed JSON."""
    _ensure_server()

    # Auto-detect tool name from caller if not provided
    if not tool_name:
        stack = inspect.stack()
        for frame in stack[1:]:
            # The tool function name is usually the one with the @mcp.tool decorator
            # We skip internal helpers
            if frame.function.startswith('_') or frame.function == 'main':
                continue
            tool_name = frame.function
            break

    url = f"{BASE_URL}{path}"
    data = json.dumps(body).encode() if body else None
    req = Request(url, data=data, method=method)
    req.add_header("Content-Type", "application/json")
    if tool_name:
        req.add_header("X-Plano-Tool", tool_name)

    try:
        resp = urlopen(req, timeout=30)
        return json.loads(resp.read())
    except URLError as exc:
        if hasattr(exc, "read"):
            detail = exc.read().decode()  # type: ignore
            try:
                return json.loads(detail)
            except Exception:
                return {"error": detail}
        return {"error": str(exc)}


# ─── Auto-position helper ──────────────────────────────────────────────────────

def _auto_position(project_id: int, diagram_id: int, width: float = 220, height: float = 60) -> tuple:
    """Calculate a non-overlapping position for a new node.

    Queries existing nodes and places the new node in a grid-like pattern
    with adequate spacing to keep edges clear.
    """
    NODE_H_SPACING = 300  # horizontal gap between nodes
    NODE_V_SPACING = 120  # vertical gap between nodes
    NODES_PER_ROW = 4     # max nodes per row before wrapping
    START_X = 100
    START_Y = 100

    try:
        existing = _api("GET", f"/api/projects/{project_id}/boards/{diagram_id}/nodes")
        if isinstance(existing, list) and existing:
            count = len(existing)
            col = count % NODES_PER_ROW
            row = count // NODES_PER_ROW
            x = START_X + col * NODE_H_SPACING
            y = START_Y + row * NODE_V_SPACING
            return (x, y)
    except Exception:
        pass

    return (START_X, START_Y)


# ─── MCP Server ───────────────────────────────────────────────────────────────

mcp = FastMCP(
    "Plano",
    instructions=(
        "Plano is a full Project Management system that tracks projects, "
        "tasks, milestones, changelogs, updates, ideas, and visual boards "
        "(process flows, DB diagrams, flowcharts, function flows, idea maps). "
        "Use these tools to manage projects end-to-end. For creating diagrams "
        "with many nodes, prefer the bulk_operations tool which auto-layouts "
        "nodes for clear edge visibility. You do NOT need to specify x/y "
        "coordinates — the system handles positioning automatically."
    ),
)


# ── Health & Docs ─────────────────────────────────────────────────────────────

@mcp.tool()
def health_check() -> str:
    """Check if the Plano server is running and healthy."""
    return json.dumps(_api("GET", "/health"), indent=2)


@mcp.tool()
def api_docs() -> str:
    """Get full machine-readable API documentation for Plano PM (v2.0)."""
    return json.dumps(_api("GET", "/api"), indent=2)


# ── Projects ─────────────────────────────────────────────────────────────────

@mcp.tool()
def list_projects(status: str = "", priority: str = "") -> str:
    """List all projects, optionally filtered by status and/or priority.

    Args:
        status: Filter by status (planning/active/on_hold/completed/archived). Empty = all.
        priority: Filter by priority (low/medium/high/critical). Empty = all.
    """
    params = []
    if status:
        params.append(f"status={status}")
    if priority:
        params.append(f"priority={priority}")
    path = "/api/projects" + ("?" + "&".join(params) if params else "")
    return json.dumps(_api("GET", path), indent=2)


@mcp.tool()
def create_project(
    name: str,
    description: str = "",
    status: str = "planning",
    priority: str = "medium",
    start_date: str = "",
    target_date: str = "",
) -> str:
    """Create a new project.

    Args:
        name: Project name.
        description: Project description.
        status: Status (planning/active/on_hold/completed/archived).
        priority: Priority (low/medium/high/critical).
        start_date: Start date in YYYY-MM-DD format (optional).
        target_date: Target completion date in YYYY-MM-DD format (optional).
    """
    body: dict = {"name": name, "description": description, "status": status, "priority": priority}
    if start_date:
        body["start_date"] = start_date
    if target_date:
        body["target_date"] = target_date
    return json.dumps(_api("POST", "/api/projects", body), indent=2)


@mcp.tool()
def get_project(project_id: int) -> str:
    """Get a project with summary stats (task counts, milestone counts, etc.).

    Args:
        project_id: The project ID.
    """
    return json.dumps(_api("GET", f"/api/projects/{project_id}"), indent=2)


@mcp.tool()
def update_project(
    project_id: int,
    name: str = "",
    description: str = "",
    status: str = "",
    priority: str = "",
    progress_pct: int = -1,
    start_date: str = "",
    target_date: str = "",
) -> str:
    """Update a project's properties. Only provided fields are changed.

    Args:
        project_id: The project ID.
        name: New name (empty = keep).
        description: New description (empty = keep).
        status: New status (empty = keep).
        priority: New priority (empty = keep).
        progress_pct: New progress percentage (-1 = keep).
        start_date: New start date YYYY-MM-DD (empty = keep).
        target_date: New target date YYYY-MM-DD (empty = keep).
    """
    body: dict = {}
    if name:
        body["name"] = name
    if description:
        body["description"] = description
    if status:
        body["status"] = status
    if priority:
        body["priority"] = priority
    if progress_pct >= 0:
        body["progress_pct"] = progress_pct
    if start_date:
        body["start_date"] = start_date
    if target_date:
        body["target_date"] = target_date
    return json.dumps(_api("PATCH", f"/api/projects/{project_id}", body), indent=2)


@mcp.tool()
def delete_project(project_id: int) -> str:
    """Delete a project and all its tasks, milestones, boards, etc.

    Args:
        project_id: The project ID.
    """
    return json.dumps(_api("DELETE", f"/api/projects/{project_id}"), indent=2)


@mcp.tool()
def export_project(project_id: int) -> str:
    """Export an entire project as a high-fidelity JSON blob.

    Captures: project metadata, milestones, tasks, diagrams (with nodes & edges),
    ideas, updates, and changelog entries.

    Args:
        project_id: The project ID.
    """
    return json.dumps(_api("GET", f"/api/projects/{project_id}/export"), indent=2)


@mcp.tool()
def import_project(export_blob: str) -> str:
    """Import a project from a previously exported JSON blob.

    Recreates the full project structure: project, milestones, tasks,
    diagrams (with nodes & edges), ideas, and updates.

    Args:
        export_blob: JSON string of the project export.
    """
    body = json.loads(export_blob)
    return json.dumps(_api("POST", "/api/projects/import", body), indent=2)




@mcp.tool()
def project_dashboard(project_id: int) -> str:
    """Get a project dashboard with task/milestone stats and recent changes.

    Args:
        project_id: The project ID.
    """
    return json.dumps(_api("GET", f"/api/projects/{project_id}/dashboard"), indent=2)


# ── Tasks ─────────────────────────────────────────────────────────────────────

@mcp.tool()
def list_tasks(project_id: int, status: str = "", assignee: str = "", milestone_id: int = -1) -> str:
    """List tasks in a project, optionally filtered.

    Args:
        project_id: The project ID.
        status: Filter by status (bugs/todo/in_progress/review/done). Empty = all.
        assignee: Filter by assignee name. Empty = all.
        milestone_id: Filter by milestone ID (-1 = all).
    """
    params = []
    if status:
        params.append(f"status={status}")
    if assignee:
        params.append(f"assignee={assignee}")
    if milestone_id >= 0:
        params.append(f"milestone_id={milestone_id}")
    path = f"/api/projects/{project_id}/tasks" + ("?" + "&".join(params) if params else "")
    return json.dumps(_api("GET", path), indent=2)


@mcp.tool()
def create_task(
    project_id: int,
    title: str,
    description: str = "",
    assignee: str = "",
    status: str = "todo",
    priority: str = "medium",
    milestone_id: int = -1,
    due_date: str = "",
    estimated_hours: float = -1,
    tags: str = "[]",
    files_meta: str = "[]",
    is_ai_working: int = -1,
) -> str:
    """Create a task in a project. Auto-logs to changelog.

    Args:
        project_id: The project ID.
        title: Task title.
        description: Task description.
        assignee: Assigned person.
        status: Status (bugs/todo/in_progress/review/done).
        priority: Priority (low/medium/high/critical).
        milestone_id: Link to milestone (-1 = none).
        due_date: Due date YYYY-MM-DD (empty = none).
        estimated_hours: Estimated hours (-1 = none).
        tags: JSON array string of tags.
        is_ai_working: 1 for active, 0 for inactive, -1 to skip.
    """
    body: dict = {
        "title": title, "description": description,
        "assignee": assignee, "status": status, "priority": priority,
        "tags": json.loads(tags),
        "files_meta": json.loads(files_meta),
    }
    if is_ai_working != -1:
        body["is_ai_working"] = bool(is_ai_working)
    elif status == "in_progress":
        body["is_ai_working"] = True
    if milestone_id >= 0:
        body["milestone_id"] = milestone_id
    if due_date:
        body["due_date"] = due_date
    if estimated_hours >= 0:
        body["estimated_hours"] = estimated_hours
    return json.dumps(_api("POST", f"/api/projects/{project_id}/tasks", body), indent=2)


@mcp.tool()
def update_task(
    project_id: int,
    task_id: int,
    title: str = "",
    description: str = "",
    assignee: str = "",
    status: str = "",
    priority: str = "",
    due_date: str = "",
    estimated_hours: float = -1,
    actual_hours: float = -1,
    files_meta: str = "",
    is_ai_working: int = -1,
) -> str:
    """Update a task. Changes are auto-logged to the changelog.

    Args:
        project_id: The project ID.
        task_id: The task ID.
        title: New title (empty = keep).
        description: New description (empty = keep).
        assignee: New assignee (empty = keep).
        status: New status (bugs/todo/in_progress/review/done, empty = keep).
        priority: New priority (empty = keep).
        due_date: New due date YYYY-MM-DD (empty = keep).
        estimated_hours: New estimate (-1 = keep).
        actual_hours: New actual hours (-1 = keep).
        is_ai_working: 1 for active, 0 for inactive, -1 to keep current.
    """
    body: dict = {}
    if title:
        body["title"] = title
    if description:
        body["description"] = description
    if assignee:
        body["assignee"] = assignee
    if status:
        body["status"] = status
    if priority:
        body["priority"] = priority
    if due_date:
        body["due_date"] = due_date
    if estimated_hours >= 0:
        body["estimated_hours"] = estimated_hours
    if actual_hours >= 0:
        body["actual_hours"] = actual_hours
    if files_meta:
        body["files_meta"] = json.loads(files_meta)
    if is_ai_working != -1:
        body["is_ai_working"] = bool(is_ai_working)
    elif status == "in_progress":
        # Smart default for AI agents
        body["is_ai_working"] = True
    elif status in ["bugs", "todo", "done", "review"] and status:
        # If moving out of progress, default to stopping the AI flag
        body["is_ai_working"] = False
    return json.dumps(_api("PATCH", f"/api/projects/{project_id}/tasks/{task_id}", body), indent=2)


@mcp.tool()
def delete_task(project_id: int, task_id: int) -> str:
    """Delete a task.

    Args:
        project_id: The project ID.
        task_id: The task ID.
    """
    return json.dumps(_api("DELETE", f"/api/projects/{project_id}/tasks/{task_id}"), indent=2)


@mcp.tool()
def set_ai_working_status(project_id: int, task_id: int, is_working: bool) -> str:
    """Explicitly set the 'AI working' indicator for a task.

    Use this when starting or pausing work on a specific task without changing 
    its status, though status updates also handle this automatically now.

    Args:
        project_id: The project ID.
        task_id: The task ID.
        is_working: True to show AI is active, False to stop.
    """
    body = {"is_ai_working": is_working}
    return json.dumps(_api("POST", f"/api/projects/{project_id}/tasks/{task_id}/ai-status", body), indent=2)


# ── Milestones ────────────────────────────────────────────────────────────────

@mcp.tool()
def list_milestones(project_id: int) -> str:
    """List all milestones in a project.

    Args:
        project_id: The project ID.
    """
    return json.dumps(_api("GET", f"/api/projects/{project_id}/milestones"), indent=2)


@mcp.tool()
def create_milestone(
    project_id: int,
    name: str,
    description: str = "",
    due_date: str = "",
    status: str = "pending",
) -> str:
    """Create a milestone in a project.

    Args:
        project_id: The project ID.
        name: Milestone name.
        description: Description.
        due_date: Due date YYYY-MM-DD (optional).
        status: Status (pending/in_progress/completed/missed).
    """
    body: dict = {"name": name, "description": description, "status": status}
    if due_date:
        body["due_date"] = due_date
    return json.dumps(_api("POST", f"/api/projects/{project_id}/milestones", body), indent=2)


@mcp.tool()
def update_milestone(
    project_id: int,
    milestone_id: int,
    name: str = "",
    description: str = "",
    due_date: str = "",
    status: str = "",
) -> str:
    """Update a milestone.

    Args:
        project_id: The project ID.
        milestone_id: The milestone ID.
        name: New name (empty = keep).
        description: New description (empty = keep).
        due_date: New due date YYYY-MM-DD (empty = keep).
        status: New status (empty = keep).
    """
    body: dict = {}
    if name:
        body["name"] = name
    if description:
        body["description"] = description
    if due_date:
        body["due_date"] = due_date
    if status:
        body["status"] = status
    return json.dumps(_api("PATCH", f"/api/projects/{project_id}/milestones/{milestone_id}", body), indent=2)


# ── Changelog ─────────────────────────────────────────────────────────────────

@mcp.tool()
def get_changelog(project_id: int, entity_type: str = "", action: str = "", page: int = 1) -> str:
    """Get paginated changelog for a project.

    Args:
        project_id: The project ID.
        entity_type: Filter by entity type (project/task/milestone/board). Empty = all.
        action: Filter by action (created/updated/deleted). Empty = all.
        page: Page number (default 1).
    """
    params = [f"page={page}"]
    if entity_type:
        params.append(f"entity_type={entity_type}")
    if action:
        params.append(f"action={action}")
    path = f"/api/projects/{project_id}/changelog?" + "&".join(params)
    return json.dumps(_api("GET", path), indent=2)


# ── Updates ───────────────────────────────────────────────────────────────────

@mcp.tool()
def list_updates(project_id: int, update_type: str = "") -> str:
    """List progress updates for a project.

    Args:
        project_id: The project ID.
        update_type: Filter by type (progress/blocker/decision/note). Empty = all.
    """
    path = f"/api/projects/{project_id}/updates"
    if update_type:
        path += f"?type={update_type}"
    return json.dumps(_api("GET", path), indent=2)


@mcp.tool()
def post_update(
    project_id: int,
    content: str,
    update_type: str = "progress",
    task_id: int = -1,
    files_meta: str = "[]",
) -> str:
    """Post a progress update to a project.

    Args:
        project_id: The project ID.
        content: Update content (supports markdown).
        update_type: Type (progress/blocker/decision/note).
        task_id: Optionally link to a task (-1 = none).
    """
    body: dict = {"content": content, "update_type": update_type, "files_meta": json.loads(files_meta)}
    if task_id >= 0:
        body["task_id"] = task_id
    return json.dumps(_api("POST", f"/api/projects/{project_id}/updates", body), indent=2)


# ── Ideas ─────────────────────────────────────────────────────────────────────

@mcp.tool()
def list_ideas(project_id: int = -1, status: str = "") -> str:
    """List ideas, optionally filtered by project and/or status.

    Args:
        project_id: Filter by project (-1 = all projects).
        status: Filter by status (new/exploring/accepted/rejected). Empty = all.
    """
    params = []
    if project_id >= 0:
        params.append(f"project_id={project_id}")
    if status:
        params.append(f"status={status}")
    path = "/api/ideas" + ("?" + "&".join(params) if params else "")
    return json.dumps(_api("GET", path), indent=2)


@mcp.tool()
def create_idea(
    title: str,
    description: str = "",
    project_id: int = -1,
    tags: str = "[]",
) -> str:
    """Create an idea, optionally scoped to a project.

    Args:
        title: Idea title.
        description: Description.
        project_id: Link to project (-1 = global idea).
        tags: JSON array string of tags.
    """
    body: dict = {"title": title, "description": description, "tags": json.loads(tags)}
    if project_id >= 0:
        body["project_id"] = project_id
    return json.dumps(_api("POST", "/api/ideas", body), indent=2)


@mcp.tool()
def vote_idea(idea_id: int) -> str:
    """Upvote an idea.

    Args:
        idea_id: The idea ID.
    """
    return json.dumps(_api("POST", f"/api/ideas/{idea_id}/vote", {}), indent=2)


# ── Diagrams (Boards) ────────────────────────────────────────────────────────

@mcp.tool()
def list_diagrams(project_id: int = -1, diagram_type: str = "") -> str:
    """List all boards/diagrams, optionally filtered by type.

    Args:
        project_id: The project ID.
        diagram_type: Filter by type (process_flow/db_diagram/flowchart/idea_map/function_flow).
                      Leave empty to list all.
    """
    if project_id < 0:
        return json.dumps({"error": "project_id is required."})
    path = f"/api/projects/{project_id}/boards"
    if diagram_type:
        path += f"?type={diagram_type}"
    return json.dumps(_api("GET", path), indent=2)


@mcp.tool()
def create_diagram(name: str, project_id: int = -1, diagram_type: str = "process_flow", description: str = "") -> str:
    """Create a new board/diagram.

    Args:
        project_id: The project ID.
        name: Name of the board.
        diagram_type: Type (process_flow/db_diagram/flowchart/idea_map/function_flow).
        description: Optional description.
    """
    body: dict = {"name": name, "type": diagram_type, "description": description}
    if project_id < 0:
        return json.dumps({"error": "project_id is required."})
    return json.dumps(_api("POST", f"/api/projects/{project_id}/boards", body), indent=2)


@mcp.tool()
def get_diagram(project_id: int = -1, diagram_id: int = -1):
    """Get a diagram/board with all its nodes and edges.

    Args:
        project_id: The project ID.
        diagram_id: The diagram ID.
    """
    if project_id < 0 and diagram_id > 0:
        res = _api("GET", f"/api/resolve-board/{diagram_id}")
        if "project_id" in res:
             project_id = res["project_id"]
    if project_id < 0:
         return json.dumps({"error": "project_id is required."})
    return json.dumps(_api("GET", f"/api/projects/{project_id}/boards/{diagram_id}"), indent=2)


@mcp.tool()
def update_diagram(project_id: int = -1, diagram_id: int = -1, name: str = "", description: str = "", diagram_type: str = ""):
    """Update a diagram's metadata.

    Args:
        project_id: The project ID.
        diagram_id: The diagram ID.
        name: New name (empty = keep).
        description: New description (empty = keep).
        diagram_type: New type (empty = keep).
    """
    if project_id < 0 and diagram_id > 0:
        res = _api("GET", f"/api/resolve-board/{diagram_id}")
        if "project_id" in res:
             project_id = res["project_id"]
    if project_id < 0:
         return json.dumps({"error": "project_id is required."})
    body: dict = {}
    if name:
        body["name"] = name
    if description:
        body["description"] = description
    if diagram_type:
        body["type"] = diagram_type
    return json.dumps(_api("PATCH", f"/api/projects/{project_id}/boards/{diagram_id}", body), indent=2)


@mcp.tool()
def delete_diagram(project_id: int = -1, diagram_id: int = -1):
    """Delete a diagram and all its nodes and edges.

    Args:
        project_id: The project ID.
        diagram_id: The diagram ID.
    """
    if project_id < 0 and diagram_id > 0:
        res = _api("GET", f"/api/resolve-board/{diagram_id}")
        if "project_id" in res:
             project_id = res["project_id"]
    if project_id < 0:
         return json.dumps({"error": "project_id is required."})
    return json.dumps(_api("DELETE", f"/api/projects/{project_id}/boards/{diagram_id}"), indent=2)


@mcp.tool()
def duplicate_diagram(project_id: int = -1, diagram_id: int = -1):
    """Duplicate a diagram with all nodes and edges (new IDs are assigned).

    Args:
        project_id: The project ID.
        diagram_id: The diagram ID.
    """
    if project_id < 0 and diagram_id > 0:
        res = _api("GET", f"/api/resolve-board/{diagram_id}")
        if "project_id" in res:
             project_id = res["project_id"]
    if project_id < 0:
         return json.dumps({"error": "project_id is required."})
    return json.dumps(_api("POST", f"/api/projects/{project_id}/boards/{diagram_id}/duplicate", {}), indent=2)


@mcp.tool()
def create_board_from_template(project_id: int, template: str, name: str = "") -> str:
    """Create a board from a pre-built template.

    Args:
        project_id: The project to create the board in.
        template: Template name (sprint_planning/release_pipeline/bug_triage/feature_request/onboarding).
        name: Custom name for the board (empty = use template default).
    """
    body: dict = {"template": template}
    if name:
        body["name"] = name
    return json.dumps(_api("POST", f"/api/projects/{project_id}/boards/from-template", body), indent=2)


# ── Nodes ─────────────────────────────────────────────────────────────────────

@mcp.tool()
def list_nodes(project_id: int = -1, diagram_id: int = -1):
    """List all nodes in a diagram.

    Args:
        project_id: The project ID.
        diagram_id: The diagram ID.
    """
    if project_id < 0 and diagram_id > 0:
        res = _api("GET", f"/api/resolve-board/{diagram_id}")
        if "project_id" in res:
             project_id = res["project_id"]
    if project_id < 0:
         return json.dumps({"error": "project_id is required."})
    return json.dumps(_api("GET", f"/api/projects/{project_id}/boards/{diagram_id}/nodes"), indent=2)


@mcp.tool()
def create_node(
    project_id: int,
    diagram_id: int,
    label: str,
    node_type: str = "default",
    x: float = -1,
    y: float = -1,
    width: float = 160,
    height: float = 60,
    meta: str = "{}",
) -> str:
    """Create a new node in a diagram.

    When x and y are not provided (left at -1), the node will be automatically
    positioned to avoid overlapping existing nodes. Nodes are placed in a
    grid-like pattern with proper spacing.

    Args:
        project_id: The project ID.
        diagram_id: The diagram ID.
        label: Display label.
        node_type: Node type (varies by diagram type).
        x: X position (-1 = auto-position to avoid overlap).
        y: Y position (-1 = auto-position to avoid overlap).
        width: Width. height: Height.
        meta: JSON string of extra metadata.
            For 'db_diagram' tables (use node_type='db_table'), meta should contain a 'columns' list:
            {"columns": [{"name": "id", "type": "INTEGER", "is_pk": true}, {"name": "user_id", "is_fk": true, "ref": "users.id"}]}
    """
    # Auto-position if no coordinates provided
    if x < 0 or y < 0:
        x, y = _auto_position(project_id, diagram_id, width, height)

    return json.dumps(
        _api("POST", f"/api/projects/{project_id}/boards/{diagram_id}/nodes", {
            "label": label, "node_type": node_type,
            "x": x, "y": y, "width": width, "height": height,
            "meta": json.loads(meta),
        }),
        indent=2,
    )


@mcp.tool()
def get_node(node_id: int, project_id: int = -1, diagram_id: int = -1):
    """Get a single node.

    Args:
        node_id: The node ID.
        project_id: The project ID.
        diagram_id: The diagram ID.
    """
    if project_id < 0 and diagram_id > 0:
        res = _api("GET", f"/api/resolve-board/{diagram_id}")
        if "project_id" in res:
             project_id = res["project_id"]
    if project_id < 0:
         return json.dumps({"error": "project_id is required."})
    return json.dumps(_api("GET", f"/api/projects/{project_id}/boards/{diagram_id}/nodes/{node_id}"), indent=2)


@mcp.tool()
def update_node(
    project_id: int, diagram_id: int, node_id: int,
    label: str = "", node_type: str = "",
    x: float = -1, y: float = -1,
    width: float = -1, height: float = -1,
    meta: str = "",
) -> str:
    """Update a node. Only provided fields are changed.

    Args:
        project_id: The project ID.
        diagram_id: The diagram ID. node_id: The node ID.
        label: New label (empty = keep). node_type: New type (empty = keep).
        x: New X (-1 = keep). y: New Y (-1 = keep).
        width: New width (-1 = keep). height: New height (-1 = keep).
        meta: New metadata JSON string (empty = keep).
            For 'db_diagram' tables (use node_type='db_table'), can contain 'columns' list:
            {"columns": [{"name": "id", "type": "INT", "is_pk": true}]}
    """
    body: dict = {}
    if label: body["label"] = label
    if node_type: body["node_type"] = node_type
    if x >= 0: body["x"] = x
    if y >= 0: body["y"] = y
    if width >= 0: body["width"] = width
    if height >= 0: body["height"] = height
    if meta: body["meta"] = json.loads(meta)
    return json.dumps(_api("PATCH", f"/api/projects/{project_id}/boards/{diagram_id}/nodes/{node_id}", body), indent=2)


@mcp.tool()
def delete_node(node_id: int, project_id: int = -1, diagram_id: int = -1):
    """Delete a node and all its connected edges.

    Args:
        node_id: The node ID.
        project_id: The project ID.
        diagram_id: The diagram ID.
    """
    if project_id < 0 and diagram_id > 0:
        res = _api("GET", f"/api/resolve-board/{diagram_id}")
        if "project_id" in res:
             project_id = res["project_id"]
    if project_id < 0:
         return json.dumps({"error": "project_id is required."})
    return json.dumps(_api("DELETE", f"/api/projects/{project_id}/boards/{diagram_id}/nodes/{node_id}"), indent=2)


# ── Edges ─────────────────────────────────────────────────────────────────────

@mcp.tool()
def list_edges(project_id: int = -1, diagram_id: int = -1):
    """List all edges in a diagram.

    Args:
        project_id: The project ID.
        diagram_id: The diagram ID.
    """
    if project_id < 0 and diagram_id > 0:
        res = _api("GET", f"/api/resolve-board/{diagram_id}")
        if "project_id" in res:
             project_id = res["project_id"]
    if project_id < 0:
         return json.dumps({"error": "project_id is required."})
    return json.dumps(_api("GET", f"/api/projects/{project_id}/boards/{diagram_id}/edges"), indent=2)


@mcp.tool()
def create_edge(
    project_id: int, diagram_id: int, source_id: int, target_id: int,
    label: str = "", edge_type: str = "default", meta: str = "{}",
    source_column: str = "", target_column: str = "",
) -> str:
    """Create an edge connecting two nodes.

    Args:
        project_id: The project ID.
        diagram_id: The diagram ID.
        source_id: Source node ID. target_id: Target node ID.
        label: Edge label. edge_type: Edge type (varies by diagram type).
        meta: JSON metadata string.
        source_column: For DB diagrams, the specific column name in the source table.
        target_column: For DB diagrams, the specific column name in the target table.
    """
    m = json.loads(meta)
    if source_column: m["source_column"] = source_column
    if target_column: m["target_column"] = target_column

    return json.dumps(
        _api("POST", f"/api/projects/{project_id}/boards/{diagram_id}/edges", {
            "source_id": source_id, "target_id": target_id,
            "label": label, "edge_type": edge_type,
            "meta": m,
        }),
        indent=2,
    )


@mcp.tool()
def get_edge(edge_id: int, project_id: int = -1, diagram_id: int = -1):
    """Get a single edge.

    Args:
        project_id: The project ID.
        diagram_id: The diagram ID. edge_id: The edge ID.
    """
    if project_id < 0 and diagram_id > 0:
        res = _api("GET", f"/api/resolve-board/{diagram_id}")
        if "project_id" in res:
             project_id = res["project_id"]
    if project_id < 0:
         return json.dumps({"error": "project_id is required."})
    return json.dumps(_api("GET", f"/api/projects/{project_id}/boards/{diagram_id}/edges/{edge_id}"), indent=2)


@mcp.tool()
def update_edge(
    project_id: int, diagram_id: int, edge_id: int,
    label: str = "", edge_type: str = "", meta: str = "",
    source_column: str = "", target_column: str = "",
) -> str:
    """Update an edge. Only provided fields are changed.

    Args:
        project_id: The project ID.
        diagram_id: The diagram ID. edge_id: The edge ID.
        label: New label (empty = keep). edge_type: New type (empty = keep).
        meta: New metadata JSON (empty = keep).
        source_column: New source column (empty = keep).
        target_column: New target column (empty = keep).
    """
    body: dict = {}
    if label: body["label"] = label
    if edge_type: body["edge_type"] = edge_type
    
    m = json.loads(meta) if meta else {}
    if source_column: m["source_column"] = source_column
    if target_column: m["target_column"] = target_column
    if m: body["meta"] = m
    
    return json.dumps(_api("PATCH", f"/api/projects/{project_id}/boards/{diagram_id}/edges/{edge_id}", body), indent=2)


@mcp.tool()
def delete_edge(edge_id: int, project_id: int = -1, diagram_id: int = -1):
    """Delete an edge.

    Args:
        project_id: The project ID.
        diagram_id: The diagram ID. edge_id: The edge ID.
    """
    if project_id < 0 and diagram_id > 0:
        res = _api("GET", f"/api/resolve-board/{diagram_id}")
        if "project_id" in res:
             project_id = res["project_id"]
    if project_id < 0:
         return json.dumps({"error": "project_id is required."})
    return json.dumps(_api("DELETE", f"/api/projects/{project_id}/boards/{diagram_id}/edges/{edge_id}"), indent=2)


# ── Bulk ──────────────────────────────────────────────────────────────────────

@mcp.tool()
def bulk_operations(operations: str, project_id: int = -1, diagram_id: int = -1, auto_layout: bool = True):
    """Apply multiple operations atomically on a diagram.

    This is the PREFERRED method for building diagrams with many nodes/edges.
    By default, auto_layout is True which automatically repositions all nodes
    after the operations complete, ensuring proper spacing and clear edges.
    You do NOT need to specify x/y coordinates for nodes — they will be
    auto-positioned.

    IMPORTANT: When creating nodes and edges in the same bulk call, use the
    "_ref" mechanism so edges can reference newly created nodes:
      1. Include "_ref": "some_string" in each create_node operation.
      2. In create_edge operations, set "source_id" and "target_id" to the
         _ref strings (e.g. "source_id": "some_string") instead of integer IDs.
       The server resolves these references to real database IDs automatically.

    Example operations JSON:
      [
        {"action":"create_node","_ref":"n1","label":"Start","node_type":"start"},
        {"action":"create_node","_ref":"n2","label":"End","node_type":"end"},
        {"action":"create_edge","source_id":"n1","target_id":"n2","edge_type":"default"}
      ]

    Args:
        operations: JSON string array of operation objects.
            Supported actions: create_node, update_node, delete_node,
            create_edge, update_edge, delete_edge, update_diagram.
            
            When creating a 'db_table' node in a 'db_diagram', you can include:
            "meta": {"columns": [{"name": "id", "type": "INT", "is_pk": true}, ...]}
            
            When creating an edge in a 'db_diagram', you can include:
            "meta": {"source_column": "user_id", "target_column": "id"}
            
        project_id: The project ID.
        diagram_id: The diagram ID.
        auto_layout: If True (default), automatically apply hierarchical layout
            after all operations, ensuring proper spacing and clear edges.
            Set to False only if you need to preserve exact manual positions.
    """
    if project_id < 0 and diagram_id > 0:
        res = _api("GET", f"/api/resolve-board/{diagram_id}")
        if "project_id" in res:
             project_id = res["project_id"]
    if project_id < 0:
         return json.dumps({"error": "project_id is required."})
    ops = json.loads(operations)
    # Ensure meta is an object if passed as string in individual ops
    for op in ops:
        if "meta" in op and isinstance(op["meta"], str) and op["meta"]:
            try:
                op["meta"] = json.loads(op["meta"])
            except:
                pass

    result = _api("POST", f"/api/projects/{project_id}/boards/{diagram_id}/bulk", {"ops": ops})

    # Auto-layout after bulk operations if enabled
    if auto_layout and not result.get("error"):
        layout_result = _api("POST", f"/api/projects/{project_id}/boards/{diagram_id}/auto-layout", {
            "direction": "LR",
            "node_spacing": 80,
            "rank_spacing": 280,
        })
        # The auto-layout endpoint returns the diagram dict directly
        if "id" in layout_result and "nodes" in layout_result:
            result["diagram"] = layout_result

    return json.dumps(result, indent=2)


# ── Layout ────────────────────────────────────────────────────────────────────

@mcp.tool()
def auto_layout(
    project_id: int = -1,
    diagram_id: int = -1,
    direction: str = "LR",
    node_spacing: int = 80,
    rank_spacing: int = 280,
) -> str:
    """Auto-layout all nodes in a diagram for clear, readable positioning.

    Repositions all nodes using a hierarchical layout algorithm that considers
    edge connections. Nodes are arranged in columns/ranks based on their
    relationships, with proper spacing so edges are clearly visible.

    Use this tool after adding nodes/edges to a diagram if the layout looks
    cluttered or if edges are overlapping.

    Args:
        project_id: The project ID.
        diagram_id: The diagram ID.
        direction: Layout direction: 'LR' (left-to-right) or 'TB' (top-to-bottom).
        node_spacing: Vertical gap between nodes in the same rank (default 80px).
        rank_spacing: Horizontal gap between ranks/columns (default 280px).
    """
    if project_id < 0 and diagram_id > 0:
        res = _api("GET", f"/api/resolve-board/{diagram_id}")
        if "project_id" in res:
             project_id = res["project_id"]
    if project_id < 0:
         return json.dumps({"error": "project_id is required."})
    return json.dumps(
        _api("POST", f"/api/projects/{project_id}/boards/{diagram_id}/auto-layout", {
            "direction": direction,
            "node_spacing": node_spacing,
            "rank_spacing": rank_spacing,
        }),
        indent=2,
    )


# ── File Change Capture ──────────────────────────────────────────────────────

def _git_changed_files(workspace_path: str, since_ref: str = "") -> list[dict]:
    """Run git commands to detect changed files in a workspace.

    Returns a list of dicts: [{"action": "added|modified|deleted|renamed", "path": "..."}]
    """
    import subprocess as _sp

    cwd = workspace_path or "."
    results: list[dict] = []

    # Map git status codes to human actions
    status_map = {
        "A": "added", "M": "modified", "D": "deleted",
        "R": "renamed", "C": "copied", "?": "untracked",
    }

    try:
        if since_ref:
            # Diff against a specific ref (commit, branch, tag)
            cmd = ["git", "diff", "--name-status", since_ref, "HEAD"]
        else:
            # Show all uncommitted changes (staged + unstaged + untracked)
            # First: staged + unstaged
            cmd = ["git", "diff", "--name-status", "HEAD"]

        proc = _sp.run(cmd, cwd=cwd, capture_output=True, text=True, timeout=15)
        for line in proc.stdout.strip().splitlines():
            parts = line.split("\t", 1)
            if len(parts) == 2:
                code = parts[0][0]  # first char (R100 -> R)
                action = status_map.get(code, "modified")
                results.append({"action": action, "path": parts[1]})

        # Also capture untracked files if no ref specified
        if not since_ref:
            proc2 = _sp.run(
                ["git", "ls-files", "--others", "--exclude-standard"],
                cwd=cwd, capture_output=True, text=True, timeout=15,
            )
            for line in proc2.stdout.strip().splitlines():
                if line:
                    results.append({"action": "added", "path": line})

    except Exception as exc:
        results.append({"action": "error", "path": str(exc)})

    return results


@mcp.tool()
def capture_file_changes(
    project_id: int,
    task_id: int,
    workspace_path: str = "",
    since_ref: str = "",
    auto_update_task: bool = True,
    is_ai_working: int = -1,
) -> str:
    """Automatically capture file changes from a Git workspace and log them to a Plano task.

    This tool uses `git diff` to detect which files were added, modified, deleted,
    or renamed in the workspace, then stores the results in the task's `files_meta`.

    Best used by AI agents after completing work on a task, to automatically
    record exactly which files were touched.

    Args:
        project_id: The project ID.
        task_id: The task ID to attach file changes to.
        workspace_path: Absolute path to the git workspace root. Empty = use Plano project dir.
        since_ref: Git ref to diff against (commit SHA, branch, tag). Empty = uncommitted changes vs HEAD.
        auto_update_task: If True (default), automatically patches the task's files_meta with captured changes.
        is_ai_working: 1 for active, 0 for inactive, -1 to keep current.
    """
    path = workspace_path or str(PROJECT_DIR)
    changes = _git_changed_files(path, since_ref)

    result: dict = {
        "workspace": path,
        "since_ref": since_ref or "HEAD (uncommitted)",
        "files_changed": len(changes),
        "changes": changes,
    }

    if auto_update_task and changes:
        patch_body: dict = {"files_meta": changes}
        if is_ai_working != -1:
            patch_body["is_ai_working"] = bool(is_ai_working)
            
        patch_result = _api(
            "PATCH",
            f"/api/projects/{project_id}/tasks/{task_id}",
            patch_body,
        )
        result["task_updated"] = True
        result["task"] = patch_result
    else:
        result["task_updated"] = False

    return json.dumps(result, indent=2)


# ── Entry point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    mcp.run(transport="stdio")
