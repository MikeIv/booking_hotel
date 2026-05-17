# Agent workflow — Booking_ukr

## Правила

| Файл | Призначення |
|------|-------------|
| `00-workflow-core` | S/M/L/XL, фази GSD + Superpowers |
| `01-discuss-before-code` | Уточнення до коду |
| `02-planning-gsd` | `.planning/`, хвилі |
| `03-execution-discipline` | Мінімальний diff, Pinia, useApi |
| `04-verify-and-done` | yarn lint + vitest, «готово» |
| `05-context-hygiene` | Вузький контекст |
| `06-fundamental-principles` | Мета-принципи |
| `90-project-context` | Контекст Booking_ukr |
| `nuxt4` | Nuxt 4, Vue 3, стек (alwaysApply) |
| `nuxt4-app-vue` | Сторінки, компоненти (globs) |
| `nuxt4-typescript-quality` | TypeScript, ESLint (globs) |
| `nuxt4-config` | nuxt.config.ts (globs) |
| `nuxt4-nitro-routes` | Nitro routes (globs) |
| `pinia-store-patterns` | Pinia паттерни (globs) |
| `figma-styles` | Figma → SCSS (globs) |
| `figma-value-rounding` | Округлення значень (alwaysApply) |

## Задача агенту

```text
Клас M. Задача: …
Done when: …
```

```bash
cp .planning/brief-template.md .planning/brief.md
```
