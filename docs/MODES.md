# Modes

Unit has three modes:

```text
simple
discovery
advanced
```

In the interactive CLI, these modes can be selected by number:

```text
1. Simple
2. Discovery
3. Advanced
```

## Simple

`simple` quickly creates clear project memory for one AI agent.

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

`discovery` helps figure out what should be built.

Use it when:

- the idea is still vague;
- you need to clarify the problem;
- you want to define users and the MVP flow;
- you want the agent to ask better questions.

It still keeps the generated project simple. The goal is not to create more files, but to create better initial context.

Meaning:

```text
discovery
→ understand what we are building
```

## Advanced

`advanced` configures a professional agent-development workflow.

Use it when:

- the project is larger;
- you want to choose a code scaffold;
- you want multiple agent roles;
- you want skills and methodology recommendations;
- you want a stricter development process.

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

- agent orchestration;
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

---

## Russian Version / Русская версия

# Режимы

В Unit есть три режима:

```text
simple
discovery
advanced
```

В интерактивном CLI эти режимы можно выбрать цифрами:

```text
1. Simple
2. Discovery
3. Advanced
```

## Simple

`simple` быстро создаёт понятную память проекта для одного AI-агента.

Используй его, когда:

- нужен минимальный полезный старт;
- уже есть примерное понимание идеи;
- нужно, чтобы агент начал безопасно;
- пока не нужна оркестрация или дополнительная методология.

Создаёт:

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

Смысл:

```text
simple
→ быстро создать понятную память проекта
```

## Discovery

`discovery` помогает понять, что именно нужно построить.

Используй его, когда:

- идея ещё расплывчатая;
- нужно уточнить проблему;
- нужно определить пользователей и MVP-flow;
- хочется, чтобы агент задавал более точные вопросы.

Созданный проект всё равно остаётся простым. Цель — не создать больше файлов, а создать лучший начальный контекст.

Смысл:

```text
discovery
→ понять, что мы строим
```

## Advanced

`advanced` настраивает профессиональный процесс агентной разработки.

Используй его, когда:

- проект крупнее;
- нужно выбрать каркас кода;
- нужны несколько ролей агентов;
- нужны рекомендации по skills и методологии;
- нужен более строгий процесс разработки.

Advanced может настроить:

```text
каркас проекта
режим команды агентов
skills
рекомендацию Superpowers
git
```

## Advanced — это процесс

`advanced` не означает "усложнить проект".

Он означает:

```text
настроить процесс разработки
```

Advanced может включать:

- оркестрацию агентов;
- роли team-lite или team-full;
- выбранные skills;
- внешнюю методологию вроде Superpowers;
- более строгий review и verification workflow.

## Superpowers

Superpowers — внешний фреймворк agentic skills и методология разработки:

```text
https://github.com/obra/superpowers
```

Он может помочь с:

- brainstorming;
- planning;
- TDD;
- code review;
- verification;
- subagent workflows.

Unit не устанавливает Superpowers автоматически.

В `advanced` Unit может добавить Superpowers как рекомендацию в `.skills/README.md`, чтобы владелец проекта сам посмотрел и установил его под своего агента.

## Кратко

```text
simple
→ быстро создать понятную память проекта

discovery
→ понять, что мы строим

advanced
→ настроить процесс разработки: агенты + skills + методология
```
