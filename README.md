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

### 4. Optional: AI Agent Integration
Plano includes a pre-configured **Directives** system in the `directives/` folder to give AI agents (like Cursor or Windsurf) structured oversight. Check out [AGENTS.md](AGENTS.md) for more details.

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

## AI Agent Integration (Optional)

Plano is built for "agent-led development." You can integrate its MCP server into your AI assistant (like Cursor, Windsurf, or Antigravity) to give it structured oversight of your project management.

### The 3-Layer Architecture
For optimal results, we recommend a 3-layer approach to agent orchestration, as seen in the project's own development:

1.  **Layer 1: Directive (Intent)**: Standard Operating Procedures (SOPs) defined in the `directives/` folder.
2.  **Layer 2: Orchestration (Decision)**: The AI Assistant reads directives to decide which tools to execute.
3.  **Layer 3: Execution (Action)**: The Plano MCP tools directly manage tasks and diagrams.

### Integration Example
To integrate the MCP into your agent's behavior, check the **[AGENTS.md](AGENTS.md)** file for a complete template. You can add these instructions to your agent's core rules (e.g., `.cursorrules` or `.windsurfrules`):

> "Always refer to the `directives/` folder for project management SOPs. Use the Plano MCP tools as the source of truth for tracking progress, tasks, and project status."

By doing this, the agent will automatically update its progress in Plano as it completes work, ensuring your project dashboard is always up to date.

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
