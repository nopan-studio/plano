"""Plano configuration."""
import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))


class Config:
    DB_PATH = os.path.join(BASE_DIR, 'plano.db')
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL', 'sqlite:///' + DB_PATH
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'connect_args': {'timeout': 15, 'check_same_thread': False}
    }
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key')


class TestConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
