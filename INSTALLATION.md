# AI-Driven Installation Guide

This guide is designed for **AI Assistants** (like Antigravity, Windsurf, or Cursor) to automatically set up the Plano environment and adapt its project management directives.

---

## 🤖 Step 1: Automated Environment Setup
Copy the following command block and execute it in your terminal. This will detect your OS, set up the virtual environment, install dependencies, and start the Plano server.

### Linux / macOS
```bash
python3 -m venv venv && source venv/bin/activate && pip install -r backend/requirements.txt && ./start.sh
```

### Windows
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

### Docker Setup (PostgreSQL Managed)
```bash
# Start both the Flask app and the managed PostgreSQL database
docker-compose up -d --build
```

---

## 🧭 Step 2: AI Agent Adaptation (Mandatory)
Plano is built with a **3-Layer Architecture** (Directives, Orchestration, Execution). To function correctly as an agent in this project, you must consume the project rules.

**Your Goal**: Self-configure your system prompt or project rules with these files:

1.  **Read Core Rules**: [AGENTS.md](AGENTS.md)
2.  **Read SOPs**: [directives/PLANO_PROJECT_OVERSIGHT.md](directives/PLANO_PROJECT_OVERSIGHT.md)
3.  **Read Update Standards**: [directives/PLANO_POST_UPDATE_STANDARD.md](directives/PLANO_POST_UPDATE_STANDARD.md)

### 📋 Checklist for the AI Assistant:
- [ ] I have read `AGENTS.md` and understand the mandatory (Capture -> Update -> Post Update) workflow.
- [ ] I have read the project management oversight directive.
- [ ] I am ready to manage tasks using the Plano MCP tools.

---

## 🔌 Step 3: MCP Tool Integration
If you support **MCP (Model Context Protocol)**, you can manage this project's tasks, milestones, and diagrams directly.

**Installation (Recommended)**
You can run the Plano MCP server directly using `npx`. This is the easiest way to get started.

```json
{
  "mcpServers": {
    "plano": {
      "command": "npx",
      "args": [
        "-y",
        "plano-mcp",
        "--path",
        "{{PROJECT_DIR}}"
      ]
    }
  }
}
```



---

## 🚀 Step 4: Verification
After installation, open the dashboard to ensure everything is running:
- **Local Dashboard**: [http://localhost:5173](http://localhost:5173) (SvelteKit)
- **API Health**: [http://localhost:5000/health](http://localhost:5000/health)

**AI Verification Prompt**:
> "Tell me about the current status of the Plano project and list the 3 most recent updates."
