# Booking_ukr — PROJECT

Контекст для Cursor Agent. Оновлюйте при зміні архітектури або API.

## Назначення

Система бронювання готелю «Олімпійський» (Україна). SPA на Nuxt 4 (`ssr: false`). Розділи: пошук номерів, бронювання, підтвердження, особистий кабінет, скасування, мульти-кімнати, сервіси.

## Стек

| Шар | Технологія |
|-----|------------|
| Frontend | Nuxt 4, Vue 3, @nuxt/ui |
| Стан | Pinia (booking, auth) |
| API | useApi → NUXT_PUBLIC_API_BASE |
| Тести | Vitest |
| PM | yarn |

## Ключові модулі

| Шлях | Назначення |
|------|------------|
| `app/stores/booking.ts` | Стан бронювання (пошук, номери, тарифи) |
| `app/stores/auth.ts` | Аутентифікація |
| `app/composables/useApi.ts` | HTTP-клієнт |
| `app/composables/useBooking*.ts` | Логіка змін бронювання |
| `app/components/booking/Booking.vue` | Головний компонент бронювання |
| `app/components/core/` | DatePicker, GuestsSelector, RoomBlock |

## Команди

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

- Pinia: тільки через actions, не мутувати storeToRefs напряму
- API тільки через `useApi`
- Мінімальний diff
