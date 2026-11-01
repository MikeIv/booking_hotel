/**
 * Моки для Nuxt composables
 */
import { ref, type Ref } from "vue";
import { vi } from "vitest";

/**
 * Nuxt useState вне Nuxt-рантайма: один ключ → один ref на весь тест-ран.
 * setup.ts стабилизирует через это стор глобальный useState,
 * спеки могут готовить состояние до монтирования компонента.
 */
export const nuxtState = new Map<string, Ref<unknown>>();

export function useStateStub<T>(key: string, init?: () => T): Ref<T> {
  if (!nuxtState.has(key)) {
    nuxtState.set(key, ref(init ? init() : (undefined as unknown)));
  }
  return nuxtState.get(key) as Ref<T>;
}

export const mockRouterPush = vi.fn().mockResolvedValue(undefined);
export const mockRoute: {
  path: string;
  query: Record<string, string | string[] | undefined>;
} = {
  path: "/",
  query: {},
};
export const mockToastAdd = vi.fn();

// Настраиваем моки для Nuxt composables глобально
vi.mock("#app", () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
  useRoute: () => mockRoute,
  useToast: () => ({
    add: mockToastAdd,
  }),
  definePageMeta: vi.fn(),
}));

// Мокируем глобальные auto-imports Nuxt
vi.mock("nuxt/app", () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
  useRoute: () => mockRoute,
  useToast: () => ({
    add: mockToastAdd,
  }),
  definePageMeta: vi.fn(),
}));

// Мокируем Nuxt auto-imports (используется в composables через "#imports")
vi.mock("#imports", () => ({
  useHead: vi.fn(),
  useSeoMeta: vi.fn(),
}));

// Глобальные моки для window/global
if (typeof globalThis !== "undefined") {
  (globalThis as Record<string, unknown>).useRouter = () => ({
    push: mockRouterPush,
  });
  (globalThis as Record<string, unknown>).useRoute = () => mockRoute;
  (globalThis as Record<string, unknown>).useToast = () => ({
    add: mockToastAdd,
  });
  (globalThis as Record<string, unknown>).definePageMeta = vi.fn();
}
