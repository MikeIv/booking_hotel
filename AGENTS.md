# Agent workflow — Booking_ukr

Правила: `.cursor/rules/` и `.planning/` (локально, в gitignore) · Продукт: `90-project-context.mdc`, `.planning/PROJECT.md`.

## Карта правил

| Правило                | Режим                                  | Назначение                                          |
| ---------------------- | -------------------------------------- | --------------------------------------------------- |
| `00`                   | **always**                             | GSD: классы, фазы, стоп, краткий Verify             |
| `08`                   | **always**                             | Экономия токенов (чат + контекст + MCP)             |
| `90`                   | **always**                             | Стек, команды, зоны, MCP                            |
| `nuxt-template`        | **globs** `app/`, `server/`, `shared/` | TS, Vue, SCSS, API, Storybook, hotel                |
| `figma`                | **globs** `app/**/*.vue,scss`, stories | Токены и округление из Figma                        |
| `pinia-store-patterns` | **globs** `app/**/*.{ts,vue}`          | Pinia: persist, storeToRefs, ошибки                 |
| `01`–`07`              | **requestable**                        | Discuss, Plan, Execute, Verify, Context, Principles, Commits |

## Планирование (`.planning/`)

1. Прочитать `PROJECT.md` в новой сессии
2. Для задачи M+: скопировать `brief-template.md` → `brief.md`, заполнить
3. Для L+: добавить `plan.md`, после волн обновлять `state.md` (из `state-template.md`)

Рабочие `brief.md`, `plan.md`, `state.md` не коммитятся (см. `.gitignore`).

## Промпт агенту

```text
Класс M. Задача: … Done when: …
Figma: один node для get_design_context; остальные — screenshot. Browser MCP не использовать.
```

Новая сессия L+: `@.planning/PROJECT.md` `@.planning/brief.md`

## Проверка перед коммитом

`yarn lint` (+ `yarn test` по scope) — см. `04-verify-and-done.mdc`. Коммит — только по явной просьбе; формат — `07-commit-messages.mdc`.
