import { describe, it, expect, afterEach } from "vitest";
import { nextTick } from "vue";

import SlideMenu from "~/components/ui/SlideMenu.vue";
import { mountComponent } from "../../utils/test-utils";

const mountMenu = (isOpen = true) =>
  mountComponent(SlideMenu, {
    props: { isOpen },
    slots: { default: '<a href="#accommodation">Размещение</a>' },
  });

describe("SlideMenu.vue — левая меню-шторка", () => {
  afterEach(() => {
    document.documentElement.style.overflow = "";
  });

  it("при открытии рендерит диалог со слотом", () => {
    const wrapper = mountMenu(true);

    const panel = wrapper.find('[data-testid="slide-menu-panel"]');
    expect(panel.exists()).toBe(true);
    expect(panel.attributes("role")).toBe("dialog");
    expect(panel.attributes("aria-modal")).toBe("true");
    expect(panel.attributes("aria-label")).toBe("Меню");
    expect(wrapper.text()).toContain("Размещение");

    wrapper.unmount();
  });

  it("при закрытии не рендерит панель и оверлей", () => {
    const wrapper = mountMenu(false);

    expect(wrapper.find('[data-testid="slide-menu-panel"]').exists()).toBe(
      false,
    );
    expect(wrapper.find('[data-testid="slide-menu-overlay"]').exists()).toBe(
      false,
    );

    wrapper.unmount();
  });

  it("закрывается по крестику", async () => {
    const wrapper = mountMenu(true);

    await wrapper.find('[data-testid="slide-menu-close"]').trigger("click");

    expect(wrapper.emitted("close")).toHaveLength(1);

    wrapper.unmount();
  });

  it("закрывается по клику на оверлей", async () => {
    const wrapper = mountMenu(true);

    await wrapper.find('[data-testid="slide-menu-overlay"]').trigger("click");

    expect(wrapper.emitted("close")).toHaveLength(1);

    wrapper.unmount();
  });

  it("закрывается по Esc", async () => {
    const wrapper = mountMenu(true);

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    await nextTick();

    expect(wrapper.emitted("close")).toHaveLength(1);

    wrapper.unmount();
  });

  it("блокирует скролл при открытии и снимает при закрытии", async () => {
    const wrapper = mountMenu(true);

    expect(document.documentElement.style.overflow).toBe("hidden");

    await wrapper.setProps({ isOpen: false });
    await nextTick();

    expect(document.documentElement.style.overflow).toBe("");

    wrapper.unmount();
  });
});
