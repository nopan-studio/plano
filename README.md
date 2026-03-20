# Plano

![Plano Logo](./static/logo.png)

Plano is a minimalist, powerful project management system designed with one core philosophy: **calm, structured oversight over everything.**
It features built-in visual diagrams alongside standard task tracking so your architecture, process flows, and daily tasks all live in one cohesive environment.

## Features

- **Project & Task Management**: A full project tracking system with milestones, tasks (kanban/list views), tags, and updates.
- **Dynamic Visual Boards**: Create interactive diagrams directly within projects.
  - Process Flows
  - Entity-Relationship / Database Diagrams
  - Flowcharts
  - Idea Maps
  - Function & API Flows
- **MCP Native Integration**: Built from the ground up to be easily operated via the Model Context Protocol (MCP), meaning AI assistants can auto-generate and manage your diagrams and project data.
- **API Tester**: Full built-in API testing interface.

## Quick Start

### 1. Setup Environment
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Start the Server
```bash
./start.sh
```

### 3. Usage
- **Dashboard**: `http://localhost:5000/dashboard`
- **Health Check**: `http://localhost:5000/health`
- **API Docs**: `http://localhost:5000/api`

## MCP Installation

Plano includes a native MCP (Model Context Protocol) server that allows AI assistants to directly manage your projects and diagrams.

### Quick Install (AI-Driven)
If you are using an AI assistant that supports MCP auto-discovery (like Antigravity or Windsurf), copy the absolute path to this project and tell the AI:
> `{{PATH}} install this mcp tool`

### Manual Configuration (Claude Desktop)
Add the following to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "plano": {
      "command": "/home/tsuki/Projects/Plano/venv/bin/python",
      "args": ["/home/tsuki/Projects/Plano/mcp_server.py"]
    }
  }
}
```

*Note: The MCP server automatically manages the lifecycle of the Flask backend. On the first tool call, it will start the backend on port 5050 if it isn't already running.*

## Architecture

Plano is built using a lightweight stack:
- **Backend:** Flask / Python
- **Database:** SQLite & SQLAlchemy (`plano.db`)
- **Frontend:** Vanilla JS / CSS / HTML with no heavy build systems or JS frameworks.
- **MCP:** Built on FastMCP for quick conversational AI usage.

## License
Copyright (C) 2026 nopan-studio
GNU General Public License v3.0 (GPL-3.0)
See [LICENSE](LICENSE) for details.
