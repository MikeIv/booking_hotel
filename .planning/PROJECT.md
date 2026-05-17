# Booking_ukr — PROJECT

Контекст для Cursor Agent. Обновляйте при смене архитектуры или API.

## Назначение

Система бронирования отеля (Grand). SPA на Nuxt 4 (`ssr: false`). Разделы: поиск номеров, бронирование, подтверждение, личный кабинет, отмена, мульти-комнаты, сервисы.

## Стек

| Слой | Технология |
|------|------------|
| Frontend | Nuxt 4, Vue 3, @nuxt/ui |
| Состояние | Pinia (booking, auth) |
| API | useApi → NUXT_PUBLIC_API_BASE |
| Тесты | Vitest |
| PM | yarn |

## Ключевые модули

| Путь | Назначение |
|------|------------|
| `app/stores/booking.ts` | Состояние бронирования (поиск, номера, тарифы) |
| `app/stores/auth.ts` | Аутентификация |
| `app/composables/useApi.ts` | HTTP-клиент |
| `app/composables/useBooking*.ts` | Логика изменений бронирования |
| `app/components/booking/Booking.vue` | Главный компонент бронирования |
| `app/components/core/` | DatePicker, GuestsSelector, RoomBlock |

## Команды

```bash
yarn dev
yarn build
yarn lint
yarn test
```

## Cursor rules

- Workflow: `.cursor/rules/00` … `06`
- Стек: `nuxt4.mdc`, `nuxt4-app-vue.mdc`, `pinia-store-patterns.mdc`
- Figma: `figma-styles.mdc`, `figma-value-rounding.mdc`
- Контекст: `90-project-context.mdc`

## Ограничения для агента

- Pinia: только через actions, не мутировать storeToRefs напрямую
- API только через `useApi`
- Минимальный diff
