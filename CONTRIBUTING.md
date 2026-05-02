# Contributing

Thanks for helping improve Unit Agent Starter.

The goal of this project is simplicity. Please keep changes understandable for people who are new to AI-assisted coding.

## Principles

- Keep `simple` mode small and beginner-friendly.
- Do not add files to generated projects unless they solve a clear user problem.
- Prefer plain language first, technical terms in parentheses.
- Protect project memory: agents suggest changes to `PRD.md`, `MEMORY.md`, and `TASKS.md` through `NOTES.md`.
- Do not auto-install community skills without user review.

## Local Development

```bash
npm run check
node ./bin/unit.js --help
node ./bin/unit.js simple
```

Global test:

```bash
npm install -g .
unit --help
```

## Pull Requests

Please include:

- what user problem the change solves;
- what mode it affects: `simple`, `discovery`, or `advanced`;
- how you tested it;
- screenshots or terminal output if UX changes.

## Good First Issues

Useful beginner-friendly improvements:

- clearer question wording;
- better examples in prompts;
- documentation for new users;
- tests for generated file structure;
- translations.
