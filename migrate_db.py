from app import db, create_app
from sqlalchemy import text

app = create_app()
with app.app_context():
    try:
        # Check if column exists
        db.session.execute(text("SELECT kanban_order FROM project LIMIT 1"))
        print("Column 'kanban_order' already exists.")
    except Exception:
        print("Adding column 'kanban_order' to table 'project'...")
        db.session.execute(text("ALTER TABLE project ADD COLUMN kanban_order TEXT DEFAULT '{}'"))
        db.session.commit()
        print("Column added successfully.")
