# Post Update Standard Directive

This directive defines the mandatory structure and level of detail required for progress updates (Post Updates) made via the `mcp_plano_post_update` tool.

## Goal
To ensure that all progress updates provide a clear, technical, and comprehensive record of work performed, making it easy for both users and other AI agents to understand the changes and the reasoning behind them.

## Mandatory Format
Each post update MUST follow this technical structure:

### 1. **Summary of Work**
   - Provide a concise (1-2 sentences) overview of what was achieved.
   - Example: "Refactored the dashboard's recent activity section to fix layout issues on mobile devices."

### 2. **Technical Approach & Logic**
   - Describe **how** the task was tackled.
   - Explain the reasoning behind key technical decisions.
   - Detail any complex logic or algorithms introduced.
   - Example: "Switched from a flex-based layout to CSS Grid for the card container to ensure better control over item alignment. Used a media query at 768px to stack items vertically."

### 3. **Files Added, Modified, or Deleted**
   - List every file touched with a brief explanation of the change in each.
   - **Modified**: `[filename]` - reason for modification.
   - **Added**: `[filename]` - purpose of the new file.
   - **Deleted**: `[filename]` - why it was removed.

### 4. **Detailed Changes (Diff Summary)**
   - What specifically changed? Mention added/removed functions, changed CSS classes, or modified database schemas.
   - Mention any new dependencies or configuration changes.
   - Example: "Modified `dashboard.js`: Added `reformatDate()` utility function. Updated `renderActivity()` to use this new utility."

### 5. **Validation & Testing**
   - Briefly state how the changes were verified (e.g., "Verified layout in Chromium browser," "Passed all unit tests in `tests/test_ui.py`").

## Triggers
This directive must be followed whenever:
- `mcp_plano_post_update` is called.
- A task is moved to `review` or `done`.
- A major implementation milestone is reached.

## Tooling Integration
When using `mcp_plano_post_update`, the `content` field **MUST** be populated using this markdown-formatted structure. 
If you are resolving a bug task (status `bugs`), you **MUST** ensure the `update_type` argument is set to `"bug_fix"`. For all other task types, default to `"progress"`.
Use the output from `mcp_plano_capture_file_changes` to populate the "Files Added, Modified, or Deleted" section accurately.

## Final Response Rule
To avoid redundant information and keep the conversation concise, the agent **MUST NOT** summarize the work in the chat after successfully calling `mcp_plano_post_update`. 

Since all technical details are now stored in Plano, the agent's final response should simply be:
"Task #[ID] is done and update is posted in Plano."

(Replace `[ID]` with the actual task ID number). This encourages the user to view the structured update directly within the system.

