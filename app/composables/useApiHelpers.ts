import type { ApiError } from "~/composables/useApi";

export const isApiError = (error: unknown): error is ApiError => {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    !(error instanceof Error)
  );
};

export const getErrorMessage = (
  error: unknown,
  defaultMessage?: string,
): string => {
  if (isApiError(error) && error.message) {
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return defaultMessage ?? "Произошла неизвестная ошибка";
};

export const BOOKING_ACCESS_DENIED_MESSAGE = "Доступ к бронированию запрещено";

export const getErrorStatus = (error: unknown): number | undefined =>
  (error as { status?: number }).status;

export const isBookingAccessDeniedError = (error: unknown): boolean =>
  getErrorStatus(error) === 403;

export const useApiHelpers = () => {
  return {
    isApiError,
    getErrorMessage,
  };
};
