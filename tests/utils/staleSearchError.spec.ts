import { describe, it, expect } from "vitest";
import {
  createStaleSearchError,
  isStaleSearchError,
} from "~/utils/staleSearchError";

describe("staleSearchError", () => {
  it("createStaleSearchError помечает AbortError флагом isStaleSearch", () => {
    const error = createStaleSearchError();
    expect(error.name).toBe("AbortError");
    expect(error.isStaleSearch).toBe(true);
    expect(isStaleSearchError(error)).toBe(true);
  });

  it("не путает обычный AbortError (таймаут) со stale search", () => {
    const timeout = new Error("Aborted");
    timeout.name = "AbortError";
    expect(isStaleSearchError(timeout)).toBe(false);
  });
});
