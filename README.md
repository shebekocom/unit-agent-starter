# Unit Agent Starter

`unit-agent-starter` creates a new project folder with agent instructions, project memory, PRD, task tracking, guardrails, and first-session rituals.

Think of it as a blank starter theme for AI-agent-managed projects: the generated repo starts with the control files an agent needs before real implementation begins.

For a plain-language explanation of the generated files and rules, read [docs/USER_GUIDE.md](docs/USER_GUIDE.md).

## Local Use

```bash
npm start
```

## Global Use

Install from this repository during development:

```bash
npm install -g .
```

After publishing to npm:

```bash
npm install -g unit-agent-starter
```

Then run from any folder:

```bash
cd C:\server\projects
unit
```

The starter package stays in npm's global storage. The generated project is created inside the folder where `unit` is executed:

```text
C:\server\projects\
  my-new-project\
    AGENTS.md
    PRD.md
    MEMORY.md
    TASKS.md
    NOTES.md
```

The starter does not copy itself into the generated project.

By default, `unit` creates a new folder with the project name. To create files directly in the current folder, use:

```bash
unit simple --here
unit discovery --here
```

`--here` does not overwrite existing generated files silently. If `PRD.md`, `MEMORY.md`, `TASKS.md`, or another target file already exists, Unit asks what to do.
When a target file already exists, Unit asks per file:

```text
append / overwrite / skip
```

Press Enter to skip. `append` adds the generated content to the end of the existing file with a separator, so the user can review and merge it manually.

Explicit modes:

```bash
unit simple
unit discovery
unit advanced
unit simple --here

npm run start:simple
npm run start:discovery
npm run start:advanced
```

Or:

```bash
npm start -- --mode simple
npm start -- --mode discovery
npm start -- --mode advanced
```

The CLI asks for a start mode:

- Быстрый старт (`simple`): default path for most people. Minimal questions, one agent, no team files.
- Сначала разобраться (`discovery`): guided product interview first, then generates project files from the discovered spec.
- Расширенные настройки (`advanced`): choose scaffold, agent-team mode, skills, and extra setup.

Recommended first run:

```text
simple
```

It creates a small, readable project context so any agent can understand what the project is, what is protected, and what to do first.

Every question includes a short hint and example, so the user does not need to understand agent tooling before starting.

The starter can also capture references:

- current site or project URL
- competitor/example URL
- what should be similar: structure, flow, form, cabinet, style, content model

References are written into PRD and MEMORY as context for the agent. They are treated as inspiration, not as permission to copy protected text, branding, or design 1:1.

In `advanced` mode it also asks for a project scaffold preset:

- `auto`: infer from stack and discovery answers.
- `agent-only`: only agent instructions and project-control files.
- `node-cli`: minimal Node CLI source tree.
- `webapp`: minimal web app source tree.
- `python-app`: minimal Python app source tree.

In `advanced` mode it can also ask how agent work should be organized:

- `solo`: one agent owns the project flow. No team files are generated.
- `team-lite`: orchestrator + implementer + reviewer files are generated.
- `team-full`: discovery + architect + implementer + QA + reviewer + research files are generated.

Use `solo` for small or unclear projects. Use team modes only when the project is large enough to benefit from delegation. `simple` and `discovery` always use `solo`.

After publishing or linking:

```bash
npx unit-agent-starter
unit
unit simple
unit discovery
unit advanced
unit --mode simple
unit --mode discovery
unit --mode advanced
```

## What It Creates

In `simple` mode:

- `AGENTS.md`, `CLAUDE.md`, or `GEMINI.md` depending on selected agent
- `PRD.md`
- `MEMORY.md`
- `TASKS.md`
- `NOTES.md`
- `.skills/README.md`
- `README.md`
- `.env.example`
- `.gitignore`

The CLI also asks whether to initialize git. If enabled, it runs `git init`, creates the first commit, and uses `main` as the branch.

In `discovery` and `advanced` modes it can create the fuller project-control set:

- `CLAUDE.md`, `AGENTS.md`, `MEMORY.md`, `TODO.md`
- `.claude/settings.json` for Claude Code projects
- `.codex/AGENTS.md` for Codex-oriented projects
- `.gemini/GEMINI.md` for Gemini-oriented projects
- `.evals/contract.md`
- `.staging/notes.md`
- `.logs/journal.md`
- `.context/init.md`
- `docs/PRD.md`
- `docs/DISCOVERY.md` when using discovery mode
- `docs/HOW_TO_MANAGE.md`
- `.env.example`
- `.gitignore`
- optional starter source files based on the selected preset
- optional `TEAM.md`, `.agents/roles/*`, and `.claude/agents/*` files when a team mode is selected

## Agent Profiles

The CLI asks which executor profile to optimize for:

- `codex`: uses `AGENTS.md` as the primary operating contract and adds Codex-oriented notes.
- `claude`: uses `CLAUDE.md` plus `.claude/settings.json` guardrails.
- `gemini`: creates Gemini-oriented project context under `.gemini/`.
- `multi`: creates all profiles and marks ownership boundaries explicitly.

## Safety Defaults

Community skills are not downloaded automatically. The generated management guide keeps the rule that community skill contents must be inspected before installation.

## Discovery Mode

Discovery mode is based on the `discovery-interview` pattern: start from the problem and users, then clarify current workflow, target outcomes, first MVP flow, data/API needs, technical constraints, infrastructure, risks, and agent profile.

The starter uses the answers to prefill:

- PRD problem, solution, integrations, MVP criteria
- MEMORY status, decisions, and constraints
- TODO first implementation step
- AGENTS/CLAUDE/GEMINI operating contracts
- recommended skills, including `discovery-interview` when relevant

## Skill Boosters

The starter can recommend workflow skills without installing them blindly:

- `discovery-interview`: turns a vague project idea into a usable spec.
- `using-superpowers` / Superpowers: structured engineering workflow for brainstorming, planning, TDD, debugging, review, and verification.
- `skill-creator`: creates project-specific skills after the first patterns are clear.

Community skills should be inspected before installation. The starter records recommendations in `.skills/README.md`; the project owner decides what to install.
