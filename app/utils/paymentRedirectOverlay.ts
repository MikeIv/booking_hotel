/**
 * Сбрасывает payment overlay при уходе со страницы (redirect / Back / bfcache).
 * Нужен, потому что createBooking оставляет loading=true при redirect_url.
 */
export function armPaymentRedirectOverlayCleanup(
  onLeave: () => void,
): () => void {
  let disposed = false;

  const cleanup = () => {
    if (disposed) return;
    disposed = true;
    window.removeEventListener("pagehide", cleanup);
    document.removeEventListener("visibilitychange", onVisibilityChange);
    onLeave();
  };

  const onVisibilityChange = () => {
    if (document.visibilityState === "hidden") cleanup();
  };

  window.addEventListener("pagehide", cleanup);
  document.addEventListener("visibilitychange", onVisibilityChange);

  return cleanup;
}
