# Unit Agent Starter — User Guide

Unit creates a small project folder so an AI agent can immediately understand:

- what is being built;
- what must be remembered;
- which task comes first;
- where to write results;
- which files must not be changed without explicit permission.

## How To Use

Install the starter globally:

```bash
npm install -g unit-agent-starter
```

Create a new project in a new folder:

```bash
unit simple
```

Create files directly in the current folder:

```bash
unit simple --here
```

If a target file already exists, Unit asks:

```text
1. Append — add generated content to the end
2. Overwrite — replace the file
3. Skip — keep the existing file
```

- `append`: add the generated block to the end of the file.
- `overwrite`: replace the file.
- `skip`: keep the existing file unchanged.

Enter means `skip`. You can choose by number, so pressing `1`, `2`, or `3` is enough. This protects `MEMORY.md`, `TASKS.md`, and `PRD.md` from accidental overwrites.

If you do not know what to choose, run:

```bash
unit
```

and press Enter for the quick start.

For menu questions, you can choose by number. For example:

```text
1. Simple
2. Discovery
3. Advanced
```

You can press `1`, `2`, or `3` instead of typing the full word.

## What Gets Created

In `simple` mode:

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

## Main Idea

There are files for the human and files for the agent.

The human manages the project:

- changes the goal;
- makes decisions;
- updates memory;
- moves tasks.

The agent does the work:

- reads instructions;
- writes code;
- asks questions;
- writes results and proposals to `NOTES.md`.

## AGENTS.md / CLAUDE.md / GEMINI.md

This is the main instruction file for the agent.

The exact file depends on the selected assistant:

- `AGENTS.md`: Codex or a universal agent.
- `CLAUDE.md`: Claude.
- `GEMINI.md`: Gemini.

It explains:

- which files to read at the start;
- what the agent may change;
- what the agent must not change without a human command;
- where the agent should write session notes.

Main rule:

```text
The agent does not change PRD.md, MEMORY.md, or TASKS.md without an explicit human command.
```

## PRD.md

`PRD.md` answers:

```text
What are we building?
```

It stores:

- project description;
- target users;
- first useful result;
- references;
- stack;
- integrations;
- done criteria.

Who edits it:

```text
Human.
```

The agent may suggest changes, but it writes them to `NOTES.md`. The human decides what to move into `PRD.md`.

## MEMORY.md

`MEMORY.md` answers:

```text
What must be remembered between sessions?
```

It stores:

- important decisions;
- constraints;
- what worked;
- what did not work;
- questions that must not be forgotten.

Generated `MEMORY.md` uses this structure:

```text
## Status [max 10 lines — remove old items]
Current state and the next visible step.

## Infrastructure
Local path, deploy target, ports, services, credentials location, and critical runtime notes.

## Decisions [max 10 lines — final decisions only]
Architecture and product decisions that should survive between sessions.

## Never [max 10 lines — permanent rules]
Things the agent must not do.

## Snapshot when
When to copy memory into an archive or context snapshot.

## Updated
Last meaningful manual update.
```

Who edits it:

```text
Human.
```

Why the agent does not write here directly:

- memory must stay short;
- the agent can be wrong;
- the human decides what is important enough to save.

The agent writes memory proposals to `NOTES.md`. The human decides what to move into `MEMORY.md`.

## TASKS.md

`TASKS.md` answers:

```text
What should be done?
```

It contains:

- `In progress`: the first task for the agent;
- `Next`: upcoming tasks;
- `Backlog`: ideas and later work;
- `Done`: completed tasks.

Generated `TASKS.md` uses this structure:

```text
## In progress
- [ ] **Task title** — short action
      agent: codex / claude / gemini / other
      done when: concrete check

## Next
- [ ] Upcoming task

## Backlog
- [ ] Later idea

## Done
- [x] Completed task
```

Who edits it:

```text
Human.
```

Why the agent does not move tasks by itself:

- the human owns priorities;
- the agent may call something done too early;
- the result should be accepted manually.

The agent takes the first item from `In progress`. It proposes new tasks through `NOTES.md`. The human decides what to add to `TASKS.md`.

## NOTES.md

`NOTES.md` is a temporary inbox for the agent, not long-term project memory.

The agent writes:

- what it completed;
- what should be checked;
- what questions remain;
- what should be moved to `PRD.md`;
- what should be moved to `MEMORY.md`;
- what should be added to `TASKS.md`.

Generated `NOTES.md` includes this structure:

```text
# Rule: only append lines at the bottom
# Format: [date] [model] [type] text
# Types: done / lesson / decision / question
# The project owner clears the file after merging important notes into MEMORY.md, TASKS.md, or PRD.md.
```

Who edits it:

```text
Agent and human.
```

The agent does not read `NOTES.md` at the start of every session unless the human asks. For context, it reads `PRD.md`, `MEMORY.md`, and `TASKS.md`.

After the agent works, the human reads `NOTES.md`, moves important information into the right files, and removes outdated notes. This prevents `NOTES.md` from growing forever and keeps prompt context small.

## Importing A Large Context Dump

You can send the agent many project materials at once: old specs, links, competitor notes, screenshots described in text, API notes, meeting notes, marketing notes, or rough ideas.

Useful materials to paste:

- current website, competitor, reference, GitHub, or API documentation links;
- old specs, client messages, notes, requirements, feature lists;
- target audience, offer, marketing, funnel, positioning, copy ideas;
- stack, server, access, deadline, budget, and legal constraints;
- file snippets or existing project notes that should not be lost.

Use this prompt:

```text
Analyze the context below.
Do not edit PRD.md, MEMORY.md, or TASKS.md directly.
Sort the information into:
- proposed additions to PRD.md
- proposed additions to MEMORY.md
- proposed additions to TASKS.md
- questions or conflicts to leave in NOTES.md

[paste project materials here]
```

The agent should not silently rewrite protected files. It should produce recommendations first. The human then decides what to move into `PRD.md`, `MEMORY.md`, and `TASKS.md`.

## .skills/README.md

`.skills/README.md` explains which extra skills may be useful for the agent.

Skills are not downloaded automatically.

Why:

- community skills may contain unexpected instructions;
- the human should inspect the source first;
- the project should not become complex without a reason.

Typical recommendations:

- `discovery-interview`;
- `skill-creator`;
- `frontend-design`;
- `webapp-testing`;
- `using-superpowers`.

## Where Restrictions Are Written

Restrictions are written in two places.

First place: the main agent file:

```text
AGENTS.md / CLAUDE.md / GEMINI.md
```

It has a section like:

```text
Do not change without an explicit human command
```

Second place: the header of each protected file:

```text
PRD.md
MEMORY.md
TASKS.md
```

For example, `MEMORY.md` says:

```text
Who edits this file: human.
The agent does NOT change this file directly.
The agent writes memory proposals to NOTES.md.
```

## First Prompt For The Agent

After creating the project, send this to the agent:

```text
Read AGENTS.md, PRD.md, MEMORY.md, and TASKS.md.
Confirm what we are building, what must be remembered, and which task you will take first.
Do not read NOTES.md at the start of the session unless I ask.
After the work, write results and proposals to NOTES.md.
```

If you selected Claude, use `CLAUDE.md` instead of `AGENTS.md`.

If you selected Gemini, use `GEMINI.md` instead of `AGENTS.md`.

## Ending A Session

After the agent replies:

1. Open `NOTES.md`.
2. Move important decisions to `MEMORY.md`.
3. Move new or changed tasks to `TASKS.md`.
4. If the product goal changed, update `PRD.md`.
5. Remove outdated notes from `NOTES.md` after they are moved.
6. If git is enabled, commit the result.

## Why It Stays Simple

Unit is not trying to be a large agent framework.

It creates the smallest useful set of files:

- so the agent understands the project;
- so the human owns decisions;
- so project memory is not lost;
- so work can continue in another AI agent.

Main principle:

```text
The agent works. The human manages memory and tasks.
```

## Discovery And Advanced

For mode details, see [MODES.md](MODES.md).

`discovery` is useful when the idea is still unclear. It helps collect the initial understanding of the project and prepares the agent for better follow-up questions.

`advanced` is useful when you want to choose the development process:

- create a code scaffold;
- choose agent work mode;
- add skill recommendations;
- include a methodology such as Superpowers;
- configure git.

Advanced does not have to be complicated. Its purpose is to give experienced users more control.

## Superpowers

Superpowers is an external project and agentic development methodology:

```text
https://github.com/obra/superpowers
```

Unit can add Superpowers as a recommendation, but it does not install it automatically.

Use Superpowers when the project is serious enough to need:

- brainstorming;
- planning;
- TDD;
- code review;
- verification;
- subagent workflows.

For a simple start, Superpowers is not required. `PRD.md`, `MEMORY.md`, `TASKS.md`, and `NOTES.md` are enough.

---

## Russian Version / Русская версия

# Unit Agent Starter — руководство пользователя

Unit создаёт небольшую папку проекта, чтобы AI-агент сразу понял:

- что строим;
- что важно помнить;
- какую задачу делать первой;
- куда писать итоги;
- какие файлы нельзя менять без явного разрешения.

## Как пользоваться

Установи стартер глобально:

```bash
npm install -g unit-agent-starter
```

Создать новый проект в новой папке:

```bash
unit simple
```

Создать файлы прямо в текущей папке:

```bash
unit simple --here
```

Если файл уже существует, Unit спросит:

```text
1. Append — дописать новый блок в конец файла
2. Overwrite — перезаписать файл
3. Skip — оставить существующий файл
```

- `append`: дописать новый блок в конец файла.
- `overwrite`: перезаписать файл.
- `skip`: оставить существующий файл без изменений.

Enter означает `skip`. Можно выбрать цифрой: достаточно нажать `1`, `2` или `3`. Это защищает `MEMORY.md`, `TASKS.md` и `PRD.md` от случайной перезаписи.

Если не знаешь, что выбрать, запускай:

```bash
unit
```

и нажимай Enter для быстрого старта.

В вопросах с меню можно выбирать цифрами. Например:

```text
1. Simple
2. Discovery
3. Advanced
```

Можно нажать `1`, `2` или `3`, не вводя слово целиком.

## Что создаётся

В режиме `simple`:

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

## Главная идея

Есть файлы для человека и файлы для агента.

Человек управляет проектом:

- меняет цель;
- принимает решения;
- обновляет память;
- двигает задачи.

Агент выполняет работу:

- читает инструкции;
- пишет код;
- задаёт вопросы;
- пишет итоги и предложения в `NOTES.md`.

## AGENTS.md / CLAUDE.md / GEMINI.md

Это главный файл инструкций для агента.

Какой файл создаётся, зависит от выбранного помощника:

- `AGENTS.md`: Codex или универсальный агент.
- `CLAUDE.md`: Claude.
- `GEMINI.md`: Gemini.

В этом файле написано:

- какие файлы читать в начале;
- что можно менять;
- что нельзя менять без команды человека;
- куда агент должен писать итоги.

Главное правило:

```text
Агент не меняет PRD.md, MEMORY.md и TASKS.md без явной команды человека.
```

## PRD.md

`PRD.md` отвечает на вопрос:

```text
Что мы строим?
```

В нём хранится:

- описание проекта;
- для кого проект;
- первый полезный результат;
- референсы;
- стек;
- интеграции;
- критерии готовности.

Кто редактирует:

```text
Человек.
```

Агент может предложить изменения, но пишет их в `NOTES.md`. Человек решает, что переносить в `PRD.md`.

## MEMORY.md

`MEMORY.md` отвечает на вопрос:

```text
Что важно помнить между сессиями?
```

В нём хранится:

- важные решения;
- ограничения;
- что сработало;
- что не сработало;
- вопросы, которые нельзя забыть.

Созданный `MEMORY.md` использует такую структуру:

```text
## Статус [макс 10 строк — старое удалять]
Текущее состояние и следующий видимый шаг.

## Инфраструктура
Локальный путь, деплой, порты, сервисы, где лежат доступы, важные runtime-заметки.

## Решения [макс 10 строк — только финальные]
Архитектурные и продуктовые решения, которые нужно помнить между сессиями.

## Нельзя [макс 10 строк — правила навсегда]
Что агенту запрещено делать.

## Снапшот делать когда
Когда копировать память в архив или context snapshot.

## Обновлено
Последнее важное ручное обновление.
```

Кто редактирует:

```text
Человек.
```

Почему агент не пишет сюда сам:

- память должна быть короткой;
- агент может ошибиться;
- человек решает, что действительно важно сохранить.

Агент пишет предложения для памяти в `NOTES.md`. Человек решает, что переносить в `MEMORY.md`.

## TASKS.md

`TASKS.md` отвечает на вопрос:

```text
Что делать?
```

В нём есть:

- `В работе`: первая задача для агента;
- `Следующее`: следующие задачи;
- `Бэклог`: идеи и задачи на потом;
- `Выполнено`: выполненные задачи.

Созданный `TASKS.md` использует такую структуру:

```text
## В работе
- [ ] **Название задачи** — короткое действие
      агент: codex / claude / gemini / other
      готово когда: конкретная проверка

## Следующее
- [ ] Следующая задача

## Бэклог
- [ ] Идея на потом

## Выполнено
- [x] Выполненная задача
```

Кто редактирует:

```text
Человек.
```

Почему агент не двигает задачи сам:

- человек управляет приоритетами;
- агент может считать задачу готовой слишком рано;
- важно вручную принять результат.

Агент берёт первый пункт из `В работе`. Новые задачи он предлагает через `NOTES.md`. Человек решает, что добавлять в `TASKS.md`.

## NOTES.md

`NOTES.md` — это временный inbox агента, а не долгая память проекта.

Сюда агент пишет:

- что сделал;
- что проверить;
- какие вопросы остались;
- что предложить перенести в `PRD.md`;
- что предложить перенести в `MEMORY.md`;
- что предложить добавить в `TASKS.md`.

В созданном `NOTES.md` есть такая структура:

```text
# Правило: только добавлять строки снизу
# Формат: [дата] [модель] [тип] текст
# Типы: done / lesson / decision / question
# Владелец проекта очищает файл после переноса важного в MEMORY.md, TASKS.md или PRD.md.
```

Кто редактирует:

```text
Агент и человек.
```

Агент не читает `NOTES.md` в начале каждой сессии, если человек не попросил. Для контекста он читает `PRD.md`, `MEMORY.md` и `TASKS.md`.

После работы агента человек читает `NOTES.md`, переносит важное в нужные файлы и очищает устаревшие записи. Это защищает проект от разрастания `NOTES.md` и лишнего контекста в prompt.

## Импорт большого контекста

Можно отправить агенту много материалов проекта одним сообщением: старые ТЗ, ссылки, заметки по конкурентам, текстовое описание скриншотов, заметки по API, маркетинг, итоги созвонов или сырые идеи.

Что полезно вставлять:

- ссылки на текущий сайт, конкурентов, референсы, GitHub или документацию API;
- старые ТЗ, сообщения клиентов, заметки, требования, список фич;
- аудиторию, оффер, маркетинг, воронку, позиционирование, идеи текстов;
- стек, сервер, доступы, сроки, бюджет и юридические ограничения;
- фрагменты файлов или старые заметки проекта, которые нельзя потерять.

Используй такой prompt:

```text
Разбери контекст ниже.
Не меняй PRD.md, MEMORY.md и TASKS.md напрямую.
Разложи информацию по разделам:
- что предложить добавить в PRD.md
- что предложить добавить в MEMORY.md
- что предложить добавить в TASKS.md
- какие вопросы или конфликты оставить в NOTES.md

[вставь материалы проекта сюда]
```

Агент не должен молча переписывать защищённые файлы. Сначала он даёт рекомендации. Потом человек сам решает, что переносить в `PRD.md`, `MEMORY.md` и `TASKS.md`.

## .skills/README.md

`.skills/README.md` объясняет, какие дополнительные навыки можно добавить агенту.

Skills не скачиваются автоматически.

Почему:

- community skills могут содержать неожиданные инструкции;
- человек должен сначала посмотреть источник;
- проект не должен усложняться без необходимости.

Обычно там будут рекомендации:

- `discovery-interview`;
- `skill-creator`;
- `frontend-design`;
- `webapp-testing`;
- `using-superpowers`.

## Где прописаны ограничения

Ограничения прописаны в двух местах.

Первое место — главный файл агента:

```text
AGENTS.md / CLAUDE.md / GEMINI.md
```

Там есть раздел вроде:

```text
Что нельзя менять без явной команды человека
```

Второе место — шапка каждого защищённого файла:

```text
PRD.md
MEMORY.md
TASKS.md
```

Например, в `MEMORY.md` написано:

```text
Кто редактирует: человек.
Агент НЕ меняет этот файл напрямую.
Агент пишет предложения для памяти в NOTES.md.
```

## Первый промпт агенту

После создания проекта отправь агенту:

```text
Прочитай AGENTS.md, PRD.md, MEMORY.md и TASKS.md.
Подтверди: что строим, что важно помнить, и какую задачу берёшь первой.
Не читай NOTES.md в начале сессии, если я не попрошу.
После работы записывай итоги и предложения в NOTES.md.
```

Если выбран Claude, вместо `AGENTS.md` будет `CLAUDE.md`.

Если выбран Gemini, вместо `AGENTS.md` будет `GEMINI.md`.

## Как заканчивать сессию

После ответа агента:

1. Открой `NOTES.md`.
2. Перенеси важные решения в `MEMORY.md`.
3. Перенеси новые или изменённые задачи в `TASKS.md`.
4. Если изменилась цель продукта — обнови `PRD.md`.
5. Очисти устаревшие заметки в `NOTES.md`, если они уже перенесены.
6. Если включён git — сделай commit.

## Почему так просто

Unit не пытается быть большим агентным фреймворком.

Он создаёт минимальный набор файлов:

- чтобы агент понял проект;
- чтобы человек управлял решениями;
- чтобы память проекта не терялась;
- чтобы можно было продолжать работу в другом AI-агенте.

Главный принцип:

```text
Агент работает. Человек управляет памятью и задачами.
```

## Discovery и Advanced

Подробнее о режимах см. [MODES.md](MODES.md).

`discovery` нужен, когда идея ещё неясная. Он помогает собрать начальное понимание проекта и подготовить агента к уточняющим вопросам.

`advanced` нужен, когда ты уже хочешь выбрать процесс разработки:

- создать каркас проекта;
- выбрать режим работы агентов;
- добавить рекомендации по skills;
- включить методологию вроде Superpowers;
- настроить git.

Advanced не обязан быть сложным. Его смысл — дать опытному пользователю больше контроля.

## Superpowers

Superpowers — внешний проект и методология агентной разработки:

```text
https://github.com/obra/superpowers
```

Unit может добавить Superpowers в рекомендации, но не устанавливает его автоматически.

Используй Superpowers, когда проект уже достаточно серьёзный и тебе нужны:

- brainstorming;
- planning;
- TDD;
- code review;
- verification;
- работа с несколькими агентами.

Для простого старта Superpowers не нужен. Сначала достаточно `PRD.md`, `MEMORY.md`, `TASKS.md` и `NOTES.md`.
