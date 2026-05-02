# Unit Agent Starter

Simple CLI starter that creates PRD, memory, tasks, notes, and agent instructions for AI-assisted coding projects.

```bash
npm install -g unit-agent-starter
unit simple
```

Use it when you want Codex, Claude, Gemini, or another AI coding agent to understand a project before it starts changing files.

Think of it as a blank starter theme for AI-agent-managed projects: the generated repo starts with the small set of control files an agent needs before implementation begins.

## Documentation

- [User Guide](docs/USER_GUIDE.md): plain-language explanation of generated files and rules.
- [Modes](docs/MODES.md): difference between `simple`, `discovery`, and `advanced`.
- [Discoverability Checklist](docs/DISCOVERABILITY.md): GitHub topics, launch notes, and promotion checklist.

Each document starts in English and includes a Russian translation at the bottom.

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
unit
```

By default, `unit` creates a new folder with the project name:

```text
projects/
  my-new-project/
    AGENTS.md
    PRD.md
    MEMORY.md
    TASKS.md
    NOTES.md
```

The starter package stays in npm's global storage. It is not copied into the generated project.

To create files directly in the current folder:

```bash
unit --here
unit simple --here
unit discovery --here
```

If a target file already exists, Unit asks per file:

```text
1. Append — add generated content to the end
2. Overwrite — replace the file
3. Skip — keep the existing file
```

Press Enter to skip. You can also type `append`, `overwrite`, or `skip`, but numbers are the easiest path. `Append` adds the generated content to the end of the existing file with a separator, so the user can review and merge it manually.

## Modes

```bash
unit simple
unit discovery
unit advanced
```

In the interactive menu, you can choose by number:

```text
1. Simple
2. Discovery
3. Advanced
```

- `simple`: quick start, minimal questions, one agent, no team setup.
- `discovery`: guided product interview first, then project files from the discovered spec.
- `advanced`: scaffold choice, agent-team mode, skills, Superpowers recommendation, and git setup.

Recommended first run:

```bash
unit simple
```

Every fixed-choice question supports numbers such as `1`, `2`, `3`. Every question includes a short hint and example, so the user does not need to understand agent tooling before starting.

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

`NOTES.md` is a temporary inbox for agent output. The agent should not read it at the start of every session unless asked. It writes suggestions there; the human decides what to move into `PRD.md`, `MEMORY.md`, or `TASKS.md`.

You can also paste a large context dump into the agent chat and ask it to sort the material into proposed updates for `PRD.md`, `MEMORY.md`, `TASKS.md`, and `NOTES.md`. The agent recommends changes first; the project owner decides what to merge.

## Agent Profiles

The CLI asks which executor profile to optimize for:

- `codex`: uses `AGENTS.md` as the primary operating contract and adds Codex-oriented notes.
- `claude`: uses `CLAUDE.md` plus Claude Code guardrails.
- `gemini`: creates Gemini-oriented project context under `.gemini/`.
- `other`: creates a universal `AGENTS.md` for OpenCode, Cursor, Windsurf, Aider, Qwen, DeepSeek, MiniMax, or another AI coding tool.

## Skills

The starter can recommend workflow skills without installing them blindly:

- `discovery-interview`: turns a vague project idea into a usable spec.
- `using-superpowers` / Superpowers: structured engineering workflow for brainstorming, planning, TDD, debugging, review, and verification.
- `skill-creator`: creates project-specific skills after the first patterns are clear.

Community skills should be inspected before installation. Unit records recommendations in `.skills/README.md`; the project owner decides what to install.

## Russian Version / Русская версия

# Unit Agent Starter

Простой CLI-стартер, который создаёт PRD, память, задачи, заметки и инструкции для AI-агента в проектах с vibe coding и агентной разработкой.

```bash
npm install -g unit-agent-starter
unit simple
```

Используй его, когда нужно, чтобы Codex, Claude, Gemini или другой AI-агент понял проект до того, как начнёт менять файлы.

Это как пустой starter template для проектов под AI-агента: в новом репозитории сразу появляются базовые управляющие файлы.

## Документация

- [User Guide](docs/USER_GUIDE.md): простое объяснение созданных файлов и правил.
- [Modes](docs/MODES.md): разница между `simple`, `discovery` и `advanced`.
- [Discoverability Checklist](docs/DISCOVERABILITY.md): GitHub topics, запуск и продвижение проекта.

Каждый документ начинается с английской версии, а внизу содержит русский перевод.

## Глобальное использование

Установка из этого репозитория во время разработки:

```bash
npm install -g .
```

После публикации в npm:

```bash
npm install -g unit-agent-starter
```

Запуск из любой папки:

```bash
unit
```

По умолчанию `unit` создаёт новую папку с названием проекта:

```text
projects/
  my-new-project/
    AGENTS.md
    PRD.md
    MEMORY.md
    TASKS.md
    NOTES.md
```

Сам стартер остаётся в глобальном хранилище npm и не копируется в созданный проект.

Чтобы создать файлы прямо в текущей папке:

```bash
unit --here
unit simple --here
unit discovery --here
```

Если файл уже существует, Unit спросит по каждому файлу:

```text
1. Append — дописать новый блок в конец файла
2. Overwrite — перезаписать файл
3. Skip — оставить существующий файл
```

Enter означает `skip`. Можно также написать `append`, `overwrite` или `skip`, но проще выбрать цифру. `Append` дописывает новый блок в конец файла через разделитель, чтобы человек сам посмотрел и объединил нужное.

## Режимы

```bash
unit simple
unit discovery
unit advanced
```

В интерактивном меню можно выбирать цифрами:

```text
1. Simple
2. Discovery
3. Advanced
```

- `simple`: быстрый старт, минимум вопросов, один агент, без команды агентов.
- `discovery`: сначала интервью по продукту, потом генерация файлов проекта.
- `advanced`: выбор каркаса, режим команды агентов, skills, рекомендация Superpowers и настройка git.

Рекомендуемый первый запуск:

```bash
unit simple
```

Во всех вопросах с фиксированным выбором можно нажимать цифры: `1`, `2`, `3`. У каждого вопроса есть короткая подсказка и пример, поэтому человеку не нужно заранее разбираться в агентных инструментах.

## Что создаётся

В режиме `simple`:

- `AGENTS.md`, `CLAUDE.md` или `GEMINI.md` в зависимости от выбранного агента
- `PRD.md`
- `MEMORY.md`
- `TASKS.md`
- `NOTES.md`
- `.skills/README.md`
- `README.md`
- `.env.example`
- `.gitignore`

CLI также спрашивает, нужно ли инициализировать git. Если да, он запускает `git init`, создаёт первый commit и использует ветку `main`.

`NOTES.md` — временный inbox для вывода агента. Агент не должен читать его в начале каждой сессии без просьбы. Он пишет туда предложения, а человек решает, что переносить в `PRD.md`, `MEMORY.md` или `TASKS.md`.

Также можно вставить большой набор материалов прямо в чат агента и попросить разложить информацию по предложениям для `PRD.md`, `MEMORY.md`, `TASKS.md` и `NOTES.md`. Агент сначала рекомендует изменения, а владелец проекта решает, что переносить.

## Профили агентов

CLI спрашивает, под какого исполнителя оптимизировать проект:

- `codex`: использует `AGENTS.md` как главный рабочий контракт и добавляет заметки под Codex.
- `claude`: использует `CLAUDE.md` и ограничения под Claude Code.
- `gemini`: создаёт контекст проекта под Gemini в `.gemini/`.
- `other`: создаёт универсальный `AGENTS.md` для OpenCode, Cursor, Windsurf, Aider, Qwen, DeepSeek, MiniMax или другого AI-инструмента.

## Skills

Стартер может рекомендовать workflow skills, но не устанавливает их вслепую:

- `discovery-interview`: превращает смутную идею проекта в понятное ТЗ.
- `using-superpowers` / Superpowers: структурированный процесс разработки для brainstorming, planning, TDD, debugging, review и verification.
- `skill-creator`: помогает создать проектные skills после того, как первые паттерны стали понятны.

Community skills нужно просматривать перед установкой. Unit записывает рекомендации в `.skills/README.md`, а владелец проекта сам решает, что устанавливать.
