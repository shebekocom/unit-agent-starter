#!/usr/bin/env node

import fs from "node:fs/promises";
import { readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const AGENT_PROFILES = new Set(["codex", "claude", "gemini", "other", "multi"]);
const STARTER_MODES = new Set(["simple", "discovery", "advanced"]);
const STARTER_PRESETS = new Set(["auto", "agent-only", "node-cli", "webapp", "python-app"]);
const COLLABORATION_MODES = new Set(["solo", "team-lite", "team-full"]);

const OFFICIAL_SKILLS = [
  ["frontend-design", "Production UI, typography, design systems"],
  ["pdf", "Read, extract, fill, and combine PDF files"],
  ["docx", "Create and edit Word documents"],
  ["pptx", "Create PowerPoint presentations"],
  ["xlsx", "Work with Excel spreadsheets"],
  ["webapp-testing", "Test web applications with Playwright"],
  ["skill-creator", "Create new SKILL.md files"]
];

const STACK_IGNORES = {
  node: ["node_modules/", ".next/", "dist/", "coverage/"],
  next: ["node_modules/", ".next/", "out/", "coverage/"],
  react: ["node_modules/", "dist/", "coverage/"],
  python: [".venv/", "__pycache__/", "*.pyc", ".pytest_cache/"],
  django: [".venv/", "__pycache__/", "*.pyc", ".pytest_cache/", "staticfiles/"],
  docker: [".env", "docker-compose.override.yml"],
  default: ["node_modules/", ".venv/", "dist/", "coverage/"]
};

function today() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function slugify(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9а-яё-]+/giu, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function lines(value) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function inferStackKey(stack) {
  const normalized = stack.toLowerCase();
  if (normalized.includes("next")) return "next";
  if (normalized.includes("react")) return "react";
  if (normalized.includes("django")) return "django";
  if (normalized.includes("python")) return "python";
  if (normalized.includes("docker")) return "docker";
  if (normalized.includes("node") || normalized.includes("npm")) return "node";
  return "default";
}

function lintCommand(stack) {
  const normalized = stack.toLowerCase();
  if (normalized.includes("python") || normalized.includes("django")) return "ruff check .";
  if (normalized.includes("next") || normalized.includes("react") || normalized.includes("node")) return "npm run lint";
  return "задать после выбора стека";
}

function testCommand(stack) {
  const normalized = stack.toLowerCase();
  if (normalized.includes("python") || normalized.includes("django")) return "pytest";
  if (normalized.includes("next") || normalized.includes("react") || normalized.includes("node")) return "npm test";
  return "задать после выбора стека";
}

function suggestSkills(stack, apis) {
  const normalized = `${stack} ${apis}`.toLowerCase();
  const skills = new Set(["skill-creator"]);
  if (normalized.match(/next|react|frontend|ui|web/)) {
    skills.add("frontend-design");
    skills.add("webapp-testing");
  }
  if (normalized.match(/pdf|document|документ/)) skills.add("pdf");
  if (normalized.match(/word|docx/)) skills.add("docx");
  if (normalized.match(/excel|xlsx|таблиц/)) skills.add("xlsx");
  if (normalized.match(/presentation|pptx|презентац/)) skills.add("pptx");
  return [...skills];
}

function skillListMarkdown(skills) {
  if (!skills.length) return "Пока не установлены.";
  return skills.map((skill) => `- ${skill}`).join("\n");
}

function superpowersRecommendationBlock(skills) {
  if (!skills.includes("using-superpowers")) return "";

  return `
## Superpowers

Superpowers is an external agentic skills framework and software development methodology.

Source:
https://github.com/obra/superpowers

Use when:
- the project is bigger than a quick one-file task;
- you want structured brainstorming, planning, TDD, review, and verification;
- you are ready to follow a stricter development workflow.

Unit does not install Superpowers automatically.
Install it manually for your agent after reviewing the source and installation instructions.
`;
}

function codeFolders(stack) {
  const normalized = stack.toLowerCase();
  if (normalized.includes("next") || normalized.includes("react")) return "app/ · src/ · components/ · lib/ · tests/";
  if (normalized.includes("python") || normalized.includes("django")) return "src/ · tests/ · scripts/";
  return "src/ · tests/ · scripts/";
}

function moduleStructure(stack) {
  const normalized = stack.toLowerCase();
  if (normalized.includes("next")) {
    return "app/ — маршруты и страницы\ncomponents/ — UI\nlib/ — доменная логика\ntests/ — тесты";
  }
  if (normalized.includes("react")) {
    return "src/ — приложение\nsrc/components/ — UI\nsrc/lib/ — логика\ntests/ — тесты";
  }
  if (normalized.includes("python") || normalized.includes("django")) {
    return "src/ — код приложения\ntests/ — тесты\nscripts/ — служебные скрипты";
  }
  return "src/ — код\ntests/ — тесты\nscripts/ — служебные скрипты";
}

function envExample(apis) {
  const names = lines(apis);
  if (!names.length || apis.trim().toLowerCase() === "нет") {
    return "# Add real values in .env\n";
  }
  return names
    .map((name) => {
      const key = name
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, "_")
        .replace(/^_|_$/g, "");
      return `# ${name} - add real value in .env\n${key}_API_KEY=`;
    })
    .join("\n\n") + "\n";
}

function splitList(value) {
  return value
    .split(/[,;\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function markdownBullets(value, fallback) {
  const items = splitList(value);
  if (!items.length) return fallback;
  return items.map((item) => `- ${item}`).join("\n");
}

function integrationsTable(value) {
  const items = splitList(value);
  if (!items.length || value.trim().toLowerCase() === "нет") return "| Нет | - | - | - |";
  return items.map((api) => `| ${api} | TBD | TBD | TBD |`).join("\n");
}

function referenceBlock(references) {
  if (!references) return "";
  const hasAny = [references.ownSite, references.exampleSite, references.referenceGoal]
    .some((value) => value && value.trim() && value.trim().toLowerCase() !== "нет");
  if (!hasAny) return "";

  return `\n## Референсы\n| Тип | Ссылка / описание |\n|-----|-------------------|\n| Свой сайт / текущий проект | ${references.ownSite || "нет"} |\n| Пример / конкурент | ${references.exampleSite || "нет"} |\n| Что взять из референса | ${references.referenceGoal || "уточнить"} |\n\nВажно: использовать референсы как ориентир по структуре, UX и функциям. Не копировать чужой текст, бренд, дизайн 1-в-1 или защищённые материалы.\n`;
}

function inlineReferenceBlock(references) {
  const block = referenceBlock(references).trim();
  return block ? `\n${block}` : "";
}

function referenceMemoryLine(references) {
  if (!references) return "";
  const parts = [];
  if (references.ownSite && references.ownSite.toLowerCase() !== "нет") parts.push(`свой сайт: ${references.ownSite}`);
  if (references.exampleSite && references.exampleSite.toLowerCase() !== "нет") parts.push(`референс: ${references.exampleSite}`);
  if (references.referenceGoal && references.referenceGoal.toLowerCase() !== "нет") parts.push(`ориентир: ${references.referenceGoal}`);
  return parts.length ? `- Референсы: ${parts.join("; ")}` : "";
}

function agentPrimaryFile(profile) {
  if (profile === "claude") return "CLAUDE.md";
  if (profile === "gemini") return ".gemini/GEMINI.md";
  if (profile === "codex") return "AGENTS.md";
  if (profile === "other") return "AGENTS.md";
  return "AGENTS.md + CLAUDE.md + .gemini/GEMINI.md";
}

function simpleAgentFileName(profile) {
  if (profile === "claude") return "CLAUDE.md";
  if (profile === "gemini") return "GEMINI.md";
  return "AGENTS.md";
}

function officialSkillCatalog() {
  return OFFICIAL_SKILLS.map(([name, description]) => `- ${name}: ${description}`).join("\n");
}

function renderSimpleFiles(answers) {
  const {
    projectName,
    description,
    stack,
    infra,
    critical,
    apis,
    mvpDeadline,
    agentProfile,
    selectedSkills
  } = answers;

  const agentFileName = simpleAgentFileName(agentProfile);
  const date = today();
  const protectedFiles = "PRD.md, MEMORY.md, TASKS.md, README.md, .env";
  const otherAgentNote = agentProfile === "other"
    ? `\n## Универсальный профиль\nЭтот проект подготовлен для другого AI-помощника или IDE.\n\nПодходит для OpenCode, Cursor, Windsurf, Aider, Qwen, DeepSeek, MiniMax и других инструментов, которые читают AGENTS.md или позволяют вставить инструкции вручную.\n`
    : "";
  const agentInstructions = `# ${agentFileName} — ${projectName}

Этот файл — инструкция для AI-агента в этом проекте.
${otherAgentNote}

## Что читать в начале
1. PRD.md — что строим и для кого
2. MEMORY.md — что важно помнить между сессиями
3. TASKS.md — какую задачу делать сейчас

Не читай NOTES.md в начале сессии, если человек не попросил. NOTES.md — временный inbox для итогов после работы.

## Что можно менять
- код проекта
- NOTES.md
- новые файлы, нужные для задачи

## Что нельзя менять без явной команды человека
- ${protectedFiles}
- .skills/*

## Как работать
1. Возьми первую задачу из TASKS.md в разделе "Сейчас"
2. Сделай только эту задачу
3. Если не хватает данных — задай вопрос и запиши его в NOTES.md
4. После работы добавь в NOTES.md:
   - что сделано
   - что проверить
   - что предложить человеку перенести в PRD.md
   - что предложить человеку перенести в MEMORY.md
   - что предложить человеку добавить в TASKS.md

## Проект
${description}

## Стек
${stack}

## Ограничения
${critical || "Не трогать .env и секреты."}
`;

  const files = {
    [agentFileName]: agentInstructions,
    "PRD.md": `# PRD — ${projectName}
> Для чего файл: описывает, что строим, для кого и какой результат нужен.
> Кто редактирует: человек. Агент может предлагать изменения через NOTES.md.
> Агенту нельзя менять этот файл без явной команды.

## Что строим
${answers.discovery ? answers.discovery.problem : description}

## Для кого
${answers.discovery ? answers.discovery.users : "уточнить"}${inlineReferenceBlock(answers.references)}

## Первый результат
${answers.discovery ? answers.discovery.mvpFlow : "уточнить"}

## Интеграции и данные
${apis}

## Стек
${stack}

## Инфраструктура
${infra}

## Готово когда
- [ ] Агент понял проект и первую задачу
- [ ] Первый рабочий результат выполнен
- [ ] В NOTES.md записано, что сделано и что проверить
`,
    "MEMORY.md": `# MEMORY — ${projectName}
> Для чего файл: хранит важную память проекта между сессиями.
> Кто редактирует: человек. Агент НЕ меняет этот файл напрямую.
> Агент пишет предложения для памяти в NOTES.md.
> Правило: держать файл коротким, только важное.

## Важно помнить
- ${critical || "Не трогать .env и секреты."}
${referenceMemoryLine(answers.references) ? `${referenceMemoryLine(answers.references)}\n` : ""}- Основной агент: ${agentProfile}
- Стек: ${stack}

## Что уже решили
- Проект создан через Unit Agent Starter
- Первый рабочий файл агента: ${agentFileName}

## Что сработало
- Пока пусто

## Что не сработало
- Пока пусто

## Вопросы
- Пока нет

## Обновлено
${date} — инициализация
`,
    "TASKS.md": `# TASKS — ${projectName}
> Для чего файл: список задач для человека и агента.
> Кто редактирует: человек. Агент НЕ меняет этот файл напрямую.
> Агент берёт первую задачу из раздела "Сейчас".
> Агент предлагает новые задачи через NOTES.md.

## Сейчас
- [ ] ${answers.discovery ? answers.discovery.mvpFlow : "Уточнить первый рабочий шаг и выполнить его"}

## Потом
- [ ] Уточнить стек, если он ещё не выбран
- [ ] Добавить инструкции запуска проекта
- [ ] Проверить результат вручную

## Сделано
- [x] Проект инициализирован
`,
    "NOTES.md": `# NOTES — ${projectName}
> Для чего файл: временный inbox. Сюда агент пишет итоги, вопросы и предложения.
> Кто редактирует: агент и человек.
> Агент НЕ читает этот файл в начале сессии, если человек не попросил.
> Человек переносит важное из NOTES.md в PRD.md, MEMORY.md или TASKS.md.
> Старые записи нужно очищать после переноса, чтобы файл не разрастался.

## Формат записи
- дата:
- агент:
- что сделано:
- что проверить:
- вопросы:
- предложить человеку перенести в PRD:
- предложить человеку перенести в MEMORY:
- предложить человеку добавить в TASKS:

---
`,
    ".skills/README.md": `# Skills

Эта папка для дополнительных навыков агента.

В simple-режиме skills не скачиваются автоматически.
Если нужен skill:
1. Найди источник: github.com/anthropics/skills, skillsmp.com или другой trusted repo
2. Посмотри содержимое skill перед установкой
3. Добавь его сюда вручную
4. Запиши в MEMORY.md, зачем он нужен

Рекомендовано для этого проекта:
${skillListMarkdown(selectedSkills)}
${superpowersRecommendationBlock(selectedSkills)}
`,
    "README.md": `# ${projectName}

Проект подготовлен для работы с AI-агентом.

## Как начать
1. Открой ${agentFileName}
2. Дай агенту первый промпт:

\`\`\`
Прочитай ${agentFileName}, PRD.md, MEMORY.md и TASKS.md.
Подтверди: что строим, что важно помнить, и какую задачу берёшь первой.
Не читай NOTES.md в начале сессии, если я не попрошу.
После работы записывай итоги и предложения в NOTES.md.
\`\`\`

## Главные файлы
- ${agentFileName} — инструкция для агента
- PRD.md — что строим
- MEMORY.md — что помнить
- TASKS.md — что делать
- NOTES.md — куда агент пишет итоги
`,
    ".env.example": envExample(apis),
    ".gitignore": [".env", ".env.local", ...STACK_IGNORES[inferStackKey(stack)]].join("\n") + "\n"
  };

  return files;
}

function renderFiles(answers) {
  const {
    projectName,
    description,
    stack,
    infra,
    critical,
    apis,
    mvpDeadline,
    otherLlms,
    agentProfile,
    selectedSkills,
    customSkills
  } = answers;

  const date = today();
  const lint = lintCommand(stack);
  const tests = testCommand(stack);
  const resolvedPreset = answers.starterPreset === "auto"
    ? inferPreset(answers.stack, answers.discovery?.projectType ?? "")
    : answers.starterPreset;
  const installedSkills = [...selectedSkills, ...customSkills.map((name) => `custom/${name}`)];
  const criticalBlock = critical.trim().toLowerCase() === "нет" || !critical.trim()
    ? ""
    : `## ⚠ КРИТИЧНО\n${critical}\n\n`;

  const memory = `# MEMORY — ${projectName}
> Только владелец проекта редактирует. LLM предлагают изменения через .staging/notes.md.
> Лимит секции — 10 строк. Старое переносить в .context/

## Статус
⬜ Шаг 1: инициализировать базовый код проекта
⬜ Шаг 2: подключить линтер и тесты
⬜ Шаг 3: реализовать первый MVP-сценарий

## Инфраструктура
${infra}

## Решения
- Основной профиль агента: ${agentProfile}
- Основной контракт: ${agentPrimaryFile(agentProfile)}
- Стек: ${stack}
- Каркас проекта: ${resolvedPreset}
- Режим агентов: ${answers.collaborationMode}
${referenceMemoryLine(answers.references)}

## Нельзя
${critical.trim() || "Не менять .env и защищённые файлы без явной команды владельца."}

## Скиллы выбраны
${skillListMarkdown(installedSkills)}

## Снапшот делать когда
- После каждого выполненного шага
- Перед переключением на другую LLM
- Перед крупной миграцией или деплоем

## Обновлено
${date} — инициализация
`;

  return {
    ...presetFiles(answers),
    ...teamFiles(answers),
    "CLAUDE.md": `# CLAUDE.md — ${projectName}

${criticalBlock}## Проект
${description}

## Стек
${stack}

## Инфраструктура
${infra}

## Алгоритм каждой сессии
1. Прочитай MEMORY.md — статус и ограничения
2. Прочитай TODO.md — возьми первое из "В работе"
3. Прочитай нужный скилл из .claude/skills/ или .skills/
4. Выполни задачу
5. ${lint} && ${tests}
6. Запиши в .staging/notes.md тегом [claude]
7. Добавь строку в .logs/journal.md

## Выбранные скиллы
${skillListMarkdown(installedSkills)}

## Таблица владения
ТОЛЬКО ЧИТАТЬ:
  CLAUDE.md · MEMORY.md · AGENTS.md · TODO.md
  .skills/* · .evals/* · .env

ПИСАТЬ МОЖНО:
  ${codeFolders(stack)}
  .staging/notes.md · .logs/journal.md · .context/*

## Структура модулей
${moduleStructure(stack)}

## Соглашения кода
Следуй существующим паттернам проекта. Новые абстракции добавляй только при явной пользе.

## После каждого изменения
${lint} && ${tests}
`,
    "AGENTS.md": `# AGENTS.md — ${projectName}

## Основной агент
Профиль: ${agentProfile}
Контракт: ${agentPrimaryFile(agentProfile)}
Роль: основной исполнитель задач по коду, тестам и документации.
Граница: не трогает .env, MEMORY.md, TODO.md, CLAUDE.md, AGENTS.md и .skills/* без явной команды.

## Режим работы
${answers.collaborationMode === "solo"
  ? "solo — один агент ведёт проект целиком. TEAM.md и дополнительные роли не используются."
  : `${answers.collaborationMode} — см. TEAM.md и .agents/roles/*.md. Оркестратор обязан назначать непересекающиеся write-scope.`}

## Code агент
Роль: реализация, исправления, тесты, рефакторинг в границах задачи.
Модель: выбирается владельцем проекта.
Скиллы:
${skillListMarkdown(installedSkills)}

## Research агент
Роль: актуальная документация API, проверка community skills, анализ внешних сервисов.
Когда: перед новым API, новым SDK или установкой community skill.

## Другие LLM
${otherLlms}

## Когда переключать
- Не справился за 2 попытки → другой code агент
- Нужна актуальная документация API → research агент
- Баг держится 3+ попытки → отдельный анализ причины
- Нужен новый скилл → сначала показать содержимое и получить подтверждение
`,
    "MEMORY.md": memory,
    "TODO.md": `# TODO — ${projectName}
> Только владелец проекта управляет. Агент берёт первое из "В работе".

## В работе
- [ ] Шаг 1: инициализировать базовый код проекта
      агент: ${agentProfile}
      скилл: ${selectedSkills[0] ? `.skills/${selectedSkills[0]}/SKILL.md` : "не требуется"}
      готово когда: проект запускается локально, линтер и тесты определены

## Следующее
- [ ] Шаг 2: реализовать первый MVP-сценарий
- [ ] Шаг 3: подготовить деплой или локальный runbook

## Бэклог
- [ ] Уточнить вне скоупа MVP
- [ ] Добавить недостающие интеграционные тесты

## Выполнено
- [x] агентная система инициализирована
`,
    ".evals/contract.md": `# contract.md — Контракт исполнителя

## Перед стартом
□ Прочитал MEMORY.md
□ Прочитал TODO.md — взял первое из "В работе"
□ Прочитал нужный скилл
□ Проверил ограничения инфраструктуры

## После выполнения
□ ${lint} → нет ошибок
□ ${tests} → проходят
□ Записал в .staging/notes.md тегом [${agentProfile}]
□ Добавил строку в .logs/journal.md

## Нельзя никогда
✗ Менять: CLAUDE.md, MEMORY.md, AGENTS.md, TODO.md, .skills/*, .env
✗ Скачивать и устанавливать community skills без показа содержимого и подтверждения
✗ Трогать критичную инфраструктуру: ${critical.trim() || "не указана"}

## Если не знаешь
→ Стоп. Запиши: [дата][${agentProfile}] question: [вопрос]
→ Не угадывай API — сначала Research агент
→ Нужен новый скилл — предложи, не устанавливай сам
`,
    ".claude/settings.json": `${JSON.stringify({
      permissions: {
        allow: [
          `Bash(${lint})`,
          `Bash(${tests})`,
          "Bash(git status)",
          "Bash(git diff *)",
          "Bash(curl -sL * | head -30)",
          "Read(./**)",
          "Write(./.staging/notes.md)",
          "Write(./.logs/journal.md)",
          "Write(./.context/**)"
        ],
        deny: [
          "Write(./CLAUDE.md)",
          "Write(./MEMORY.md)",
          "Write(./AGENTS.md)",
          "Write(./TODO.md)",
          "Write(./.skills/**)",
          "Write(./.evals/**)",
          "Write(./.env)",
          "Bash(curl * -o .skills/*)"
        ]
      }
    }, null,  twoSpaces())}
`,
    ".codex/AGENTS.md": `# Codex Profile — ${projectName}

Read AGENTS.md, MEMORY.md, TODO.md, and .evals/contract.md before coding.

Primary rule: make scoped code changes, verify with tests, and write session notes to .staging/notes.md.
Do not edit protected project-control files unless the user explicitly asks.
`,
    ".gemini/GEMINI.md": `# Gemini Profile — ${projectName}

Use this file as Gemini-specific context.

Project: ${description}
Stack: ${stack}
Infrastructure: ${infra}

Before coding, read MEMORY.md, TODO.md, AGENTS.md, and .evals/contract.md.
Do not edit protected files unless explicitly instructed by the owner.
`,
    "docs/PRD.md": `# PRD — ${projectName}

## Проблема
${answers.discovery ? answers.discovery.problem : description}

## Решение
${answers.discovery ? markdownBullets(answers.discovery.outcomes, "- Уточнить после первого технического шага") : "- Уточнить после первого технического шага"}

## Пользователи
${answers.discovery ? answers.discovery.users : "Уточнить с владельцем проекта."}
${referenceBlock(answers.references)}

## Метрики успеха MVP
- Проект запускается в целевой среде
- Первый пользовательский сценарий работает end-to-end
- Ошибки фиксируются и воспроизводятся через тесты или runbook

## Источники данных / интеграции
| Источник | Метод | Что берём | Частота |
|----------|-------|-----------|---------|
${integrationsTable(apis)}

## Стек
${stack}

## Инфраструктура
${infra}

## Структура проекта
${moduleStructure(stack)}

## Переменные окружения
См. .env.example

## MVP — критерии готовности
- [ ] Базовый проект запускается
- [ ] Первый сценарий реализован и проверен: ${answers.discovery ? answers.discovery.mvpFlow : "уточнить"}
- [ ] Есть инструкция запуска и деплоя

## Вне скоупа MVP
Уточнить перед началом реализации.

## Срок MVP
${mvpDeadline}
`,
    ...(answers.discovery ? {
      "docs/DISCOVERY.md": `# Discovery — ${projectName}

## Problem
${answers.discovery.problem}

## Users
${answers.discovery.users}

## Project Type
${answers.discovery.projectType}

## Current Workflow / Workaround
${answers.discovery.currentWorkflow}

## Desired Outcomes
${answers.discovery.outcomes}

## First MVP Flow
${answers.discovery.mvpFlow}

## Data, Integrations, APIs
${answers.discovery.dataAndApis}

## Technical Notes
${answers.discovery.technicalNotes}

## Constraints and Risks
${answers.discovery.constraints}
${referenceBlock(answers.references)}

## Acceptance Criteria Draft
- User can complete the first MVP flow end-to-end
- Required integrations are represented in .env.example and docs/PRD.md
- Linter and test commands are documented in project instructions
- Known constraints are visible in MEMORY.md and .evals/contract.md
`
    } : {}),
    "docs/HOW_TO_MANAGE.md": `# Как управлять этим проектом

## Роли
Владелец проекта — оркестратор. Принимает решения и пишет в защищённые файлы.
Основной агент — ${agentProfile}. Выполняет задачи в коде и пишет заметки.
Другие LLM — консультанты на задачу, не владельцы памяти проекта.

## Кто за что отвечает
| Файл | Кто пишет | Правило |
|------|-----------|---------|
| CLAUDE.md | Владелец | При смене архитектуры или Claude-профиля |
| MEMORY.md | Владелец | После каждой сессии |
| TODO.md | Владелец | Двигает задачи |
| AGENTS.md | Владелец | При смене ролей агентов |
| .skills/* | Владелец | После проверки содержимого |
| .staging/notes.md | LLM пишет, владелец очищает | Каждая сессия |
| .logs/journal.md | LLM + владелец | Только добавлять снизу |
| Код | LLM | Линтер + тесты после |

## Ритуал старта
Первый промпт:

\`\`\`
Прочитай ${agentPrimaryFile(agentProfile)}, MEMORY.md и TODO.md.
Подтверди: что строим, что сделано, что берёшь первым.
Затем прочитай нужный скилл и начни Шаг 1.
\`\`\`

## Ритуал конца сессии
1. Прочитать .staging/notes.md
2. Перенести важные решения в MEMORY.md
3. Очистить .staging/notes.md после переноса
4. Проверить git diff
5. Сделать commit

## Как добавить новый скилл
1. Найти на skillsmp.com или github.com/anthropics/skills
2. Посмотреть первые 30 строк
3. Если есть scripts/ или bin/ — проверить отдельно
4. Скачать в .skills/<name>/SKILL.md или .claude/skills/<name>/SKILL.md
5. Добавить в список скиллов в CLAUDE.md и MEMORY.md

## Красные флаги
- Агент говорит "готово" без упоминания тестов
- Агент меняет защищённые файлы без команды
- MEMORY.md растёт без чистки
- Community skill установлен без просмотра
`,
    ".staging/notes.md": `# .staging/notes.md
# Только добавлять снизу. Владелец очищает после переноса в MEMORY.md.
# Формат: [дата][модель] [тип] описание
# Типы: done / lesson / decision / question
---
`,
    ".logs/journal.md": `# .logs/journal.md
# Только добавлять снизу. Никогда не редактировать старое.
---
${date} owner decision: стек — ${stack}
${date} owner decision: основной агент — ${agentProfile}
${date} owner decision: каркас проекта — ${resolvedPreset}
${date} owner decision: режим агентов — ${answers.collaborationMode}
${date} owner done: агентная система инициализирована
`,
    ".context/init.md": `# Снапшот MEMORY — инициализация
# Дата: ${date}
# Следующий снапшот: после Шага 1
---
${memory}
`,
    ".env.example": envExample(apis),
    ".gitignore": [".env", ".env.local", ".staging/", ...STACK_IGNORES[inferStackKey(stack)]].join("\n") + "\n",
    ".skills/README.md": `# Project Skills

Recommended official skills:

${officialSkillCatalog()}

Selected for this project:

${skillListMarkdown(installedSkills)}
${superpowersRecommendationBlock(installedSkills)}

Discovery source:
- discovery-interview: https://github.com/parcadei/continuous-claude-v3/tree/main/skills/discovery-interview

Official skills are listed here but not downloaded automatically by default.
Community skills must be inspected before installation.
`
  };
}

function twoSpaces() {
  return 2;
}

async function exists(target) {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

async function askExistingFileAction(rl, relativePath) {
  while (true) {
    const answer = (await rl.question(`Файл уже существует: ${relativePath}
Что сделать? append / overwrite / skip
Подсказка: Enter = skip, чтобы не потерять данные.
> `)).trim().toLowerCase() || "skip";

    if (["append", "a", "дописать"].includes(answer)) return "append";
    if (["overwrite", "o", "перезаписать"].includes(answer)) return "overwrite";
    if (["skip", "s", "пропустить"].includes(answer)) return "skip";
    console.log("Выбери append, overwrite или skip.");
  }
}

async function writeProjectFiles(root, files, rl) {
  const result = {
    written: [],
    skipped: [],
    overwritten: [],
    appended: []
  };

  for (const [relativePath, content] of Object.entries(files)) {
    const absolutePath = path.join(root, relativePath);
    await fs.mkdir(path.dirname(absolutePath), { recursive: true });
    if (await exists(absolutePath)) {
      const action = await askExistingFileAction(rl, relativePath);
      if (action === "skip") {
        result.skipped.push(relativePath);
        continue;
      }
      if (action === "append") {
        const appendix = `\n\n---\n\n<!-- Unit appended generated content. Review and merge manually if useful. -->\n\n${content}`;
        await fs.appendFile(absolutePath, appendix, "utf8");
        result.appended.push(relativePath);
        continue;
      }
      result.overwritten.push(relativePath);
    } else {
      result.written.push(relativePath);
    }
    await fs.writeFile(absolutePath, content, "utf8");
  }

  return result;
}

async function maybeGitInit(root) {
  try {
    try {
      await execFileAsync("git", ["init", "-b", "main"], { cwd: root });
    } catch {
      await execFileAsync("git", ["init"], { cwd: root });
      await execFileAsync("git", ["branch", "-M", "main"], { cwd: root });
    }
    await execFileAsync("git", ["add", "."], { cwd: root });
    await execFileAsync("git", ["commit", "-m", "init: agent system"], { cwd: root });
    return "git init + first commit created";
  } catch (error) {
    return `git step skipped: ${error.message.split("\n")[0]}`;
  }
}

async function createPrompt() {
  if (!input.isTTY) {
    const raw = readFileSync(0, "utf8");
    const answers = raw.split(/\r?\n/);
    let index = 0;
    return {
      async question(questionText) {
        output.write(questionText);
        const answer = answers[index] ?? "";
        index += 1;
        output.write(`${answer}\n`);
        return answer;
      },
      close() {}
    };
  }

  return readline.createInterface({ input, output });
}

async function askRequired(rl, question, transform = (value) => value.trim()) {
  while (true) {
    const answer = transform(await rl.question(`${question}\n> `));
    if (answer) return answer;
    console.log("Нужен ответ, чтобы продолжить.");
  }
}

async function askOptional(rl, question, fallback = "нет") {
  const answer = (await rl.question(`${question}\n> `)).trim();
  return answer || fallback;
}

async function askAgentProfile(rl) {
  while (true) {
    const answer = (await rl.question(`С каким AI-помощником будешь работать? (agent profile)
1. Codex (codex)
2. Claude (claude)
3. Gemini (gemini)
4. Другой AI / IDE (other)
Подсказка: выбирай other, если используешь OpenCode, Cursor, Windsurf, Aider, Qwen, DeepSeek, MiniMax или не уверен.
> `)).trim().toLowerCase();
    const normalized = normalizeAgentProfile(answer);
    if (normalized) return normalized;
    console.log("Выбери один вариант: codex, claude, gemini или other.");
  }
}

function normalizeAgentProfile(value) {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  if (normalized === "1") return "codex";
  if (normalized === "2") return "claude";
  if (normalized === "3") return "gemini";
  if (normalized === "4") return "other";
  if (normalized === "multi") return "other";
  if (AGENT_PROFILES.has(normalized)) return normalized;
  return null;
}

async function askStarterMode(rl) {
  const cliMode = parseModeArg(process.argv.slice(2));
  if (cliMode) return cliMode;

  while (true) {
    const answer = (await rl.question(`Как стартуем?
1. Быстрый старт (simple) — один AI-помощник, минимум вопросов
2. Сначала разобраться (discovery) — вопросы и первичный PRD
3. Расширенные настройки (advanced) — каркас, команды агентов, skills
Нажми Enter для быстрого старта (simple).
> `)).trim().toLowerCase() || "simple";
    const normalized = normalizeMode(answer);
    if (normalized) return normalized;
    if (STARTER_MODES.has(answer)) return answer;
    console.log("Выбери simple, discovery или advanced.");
  }
}

function parseModeArg(args) {
  const modeIndex = args.findIndex((arg) => arg === "--mode" || arg === "-m");
  if (modeIndex >= 0) return normalizeMode(args[modeIndex + 1]);

  const inline = args.find((arg) => arg.startsWith("--mode="));
  if (inline) return normalizeMode(inline.slice("--mode=".length));

  const positionalMode = args.find((arg) => !arg.startsWith("-"));
  if (positionalMode) return normalizeMode(positionalMode);

  return null;
}

function parseHereArg(args) {
  return args.includes("--here");
}

function normalizeMode(value) {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  if (normalized === "1") return "simple";
  if (normalized === "2") return "discovery";
  if (normalized === "3") return "advanced";
  if (STARTER_MODES.has(normalized)) return normalized;
  return null;
}

async function askStarterPreset(rl, stack, projectType = "") {
  const inferred = inferPreset(stack, projectType);
  while (true) {
    const answer = (await rl.question(`Какой каркас проекта создать? auto (${inferred}) / agent-only / node-cli / webapp / python-app
Подсказка: agent-only — только инструкции для агента; остальные варианты добавляют минимальный кодовый скелет.
> `)).trim().toLowerCase() || "auto";
    if (STARTER_PRESETS.has(answer)) return answer;
    console.log("Выбери: auto, agent-only, node-cli, webapp или python-app.");
  }
}

async function askCollaborationMode(rl) {
  while (true) {
    const answer = (await rl.question(`Как организовать агентную работу? solo / team-lite / team-full
Подсказка: solo — один агент и меньше файлов. team-lite/full нужны только для больших проектов.
> `)).trim().toLowerCase() || "solo";
    if (COLLABORATION_MODES.has(answer)) return answer;
    console.log("Выбери: solo, team-lite или team-full.");
  }
}

function classifyProjectType(text) {
  const normalized = text.toLowerCase();
  if (normalized.match(/cli|команд|терминал/)) return "CLI tool";
  if (normalized.match(/mobile|ios|android|мобиль/)) return "Mobile app";
  if (normalized.match(/api|backend|service|сервер/)) return "Backend service/API";
  if (normalized.match(/automation|etl|cron|script|автомат/)) return "Script/Automation";
  if (normalized.match(/sdk|library|package|библиотек/)) return "Library/SDK";
  if (normalized.match(/web|next|react|frontend|dashboard|crm|сайт|кабинет/)) return "Frontend/Web app";
  return "Full-stack app";
}

function recommendStack(projectType, technicalNotes) {
  if (technicalNotes && !["нет", "не знаю", "не знаю пока"].includes(technicalNotes.trim().toLowerCase())) {
    return technicalNotes;
  }

  if (projectType === "CLI tool") return "Node.js CLI или Python CLI — выбрать по экосистеме проекта";
  if (projectType === "Backend service/API") return "Node.js/Fastify или Python/FastAPI — выбрать после требований к API";
  if (projectType === "Script/Automation") return "Python или Node.js script — выбрать по источникам данных";
  if (projectType === "Frontend/Web app") return "Next.js + TypeScript";
  if (projectType === "Mobile app") return "React Native или Flutter — выбрать после требований к платформам";
  if (projectType === "Library/SDK") return "TypeScript или Python package — выбрать по целевой аудитории";
  return "Next.js + TypeScript + API layer";
}

function inferPreset(stack, projectType = "") {
  const normalized = `${stack} ${projectType}`.toLowerCase();
  if (normalized.includes("cli")) return "node-cli";
  if (normalized.match(/next|react|frontend|web app|dashboard|сайт|кабинет/)) return "webapp";
  if (normalized.match(/python|django|fastapi/)) return "python-app";
  return "agent-only";
}

function presetFiles(answers) {
  const preset = answers.starterPreset === "auto"
    ? inferPreset(answers.stack, answers.discovery?.projectType ?? "")
    : answers.starterPreset;
  const projectName = answers.projectName;

  if (preset === "agent-only") return {};

  if (preset === "node-cli") {
    return {
      "src/index.js": `export function main() {
  console.log("${projectName} starter is ready.");
}

main();
`,
      "tests/.gitkeep": "",
      "scripts/.gitkeep": ""
    };
  }

  if (preset === "webapp") {
    return {
      "src/main.js": `const root = document.querySelector("#app");

if (root) {
  root.textContent = "${projectName} starter is ready.";
}
`,
      "src/styles.css": `:root {
  color-scheme: light;
  font-family: system-ui, sans-serif;
}

body {
  margin: 0;
}
`,
      "public/.gitkeep": "",
      "tests/.gitkeep": ""
    };
  }

  if (preset === "python-app") {
    return {
      "src/__init__.py": "",
      "src/main.py": `def main() -> None:
    print("${projectName} starter is ready.")


if __name__ == "__main__":
    main()
`,
      "tests/.gitkeep": "",
      "scripts/.gitkeep": ""
    };
  }

  return {};
}

function teamFiles(answers) {
  if (answers.collaborationMode === "solo") return {};

  const roles = answers.collaborationMode === "team-full"
    ? "- discovery\n- architect\n- implementer\n- qa\n- reviewer\n- research"
    : "- orchestrator\n- implementer\n- reviewer";

  const common = {
    "TEAM.md": `# TEAM.md — ${answers.projectName}

## Режим
${answers.collaborationMode}

## Принцип
Оркестратор управляет задачей, но не раздаёт двум агентам один и тот же write-scope.
Каждый агент получает цель, границы файлов, критерий готовности и формат отчёта.

## Базовый цикл
1. Оркестратор читает MEMORY.md, TODO.md, docs/PRD.md и .evals/contract.md
2. Делит задачу на независимые task packets
3. Назначает роли
4. Принимает отчёты
5. Проверяет diff, тесты и конфликтующие изменения
6. Обновляет .staging/notes.md и .logs/journal.md

## Роли
${roles}
`,
    ".agents/handoff-template.md": `# Task Packet

Agent:
Goal:

## Write Scope
-

## Read Scope
- AGENTS.md
- MEMORY.md
- TODO.md
- docs/PRD.md
- .evals/contract.md

## Do Not Touch
- .env
- MEMORY.md
- TODO.md
- CLAUDE.md
- AGENTS.md
- .skills/*

## Done When
-

## Report Format
- changed files
- verification run
- risks / open questions
`,
    ".agents/roles/orchestrator.md": `# Orchestrator

Owns planning, delegation, integration, and final verification.
Does not do large implementation work when parallel agents are assigned.
Must prevent overlapping write scopes.
`,
    ".agents/roles/implementer.md": `# Implementer

Owns scoped code changes.
Reads project control files before editing.
Writes only inside assigned write scope.
Reports changed files, tests, and unresolved risks.
`,
    ".agents/roles/reviewer.md": `# Reviewer

Reviews diffs for bugs, regressions, security risks, missing tests, and contract violations.
Findings first. No broad rewrites unless explicitly assigned.
`,
    ".claude/agents/implementer.md": `---
name: implementer
description: Scoped implementation agent. Use when a task packet has a clear write scope and verification criteria.
model: inherit
---

You implement only the assigned task packet. Read project control files first. Do not edit protected files. Report changed files and verification.
`,
    ".claude/agents/reviewer.md": `---
name: reviewer
description: Code review agent. Use after implementation or before finalizing a task.
model: inherit
---

Review for concrete bugs, regressions, security risks, missing tests, and violations of project instructions. Return findings first with file and line references when possible.
`
  };

  if (answers.collaborationMode === "team-lite") return common;

  return {
    ...common,
    ".agents/roles/discovery.md": `# Discovery Agent

Owns requirement discovery and spec clarification.
Uses discovery-interview style questioning.
Writes recommendations to .staging/notes.md unless explicitly allowed to edit docs.
`,
    ".agents/roles/architect.md": `# Architect

Owns module boundaries, implementation plan, and technical tradeoffs.
Does not implement unless assigned.
`,
    ".agents/roles/qa.md": `# QA Agent

Owns test strategy, acceptance criteria checks, and verification commands.
Can propose tests and report coverage gaps.
`,
    ".agents/roles/research.md": `# Research Agent

Owns current documentation, API checks, and skill discovery.
Does not install community skills without owner approval.
`,
    ".claude/agents/discovery.md": `---
name: discovery
description: Requirements discovery agent for clarifying vague product ideas before implementation.
model: inherit
---

Ask focused questions, surface assumptions, and produce a concise spec summary. Do not implement.
`,
    ".claude/agents/architect.md": `---
name: architect
description: Architecture planning agent for module boundaries, risks, and implementation plans.
model: inherit
---

Create practical plans with file boundaries, dependencies, and verification steps. Do not implement unless explicitly assigned.
`,
    ".claude/agents/qa.md": `---
name: qa
description: QA and verification agent for tests, acceptance criteria, and regression checks.
model: inherit
---

Verify behavior against acceptance criteria. Prefer concrete commands and focused test gaps.
`,
    ".claude/agents/research.md": `---
name: research
description: Research agent for current API docs, external services, and skill discovery.
model: inherit
---

Use primary sources where possible. Summarize findings with links and do not modify code unless explicitly assigned.
`
  };
}

async function runDiscoveryInterview(rl, projectName) {
  console.log("\nDiscovery Interview: коротко, но глубже обычной анкеты. Отвечай свободно, можно черновиком.\n");
  const problem = await askRequired(rl, "1. В одном предложении: какую проблему решаем?\nПодсказка: не описывай решение, опиши боль. Например: клиенты теряются в переписках.");
  const users = await askRequired(rl, "2. Кто будет пользоваться этим продуктом?\nПодсказка: роль или тип людей. Например: владелец салона, менеджер, клиент.");
  const existing = await askOptional(rl, "3. Это новая штука или улучшение существующего процесса/проекта?\nПодсказка: можно ответить 'новый проект' или 'улучшаем текущий сайт'.");
  const currentWorkflow = await askOptional(rl, "4. Как сейчас решают эту задачу? Что болит в текущем способе?\nПодсказка: агенту важно понять текущий workaround.");
  const outcomes = await askRequired(rl, "5. Какие 2-3 главных результата должен дать продукт?\nПодсказка: перечисли через запятую. Например: принять заявку, сохранить клиента, отправить уведомление.");
  const mvpFlow = await askRequired(rl, "6. Опиши первый MVP-сценарий от входа пользователя до результата.\nПодсказка: 'пользователь открывает..., вводит..., получает...'.");
  const dataAndApis = await askOptional(rl, "7. Какие данные, API, файлы или внешние сервисы нужны?\nПодсказка: Telegram, Stripe, Google Sheets, база данных, файлы CSV. Если нет — 'нет'.");
  const technicalNotes = await askOptional(rl, "8. Есть предпочтения по стеку или ограничения? Если не знаешь — напиши 'не знаю'.\nПодсказка: Next.js, Python, Telegram bot, только локально и т.п.", "не знаю");
  const infra = await askRequired(rl, "9. Где разработка и где деплой?\nПодсказка: локально, Vercel, Railway, VPS, WordPress-хостинг, только тест.");
  const constraints = await askOptional(rl, "10. Что нельзя трогать или что критично не сломать?\nПодсказка: .env, существующая БД, другие боты, порты, серверные сервисы.");
  const mvpDeadline = await askOptional(rl, "11. Срок на MVP?\nПодсказка: сегодня, неделя, 2 недели, без срока.");
  const otherLlms = await askOptional(rl, "12. Будешь подключать другие LLM кроме основного агента?\nПодсказка: можно ответить 'нет' или 'Claude + Codex + Gemini'.");
  const references = await askReferences(rl);
  const projectType = classifyProjectType(`${problem} ${outcomes} ${mvpFlow} ${technicalNotes}`);
  const stack = recommendStack(projectType, technicalNotes);

    return {
    projectName,
    description: `${problem} Пользователи: ${users}. MVP: ${mvpFlow}`,
    stack,
    infra,
    critical: constraints,
    apis: dataAndApis,
    mvpDeadline,
    otherLlms,
    references,
    discovery: {
      problem,
      users,
      projectType: `${projectType}; ${existing}`,
      currentWorkflow,
      outcomes,
      mvpFlow,
      dataAndApis,
      technicalNotes: stack,
      constraints
    }
  };
}

async function runQuickInterview(rl, projectName) {
  const description = await askRequired(rl, "2. Опиши проект в 2-3 предложениях.\nПодсказка: что делает, для кого, какую проблему решает.");
  const stack = await askRequired(rl, "3. Какой стек? Если не знаешь — опиши продукт.\nПодсказка: Next.js, Python, Telegram bot, web app, CLI, 'не знаю'.");
  const infra = await askRequired(rl, "4. Где разработка и где деплой?\nПодсказка: локально + Vercel/Railway/VPS/только локально.");
  const critical = await askOptional(rl, "5. Есть ли на сервере что-то критичное, что нельзя трогать?\nПодсказка: .env, БД, другие сервисы, порты. Если нет — 'нет'.");
  const apis = await askOptional(rl, "6. Какие внешние API или источники данных?\nПодсказка: Stripe, Telegram, Google Sheets, CRM, база данных. Если нет — 'нет'.");
  const mvpDeadline = await askOptional(rl, "7. Срок на MVP?\nПодсказка: сегодня, неделя, 2 недели, без срока.");
  const otherLlms = await askOptional(rl, "8. Будешь подключать другие LLM кроме основного агента?\nПодсказка: можно ответить 'нет' или перечислить.");
  const references = await askReferences(rl);
  return {
    projectName,
    description,
    stack,
    infra,
    critical,
    apis,
    mvpDeadline,
    otherLlms,
    references
  };
}

async function askReferences(rl) {
  const hasReference = (await rl.question(`Есть сайт, пример или конкурент, на который нужно ориентироваться?
Подсказка: если есть, агент запишет это в PRD как референс. Если нет — нажми Enter.
yes / no
> `)).trim().toLowerCase();

  if (!["yes", "y", "да", "д"].includes(hasReference)) {
    return null;
  }

  const ownSite = await askOptional(rl, "Ссылка на твой текущий сайт или проект, если есть.\nПодсказка: можно вставить URL или написать 'нет'.", "нет");
  const exampleSite = await askOptional(rl, "Ссылка на пример/конкурента/референс.\nПодсказка: URL сайта, продукта, страницы, GitHub или описание, если ссылки нет.", "нет");
  const referenceGoal = await askOptional(rl, "Что именно нравится или что нужно сделать похоже?\nПодсказка: структура, форма заявки, стиль, личный кабинет, сценарий покупки, навигация.", "уточнить");

  return {
    ownSite,
    exampleSite,
    referenceGoal
  };
}

async function askGitInit(rl) {
  const answer = (await rl.question(`Создать сохранение истории изменений? (git)
Подсказка: yes — будет git init и первый commit. Это помогает откатиться, если агент что-то испортит. no — просто создать файлы.
yes / no
> `)).trim().toLowerCase() || "no";
  return ["yes", "y", "да", "д"].includes(answer);
}

async function runSimpleInterview(rl, projectName) {
  console.log("\nSimple Start: минимум вопросов, чтобы агент понял проект и первую задачу.\n");
  const product = await askRequired(rl, "2. Что это за проект? Одним-двумя предложениями.\nПодсказка: например 'бот для записи клиентов' или 'сайт для портфолио'.");
  const users = await askOptional(rl, "3. Для кого он?\nПодсказка: кто будет пользоваться: я, клиенты, менеджеры, команда.", "уточнить позже");
  const firstGoal = await askRequired(rl, "4. Что агент должен сделать первым?\nПодсказка: конкретный первый результат. Например: создать структуру, написать MVP, проверить текущий код.");
  const stack = await askOptional(rl, "5. Стек известен? Если нет — напиши 'не знаю'.\nПодсказка: можно написать 'не знаю', агент предложит позже.", "не знаю");
  const constraints = await askOptional(rl, "6. Есть что-то, что нельзя трогать? Например .env, сервер, чужие файлы.\nПодсказка: если не уверен — оставь запрет на .env и секреты.", "Не трогать .env и существующие секреты.");
  const references = await askReferences(rl);

  return {
    projectName,
    description: `${product} Пользователи: ${users}. Первый шаг: ${firstGoal}`,
    stack: stack === "не знаю" ? "будет выбран агентом после уточнения задачи" : stack,
    infra: "локально; деплой уточнить позже",
    critical: constraints,
    apis: "уточнить позже",
    mvpDeadline: "уточнить позже",
    otherLlms: "нет",
    references,
    discovery: {
      problem: product,
      users,
      projectType: "AI-agent-managed project",
      currentWorkflow: "уточнить позже",
      outcomes: firstGoal,
      mvpFlow: firstGoal,
      dataAndApis: "уточнить позже",
      technicalNotes: stack === "не знаю" ? "стек будет выбран после уточнения" : stack,
      constraints
    }
  };
}

async function askSkills(rl, suggested) {
  console.log("\nРекомендованные skills, которые подходят по ответам:");
  for (const skill of suggested) console.log(`- ${skill}`);
  console.log("\nМожно указать список через запятую, написать all или none.");
  const answer = (await rl.question("> ")).trim().toLowerCase();
  if (!answer || answer === "none" || answer === "нет") return [];
  if (answer === "all" || answer === "все") return suggested;
  return answer
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

async function askCustomSkills(rl) {
  console.log("\nСоздать записи о кастомных skills под проект?");
  console.log("Например: apis, docker, clickhouse, telegram, billing.");
  const answer = (await rl.question('Перечисли через запятую или напиши "нет"\n> ')).trim().toLowerCase();
  if (!answer || answer === "нет" || answer === "none") return [];
  return answer
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

async function askSuperpowersRecommendation(rl) {
  const answer = (await rl.question(`Добавить рекомендацию Superpowers? (advanced methodology)
Подсказка: yes — добавит в .skills/README.md ссылку и объяснение. Ничего не скачивает и не устанавливает.
yes / no
> `)).trim().toLowerCase() || "no";

  return ["yes", "y", "да", "д"].includes(answer);
}

async function askRecommendedSkillsSimple(rl, suggested) {
  console.log("\nДобавить подсказки для агента? (skills)");
  console.log(`Рекомендовано: ${suggested.join(", ")}`);
  console.log("Подсказка: yes — в .skills/README.md появятся рекомендуемые skills. Сами skills не скачиваются.");
  const answer = (await rl.question("yes / no\n> ")).trim().toLowerCase() || "yes";
  return ["yes", "y", "да", "д"].includes(answer) ? suggested : [];
}

async function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    printHelp();
    return;
  }

  const args = process.argv.slice(2);
  const createHere = parseHereArg(args);
  const rl = await createPrompt();

  try {
    console.log("Unit Agent Starter\nЗадаю вопросы по одному и создаю проектную папку.\n");

    const rawProjectName = await askRequired(
      rl,
      createHere
        ? `1. Как называется проект? Строчными через дефис.
Подсказка: файлы будут созданы прямо в текущей папке (${process.cwd()}), без новой подпапки.`
        : "1. Как называется проект? Строчными через дефис."
    );
    const projectName = slugify(rawProjectName);
    const mode = await askStarterMode(rl);
    const baseAnswers = mode === "discovery"
      ? await runDiscoveryInterview(rl, projectName)
      : mode === "advanced"
        ? await runQuickInterview(rl, projectName)
        : await runSimpleInterview(rl, projectName);
    const starterPreset = mode !== "advanced"
      ? "agent-only"
      : await askStarterPreset(rl, baseAnswers.stack, baseAnswers.discovery?.projectType ?? "");
    const collaborationMode = mode !== "advanced"
      ? "solo"
      : await askCollaborationMode(rl);
    const agentProfile = await askAgentProfile(rl);

    const suggested = mode === "discovery"
      ? [...new Set(["discovery-interview", "using-superpowers", ...suggestSkills(baseAnswers.stack, baseAnswers.apis)])]
      : mode !== "advanced"
        ? ["discovery-interview", "skill-creator"]
        : suggestSkills(baseAnswers.stack, baseAnswers.apis);
    const selectedSkills = mode !== "advanced"
      ? await askRecommendedSkillsSimple(rl, suggested)
      : await askSkills(rl, suggested);
    const customSkills = mode === "advanced" ? await askCustomSkills(rl) : [];
    if (mode === "advanced" && await askSuperpowersRecommendation(rl) && !selectedSkills.includes("using-superpowers")) {
      selectedSkills.push("using-superpowers");
    }
    const shouldInitGit = await askGitInit(rl);

    const projectRoot = createHere ? process.cwd() : path.resolve(process.cwd(), projectName);
    if (!createHere && await exists(projectRoot)) {
      throw new Error(`Project folder already exists: ${projectRoot}`);
    }

    if (!createHere) {
      await fs.mkdir(projectRoot, { recursive: true });
    }
    const renderAnswers = {
      ...baseAnswers,
      starterPreset,
      collaborationMode,
      agentProfile,
      selectedSkills,
      customSkills
    };

    const writeResult = await writeProjectFiles(
      projectRoot,
      mode === "advanced" ? renderFiles(renderAnswers) : renderSimpleFiles(renderAnswers),
      rl
    );

    const gitResult = shouldInitGit ? await maybeGitInit(projectRoot) : "git skipped by user";

    console.log(`\n✅ Проект ${projectName} инициализирован`);
    console.log(`Папка: ${projectRoot}`);
    console.log(`Создание: ${createHere ? "в текущей папке (--here)" : "в новой папке проекта"}`);
    console.log(`Профиль агента: ${agentProfile}`);
    console.log(`Скиллы: ${installedSummary(selectedSkills, customSkills)}`);
    console.log(`Git: ${gitResult}`);
    if (writeResult.overwritten.length) {
      console.log(`Перезаписано файлов: ${writeResult.overwritten.length}`);
    }
    if (writeResult.appended.length) {
      console.log(`Дописано в конец файлов: ${writeResult.appended.length}`);
    }
    if (writeResult.skipped.length) {
      console.log(`Пропущено файлов: ${writeResult.skipped.length}`);
    }
    console.log("\nПервый промпт для следующей сессии:");
    console.log("────────────────────────────────────");
    if (mode !== "advanced") {
      console.log(`Прочитай ${simpleAgentFileName(agentProfile)}, PRD.md, MEMORY.md и TASKS.md.`);
      console.log("Подтверди: что строим, что важно помнить, и какую задачу берёшь первой.");
      console.log("Не читай NOTES.md в начале сессии, если я не попрошу.");
      console.log("После работы записывай итоги и предложения в NOTES.md.");
    } else {
      console.log(`Прочитай ${agentPrimaryFile(agentProfile)}, MEMORY.md и TODO.md.`);
      console.log("Подтверди: что строим, что сделано, что берёшь первым.");
      console.log("Затем прочитай нужный скилл и начни Шаг 1.");
    }
    console.log("────────────────────────────────────");
  } finally {
    rl.close();
  }
}

function printHelp() {
  console.log(`Unit Agent Starter

Usage:
  unit
  unit simple
  unit discovery
  unit advanced
  unit simple --here
  unit --mode simple
  unit --mode discovery
  unit --mode advanced

Modes:
  simple     Быстрый старт: minimal project context for one AI agent
  discovery  Сначала разобраться: guided interview, then minimal context
  advanced   Расширенные настройки: scaffold, agent team mode, skills

Examples:
  cd C:\\server\\projects
  unit simple
  unit simple --here
  unit --mode simple

By default, the generated project is created as a new folder in the current directory.
Use --here to create files directly in the current folder.
`);
}

function installedSummary(selectedSkills, customSkills) {
  const all = [...selectedSkills, ...customSkills.map((skill) => `custom/${skill}`)];
  return all.length ? all.join(", ") : "не выбраны";
}

main().catch((error) => {
  console.error(`\nОшибка: ${error.message}`);
  process.exitCode = 1;
});
