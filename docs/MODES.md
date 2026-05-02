# Modes

Unit has three modes:

```text
simple
discovery
advanced
```

## Simple

`simple` is for quickly creating a clear project memory for one AI agent.

Use it when:

- you want the smallest useful setup;
- you already have a rough idea;
- you want the agent to start safely;
- you do not need orchestration or extra methodology yet.

Creates:

```text
AGENTS.md / CLAUDE.md / GEMINI.md
PRD.md
MEMORY.md
TASKS.md
NOTES.md
.skills/README.md
README.md
.env.example
.gitignore
```

Meaning:

```text
simple
→ quickly create understandable project memory
```

## Discovery

`discovery` is for figuring out what should be built.

Use it when:

- the idea is still vague;
- you need to clarify the problem;
- you want to define users and MVP flow;
- you want the agent to ask better questions.

It still keeps the generated project simple. The goal is not to create more files, but to create better initial context.

Meaning:

```text
discovery
→ understand what we are building
```

## Advanced

`advanced` is for professional agent-development workflow setup.

Use it when:

- the project is larger;
- you want to choose a code scaffold;
- you want multiple agent roles;
- you want skills and methodology recommendations;
- you want stricter development process.

Advanced can configure:

```text
project scaffold
agent team mode
skills
Superpowers recommendation
git
```

## Advanced Means Process

`advanced` does not mean "make the project complicated".

It means:

```text
configure the development process
```

Advanced can include:

- orchestration of agents;
- team-lite or team-full roles;
- selected skills;
- external methodology such as Superpowers;
- stricter review and verification workflow.

## Superpowers

Superpowers is an external agentic skills framework and software development methodology:

```text
https://github.com/obra/superpowers
```

It can help with:

- brainstorming;
- planning;
- TDD;
- code review;
- verification;
- subagent workflows.

Unit does not install Superpowers automatically.

In `advanced`, Unit can add Superpowers as a recommendation in `.skills/README.md` so the project owner can review and install it manually for their agent.

## Summary

```text
simple
→ quickly create understandable project memory

discovery
→ understand what we are building

advanced
→ configure development process: agents + skills + methodology
```
