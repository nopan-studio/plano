# Plano Design Document

Plano is a minimalist, powerful project management system designed for **calm, structured oversight**. It uniquely combines traditional task tracking with dynamic visual board systems, creating a unified environment for architecture, process flows, and daily execution.

## 1. Core Philosophy

Plano is built on the belief that project management should be **visual, agent-friendly, and portable**.

-   **Visual-First**: Architecture and process flows shouldn't live in a separate tool from the tasks that implement them.
-   **Agent-Led**: Designed from the ground up to be operated by AI coding assistants using the Model Context Protocol (MCP).
-   **Local-First Architecture**: Fast, lightweight, and completely private, using a PostgreSQL database and git-based file tracking.

## 2. The 3-Layer Agentic Architecture

Plano follows a robust **3-Layer Architecture**, separating intent from execution.

### Layer 1: Directive (Intent)
Standard Operating Procedures (SOPs) are stored as Markdown files in `directives/`. These define "how" the project should be managed, giving AI agents clear, deterministic sets of rules to follow. These act as the "source of truth" for agent behavior.

### Layer 2: Orchestration (Decision)
The AI Assistant acts as the bridge. It reads the directives to understand the current context and chooses the appropriate **Plano MCP tools** to execute the required actions. The agent is responsible for translating user intent into project state transitions.

### Layer 3: Execution (Action)
The **Plano MCP Server** (available via the `plano-mcp` NPM package) and the **Flask Backend** perform the deterministic work. The MCP server provides a semantic interface to the underlying database, ensuring all changes are recorded consistently in the project's own database. This layer abstracts away the complexity of project management operations.


---

### Tech Stack
-   **Backend**: Python / Flask (REST API).
-   **Database**: PostgreSQL with SQLAlchemy ORM.
-   **Real-time Engine**: Server-Sent Events (SSE) for live UI updates and AI activity tracking.
-   **Frontend**: Modern SvelteKit, Svelte 5 (High-fidelity design, reactive state management).
-   **Integration**: Native Model Context Protocol (MCP) server for deep AI assistant integration.

## 3. Data Models

The system is organized around several key entities:

-   **Project**: The top-level container for all work, including status, priority, and progress tracking.
-   **Milestone**: Key targets within a project to group related tasks.
-   **Task**: Individual units of work with status (`todo`, `in_progress`, `review`, `done`, `bugs`), priority, and automatic file change capturing.
-   **Diagram (Board)**: Visual representations of logic or structure (Process Flows, DB Diagrams, Flowcharts, Idea Maps, Function Flows).
-   **Node & Edge**: The building blocks of diagrams, supporting rich metadata for database schemas and complex relationships.
-   **ChangeLog**: A comprehensive audit trail of every modification, enabling detailed progress transparency.
-   **Update**: Narrative progress notes, decisions, or blockers associated with projects or specific tasks.
-   **Idea**: A project-independent or project-scoped "backlog" for brainstorming and voting.

## 4. Key Features & Workflows

### Visual Database Modeling
Plano supports high-fidelity database schema visualization. `db_table` nodes can store and display column metadata, including types and keys, allowing for architecture-level planning directly inside the PM tool.

### Automatic File Tracking
Unlike traditional PM tools, Plano automatically tracks which files are touched during a task. By integrating with `git diff`, it captures file changes and associates them with the task's metadata, creating a perfect record of the work performed.

### Real-time Reactivity
Global SSE broadcasting ensures that when an AI agent calls an MCP tool, the UI reflects the change immediately. This includes "AI Working" status indicators on tasks and auto-refreshing project dashboards.

### Portability (High-Fidelity JSON)
Entire projects can be exported to a single JSON blob and imported elsewhere. This includes all tasks, milestones, and even complex diagrams with node positions and connections.

## 5. Directory Structure

-   `/backend`: Core backend application logic.
    -   `/app`: Flask application, models, and routes.
    -   `run.py`: Entry point for starting the web server.
    -   `plano.db`: (Legacy) The source SQLite database if migrating.
-   `plano-mcp` (NPM): The official Model Context Protocol server.

-   `/frontend`: Modern SvelteKit project (High-fidelity UI).
    -   `/src`: Svelte components and reactive logic.
-   `/directives`: Markdown SOPs for AI agents.
-   `/static`: Global static assets (Images, shared media).
-   `start.sh`: Universal script to launch both backend and frontend.
-   `docker-compose.yml`: Standard deployment for Docker environments with managed PostgreSQL.

## 6. Design Aesthetics

Plano uses a **Flat Dark Mode** aesthetic with a premium feel:
-   **Palette**: Deep charcoals, slate grays, and vibrant accent colors for status indicators.
-   **Typography**: Clean, modern sans-serif fonts (Inter/Outfit).
-   **Interactions**: Smooth CSS transitions, subtle hover states, and glassmorphism elements in modal overlays.
