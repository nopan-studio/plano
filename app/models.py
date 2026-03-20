"""SQLAlchemy models for Plano PM system."""
from datetime import datetime
import json
from app import db


# ─── Valid types ──────────────────────────────────────────────────────────────

DIAGRAM_TYPES = ['process_flow', 'db_diagram', 'flowchart', 'idea_map', 'function_flow']

NODE_TYPES = {
    'process_flow': ['start', 'end', 'process', 'decision', 'io', 'connector', 'annotation'],
    'db_diagram': ['table', 'view', 'enum', 'note'],
    'flowchart': ['start', 'end', 'process', 'decision', 'io', 'connector', 'annotation'],
    'idea_map': ['idea', 'category', 'note', 'link'],
    'function_flow': ['function', 'class', 'module', 'api_endpoint', 'event', 'callback'],
}

EDGE_TYPES = {
    'process_flow': ['default', 'success', 'failure', 'conditional'],
    'db_diagram': ['one_to_one', 'one_to_many', 'many_to_many', 'belongs_to'],
    'flowchart': ['default', 'success', 'failure', 'conditional'],
    'idea_map': ['related', 'supports', 'contradicts', 'extends'],
    'function_flow': ['calls', 'returns', 'emits', 'subscribes', 'inherits', 'imports'],
}

PROJECT_STATUSES = ['planning', 'active', 'on_hold', 'completed', 'archived']
TASK_STATUSES = ['todo', 'in_progress', 'review', 'done']
MILESTONE_STATUSES = ['pending', 'in_progress', 'completed', 'missed']
IDEA_STATUSES = ['new', 'exploring', 'accepted', 'rejected']
UPDATE_TYPES = ['progress', 'blocker', 'decision', 'note']
PRIORITIES = ['low', 'medium', 'high', 'critical']


# ─── Project ──────────────────────────────────────────────────────────────────

class Project(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, default='')
    status = db.Column(db.String(32), default='planning')
    priority = db.Column(db.String(16), default='medium')
    start_date = db.Column(db.Date, nullable=True)
    target_date = db.Column(db.Date, nullable=True)
    progress_pct = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    milestones = db.relationship('Milestone', backref='project', lazy=True, cascade='all, delete-orphan')
    tasks = db.relationship('Task', backref='project', lazy=True, cascade='all, delete-orphan')
    boards = db.relationship('Diagram', backref='project', lazy=True, cascade='all, delete-orphan')
    changelogs = db.relationship('ChangeLog', backref='project', lazy=True, cascade='all, delete-orphan')
    updates = db.relationship('Update', backref='project', lazy=True, cascade='all, delete-orphan')

    def to_dict(self, summary=False):
        d = dict(
            id=self.id, name=self.name, description=self.description,
            status=self.status, priority=self.priority,
            start_date=self.start_date.isoformat() if self.start_date else None,
            target_date=self.target_date.isoformat() if self.target_date else None,
            progress_pct=self.progress_pct,
            created_at=self.created_at.isoformat(),
            updated_at=self.updated_at.isoformat(),
        )
        if summary:
            d['task_count'] = len(self.tasks)
            d['milestone_count'] = len(self.milestones)
            d['board_count'] = len(self.boards)
            # Task breakdown
            d['tasks_by_status'] = {}
            for t in self.tasks:
                d['tasks_by_status'][t.status] = d['tasks_by_status'].get(t.status, 0) + 1
        return d


# ─── Milestone ────────────────────────────────────────────────────────────────

class Milestone(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, default='')
    due_date = db.Column(db.Date, nullable=True)
    status = db.Column(db.String(32), default='pending')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    tasks = db.relationship('Task', backref='milestone', lazy=True)

    def to_dict(self):
        return dict(
            id=self.id, project_id=self.project_id,
            name=self.name, description=self.description,
            due_date=self.due_date.isoformat() if self.due_date else None,
            status=self.status,
            task_count=len(self.tasks),
            created_at=self.created_at.isoformat(),
            updated_at=self.updated_at.isoformat(),
        )


# ─── Task ─────────────────────────────────────────────────────────────────────

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    milestone_id = db.Column(db.Integer, db.ForeignKey('milestone.id'), nullable=True)
    title = db.Column(db.String(300), nullable=False)
    description = db.Column(db.Text, default='')
    assignee = db.Column(db.String(120), default='')
    status = db.Column(db.String(32), default='todo')
    priority = db.Column(db.String(16), default='medium')
    due_date = db.Column(db.Date, nullable=True)
    estimated_hours = db.Column(db.Float, nullable=True)
    actual_hours = db.Column(db.Float, nullable=True)
    tags = db.Column(db.Text, default='[]')  # JSON array
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return dict(
            id=self.id, project_id=self.project_id,
            milestone_id=self.milestone_id,
            title=self.title, description=self.description,
            assignee=self.assignee, status=self.status,
            priority=self.priority,
            due_date=self.due_date.isoformat() if self.due_date else None,
            estimated_hours=self.estimated_hours,
            actual_hours=self.actual_hours,
            tags=json.loads(self.tags or '[]'),
            created_at=self.created_at.isoformat(),
            updated_at=self.updated_at.isoformat(),
        )


# ─── ChangeLog ────────────────────────────────────────────────────────────────

class ChangeLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    entity_type = db.Column(db.String(64), nullable=False)  # project, task, milestone, board, etc.
    entity_id = db.Column(db.Integer, nullable=False)
    action = db.Column(db.String(32), nullable=False)  # created, updated, deleted
    field_changed = db.Column(db.String(120), default='')
    old_value = db.Column(db.Text, default='')
    new_value = db.Column(db.Text, default='')
    changed_by = db.Column(db.String(120), default='system')
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return dict(
            id=self.id, project_id=self.project_id,
            entity_type=self.entity_type, entity_id=self.entity_id,
            action=self.action, field_changed=self.field_changed,
            old_value=self.old_value, new_value=self.new_value,
            changed_by=self.changed_by,
            timestamp=self.timestamp.isoformat(),
        )


# ─── Update (Progress Note) ──────────────────────────────────────────────────

class Update(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    task_id = db.Column(db.Integer, db.ForeignKey('task.id'), nullable=True)
    content = db.Column(db.Text, nullable=False)
    update_type = db.Column(db.String(32), default='progress')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return dict(
            id=self.id, project_id=self.project_id,
            task_id=self.task_id,
            content=self.content, update_type=self.update_type,
            created_at=self.created_at.isoformat(),
        )


# ─── Idea ─────────────────────────────────────────────────────────────────────

class Idea(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=True)
    title = db.Column(db.String(300), nullable=False)
    description = db.Column(db.Text, default='')
    status = db.Column(db.String(32), default='new')
    votes = db.Column(db.Integer, default=0)
    tags = db.Column(db.Text, default='[]')  # JSON array
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return dict(
            id=self.id, project_id=self.project_id,
            title=self.title, description=self.description,
            status=self.status, votes=self.votes,
            tags=json.loads(self.tags or '[]'),
            created_at=self.created_at.isoformat(),
            updated_at=self.updated_at.isoformat(),
        )


# ─── Diagram (Board / View) ──────────────────────────────────────────────────

class Diagram(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=True)
    name = db.Column(db.String(120), nullable=False)
    type = db.Column(db.String(32), nullable=False)  # process_flow | db_diagram | flowchart | idea_map | function_flow
    description = db.Column(db.Text, default='')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    nodes = db.relationship('Node', backref='diagram', lazy=True, cascade='all, delete-orphan')
    edges = db.relationship('Edge', backref='diagram', lazy=True, cascade='all, delete-orphan')

    def to_dict(self, full=False):
        d = dict(
            id=self.id, project_id=self.project_id,
            name=self.name, type=self.type,
            description=self.description,
            created_at=self.created_at.isoformat(),
            updated_at=self.updated_at.isoformat(),
            node_count=len(self.nodes),
            edge_count=len(self.edges),
        )
        if full:
            d['nodes'] = [n.to_dict() for n in self.nodes]
            d['edges'] = [e.to_dict() for e in self.edges]
        return d


# ─── Node ─────────────────────────────────────────────────────────────────────

class Node(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    diagram_id = db.Column(db.Integer, db.ForeignKey('diagram.id'), nullable=False)
    label = db.Column(db.String(200), nullable=False)
    node_type = db.Column(db.String(64), default='default')
    x = db.Column(db.Float, default=100)
    y = db.Column(db.Float, default=100)
    width = db.Column(db.Float, default=160)
    height = db.Column(db.Float, default=60)
    meta = db.Column(db.Text, default='{}')

    def to_dict(self):
        return dict(
            id=self.id, diagram_id=self.diagram_id,
            label=self.label, node_type=self.node_type,
            x=self.x, y=self.y, width=self.width, height=self.height,
            meta=json.loads(self.meta or '{}'),
        )


# ─── Edge ─────────────────────────────────────────────────────────────────────

class Edge(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    diagram_id = db.Column(db.Integer, db.ForeignKey('diagram.id'), nullable=False)
    source_id = db.Column(db.Integer, db.ForeignKey('node.id'), nullable=False)
    target_id = db.Column(db.Integer, db.ForeignKey('node.id'), nullable=False)
    label = db.Column(db.String(200), default='')
    edge_type = db.Column(db.String(64), default='default')
    meta = db.Column(db.Text, default='{}')

    def to_dict(self):
        return dict(
            id=self.id, diagram_id=self.diagram_id,
            source_id=self.source_id, target_id=self.target_id,
            label=self.label, edge_type=self.edge_type,
            meta=json.loads(self.meta or '{}'),
        )
