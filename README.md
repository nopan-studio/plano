# Plano

<img src="https://github.com/nopan-studio/plano/raw/main/static/logo.png" alt="Plano Logo" width="250" />

Plano is a minimalist, powerful project management system designed with one core philosophy: **calm, structured oversight over everything.**
It features built-in visual diagrams alongside standard task tracking so your architecture, process flows, and daily tasks all live in one cohesive environment.

## Features

- **Project & Task Management**: A full project tracking system with milestones, tasks (kanban/list views), tags, and updates.
- **Agent-Led Architecture (3-Layer)**: Designed from the ground up to be operated by AI assistants with structured SOPs (Directives), Orchestration, and Execution layers.
- **Overhauled Visual Boards**: A completely rebuilt high-fidelity editor for diagrams (Process Flows, DB Diagrams, Flowcharts) with reactive state and intelligent auto-layout.
- **Relational DB Visualization**: Rich metadata schema for database nodes, including columns, types, and primary/foreign keys.
- **MCP Native Integration**: Built from the ground up to be easily operated via the Model Context Protocol (MCP).
- **Real-time Reactivity**: Live system-wide updates and AI tool-call indicators powered by Server-Sent Events (SSE).
- **Global Portability**: High-fidelity JSON export/import for entire projects including diagrams, tasks, and milestones.
- **Automatic File Tracking**: Automatically captures and persists exactly which files were modified in every task using `git diff`.
- **API Tester**: Full built-in API testing interface.

## Screenshots

![Project Dashboard](https://github.com/nopan-studio/plano/raw/main/static/1.png)
*Figure 1: Unified dashboard with real-time progress tracking.*

![Kanban Workflow](https://github.com/nopan-studio/plano/raw/main/static/2.png)
*Figure 2: Interactive Kanban board with AI-activity indicators.*

![Process Architect](https://github.com/nopan-studio/plano/raw/main/static/3.png)
*Figure 3: Architect-level process flows and system diagrams.*

![Board Editor Overhaul](https://github.com/nopan-studio/plano/raw/main/static/4.png)
*Figure 4: **Major Overhaul**: High-fidelity Board Editor with reactive database modeling and intelligent edge routing.*


## Getting Started

Plano is built for AI-first development. Follow these steps to set up both the environment and the AI agent directives.

> [!TIP]
> **New**: AI assistants can use our [AI-Driven Installation Guide (INSTALLATION.md)](INSTALLATION.md) for automated setup and directive adaptation.

### 1. Project Installation

Clone the repository and set up the Python environment:

**Linux / macOS:**
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r backend/requirements.txt
./start.sh
```

**Windows:**
```powershell
python -m venv venv
.\venv\Scripts\activate
pip install -r backend/requirements.txt
# Start backend
cd backend
python run.py
# Start frontend (separate terminal)
cd ../frontend
npm install
npm run dev
```

**Docker (Recommended for Production):**

*   **Full Stack Deployment:** Use Docker Compose to start both the app and the managed PostgreSQL database.
    ```bash
    docker-compose up -d --build
    ```


### 2. AI Agent Adaptation (Mandatory)

To enable Plano's full project management layer for your AI assistant (Cursor, Windsurf, or Antigravity), you **must** adapt the pre-configured directives. This ensures the AI follows the correct SOPs (Standard Operating Procedures).

1.  **Read the Instructions**: Open [AGENTS.md](AGENTS.md) and review the 3-Layer Architecture.
2.  **Configure Rules**: Copy the contents of [AGENTS.md](AGENTS.md) AND the contents of the `directives/` folder into your agent's core rules (e.g., `.cursorrules`, `.windsurfrules`, or project settings).
3.  **Third-Party Projects**: If you want to use Plano's agentic workflow in **other projects**, use the pre-configured templates in the [`optional/`](optional/) folder. These provide generic versions of the directives and instructions ready for immediate installation.
4.  **Verify Setup**: Ask the AI: *"What is the Plano project oversight directive?"*. If it explains the tool-calling rules, the setup is successful.

### 3. Quick Links
- **Dashboard**: `http://localhost:5173/` (Frontend)
- **API Server**: `http://localhost:5000/api`
- **Health Check**: `http://localhost:5000/health`


## MCP Installation

Plano includes a native MCP (Model Context Protocol) server that allows AI assistants to directly manage your projects and diagrams.

### 1. NPM Installation (Recommended)
You can run the Plano MCP server directly using `npx`. This is the easiest way to get started and ensures you're always using the latest version.

**Claude Desktop Configuration:**
Add the following to your `claude_desktop_config.json` (replacing `/PATH/TO/PLANO` with the absolute path to this project):

```json
{
  "mcpServers": {
    "plano": {
      "command": "npx",
      "args": [
        "-y",
        "plano-mcp",
        "--path",
        "/PATH/TO/PLANO"
      ]
    }
  }
}
```

> [!NOTE]
> Ensure you replace `/PATH/TO/PLANO` with the **absolute path** to where you cloned this repository.

### 2. Auto-Discovery
If you are using an AI assistant that supports MCP auto-discovery (like Antigravity or Windsurf), copy the absolute path to this project and tell the AI:
> `{{PATH}} install this mcp tool`


## Recent Changes (Changelog)

- **v2.8.0** (Current):
  - **Exclusive PostgreSQL Strategy**: Completely removed legacy SQLite support in favor of a managed PostgreSQL container environment for both development and production.
  - **Docker Engine Consolidation**: Deprecated the `docker-run.sh` script in favor of a unified `docker-compose.yml` workflow, exposing port 5432 for external database management.
  - **Migration & Portability**: Added `backend/migrate_db.py` to facilitate seamless data transitions from legacy SQLite files into the new persistent PostgreSQL volumes.
  - **Unified Configuration**: Streamlined `backend/config.py` to exclusively prioritize environment-based PostgreSQL connection strings.

- **v2.7.0**:
  - **Optional Installation Kit**: Created a standalone `/optional` directory with generic templates (`AGENTS.md`, `directives/`) for easy installation into any third-party project.
  - **Standardized Capitalization**: Migrated all project documentation and agent directives to a consistent ALL CAPS naming convention (e.g., `AGENTS.md`, `PLANO_PROJECT_OVERSIGHT.md`) for improved visibility.
  - **Generic Directive Refinement**: Overhauled agent SOPs to remove project-specific hardcoding, making the 3-layer architecture truly portable between different codebases.
  - **Design Strategy Unification**: Synchronized the core `DESIGN.md` with the new Agent-Led Design Strategy, emphasizing the separation of intent from execution.

- **v2.6.0**:
  - **Unified Workspace Structure**: Migrated all core logic into a clean `/backend` and `/frontend` directory structure.
  - **Gevent Performance Boost**: Replaced `eventlet` with `gevent` for significant performance improvements and better SocketIO stability.
  - **Docker Engine Revamp**: Introduced a unified `docker-run.sh` management script and optimized `docker-compose` for full-stack deployments.
  - **Complete Board Editor Overhaul**: Fully rebuilt reactive canvas with improved performance, intelligent edge routing, and rich database modeling (as showcased in Figure 4).
  - **Silent Data Sync**: Optimized the dashboard to perform "silent reloads" for project meta changes, eliminating UI flickering during AI tool calls.
  - **Enhanced AI Notifications**: Added real-time toast notifications whenever an AI agent utilizes an MCP tool.

- **v2.5.0** (2026-03-22):
  - **MCP Token Optimization**: Dramatic **300x reduction** in LLM token usage for project-level task management.
  - **Intelligent Default Filtering**: Archived tasks are now automatically hidden from `list_tasks` to minimize redundant context.
  - **Selective Field Projection**: Implemented support for the `fields` parameter in task listings, allowing tools to request only the necessary columns (e.g., `id`, `title`, `status`).
  - **Adaptive Oversight**: Enhanced the project oversight directive to dynamically identify projects based on workspace context, removing hardcoded IDs.
  - **Concise AI Communication**: Enforced a new "Final Response Rule" in agent directives to streamline chat feedback following structured Plano updates.

- **v2.4.0** (2026-03-22):
  - **Cross-Platform Parity**: Enhanced venv discovery and path normalization for reliable operation on Windows and macOS.
  - **Native Diff Capture**: Advanced file tracking that captures exact git diff content (staged, unstaged, and untracked) within task metadata.
  - **Intelligent Snapshotting**: Improved change detection that accurately tracks files even if they had uncommitted changes before a task started.
  - **Bug Fix Governance**: Introduced a specialized `bug_fix` update type and mandatory post-update standards for bug resolutions.
  - **Workspace UX**: Implemented dynamic tab titles and addressed issues with improper agent placeholder usage.

- **v2.3.0** (2026-03-22):
  - **AI Adaptation**: Revamped the installation guide to prioritize AI Agent directives and `AGENTS.md` for mandatory project oversight.
  - **Dashboard Refactor**: Migrated the main dashboard route to `/` and significantly improved card designs and layout.
  - **Idea Board Integration**: Integrated the "Ideas" system directly into project-specific views for better unified management.
  - **Bug Fix Automation**: Introduced automatic progress logging for bug fixes when tasks are resolved.
  - **UI/UX Polish**: Fixed markdown spacing issues in descriptions and added a "Contribute" link to the bottom sidebar.

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

Plano is built using a modern, reactive stack:
- **Backend:** Flask / Python (gevent mode)
- **Database:** PostgreSQL via SQLAlchemy
- **Frontend:** SvelteKit / Vite / Vanilla CSS
- **MCP:** Built on the Model Context Protocol (MCP) for seamless AI integration.


## License
Copyright (C) 2026 nopan-studio
MIT License
See [LICENSE](LICENSE) for details.

