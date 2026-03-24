"""Plano configuration."""
import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))


class Config:
    DB_PATH = os.path.join(BASE_DIR, 'plano.db')
    # Use PostgreSQL if DATABASE_URL is set, otherwise fallback to SQLite
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
    if not SQLALCHEMY_DATABASE_URI:
        SQLALCHEMY_DATABASE_URI = 'sqlite:///' + DB_PATH
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Engine options based on database type
    # Built as a single dictionary to avoid type-check errors with assignment
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_pre_ping': True,
        **({'connect_args': {'timeout': 15, 'check_same_thread': False}} 
           if 'sqlite' in SQLALCHEMY_DATABASE_URI else {})
    }
    
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key')


class TestConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
