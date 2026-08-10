import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useAuthStore } from "~/stores/auth";
import { restoreClientAuthSession } from "~/utils/authToken";

const mockFetch = vi.fn();

vi.stubGlobal("$fetch", mockFetch);

describe("restoreClientAuthSession", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  function seedUser() {
    const authStore = useAuthStore();
    authStore.setAuthData("old-token", {
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

    await restoreClientAuthSession(authStore, "https://api.example.com/v1");

    expect(authStore.token).toBe("new-access");
    expect(logoutSpy).not.toHaveBeenCalled();
    expect(mockFetch).toHaveBeenCalledWith(
      "/v1/auth/refresh",
      expect.objectContaining({
        method: "POST",
        baseURL: "https://api.example.com",
        credentials: "include",
      }),
    );
  });

  it("payload.token (legacy) → setToken", async () => {
    const authStore = seedUser();

    mockFetch.mockResolvedValue({
      success: true,
      payload: { token: "legacy-token" },
    });

    await restoreClientAuthSession(authStore, "https://api.example.com");

    expect(authStore.token).toBe("legacy-token");
  });

  it("ошибка со status: 401 → logout", async () => {
    const authStore = seedUser();
    const logoutSpy = vi.spyOn(authStore, "logout");

    mockFetch.mockRejectedValue(
      Object.assign(new Error("Unauthorized"), { status: 401 }),
    );

    await restoreClientAuthSession(authStore, "https://api.example.com");

    expect(logoutSpy).toHaveBeenCalledOnce();
    expect(authStore.token).toBeNull();
    expect(authStore.user).toBeNull();
  });

  it("сетевая ошибка без статуса → сессия сохранена", async () => {
    const authStore = seedUser();
    const logoutSpy = vi.spyOn(authStore, "logout");

    mockFetch.mockRejectedValue(new Error("Network Error"));

    await restoreClientAuthSession(authStore, "https://api.example.com");

    expect(logoutSpy).not.toHaveBeenCalled();
    expect(authStore.token).toBe("old-token");
    expect(authStore.user?.email).toBe("a@b.c");
  });

  it("без user в сторе — refresh не вызывается", async () => {
    const authStore = useAuthStore();

    await restoreClientAuthSession(authStore, "https://api.example.com");

    expect(mockFetch).not.toHaveBeenCalled();
  });
});
