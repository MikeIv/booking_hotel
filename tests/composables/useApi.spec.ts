import { describe, it, expect, vi, beforeEach } from "vitest";
import { createPinia, setActivePinia } from "pinia";

const mockFetch = vi.fn();

function unauthorized(status = 401) {
  return Object.assign(new Error("Unauthorized"), { status });
}

async function loadUseApi() {
  vi.resetModules();
  vi.stubGlobal("$fetch", mockFetch);
  vi.stubGlobal("useRuntimeConfig", () => ({
    public: { apiBase: "https://api.example.com" },
  }));

  const { useAuthStore } = await import("~/stores/auth");
  vi.stubGlobal("useAuthStore", () => useAuthStore());

  const { useApi } = await import("~/composables/useApi");
  return { useApi, useAuthStore };
}

describe("useApi", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it("401 → ровно один refresh и один повтор запроса", async () => {
    const { useApi, useAuthStore } = await loadUseApi();
    const authStore = useAuthStore();
    authStore.setToken("expired");

    let protectedCalls = 0;
    mockFetch.mockImplementation(async (url: string) => {
      if (String(url).includes("/auth/refresh")) {
        return { success: true, payload: { accessToken: "fresh" } };
      }
      protectedCalls += 1;
      if (protectedCalls === 1) throw unauthorized();
      return { success: true, payload: { ok: true } };
    });

    const { get } = useApi();
    const result = await get<{ ok: boolean }>("/v1/profile");

    expect(result).toEqual({ success: true, payload: { ok: true } });
    expect(authStore.token).toBe("fresh");
    expect(
      mockFetch.mock.calls.filter((call) =>
        String(call[0]).includes("/auth/refresh"),
      ),
    ).toHaveLength(1);
    expect(protectedCalls).toBe(2);
  });

  it("параллельные 401 схлопываются в один refresh", async () => {
    const { useApi, useAuthStore } = await loadUseApi();
    const authStore = useAuthStore();
    authStore.setToken("expired");

    let refreshCalls = 0;
    let releaseRefresh!: () => void;
    const refreshGate = new Promise<void>((resolve) => {
      releaseRefresh = resolve;
    });

    mockFetch.mockImplementation(
      async (url: string, opts?: { headers?: Record<string, string> }) => {
        if (String(url).includes("/auth/refresh")) {
          refreshCalls += 1;
          await refreshGate;
          return { success: true, payload: { accessToken: "shared-fresh" } };
        }

        if (opts?.headers?.Authorization === "Bearer shared-fresh") {
          return { success: true, payload: { id: String(url) } };
        }
        throw unauthorized();
      },
    );

    const { get } = useApi();
    const pending = Promise.all([get("/v1/one"), get("/v1/two")]);

    await vi.waitFor(() => expect(refreshCalls).toBe(1));
    releaseRefresh();

    const [a, b] = await pending;
    expect(a.success).toBe(true);
    expect(b.success).toBe(true);
    expect(refreshCalls).toBe(1);
    expect(authStore.token).toBe("shared-fresh");
  });

  it("провал refresh → logout и ApiError со status 401", async () => {
    const { useApi, useAuthStore } = await loadUseApi();
    const authStore = useAuthStore();
    authStore.setAuthData("expired", {
      id: 1,
      email: "a@b.c",
      name: "A",
      surname: "B",
      phone: "1",
      country: "RU",
    });
    const logoutSpy = vi.spyOn(authStore, "logout");

    mockFetch.mockImplementation(async () => {
      throw unauthorized();
    });

    const { get } = useApi();
    await expect(get("/v1/profile")).rejects.toMatchObject({
      status: 401,
      message: expect.stringMatching(/сессия|авторизац/i),
    });
    expect(logoutSpy).toHaveBeenCalled();
    expect(authStore.token).toBeNull();
  });

  it("abort/timeout маппится в status 408", async () => {
    const { useApi, useAuthStore } = await loadUseApi();
    useAuthStore().setToken("ok");

    mockFetch.mockRejectedValue(
      Object.assign(new Error("The operation was aborted due to timeout"), {
        name: "AbortError",
      }),
    );

    const { get } = useApi();
    await expect(get("/v1/profile")).rejects.toMatchObject({
      status: 408,
      statusText: "Request Timeout",
    });
  });
});
