# Plano Project Oversight Directive

Always use **Plano MCP tools** to track tasks, progress, and updates when the user asks about this project's health, tasks, or status.

## Goal
To provide a consolidated, real-time overview of the project's development progress directly within the Plano system.

## Keywords & Triggers
Use this directive when the following keywords or intent are identified:
- "Check task", "How is it going?", "What's left?", "Progress", "Status", "Todo list".
- Queries about milestones, recent changes, or project summaries.
- "Execute task", "Do task", "Perform next task", "Work on tasks".

## Procedure
1.  **Identify Project**: If multiple projects exist, list them using `mcp_plano_list_projects` and identify the one related to the current workspace (ID 2 for "Plano PM").
2.  **Fetch Data**:
    *   Call `mcp_plano_project_dashboard(project_id=2)` to get high-level stats.
    *   Call `mcp_plano_list_tasks(project_id=2)` for specific task statuses.
3.  **Synthesize Report**:
    *   Summarize current progress (Done vs Todo).
    *   List current active milestone.
    *   Show recent activity or blockers from updates.

## Task Execution
When tasked with performing a task from Plano:
1.  **Selection**: Identify the task to work on. If the user doesn't specify, list available tasks using `mcp_plano_list_tasks(project_id=2, status="todo")`. (Note: tasks in `bugs` should be prioritized if urgent).
2.  **Immediate Status Update**: **As soon as a task is selected, you MUST call `mcp_plano_update_task`** to set its status to `in_progress` and `is_ai_working=1`. This is mandatory and must happen BEFORE starting any coding or file modifications, ensuring the user sees the real-time "AI Working" highlight.
3.  **Confirmation**: Briefly confirm with the user which task is being started and that the status has been updated in Plano. **If the user explicitly uses the command "select" or asks to "select a task", your response must be exactly "task selected" and nothing else.**
4.  **Review Phase**: Upon finishing the code/work, mark the task as `review` (should go to review before being marked as `done`) AND reset `is_ai_working=0`.
5.  **Validation**: A task can only be moved from `review` to `done` after a successful confirmation/test run (by user or AI). If issues are found, move it back to `in_progress`.
6.  **Next Step Hand-off**: After each completed effort (moving to `review`), **STOP and ask the user** if they want to continue with the next task or if they have other instructions. **Do NOT proceed to the next task without explicit user approval.**

## Edge Cases
- **Server Connectivity**: If the Plano MCP server is unresponsive, default to reading local documentation like `README.md` or git history to determine progress.
- **Ambiguity**: If the user asks for "progress" without context, default to checking the most recently updated project in the Plano system.
