# Project Oversight Directive

Always use **Plano MCP tools** to track tasks, progress, and updates when the user asks about this project's health, tasks, or status.

## Goal
To provide a consolidated, real-time overview of the project's development progress directly within the Plano system.

## Keywords & Triggers
Use this directive when the following keywords or intent are identified:
- "Check task", "How is it going?", "What's left?", "Progress", "Status", "Todo list".
- Queries about milestones, recent changes, or project summaries.
- "Execute task", "Do task", "Perform next task", "Work on tasks".

## Tooling Constraints
- **No Destructive Operations**: You are STRICTLY FORBIDDEN from performing any `rm -rf` operations on the root project or any significant portion of the codebase unless the user explicitly and verbatim requests it.
- **Plano Integration**: Use Plano MCP tools for all project management actions (tasks, milestones, etc.).
- **No `%SAME%` Placeholder in MCP Tools**: When using `mcp_plano_update_task` or any other Plano MCP tool, **NEVER** pass the literal string `"%SAME%"` for fields like `title`, `description`, etc.

## Procedure
1.  **Identify Project**: 
    - At the start of a session (or if current project is uncertain), call `mcp_plano_list_projects`.
    - Select the `project_id` matching your current workspace context.
    - **Optimization**: If a project ID was already identified in the conversation history, you can proceed by calling technical tools (dashboard/tasks) directly, but verify by including the project identifier in your report.
    - **No Hesitation**: Do NOT verbalize your internal debate about which tool to call first. Bundle necessary listing and fetching tools in a single turn.

2.  **Fetch Data**:
    *   Call `mcp_plano_project_dashboard(project_id=[found_id])` for high-level stats.
    *   Call `mcp_plano_list_tasks(project_id=[found_id])` for task details.
    *   **Pro Tip**: You can combine these with `list_projects` in your first turn for maximum efficiency.

3.  **Synthesize Report**:
    *   Summarize current progress (Done vs Todo).
    *   List current active milestone.
    *   Show recent activity or blockers from updates.

## Task Execution
> [!CAUTION]
> **NO BYPASSING POLICY**: You MUST NOT bypass the project management documentation steps. Every task completion MUST be backed by a file change capture, a status update, and a detailed post update. 
> **NO DIRECT-TO-DONE**: You are STRICTLY FORBIDDEN from moving a task directly to the `done` status. All completed work MUST first be moved to the `review` status for user validation. Only the user can authorize moving a task to `done`, or you may do so ONLY if the user explicitly says "mark as done" or "complete task to done".

When tasked with performing a task from Plano or when a new milestone is created:
1.  **Mandatory Initial Task**: **When a milestone is created, you MUST immediately create at least one associated task using `mcp_plano_create_task` under that milestone.** This ensures no milestone is left without actionable items.
2.  **Mandatory In-Progress**: You MUST select a task to work on. Immediately after selection (or creation), you MUST call `mcp_plano_update_task` to set its status to `in_progress` and `is_ai_working=1`. **This is a HARD REQUIREMENT and MUST happen BEFORE any coding or file modifications.** If no task is specified, use `mcp_plano_list_tasks(project_id=[found_id], status="todo")` first.

3.  **Confirmation**: Briefly confirm the task being started. 
    - If the user uses the command "select" or asks to "select a task", your response MUST be exactly "task selected" and nothing else.
    - For general task assignment, provide a brief, professional summary of the task being started.
4.  **No Recursive Thinking**: Avoid iterative planning in your responses. Decide, call the tool, and then report the outcome.
5.  **Mandatory Completion Steps**: Upon finishing the work (before hand-off), you MUST perform these actions in order:
    *   **Capture File Changes**: Call `mcp_plano_capture_file_changes` with `project_id`, `task_id`, and `auto_update_task=True`. This is CRITICAL for documenting exactly which files were affected.
    *   **Set Task to Review**: Call `mcp_plano_update_task` to set status to `review` AND set `is_ai_working=0`. **Removing the AI working status is mandatory.** You are PROHIBITED from using the `done` status here unless specifically requested.
    *   **Create a Post Update**: Call `mcp_plano_post_update` to summarize achievements and link to the task ID. Follow the detailed format specified in `directives/PLANO_POST_UPDATE_STANDARD.md`. **This step is MANDATORY and cannot be bypassed under any circumstances.**
6.  **Validation**: A task can only be moved from `review` to `done` after a successful confirmation/test run (by user or AI).
7.  **Final Response**: After posting the update, DO NOT summarize the work in the chat. Instead, provide the final response exactly as: "Task #[task_id] is done and update is posted in Plano." Then wait for further instructions.


## Edge Cases
- **Server Connectivity**: If the Plano MCP server is unresponsive, default to reading local documentation like `README.md` or git history to determine progress.
- **Ambiguity**: If the user asks for "progress" without context, default to checking the most recently updated project in the Plano system.
- **Tool Selection**: Always prioritize `mcp_plano_*` tools over any other available MCP server tools for project data.
- **Agent Loops**: If you find yourself re-evaluating the same step twice, STOP and commit to a single path of action (usually calling a foundational tool like `list_projects` or `list_tasks`).
