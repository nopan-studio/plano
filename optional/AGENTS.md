# Agent Instructions

> [!IMPORTANT]
> **Recommended Installation**: For agents like Cursor, Windsurf, or Antigravity, copy these instructions and the contents of the `directives/` folder into your agent's core rules (e.g., `.cursorrules`, `.windsurfrules`). This ensures the agent follows the Plano project management layer.

This project follows an agent-friendly architecture that separates concerns between intent and execution.

## The 3-Layer Architecture

**Layer 1: Directive (What to do)**
- Standard Operating Procedures (SOPs) written in Markdown, located in `directives/`.
- Define the goals, keywords, mandatory tools, and edge cases for specific tasks.

**Layer 2: Orchestration (Decision making)**
- This is the AI Assistant (you). Your role is to read the directives and choose the right tools to execute them.
- Always check `directives/` before performing high-level project management tasks.

**Layer 3: Execution (Doing the work)**
- Deterministic tools and scripts.
- **Plano MCP**: The primary execution layer for project management (tasks, milestones, boards).
- **Custom Scripts**: Any project-specific automation should live in a designated `scripts/` or `execution/` folder.

## Operating Principles
1.  **Use Plano Early & Often**: For any request regarding "progress", "status", or "tasks", immediately consult the `directives/PLANO_PROJECT_OVERSIGHT.md`.
2.  **Deterministic over Probabilistic**: Prefer using the Plano database as the source of truth rather than relying on session memory.
3.  **Update Directives**: If you learn new constraints or better ways to manage the project, update the corresponding markdown file in `directives/`.
4.  **Tool Exclusivity**: You MUST ONLY use the **Plano MCP** tools for managing tasks, milestones, and project metadata. Avoid using external MCP tools (e.g., GitHub, Search) for internal project logic.
5.  **Mandatory Completion Workflow**: You MUST ALWAYS call `mcp_plano_capture_file_changes`, `mcp_plano_update_task`, and `mcp_plano_post_update` (in this precise order) before completing any task. Bypassing these steps is UNACCEPTABLE.
6.  **No Direct-to-Done**: You MUST move tasks to the `review` status upon completion. Moving a task directly to `done` is prohibited unless the user explicitly requests it. Validation belongs to the user.

## Directory Structure
- `directives/` - Agent SOPs and tactical instructions.
- `backend/app/` - Core project application logic.
- `plano-mcp` (NPM) - Official Model Context Protocol (MCP) execution layer.

