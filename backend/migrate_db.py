"""
Utility to migrate data from SQLite to PostgreSQL.
Usage:
  # Inside the container (when postgres is up)
  python migrate_db.py --source sqlite:///plano.db --target postgresql://...
"""
import argparse
import os
import sys

# Ensure the parent directory is in the path so we can import 'app'
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import create_engine, MetaData, select
from app import create_app, db
from app.models import Project, Milestone, Task, ChangeLog, Update, Idea, Diagram, Node, Edge

def migrate(source_uri, target_uri):
    # Setup source and target engines
    source_engine = create_engine(source_uri)
    target_engine = create_engine(target_uri)
    
    # Reflect metadata
    metadata = MetaData()
    metadata.reflect(bind=source_engine)
    
    # Build app with target config to create tables
    app = create_app()
    app.config['SQLALCHEMY_DATABASE_URI'] = target_uri
    
    with app.app_context():
        # Create all tables in target
        db.create_all()
        
        # Models in order of dependency
        models = [
            Project,
            Milestone,
            Task,
            ChangeLog,
            Update,
            Idea,
            Diagram,
            Node,
            Edge
        ]
        
        for model in models:
            table_name = model.__tablename__
            print(f"Migrating {table_name}...")
            
            # Fetch all from source
            with source_engine.connect() as conn:
                res = conn.execute(metadata.tables[table_name].select())
                rows = [dict(r._mapping) for r in res]
                
            if rows:
                # Clear target table just in case (optional, but safer for fresh migration)
                # db.session.execute(model.__table__.delete())
                
                # Bulk insert
                db.session.bulk_insert_mappings(model, rows)
                db.session.commit()
                print(f"  Done: {len(rows)} rows.")
            else:
                print("  Skipped: table empty.")

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--source', default='sqlite:///plano.db')
    parser.add_argument('--target')
    args = parser.parse_args()
    
    if not args.target:
        print("Error: --target (PostgreSQL URI) is required.")
        exit(1)
        
    migrate(args.source, args.target)
