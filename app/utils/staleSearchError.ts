/** Ошибка устаревшего search(): отменена более новым запросом. */
export type StaleSearchError = Error & {
  name: "AbortError";
  isStaleSearch: true;
};

export function createStaleSearchError(message = "Aborted"): StaleSearchError {
  const error = new Error(message) as StaleSearchError;
  error.name = "AbortError";
  error.isStaleSearch = true;
  return error;
}

export function isStaleSearchError(error: unknown): error is StaleSearchError {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { isStaleSearch?: unknown }).isStaleSearch === true
  );
}
