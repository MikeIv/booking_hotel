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

function createGate() {
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  return { gate, release: () => release() };
}

function abortIfNeeded(signal?: AbortSignal) {
  if (signal?.aborted) {
    const err = new Error("Aborted");
    err.name = "AbortError";
    throw err;
  }
}

/** mock post, который ждёт gate и уважает AbortSignal */
function mockGatedSearch(
  gate: Promise<void>,
  roomCode: string,
  onEnter?: (signal?: AbortSignal) => void,
) {
  mockPost.mockImplementationOnce(async (_url, _body, opts) => {
    const signal = opts?.signal as AbortSignal | undefined;
    onEnter?.(signal);
    await gate;
    abortIfNeeded(signal);
    return searchPayload(roomCode);
  });
}

describe("bookingStore.search races", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("при двух search() в searchResults остаётся ответ последнего", async () => {
    const store = seedSearchableStore();
    const first = createGate();
    const second = createGate();

    let firstEntered = false;
    mockGatedSearch(first.gate, "FIRST", () => {
      firstEntered = true;
    });
    mockGatedSearch(second.gate, "SECOND");

    const firstPromise = store.search();
    await vi.waitFor(() => expect(firstEntered).toBe(true));
    const secondPromise = store.search();

    second.release();
    await expect(secondPromise).resolves.toMatchObject({
      rooms: [expect.objectContaining({ room_type_code: "SECOND" })],
    });

    first.release();
    await expect(firstPromise).rejects.toMatchObject({
      name: "AbortError",
      isStaleSearch: true,
    });

    expect(store.searchResults?.rooms[0]?.room_type_code).toBe("SECOND");
  });

  it("новый search() абортит предыдущий запрос", async () => {
    const store = seedSearchableStore();
    const first = createGate();

    let firstSignal: AbortSignal | undefined;
    mockGatedSearch(first.gate, "FIRST", (signal) => {
      firstSignal = signal;
    });
    mockPost.mockImplementationOnce(async () => searchPayload("SECOND"));

    const firstPromise = store.search();
    await vi.waitFor(() => expect(firstSignal).toBeDefined());

    const secondPromise = store.search();
    expect(firstSignal?.aborted).toBe(true);

    first.release();
    await expect(firstPromise).rejects.toMatchObject({
      name: "AbortError",
      isStaleSearch: true,
    });
    await expect(secondPromise).resolves.toBeTruthy();
  });

  it("устаревший search не гасит loading активного запроса", async () => {
    const store = seedSearchableStore();
    const first = createGate();
    const second = createGate();

    let firstEntered = false;
    mockGatedSearch(first.gate, "FIRST", () => {
      firstEntered = true;
    });
    mockGatedSearch(second.gate, "SECOND");

    const firstPromise = store.search();
    await vi.waitFor(() => expect(firstEntered).toBe(true));

    const secondPromise = store.search();
    expect(store.loading).toBe(true);

    first.release();
    await expect(firstPromise).rejects.toMatchObject({
      name: "AbortError",
      isStaleSearch: true,
    });
    expect(store.loading).toBe(true);

    second.release();
    await secondPromise;
    expect(store.loading).toBe(false);
  });
});
