# AI-Driven Installation Guide

This guide is designed for **AI Assistants** (like Antigravity, Windsurf, or Cursor) to automatically set up the Plano environment and adapt its project management directives.

---

## 🤖 Step 1: Automated Environment Setup
Copy the following command block and execute it in your terminal. This will detect your OS, set up the virtual environment, install dependencies, and start the Plano server.

```bash
# Detected OS: Linux/macOS
python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt && ./start.sh
```

*(If on Windows, use: `python -m venv venv && .\venv\Scripts\activate && pip install -r requirements.txt && python run.py`)*

---

## 🧭 Step 2: AI Agent Adaptation (Mandatory)
Plano is built with a **3-Layer Architecture** (Directives, Orchestration, Execution). To function correctly as an agent in this project, you must consume the project rules.

**Your Goal**: Self-configure your system prompt or project rules with these files:

1.  **Read Core Rules**: [AGENTS.md](AGENTS.md)
2.  **Read SOPs**: [directives/plano_project_oversight.md](file:///home/tsuki/Projects/plano/directives/plano_project_oversight.md)
3.  **Read Update Standards**: [directives/plano_post_update_standard.md](file:///home/tsuki/Projects/plano/directives/plano_post_update_standard.md)

### 📋 Checklist for the AI Assistant:
- [ ] I have read `AGENTS.md` and understand the mandatory (Capture -> Update -> Post Update) workflow.
- [ ] I have read the project management oversight directive.
- [ ] I am ready to manage tasks using the Plano MCP tools.

---

## 🔌 Step 3: MCP Tool Integration
If you support **MCP (Model Context Protocol)**, you can manage this project's tasks, milestones, and diagrams directly.

**Installation Prompt**:
> Use the `mcp_server.py` file in this directory to install the Plano MCP tool.

**Manual Config paths**:
- **Executable**: `{{PROJECT_DIR}}/venv/bin/python` (Unix) or `{{PROJECT_DIR}}/venv/Scripts/python.exe` (Windows)
- **Script**: `{{PROJECT_DIR}}/mcp_server.py`

---

## 🚀 Step 4: Verification
After installation, open the dashboard to ensure everything is running:
- **Local Dashboard**: [http://localhost:5000](http://localhost:5000)

**AI Verification Prompt**:
> "Tell me about the current status of the Plano project and list the 3 most recent updates."
