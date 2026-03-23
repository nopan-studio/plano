# Plano Design Document

Plano is a minimalist, powerful project management system designed for **calm, structured oversight**. It uniquely combines traditional task tracking with dynamic visual board systems, creating a unified environment for architecture, process flows, and daily execution.

## 1. Core Philosophy

Plano is built on the belief that project management should be **visual, agent-friendly, and portable**.

-   **Visual-First**: Architecture and process flows shouldn't live in a separate tool from the tasks that implement them.
-   **Agent-Led**: Designed from the ground up to be operated by AI coding assistants using the Model Context Protocol (MCP).
-   **Local-First**: Fast, lightweight, and completely private, using a local SQLite database and git-based file tracking.

## 2. System Architecture

Plano follows a robust **3-Layer Agentic Architecture**, separating intent from execution.

### Layer 1: Directive (Intent)
Standard Operating Procedures (SOPs) are stored as Markdown files in `directives/`. These define "how" the project should be managed, giving AI agents clear sets of rules to follow.

### Layer 2: Orchestration (Decision)
The AI Assistant (the Agent) acts as the bridge. It reads the directives to understand the current context and chooses the appropriate Plano MCP tools to execute the required actions.

### Layer 3: Execution (Action)
The **Plano MCP Server** and the **Flask Backend** perform the deterministic work. The MCP server provides a semantic interface to the underlying SQLite database, ensuring all changes are recorded in the changelog.

---

### Tech Stack
-   **Backend**: Python / Flask (REST API).
-   **Database**: SQLite with SQLAlchemy ORM.
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

-   `/app`: Core backend application logic (Flask).
    -   `/routes`: API endpoints (Boards, Tasks, Projects, etc.).
    -   `models.py`: Database schema definitions.
    -   `templates_data.py`: Pre-configured project templates.
-   `/frontend`: Modern SvelteKit project (High-fidelity UI).
    -   `/src`: Svelte components and reactive logic.
-   `/directives`: Markdown SOPs for AI agents.
-   `/static`: Global static assets (Images, shared media).
-   `mcp_server.py`: The entry point for the MCP server, providing the tool interface for AI agents.
-   `run.py`: Entry point for starting the web server.

## 6. Design Aesthetics

Plano uses a **Flat Dark Mode** aesthetic with a premium feel:
-   **Palette**: Deep charcoals, slate grays, and vibrant accent colors for status indicators.
-   **Typography**: Clean, modern sans-serif fonts (Inter/Outfit).
-   **Interactions**: Smooth CSS transitions, subtle hover states, and glassmorphism elements in modal overlays.
