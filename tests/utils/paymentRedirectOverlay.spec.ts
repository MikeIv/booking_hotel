import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { armPaymentRedirectOverlayCleanup } from "~/utils/paymentRedirectOverlay";

describe("armPaymentRedirectOverlayCleanup", () => {
  beforeEach(() => {
    vi.stubGlobal("document", {
      visibilityState: "visible",
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    vi.stubGlobal("window", {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("вызывает onLeave на pagehide и снимает слушатели", () => {
    const onLeave = vi.fn();
    const addWin = window.addEventListener as ReturnType<typeof vi.fn>;
    const addDoc = document.addEventListener as ReturnType<typeof vi.fn>;

    armPaymentRedirectOverlayCleanup(onLeave);

    expect(addWin).toHaveBeenCalledWith("pagehide", expect.any(Function));
    expect(addDoc).toHaveBeenCalledWith(
      "visibilitychange",
      expect.any(Function),
    );

    const pageHideHandler = addWin.mock.calls.find(
      (call) => call[0] === "pagehide",
    )?.[1] as () => void;

    pageHideHandler();

    expect(onLeave).toHaveBeenCalledTimes(1);
    expect(window.removeEventListener).toHaveBeenCalledWith(
      "pagehide",
      expect.any(Function),
    );
    expect(document.removeEventListener).toHaveBeenCalledWith(
      "visibilitychange",
      expect.any(Function),
    );
  });

  it("вызывает onLeave при visibilityState=hidden", () => {
    const onLeave = vi.fn();
    const addDoc = document.addEventListener as ReturnType<typeof vi.fn>;

    armPaymentRedirectOverlayCleanup(onLeave);

    const visibilityHandler = addDoc.mock.calls.find(
      (call) => call[0] === "visibilitychange",
    )?.[1] as () => void;

    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => "hidden",
    });

    visibilityHandler();

    expect(onLeave).toHaveBeenCalledTimes(1);
  });

  it("повторный cleanup не вызывает onLeave дважды", () => {
    const onLeave = vi.fn();
    const disarm = armPaymentRedirectOverlayCleanup(onLeave);
    disarm();
    disarm();
    expect(onLeave).toHaveBeenCalledTimes(1);
  });
});
