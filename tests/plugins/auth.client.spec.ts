import { describe, it, expect, vi, beforeEach } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useAuthStore } from "~/stores/auth";
import { restoreClientAuthSession } from "~/utils/authToken";

const mockFetch = vi.fn();
vi.stubGlobal("$fetch", mockFetch);

const API_BASE = "https://api.example.com";

describe("restoreClientAuthSession (auth.client)", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  function seedUser(token = "old-token") {
    const authStore = useAuthStore();
    authStore.setAuthData(token, {
      id: 1,
      email: "a@b.c",
      name: "Ann",
      surname: "Bee",
      phone: "+7000",
      country: "RU",
    });
    return authStore;
  }

  it("payload.accessToken → setToken, logout не вызван", async () => {
    const authStore = seedUser();
    const logoutSpy = vi.spyOn(authStore, "logout");

    mockFetch.mockResolvedValue({
      success: true,
      payload: { accessToken: "new-access" },
    });

    await restoreClientAuthSession(authStore, `${API_BASE}/v1`);

    expect(authStore.token).toBe("new-access");
    expect(logoutSpy).not.toHaveBeenCalled();
    expect(mockFetch).toHaveBeenCalledWith(
      "/v1/auth/refresh",
      expect.objectContaining({
        method: "POST",
        baseURL: API_BASE,
        credentials: "include",
        // Как useApi.refreshToken: Bearer из стора (может быть протухшим)
        headers: expect.objectContaining({
          Authorization: "Bearer old-token",
          Accept: "application/json",
          "Content-Type": "application/json",
        }),
      }),
    );
  });

  it("payload.token (legacy) → setToken", async () => {
    const authStore = seedUser();

    mockFetch.mockResolvedValue({
      success: true,
      payload: { token: "legacy-token" },
    });

    await restoreClientAuthSession(authStore, API_BASE);

    expect(authStore.token).toBe("legacy-token");
  });

  it("успешный ответ без токена → logout", async () => {
    const authStore = seedUser();
    const logoutSpy = vi.spyOn(authStore, "logout");

    mockFetch.mockResolvedValue({
      success: true,
      payload: {},
    });

    await restoreClientAuthSession(authStore, API_BASE);

    expect(logoutSpy).toHaveBeenCalledOnce();
    expect(authStore.token).toBeNull();
  });

  it("ошибка со status: 401 → logout", async () => {
    const authStore = seedUser();
    const logoutSpy = vi.spyOn(authStore, "logout");

    mockFetch.mockRejectedValue(
      Object.assign(new Error("Unauthorized"), { status: 401 }),
    );

    await restoreClientAuthSession(authStore, API_BASE);

    expect(logoutSpy).toHaveBeenCalledOnce();
    expect(authStore.user).toBeNull();
  });

  it("ошибка с response.status: 403 → logout", async () => {
    const authStore = seedUser();
    const logoutSpy = vi.spyOn(authStore, "logout");

    mockFetch.mockRejectedValue(
      Object.assign(new Error("Forbidden"), {
        response: { status: 403 },
      }),
    );

    await restoreClientAuthSession(authStore, API_BASE);

    expect(logoutSpy).toHaveBeenCalledOnce();
  });

  it("сетевая ошибка без статуса → сессия сохранена", async () => {
    const authStore = seedUser();
    const logoutSpy = vi.spyOn(authStore, "logout");

    mockFetch.mockRejectedValue(new Error("Network Error"));

    await restoreClientAuthSession(authStore, API_BASE);

    expect(logoutSpy).not.toHaveBeenCalled();
    expect(authStore.token).toBe("old-token");
    expect(authStore.user?.email).toBe("a@b.c");
  });

  it("без user в сторе — refresh не вызывается", async () => {
    await restoreClientAuthSession(useAuthStore(), API_BASE);
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
