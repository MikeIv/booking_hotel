<script setup lang="ts">
import { computed, defineAsyncComponent, type Component, type DeepReadonly } from "vue";
import type { NotificationType, Notification, CustomIcon } from "~/composables/useNotifications";

/**
 * Пропсы компонента NotificationToast
 */
export interface NotificationToastProps {
  /** Позиция контейнера уведомлений */
  position?:
    | "top-right"
    | "top-left"
    | "bottom-right"
    | "bottom-left"
    | "top-center"
    | "bottom-center";
  /** Максимальная ширина уведомления */
  maxWidth?: string;
  /** Минимальная ширина уведомления */
  minWidth?: string;
  /** Z-index контейнера */
  zIndex?: number;
  /** Список уведомлений для отображения */
  notifications: DeepReadonly<Notification[]>;
  /** Функция для удаления уведомления по ID */
  onRemove: (id: string) => void;
  /** Целевой элемент для Teleport (по умолчанию 'body') */
  teleportTo?: string | HTMLElement;
  /** Кастомные иконки для типов уведомлений */
  customIcons?: Partial<Record<NotificationType, CustomIcon>>;
  /** Текст для aria-label контейнера */
  containerAriaLabel?: string;
  /** Текст для aria-label кнопки закрытия */
  closeButtonAriaLabel?: string;
}

const props = withDefaults(defineProps<NotificationToastProps>(), {
  position: "top-right",
  maxWidth: "500px",
  minWidth: "300px",
  zIndex: 50,
  teleportTo: "body",
  customIcons: () => ({}),
  containerAriaLabel: "Уведомления",
  closeButtonAriaLabel: "Закрыть уведомление",
});

// Иконки по умолчанию для типов уведомлений
const defaultIcons: Record<NotificationType, Component> = {
  success: defineAsyncComponent(() => import("~/components/NotificationIcons/Success.vue")),
  error: defineAsyncComponent(() => import("~/components/NotificationIcons/Error.vue")),
  warning: defineAsyncComponent(() => import("~/components/NotificationIcons/Warning.vue")),
  info: defineAsyncComponent(() => import("~/components/NotificationIcons/Info.vue")),
};

/**
 * Получает компонент иконки для типа уведомления
 */
const getIcon = (type: NotificationType): Component => {
  return props.customIcons?.[type]?.component || defaultIcons[type];
};

// Мемоизация классов для оптимизации
const typeClassMap = {
  success: "notification-success",
  error: "notification-error",
  warning: "notification-warning",
  info: "notification-info",
} as const;

const iconClassMap = {
  success: "notification-icon-success",
  error: "notification-icon-error",
  warning: "notification-icon-warning",
  info: "notification-icon-info",
} as const;

const getNotificationClasses = (notification: Notification): string => {
  const baseClasses = "border notification-toast";
  const typeClass = typeClassMap[notification.type];
  const customClass = notification.customClass
    ? ` ${notification.customClass}`
    : "";
  return `${baseClasses} ${typeClass}${customClass}`;
};

const getIconClasses = (type: NotificationType): string => {
  return iconClassMap[type];
};

const getPositionClasses = computed(() => {
  const positions = {
    "top-right": "notification-container-top-right",
    "top-left": "notification-container-top-left",
    "bottom-right": "notification-container-bottom-right",
    "bottom-left": "notification-container-bottom-left",
    "top-center": "notification-container-top-center",
    "bottom-center": "notification-container-bottom-center",
  };
  return positions[props.position];
});

const getAriaLive = (type: NotificationType): "polite" | "assertive" => {
  return type === "error" ? "assertive" : "polite";
};

const getAnimationClass = computed(() => {
  if (props.position === "top-center") {
    return "animate-slide-in-center-top";
  }
  if (props.position === "bottom-center") {
    return "animate-slide-in-center-bottom";
  }
  return "animate-slide-in";
});

/**
 * Обработчик клика по уведомлению
 */
const handleNotificationClick = (notification: Notification) => {
  if (!notification.persistent) {
    props.onRemove(notification.id);
  }
};

/**
 * Обработчик клика по действию
 */
const handleActionClick = async (
  notification: Notification,
  actionIndex: number,
) => {
  const action = notification.actions?.[actionIndex];
  if (action) {
    try {
      await action.action();
    } catch (error) {
      if (import.meta.dev) {
        console.error("Ошибка при выполнении действия уведомления:", error);
      }
    }
    // Автоматически закрываем уведомление после действия
    props.onRemove(notification.id);
  }
};
</script>

<template>
  <Teleport :to="props.teleportTo">
    <div
      :class="['notification-container', getPositionClasses]"
      :data-position="props.position"
      :style="{ zIndex: props.zIndex }"
      role="region"
      :aria-label="props.containerAriaLabel"
      aria-live="polite"
      aria-atomic="false"
    >
      <TransitionGroup name="notification" tag="div" class="notification-list">
        <article
          v-for="notification in props.notifications"
          :key="notification.id"
          :class="[
            getNotificationClasses(notification),
            'notification-item',
            getAnimationClass,
          ]"
          :style="{
            minWidth: props.minWidth,
            maxWidth: props.maxWidth,
          }"
          role="alert"
          :aria-live="getAriaLive(notification.type)"
          :aria-atomic="true"
          @click="handleNotificationClick(notification)"
        >
          <div class="notification-content">
            <!-- Иконка типа уведомления -->
            <div
              :class="[
                getIconClasses(notification.type),
                'notification-icon-wrapper',
              ]"
              aria-hidden="true"
            >
              <component
                :is="getIcon(notification.type)"
                class="notification-icon"
                :style="
                  props.customIcons?.[notification.type]?.size
                    ? {
                        width: props.customIcons[notification.type]!.size,
                        height: props.customIcons[notification.type]!.size,
                      }
                    : undefined
                "
              />
            </div>

            <!-- Контент уведомления -->
            <div class="notification-body">
              <!-- Заголовок (если есть) -->
              <h3 v-if="notification.title" class="notification-title">
                {{ notification.title }}
              </h3>

              <!-- Сообщение -->
              <div class="notification-message">
                <p v-if="!notification.html">{{ notification.message }}</p>
                <div v-else v-html="notification.message" />
              </div>

              <!-- Действия (если есть) -->
              <div
                v-if="notification.actions && notification.actions.length > 0"
                class="notification-actions"
              >
                <button
                  v-for="(action, index) in notification.actions"
                  :key="index"
                  :class="[
                    'notification-action-button',
                    action.variant === 'primary'
                      ? 'notification-action-primary'
                      : 'notification-action-secondary',
                  ]"
                  @click.stop="handleActionClick(notification, index)"
                >
                  {{ action.label }}
                </button>
              </div>
            </div>

            <!-- Кнопка закрытия -->
            <button
              class="notification-close-button"
              :aria-label="props.closeButtonAriaLabel"
              @click.stop="props.onRemove(notification.id)"
            >
              <svg
                class="notification-close-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </article>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
/* Контейнер уведомлений */
.notification-container {
  position: fixed;
  pointer-events: none;
  z-index: var(--notification-z-index, 50);
}

.notification-list {
  display: flex;
  flex-direction: column;
  gap: var(--notification-gap, 0.5rem);
}

/* Позиционирование контейнера */
.notification-container-top-right {
  top: var(--notification-offset, 1rem);
  right: var(--notification-offset, 1rem);
}

.notification-container-top-left {
  top: var(--notification-offset, 1rem);
  left: var(--notification-offset, 1rem);
}

.notification-container-bottom-right {
  bottom: var(--notification-offset, 1rem);
  right: var(--notification-offset, 1rem);
}

.notification-container-bottom-left {
  bottom: var(--notification-offset, 1rem);
  left: var(--notification-offset, 1rem);
}

.notification-container-top-center {
  top: var(--notification-offset, 1rem);
  left: 50%;
  transform: translateX(-50%);
}

.notification-container-bottom-center {
  bottom: var(--notification-offset, 1rem);
  left: 50%;
  transform: translateX(-50%);
}

/* Элемент уведомления */
.notification-item {
  position: relative;
  pointer-events: auto;
  display: flex;
  border-radius: var(--notification-border-radius, 0.5rem);
  padding: var(--notification-padding, 1rem);
  box-shadow: var(
    --notification-shadow,
    0 10px 15px -3px rgb(0 0 0 / 10%),
    0 4px 6px -2px rgb(0 0 0 / 5%)
  );
  border: 1px solid;
  backdrop-filter: blur(4px);
  cursor: pointer;
}

/* Стили для типов уведомлений - высокая специфичность без !important */

/* Используются универсальные CSS переменные с fallback значениями */
.notification-item.notification-toast.notification-success {
  background-color: rgb(
    var(--notification-success-bg-rgb, var(--a-success-bg-rgb, 20, 83, 45)),
    0.9
  );
  border-color: var(
    --notification-success-border,
    var(--a-success-border, #15803d)
  );
  color: var(--notification-success-text, var(--a-success-text, #dcfce7));
}

.notification-item.notification-toast.notification-error {
  background-color: rgb(
    var(--notification-error-bg-rgb, var(--a-error-bg-rgb, 127, 29, 29)),
    0.9
  );
  border-color: var(
    --notification-error-border,
    var(--a-error-border, #b91c1c)
  );
  color: var(--notification-error-text, var(--a-error-text, #fee2e2));
}

.notification-item.notification-toast.notification-warning {
  background-color: rgb(
    var(--notification-warning-bg-rgb, var(--a-warning-bg-rgb, 120, 53, 15)),
    0.9
  );
  border-color: var(
    --notification-warning-border,
    var(--a-warning-border, #a16207)
  );
  color: var(--notification-warning-text, var(--a-warning-text, #fef3c7));
}

.notification-item.notification-toast.notification-info {
  background-color: rgb(
    var(--notification-info-bg-rgb, var(--a-info-bg-rgb, 30, 58, 138)),
    0.9
  );
  border-color: var(--notification-info-border, var(--a-info-border, #1e40af));
  color: var(--notification-info-text, var(--a-info-text, #dbeafe));
}

/* Контент уведомления */
.notification-content {
  display: flex;
  align-items: flex-start;
  gap: var(--notification-content-gap, 0.75rem);
  width: 100%;
}

/* Иконка */
.notification-icon-wrapper {
  flex-shrink: 0;
  margin-top: var(--notification-icon-margin-top, 0.125rem);
}

.notification-icon {
  width: var(--notification-icon-size, 1.25rem);
  height: var(--notification-icon-size, 1.25rem);
}

/* Стили иконок для типов уведомлений - высокая специфичность без !important */

/* Используются универсальные CSS переменные с fallback значениями */
.notification-icon-wrapper.notification-icon-success {
  color: var(--notification-success-icon, var(--a-success-icon, #4ade80));
}

.notification-icon-wrapper.notification-icon-error {
  color: var(--notification-error-icon, var(--a-error-icon, #f87171));
}

.notification-icon-wrapper.notification-icon-warning {
  color: var(--notification-warning-icon, var(--a-warning-icon, #facc15));
}

.notification-icon-wrapper.notification-icon-info {
  color: var(--notification-info-icon, var(--a-info-icon, #60a5fa));
}

/* Тело уведомления */
.notification-body {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-size: var(--notification-title-font-size, 0.875rem);
  font-weight: var(--notification-title-font-weight, 600);
  margin-bottom: var(--notification-title-margin-bottom, 0.25rem);
  overflow-wrap: break-word;
}

.notification-message {
  font-size: var(--notification-message-font-size, 0.8125rem);
  font-weight: var(--notification-message-font-weight, 400);
  overflow-wrap: break-word;
  white-space: pre-line;
}

/* Действия */
.notification-actions {
  display: flex;
  gap: var(--notification-actions-gap, 0.5rem);
  margin-top: var(--notification-actions-margin-top, 0.75rem);
}

.notification-action-button {
  padding: var(--notification-action-padding-y, 0.375rem)
    var(--notification-action-padding-x, 0.75rem);
  font-size: var(--notification-action-font-size, 0.75rem);
  font-weight: var(--notification-action-font-weight, 500);
  border-radius: var(--notification-action-border-radius, 0.25rem);
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
  border: none;
  cursor: pointer;
}

.notification-action-primary {
  background-color: var(
    --notification-action-primary-bg,
    rgb(255 255 255 / 20%)
  );
  color: var(--notification-action-primary-text, var(--a-white, #fff));
}

.notification-action-primary:hover {
  background-color: var(
    --notification-action-primary-bg-hover,
    rgb(255 255 255 / 30%)
  );
}

.notification-action-secondary {
  background-color: var(
    --notification-action-secondary-bg,
    rgb(255 255 255 / 10%)
  );
  color: var(--notification-action-secondary-text, rgb(255 255 255 / 90%));
}

.notification-action-secondary:hover {
  background-color: var(
    --notification-action-secondary-bg-hover,
    rgb(255 255 255 / 20%)
  );
}

/* Кнопка закрытия */
.notification-close-button {
  flex-shrink: 0;
  color: var(--notification-close-color, rgb(156 163 175 / 100%));
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;
  border-radius: var(--notification-close-border-radius, 0.25rem);
}

.notification-close-button:hover {
  color: var(--notification-close-color-hover, var(--a-white, #fff));
}

.notification-close-button:focus {
  outline: none;
}

.notification-close-button:focus-visible {
  outline: 2px solid
    var(--notification-close-focus-ring, rgb(255 255 255 / 50%));
  outline-offset: 2px;
}

.notification-close-icon {
  width: var(--notification-close-icon-size, 1.25rem);
  height: var(--notification-close-icon-size, 1.25rem);
}

/* Анимации переходов */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.notification-move {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Анимация появления в зависимости от позиции */
[data-position="top-right"] .notification-enter-from,
[data-position="top-right"] .notification-leave-to {
  transform: translateX(100%);
}

[data-position="top-left"] .notification-enter-from,
[data-position="top-left"] .notification-leave-to {
  transform: translateX(-100%);
}

[data-position="bottom-right"] .notification-enter-from,
[data-position="bottom-right"] .notification-leave-to {
  transform: translateX(100%);
}

[data-position="bottom-left"] .notification-enter-from,
[data-position="bottom-left"] .notification-leave-to {
  transform: translateX(-100%);
}

[data-position="top-center"] .notification-enter-from,
[data-position="top-center"] .notification-leave-to {
  transform: translateY(-100%) translateX(-50%);
}

[data-position="bottom-center"] .notification-enter-from,
[data-position="bottom-center"] .notification-leave-to {
  transform: translateY(100%) translateX(-50%);
}

/* Keyframe анимации */
@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateX(100%);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slide-in-center-top {
  from {
    opacity: 0;
    transform: translateY(-100%) translateX(-50%);
  }

  to {
    opacity: 1;
    transform: translateY(0) translateX(-50%);
  }
}

@keyframes slide-in-center-bottom {
  from {
    opacity: 0;
    transform: translateY(100%) translateX(-50%);
  }

  to {
    opacity: 1;
    transform: translateY(0) translateX(-50%);
  }
}

.animate-slide-in {
  animation: slide-in 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.animate-slide-in-center-top {
  animation: slide-in-center-top 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.animate-slide-in-center-bottom {
  animation: slide-in-center-bottom 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Улучшенная доступность для фокуса */
button:focus-visible {
  outline: 2px solid currentcolor;
  outline-offset: 2px;
}
</style>
