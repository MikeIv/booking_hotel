# Аудит иконок проекта

## Источники

- Основной источник: `app/assets/icons` (кастомная коллекция, доступна как `i-*`)
- Внешние наборы через `@nuxt/icon`: `heroicons`, `mdi`, `simple-icons`
- SVG вне коллекции иконок:
  - `app/assets/images` (контент/иллюстрации)
  - `public/images` (контентные SVG)

## Иконки из `app/assets/icons`

- Всего файлов: 24
- Основные используемые UI-иконки:
  - `i-calendar`, `i-phone`, `i-close`, `i-chevron-down`
  - `i-persons`, `i-square`, `i-dash-square`
  - `i-payment`, `i-cancellation`, `i-fork-knife`
  - `i-arrow-back`, `i-trash`, `i-gift-line`, `i-inform-circle`
- Brand/social/doc:
  - `i-telegram`, `i-vk`, `i-pdf`

## Выявленные проблемы до стандартизации

- Смешение наборов: проектные `i-*` + `heroicons` + `mdi`
- Смешение стилей `stroke` и `filled` в UI-зонах
- Часть SVG с нестандартными размерами (`6x6`, `23x17`, `20x14`, `117x8` и т.д.)
- Точечные прямые импорты SVG-компонентов вместо единого `UIcon`

## Выполнено во втором проходе

- Заменены `i-heroicons-chevron-*` на проектные `i-chevron-down` / `i-chevron-up`
- Заменены `mdi:eye` / `mdi:eye-off` на проектные `i-eye` / `i-eye-off`
- Нормализованы размеры и цвет ключевых UI-иконок:
  - `arrow-back` -> `24x24`
  - `payment`, `cancellation`, `square`, `persons` -> `20x20`
  - `trash` -> `24x24`
  - `gift-line` -> `20x20` + `currentColor`
- Убран анимированный chevron, заменен на статичный DS-вариант

## Принятые правила

- UI-иконки: только размеры `16/20/24`
- Единый базовый стиль UI-иконок: `outline/stroke`
- Цвет через `currentColor`
- Brand/illustrative иконки ведутся отдельно от UI-набора

## Figma размещение

- Раздел: `Design System -> Foundations -> Icons`
- Обязательный frame: `Used in Project`
- Структура: секции `16`, `20`, `24`, затем категории `Brand` и `Illustrative`
