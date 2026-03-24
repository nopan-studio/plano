# Project Requirements

This document lists the required libraries and system dependencies for the Plano PM system.

## Backend (Python)
The backend is built with Flask and requires Python 3.10+. Dependencies are managed via `backend/requirements.txt`.

| Library | Version | Purpose |
|---------|---------|---------|
| `flask` | >=3.0.0 | Web Framework |
| `flask-sqlalchemy` | >=3.1.0 | Database ORM |
| `flask-cors` | >=4.0.0 | Cross-Origin Resource Sharing |
| `flask-socketio` | >=5.3.0 | Real-time WebSockets |
| `gevent` | >=23.9.1 | Asynchronous Server for SocketIO |
| `mcp` | >=1.0.0 | Model Context Protocol Server |
| `sqlalchemy` | >=2.0.0 | Primary DB driver |
| `gunicorn` | >=21.0.0 | Production Web Server |
| `pytest` | >=8.0.0 | Testing Framework |
| `pyinstaller`| >=6.0.0 | Standalone bundling (optional) |

## Frontend (Node.js)
The frontend is built with SvelteKit and requires Node.js 18+. Dependencies are managed via `frontend/package.json`.

| Library | Purpose |
|---------|---------|
| `svelte` | Framework |
| `@sveltejs/kit` | Application Framework |
| `@sveltejs/adapter-static` | Production Static Adapter |
| `socket.io-client` | Real-time frontend events |
| `vite` | Build tool and dev server |

## Production
For production deployment, use the `Dockerfile` at the project root. It handles both frontend building and backend serving automatically.
