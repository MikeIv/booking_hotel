# Grand — бронирование (Украина)

## Деплой

**Develop:** `git push origin develop` — CI выкатывает стенд https://ukraina-web.grandfs-develop.ru.

**Production:** `git push origin master` — CI собирает Docker-образ `prod-<short-sha>`, деплоит `ukraina-prod` (http://booking.ukraina-hotel.ru) и ставит git-tag `v0.0.N` (следующий после последнего `v0.0.*`). Ручные теги больше не нужны.

Пайплайн на git-tag не запускается: тег — только метка релиза, повторного деплоя нет. Теги `v*` защищены правилом Protected tags.

```bash
# dev
git push origin develop

# prod
git checkout master
git merge develop
git push origin master
```

После успешного prod-деплоя в репозитории появится тег `v0.0.N`. Образ в registry — `prod-<short-sha>`, плавающий `:prod` указывает на последнюю выкатку.

Веб-приложение бронирования на базе Nuxt 4 (отдельная копия кодовой базы Varvarka для второго отеля). Поведение и API на этапе ввода совпадают с исходником; отличия — через `NUXT_PUBLIC_API_BASE`, домены `@nuxt/image` и контент/брендинг в приложении.

## Репозиторий

После копирования remote `hub` удалён; бывший `origin` переименован в `upstream` (исходный GitLab Varvarka). Добавьте свой репозиторий:

```bash
git remote add origin <url-нового-проекта>
```

## Технологии

- **Framework:** Nuxt 4
- **Language:** TypeScript
- **UI:** Vue 3, Nuxt UI, PrimeVue
- **State Management:** Pinia
- **Styling:** SCSS, CSS Modules, Tailwind CSS
- **Internationalization:** @nuxtjs/i18n
- **Testing:** Vitest (unit), Playwright (e2e)
- **Package Manager:** Yarn

## Требования

- Node.js: `^22.19.0 || ^24.11.0 || >=26.0.0`
- Yarn: `1.22.22+`

## Установка

Установите зависимости:

```bash
yarn install
```

## Запуск

### Разработка

Запуск dev-сервера на `http://localhost:3000`:

```bash
yarn dev
```

### Storybook (витрина компонентов)

Отдельный dev-сервер на `http://localhost:6006`:

```bash
yarn storybook
# или короткий алиас:
yarn stb
```

Подробнее: [docs/storybook.md](./docs/storybook.md).

### Сборка

```bash
yarn build
```

### Предпросмотр production сборки

```bash
yarn preview
```

### Генерация статического сайта

```bash
yarn generate
```

## Доступные команды

### Линтинг и форматирование

```bash
# Проверка кода
yarn lint

# Автоисправление ошибок
yarn lint:fix

# Форматирование кода
yarn format

# Проверка стилей
yarn stylelint

# Автоисправление стилей
yarn stylelint:fix
```

### Тестирование

```bash
# Unit тесты (Vitest)
yarn test

# Unit тесты в watch режиме
yarn test:watch

# Unit тесты с покрытием
yarn test:coverage

# Unit тесты с UI
yarn test:ui
```

Подробнее о тестировании: [tests/README.md](./tests/README.md)

## Структура проекта

```
app/
├── assets/          # Статические ресурсы (стили, иконки, изображения, шрифты)
├── components/      # Vue компоненты
│   ├── booking/     # Компоненты бронирования
│   ├── common/      # Общие компоненты
│   ├── core/        # Базовые компоненты
│   ├── header/      # Компоненты шапки
│   ├── layout/      # Компоненты макета
│   ├── main/        # Компоненты главной страницы
│   └── ui/          # UI компоненты
├── composables/     # Композаблы (автоимпорт)
├── layouts/         # Макеты страниц
├── middleware/      # Middleware
├── pages/           # Страницы (автоматический роутинг)
├── plugins/         # Nuxt плагины
├── stores/          # Pinia stores
├── types/           # TypeScript типы
└── utils/           # Утилиты

docs/                # Документация проекта
tests/               # Тесты (unit и e2e)
i18n/                # Файлы локализации
```

## Работа с Git

### Создание ветки

Создайте ветку для работы:

```bash
git checkout -b <тип>/<короткое-описание-через-дефисы>
```

**Шаблон названия ветки:**
```
<тип>/<короткое-описание-через-дефисы>
```

**Основные префиксы:**
- `feat/` - для новой функциональности
- `fix/` - для исправления багов
- `refactor/` - для рефакторинга кода

**Примеры:**
- `feat/booking-form-validation`
- `fix/login-button-color`
- `refactor/api-helpers`

### Рабочий процесс

1. **Перед коммитом** - проверьте и исправьте код:

```bash
yarn lint:fix
yarn stylelint:fix
```

2. **Добавьте изменения:**

```bash
git add .
```

3. **Создайте коммит** с описательным сообщением:

```bash
# Для новой функциональности
git commit -m "feat: описание изменения"

# Для исправления багов
git commit -m "fix: описание исправления"

# Для рефакторинга
git commit -m "refactor: описание рефакторинга"
```

4. **Отправьте изменения:**

```bash
git push origin <название-вашей-ветки>
```

## Документация

📖 **Подробная документация проекта:** [docs/README.md](./docs/README.md)

Включает:
- Документацию компонентов
- Систему стилей и дизайн-систему
- Руководство по работе с CSS Modules
- Информацию о переменных, breakpoints и z-index
- Работу с иконками

## Полезные ссылки

- [Nuxt 4 Documentation](https://nuxt.com/docs/getting-started/introduction)
- [Vue 3 Documentation](https://vuejs.org/)
- [Nuxt UI Documentation](https://ui.nuxt.com/)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [Deployment Documentation](https://nuxt.com/docs/getting-started/deployment)
