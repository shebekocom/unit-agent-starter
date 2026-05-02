# Contributing

Thanks for helping improve Unit Agent Starter.

The goal of this project is simplicity. Please keep changes understandable for people who are new to AI-assisted coding.

## Principles

- Keep `simple` mode small and beginner-friendly.
- Do not add files to generated projects unless they solve a clear user problem.
- Prefer plain language first, with technical terms in parentheses when useful.
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

---

## Russian Version / Русская версия

# Как участвовать

Спасибо за помощь в развитии Unit Agent Starter.

Главная цель проекта — простота. Пожалуйста, делай изменения понятными для людей, которые только начинают работать с AI-assisted coding.

## Принципы

- Держать режим `simple` маленьким и понятным для новичков.
- Не добавлять файлы в создаваемые проекты, если они не решают ясную пользовательскую проблему.
- Сначала писать обычным языком, а технические термины добавлять в скобках, когда это помогает.
- Защищать память проекта: агенты предлагают изменения для `PRD.md`, `MEMORY.md` и `TASKS.md` через `NOTES.md`.
- Не устанавливать community skills автоматически без просмотра пользователем.

## Локальная разработка

```bash
npm run check
node ./bin/unit.js --help
node ./bin/unit.js simple
```

Глобальная проверка:

```bash
npm install -g .
unit --help
```

## Pull Requests

Укажи:

- какую пользовательскую проблему решает изменение;
- какой режим затронут: `simple`, `discovery` или `advanced`;
- как ты это проверил;
- скриншоты или вывод терминала, если менялся UX.

## Good First Issues

Хорошие задачи для первого вклада:

- более понятные формулировки вопросов;
- лучшие примеры в prompts;
- документация для новых пользователей;
- тесты структуры создаваемых файлов;
- переводы.
