import { restoreClientAuthSession } from "~/utils/authToken";

/**
 * При старте SPA тихо восстанавливает access-токен через httpOnly refresh cookie.
 * Запускается до route-middleware, поэтому auth-guard видит корректный isAuthenticated.
 */
export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore();
  const config = useRuntimeConfig();
  await restoreClientAuthSession(authStore, config.public.apiBase as string);
});
