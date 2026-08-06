# Agent workflow — Booking_ukr

Дисциплина работы Cursor Agent (GSD + Superpowers) + стек Nuxt Booking_ukr.

## Правила (`.cursor/rules/`)

| Файл                        | Назначение                               |
| --------------------------- | ---------------------------------------- |
| `00-workflow-core`          | Классы S/M/L/XL, фазы, стоп-сигналы      |
| `01-discuss-before-code`    | Уточнение до кода                        |
| `02-planning-gsd`           | План, волны, `.planning/`                |
| `03-execution-discipline`   | Минимальный diff, порядок работ          |
| `04-verify-and-done`        | Lint, тесты, критерии «готово»           |
| `05-context-hygiene`        | Узкий контекст, `state.md`               |
| `06-fundamental-principles` | Мета-принципы                            |
| `07-commit-messages`        | Формат git-коммитов (англ., без scope)   |
| `90-project-context`        | Контекст этого репозитория               |
| `nuxt-template`             | Nuxt 4, Vue, SCSS, API, Storybook, hotel |
| `pinia-store-patterns`      | Pinia: persist, storeToRefs, ошибки      |
| `figma`                     | Токены и округление из Figma             |

## Планирование (`.planning/`)

1. Прочитать `PROJECT.md` в новой сессии
2. Для задачи M+: скопировать `brief-template.md` → `brief.md`, заполнить
3. Для L+: добавить `plan.md`, после волн обновлять `state.md` (из `state-template.md`)

Рабочие `brief.md`, `plan.md`, `state.md` не коммитятся (см. `.gitignore`).

## Пример запроса в чат

```text
Класс M. Задача: доработать карточку тарифа — кнопка выбора.
Done when: кнопка в UI, запись через action стора, yarn lint зелёный.
```

## Проверка перед коммитом

`yarn lint` (+ `yarn test` по scope) — см. `04-verify-and-done.mdc` и `nuxt-template.mdc`. Коммит — только по явной просьбе; формат — `07-commit-messages.mdc`.
