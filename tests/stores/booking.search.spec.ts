import { describe, it, expect, vi, beforeEach } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useBookingStore } from "~/stores/booking";

const mockPost = vi.fn();

vi.stubGlobal("useApi", () => ({
  get: vi.fn(),
  post: mockPost,
  put: vi.fn(),
  delete: vi.fn(),
}));

function futureDateRange(): [Date, Date] {
  const start = new Date();
  start.setHours(12, 0, 0, 0);
  start.setDate(start.getDate() + 7);
  const end = new Date(start);
  end.setDate(end.getDate() + 2);
  return [start, end];
}

function searchPayload(roomCode: string) {
  return {
    success: true,
    payload: {
      rooms: [
        {
          room_type_code: roomCode,
          title: roomCode,
          min_price: 5000,
          tariffs: [{ rate_plan_code: "BAR", title: "BAR", price: 5000 }],
        },
      ],
      packages: [],
      available: true,
    },
    message: null,
  };
}

function seedSearchableStore() {
  setActivePinia(createPinia());
  const store = useBookingStore();
  store.setDate(futureDateRange());
  store.setGuests({
    rooms: 1,
    roomList: [{ adults: 2, children: 0, childrenAges: [] }],
  });
  return store;
}

describe("bookingStore.search races", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("при двух search() в searchResults остаётся ответ последнего", async () => {
    const store = seedSearchableStore();

    let releaseFirst!: (value: unknown) => void;
    let releaseSecond!: (value: unknown) => void;
    const firstGate = new Promise((resolve) => {
      releaseFirst = resolve;
    });
    const secondGate = new Promise((resolve) => {
      releaseSecond = resolve;
    });

    mockPost.mockImplementationOnce(async (_url, _body, opts) => {
      const signal = opts?.signal as AbortSignal | undefined;
      await firstGate;
      if (signal?.aborted) {
        throw Object.assign(new Error("Aborted"), { name: "AbortError" });
      }
      return searchPayload("FIRST");
    });
    mockPost.mockImplementationOnce(async (_url, _body, opts) => {
      const signal = opts?.signal as AbortSignal | undefined;
      await secondGate;
      if (signal?.aborted) {
        throw Object.assign(new Error("Aborted"), { name: "AbortError" });
      }
      return searchPayload("SECOND");
    });

    const firstPromise = store.search();
    const secondPromise = store.search();

    releaseSecond(undefined);
    await expect(secondPromise).resolves.toMatchObject({
      rooms: [expect.objectContaining({ room_type_code: "SECOND" })],
    });

    releaseFirst(undefined);
    await expect(firstPromise).rejects.toMatchObject({ name: "AbortError" });

    expect(store.searchResults?.rooms[0]?.room_type_code).toBe("SECOND");
  });

  it("новый search() абортит предыдущий запрос", async () => {
    const store = seedSearchableStore();

    let firstSignal: AbortSignal | undefined;
    let releaseFirst!: () => void;
    const firstGate = new Promise<void>((resolve) => {
      releaseFirst = resolve;
    });

    mockPost.mockImplementationOnce(async (_url, _body, opts) => {
      firstSignal = opts?.signal as AbortSignal | undefined;
      await firstGate;
      if (firstSignal?.aborted) {
        throw Object.assign(new Error("Aborted"), { name: "AbortError" });
      }
      return searchPayload("FIRST");
    });
    mockPost.mockImplementationOnce(async () => searchPayload("SECOND"));

    const firstPromise = store.search();
    await vi.waitFor(() => expect(firstSignal).toBeDefined());

    const secondPromise = store.search();
    expect(firstSignal?.aborted).toBe(true);

    releaseFirst();
    await expect(firstPromise).rejects.toMatchObject({ name: "AbortError" });
    await expect(secondPromise).resolves.toBeTruthy();
  });

  it("устаревший search не гасит loading активного запроса", async () => {
    const store = seedSearchableStore();

    let firstEntered = false;
    let releaseFirst!: () => void;
    let releaseSecond!: () => void;
    const firstGate = new Promise<void>((resolve) => {
      releaseFirst = resolve;
    });
    const secondGate = new Promise<void>((resolve) => {
      releaseSecond = resolve;
    });

    mockPost.mockImplementationOnce(async (_url, _body, opts) => {
      firstEntered = true;
      await firstGate;
      if ((opts?.signal as AbortSignal | undefined)?.aborted) {
        throw Object.assign(new Error("Aborted"), { name: "AbortError" });
      }
      return searchPayload("FIRST");
    });
    mockPost.mockImplementationOnce(async (_url, _body, opts) => {
      await secondGate;
      if ((opts?.signal as AbortSignal | undefined)?.aborted) {
        throw Object.assign(new Error("Aborted"), { name: "AbortError" });
      }
      return searchPayload("SECOND");
    });

    const firstPromise = store.search();
    await vi.waitFor(() => expect(firstEntered).toBe(true));

    const secondPromise = store.search();
    expect(store.loading).toBe(true);

    // Первый завершается как aborted, пока второй ещё в полёте
    releaseFirst();
    await expect(firstPromise).rejects.toMatchObject({ name: "AbortError" });
    expect(store.loading).toBe(true);

    releaseSecond();
    await secondPromise;
    expect(store.loading).toBe(false);
  });
});
