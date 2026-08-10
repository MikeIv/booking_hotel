import { describe, it, expect, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { mountComponent } from "../../utils/test-utils";

// Глобальный setup мокает компонент — для characterizing-теста нужен оригинал
vi.unmock("~/components/common/RequestErrorMessage.vue");

const {
  default: RequestErrorMessage,
  getRequestErrorContent,
  REQUEST_ERROR_MESSAGES,
} = await import("~/components/common/RequestErrorMessage.vue");

describe("getRequestErrorContent", () => {
  it("возвращает fallback без status", () => {
    expect(getRequestErrorContent()).toEqual({
      summary: "Повторите запрос позже",
      detail: "Временные неполадки. Повторите запрос немного позже",
    });
  });

  it("для 400 подставляет serverMessage в detail", () => {
    expect(getRequestErrorContent(400, "Номеров не найдено")).toEqual({
      summary: REQUEST_ERROR_MESSAGES[400].summary,
      detail: "Номеров не найдено",
    });
  });

  it("для 500 использует mapped detail", () => {
    expect(getRequestErrorContent(500)).toEqual(REQUEST_ERROR_MESSAGES[500]);
  });

  it("для неизвестного status использует serverMessage", () => {
    expect(getRequestErrorContent(418, "I'm a teapot")).toEqual({
      summary: "Повторите запрос позже",
      detail: "I'm a teapot",
    });
  });
});

describe("RequestErrorMessage.vue", () => {
  it("рендерит summary и detail", () => {
    const wrapper = mountComponent(RequestErrorMessage, {
      props: { status: 404 },
    });

    expect(wrapper.attributes("role")).toBe("alert");
    expect(wrapper.text()).toContain(REQUEST_ERROR_MESSAGES[404].summary);
    expect(wrapper.text()).toContain(REQUEST_ERROR_MESSAGES[404].detail);
  });

  it("использует script setup и CSS Modules без scoped", () => {
    const source = readFileSync(
      resolve(process.cwd(), "app/components/common/RequestErrorMessage.vue"),
      "utf8",
    );

    expect(source).toMatch(/<script setup lang="ts">/);
    expect(source).toMatch(/<style module/);
    expect(source).not.toMatch(/defineComponent\s*\(/);
    expect(source).not.toMatch(/<style scoped/);
  });
});
