# Task Review Directive (Plano QA Integration)

Always use this directive when the user asks to **"review tasks"**, **"verify work"**, or **"perform QA"** on existing tasks in the Plano project management system.

## Goal
To systematically transition tasks from `review` to `done` (or back to `todo`/`bugs`) by executing rigorous verification steps defined in the Plano QA framework.

## Keywords & Triggers
Use this directive when the following keywords or intent are identified:
- "Review tasks", "Check the review list", "Validate work".
- "Is this task done?", "Perform QA on task #[ID]".
- "Start reviewing", "Reviewing tasks".

## Tooling Constraints
- **Plano Integration**: All review outcomes must be recorded using `mcp_plano_post_update` and `mcp_plano_update_task`.
- **QA Directive**: You MUST follow the testing standards and reporting formats defined in `directives/PLANO_QA_DIRECTIVE.md`.

## Procedure

1.  **Identify Tasks for Review**:
    - Call `mcp_plano_list_tasks(project_id=[ID], status="review")`.
    - If no project ID is provided, default to the active project (e.g., "Plano").

2.  **Select a Review Target**:
    - Present the list of tasks in `review` status to the user.
    - Once a task is selected, get its full details using `mcp_plano_get_task`.
    - Set the task to `in_progress` and `is_ai_working=1` to indicate the review is underway.

3.  **Execute QA Verification**:
    - **Step 1: Context Gathering**: Read the `files_meta` and the most recent `mcp_plano_post_update` for the task to understand what was changed.
    - **Step 2: Systematic Testing**: Follow the **Phases** and **Testing Responsibilities** in `directives/PLANO_QA_DIRECTIVE.md`.
        - Run functional tests (scripts, API calls).
        - Verify UI/UX changes (if applicable) using browser tools or file inspections.
        - Check for regressions in related modules.

4.  **Review Outcomes**:
    - **Pass (Verified)**:
        - If the work meets all criteria, inform the user.
        - **Transition to Done**: Only move to `done` if the user explicitly authorizes it, otherwise leave in `review` but add a verification post.
        - Call `mcp_plano_post_update` with `update_type="progress"` stating "Verification Passed".
    - **Fail (Defect Found)**:
        - Call `mcp_plano_create_task` with `status="bugs"` using the **Standard Bug Format** from the QA directive.
        - Link the new bug task to the original task ID in the description.
        - Transition the original task back to `todo` or keep in `review` with a "Blocker" update.
        - Call `mcp_plano_post_update` with `update_type="blocker"`.

5.  **Completion**:
    - Follow the **Mandatory Completion Steps** in `directives/PLANO_PROJECT_OVERSIGHT.md`:
        - `mcp_plano_capture_file_changes` (if test logs/scripts were created).
        - `mcp_plano_update_task` (status update and `is_ai_working=0`).
        - `mcp_plano_post_update` (Final summary of the review session).

## Final Response
After completing a review session, provide the summary exactly as: "Task review for #[task_id] is complete and outcomes are recorded in Plano."
