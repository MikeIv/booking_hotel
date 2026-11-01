import { useNotifications } from "./useNotifications";

/**
 * Интерфейс для совместимости с PrimeVue Toast API
 */
interface PrimeToastMessage {
  severity?: "success" | "error" | "warn" | "warning" | "info";
  summary?: string;
  detail?: string;
  life?: number;
}

/**
 * Wrapper для совместимости с текущим API PrimeVue Toast
 * Преобразует вызовы toast.add() в новый кастомный toast
 * Переименован из useToast, чтобы избежать конфликта с @nuxt/ui и primevue
 */
export const useNotificationToast = () => {
  const {
    success: showSuccess,
    error: showError,
    warning: showWarning,
    info: showInfo,
  } = useNotifications();

  /**
   * Добавляет уведомление (совместимость с PrimeVue Toast API)
   */
  const add = (message: PrimeToastMessage): void => {
    // Определяем тип уведомления
    let type: "success" | "error" | "warning" | "info" = "info";
    if (message.severity === "success") {
      type = "success";
    } else if (message.severity === "error") {
      type = "error";
    } else if (message.severity === "warn" || message.severity === "warning") {
      type = "warning";
    } else if (message.severity === "info") {
      type = "info";
    }

    // Формируем текст сообщения и заголовок
    // detail -> message, summary -> title
    const messageText = message.detail || message.summary || "";
    const title =
      message.summary && message.detail ? message.summary : undefined;

    // Длительность жизни уведомления
    const duration = message.life ?? 5000;

    // Показываем уведомление
    if (type === "success") {
      showSuccess(messageText, {
        duration,
        title,
      });
    } else if (type === "error") {
      showError(messageText, {
        duration,
        title,
      });
    } else if (type === "warning") {
      showWarning(messageText, {
        duration,
        title,
      });
    } else {
      showInfo(messageText, {
        duration,
        title,
      });
    }
  };

  return {
    add,
  };
};
