/**
 * Раньше detectBrowserLanguage писал cookie i18n_redirected (часто en).
 * Детект отключён — чистим cookie, чтобы не мешала при будущих изменениях.
 */
export default defineNuxtPlugin(() => {
  const redirected = useCookie<string | null>("i18n_redirected");
  if (redirected.value) {
    redirected.value = null;
  }
});
