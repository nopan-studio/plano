"""Plano configuration."""
import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))


class Config:
    # ─── Database Configuration ───────────────────────────────────────────────
    # Use PostgreSQL exclusively. We support building from vars or a single DATABASE_URL.
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
    
    if not SQLALCHEMY_DATABASE_URI:
        # Build connection string from driver type
        driver = os.environ.get('DB_DRIVER', 'postgresql').lower()
        
        if driver == 'sqlite':
            # SQLite uses a simple file path
            db_path = os.path.join(BASE_DIR, 'plano.db')
            SQLALCHEMY_DATABASE_URI = f"sqlite:///{db_path}"
        else:
            # PostgreSQL requires full credentials
            user = os.environ.get('DB_USER', 'plano_user')
            pw = os.environ.get('DB_PASS', 'plano_pass')
            host = os.environ.get('DB_HOST', 'localhost') 
            port = os.environ.get('DB_PORT', '5432')
            name = os.environ.get('DB_NAME', 'plano_db')
            
            scheme = "postgresql+psycopg2" if "postgresql" in driver else driver
            SQLALCHEMY_DATABASE_URI = f"{scheme}://{user}:{pw}@{host}:{port}/{name}"
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Engine options for PostgreSQL
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_pre_ping': True,
        'pool_size': 10,
        'max_overflow': 20,
    }
    
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key')


class TestConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
