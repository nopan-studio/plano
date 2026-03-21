# Plano

<img src="https://github.com/nopan-studio/plano/raw/main/static/logo.png" alt="Plano Logo" width="250" />

Plano is a minimalist, powerful project management system designed with one core philosophy: **calm, structured oversight over everything.**
It features built-in visual diagrams alongside standard task tracking so your architecture, process flows, and daily tasks all live in one cohesive environment.

## Features

- **Project & Task Management**: A full project tracking system with milestones, tasks (kanban/list views), tags, and updates.
- **Dynamic Visual Boards**: Create interactive diagrams directly within projects (Process Flows, DB Diagrams, Flowcharts, Idea Maps, and more).
- **Relational DB Visualization**: Rich metadata schema for database nodes, including columns, types, and primary/foreign keys.
- **MCP Native Integration**: Built from the ground up to be easily operated via the Model Context Protocol (MCP).
- **Real-time Reactivity**: Live system-wide updates and AI tool-call indicators powered by Server-Sent Events (SSE).
- **Global Portability**: High-fidelity JSON export/import for entire projects including diagrams, tasks, and milestones.
- **Automatic File Tracking**: Automatically captures and persists exactly which files were modified in every task using `git diff`.
- **API Tester**: Full built-in API testing interface.

## Screenshots

![Screenshot 1](https://github.com/nopan-studio/plano/raw/main/static/1.png)
![Screenshot 2](https://github.com/nopan-studio/plano/raw/main/static/2.png)
![Screenshot 3](https://github.com/nopan-studio/plano/raw/main/static/3.png)
![Screenshot 4](https://github.com/nopan-studio/plano/raw/main/static/4.png)


## Quick Start

### 1. Setup Environment

**Linux / macOS:**
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

**Windows:**
```powershell
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Start the Server

**Linux / macOS:**
```bash
./start.sh
```

**Windows:**
```powershell
python run.py
```

### 3. Usage
- **Dashboard**: `http://localhost:5000/dashboard`
- **Health Check**: `http://localhost:5000/health`
- **API Docs**: `http://localhost:5000/api`

### 4. Recommended: Install AI Agent Directives
For the best experience, we **highly recommend** installing the pre-configured **Directives** system. This gives AI agents (like Cursor, Windsurf, or Antigravity) structured oversight of your project.

To install:
1. Copy the contents of [AGENTS.md](AGENTS.md).
2. Paste them into your agent's custom instructions file (e.g., `.cursorrules`, `.windsurfrules`, or project settings).
3. The agent will now automatically use Plano to track its own progress seamlessly.

## MCP Installation

Plano includes a native MCP (Model Context Protocol) server that allows AI assistants to directly manage your projects and diagrams.

### Quick Install (AI-Driven)
If you are using an AI assistant that supports MCP auto-discovery (like Antigravity or Windsurf), copy the absolute path to this project and tell the AI:
> `{{PATH}} install this mcp tool`

### Manual Configuration (Claude Desktop)
Add the following to your `claude_desktop_config.json` (replacing `/PATH/TO/PLANO` with the absolute path to this project):

**Linux / macOS:**
```json
{
  "mcpServers": {
    "plano": {
      "command": "/PATH/TO/PLANO/venv/bin/python",
      "args": ["/PATH/TO/PLANO/mcp_server.py"]
    }
  }
}
```

**Windows:**
```json
{
  "mcpServers": {
    "plano": {
      "command": "C:\\PATH\\TO\\PLANO\\venv\\Scripts\\python.exe",
      "args": ["C:\\PATH\\TO\\PLANO\\mcp_server.py"]
    }
  }
}
```

*Note: The MCP server automatically manages the lifecycle of the Flask backend. On the first tool call, it will start the backend on port 5050 if it isn't already running.*

## Recent Changes (Changelog)

- **v2.2.0** (2026-03-21):
  - **Lean Core**: Removed GitHub integration in favor of a simpler, more robust local-first architecture using a standalone `git diff` capture tool.
  - **DB Schema Visualization**: Implemented rich metadata for database nodes, enabling display and management of columns, types, and primary/foreign keys within diagrams.
  - **UI/UX Refinement**: Widened Kanban board columns for better readability and added "AI Working" status badges to project dashboards.
  - **Timezone Support**: Added full support for local timezone rendering across all UI timestamps.
  - **Layout Engine**: Improved auto-layout spacing and added default Left-to-Right orientation for process flows.

- **v2.1.0** (2026-03-20):
  - **Real-time Engine**: Implemented global SSE for live UI updates and AI activity indicators.
  - **QA Workflow**: Added dedicated `Bugs` triage and `Testing` columns to the task board.
  - **Data Portability**: Launched the high-fidelity Export/Import engine for project backups and migrations.
  - **Visual Board Fixes**: Improved diagram layout performance and node visibility.

## Architecture

Plano is built using a lightweight stack:
- **Backend:** Flask / Python
- **Database:** SQLite & SQLAlchemy (`plano.db`)
- **Frontend:** Vanilla JS / CSS / HTML with no heavy build systems or JS frameworks.
- **MCP:** Built on FastMCP for quick conversational AI usage.

## License
Copyright (C) 2026 nopan-studio
MIT License
See [LICENSE](LICENSE) for details.
