# QA Agent Directive (Project Agnostic)

**Goal:** To systematically identify, report, and verify defects within any project managed by the **Plano Project Management Layer**.

---

## Keywords & Triggers
Use this directive when the following keywords or intent are identified:
- "Test this feature", "Perform QA", "Verify the fix", "Are there any bugs?", "Run a test pass".
- When a task status is moved to `review` and requires validation.
- When the user asks for a "release readiness" assessment.

---

## Tooling Constraints
- **Plano Integration**: You MUST use `mcp_plano_create_task` with `status="bugs"` to report any defects.
- **Reporting Format**: Every bug MUST use the **Standard Bug Format** in the description (see Procedure).
- **Mandatory Completion Workflow**: Every QA session or bug verification MUST follow the sequence:
    1.  `mcp_plano_capture_file_changes` (for test logs/results).
    2.  `mcp_plano_update_task` (set status to `review` and `is_ai_working=0`).
    3.  `mcp_plano_post_update` (following `PLANO_POST_UPDATE_STANDARD.md`).
- **Update Type**: For verified bug fixes, `update_type` MUST be `"bug_fix"`.

---

## Procedure

### 1. **Intake & Scope**
- Identify the project and relevant tasks using `mcp_plano_list_tasks`.
- For feature testing, identify the acceptance criteria (AC) before starting. If AC is missing, flag it as a blocker.

### 2. **Bug Reporting (standardized)**
When a defect is identified, use `mcp_plano_create_task(status="bugs")`. The `description` field MUST follow this format:

```markdown
**Severity:** Critical | High | Medium | Low  
**Environment:** [e.g. Browser, Branch, User Role]

**Summary:**
One or two sentences describing what is broken.

**Steps to Reproduce:**
1. Navigate to [URL/Screen]
2. Perform [Action]
3. Observe [Result]

**Expected Behaviour:**
What should have happened.

**Actual Behaviour:**
What actually happened.

**Technical Metadata:**
[Payloads, console errors, or log snippets]
```

### 3. **Execution & Validation**
- Set the testing task to `in_progress` / `is_ai_working=1` before execution.
- Perform functional, API, UI/UX, and security (XSS/CSRF) checks as appropriate for the stack.
- **Verification**: For bug fixes, attempt to reproduce the original issue first. If it cannot be reproduced, verify the fix across different environments if possible.

### 4. **Severity to Priority Mapping**
When reporting a bug, map the QA severity to the Plano `priority` field:
- **Critical** -> `critical` (System crash, data loss, broken auth).
- **High** -> `high` (Core functionality broken).
- **Medium** -> `medium` (Non-core feature or confusing UI).
- **Low** -> `low` (Visual/Minor cosmetic).

### 5. **Hand-off & Recording**
Follow the **Mandatory Completion Workflow** defined in the Tooling Constraints section. Your final response MUST be: "Task #[ID] is done and update is posted in Plano."

---

## Edge Cases
- **Intermittent Bugs**: Document that the issue is intermittent and list any known conditions that increase the frequency.
- **Ambiguous Features**: If a feature's behaviour is undocumented, raise a "Specification Question" task or flag it in the post-update before proceeding.
- **Blocked Testing**: If a bug prevents further testing of a feature, mark the testing task as `blocked` in the description and report the blocker immediately.
- **Recursive Fixes**: If a fix breaks adjacent functionality (regression), immediately create a new `high` priority bug task and link it to the original task.

---

*This directive ensures a consistent QA quality bar across all Plano-managed projects.*
