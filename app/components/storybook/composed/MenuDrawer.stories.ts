import type { Meta, StoryObj } from "@nuxtjs/storybook";

import HeaderMenuDrawer from "~/components/header/menu-drawer.vue";

/**
 * Левая меню-шторка — состав и поведение как на старом сайте отеля
 * (ukraina-hotel: `nav.hamburger`).
 *
 * В шапке шторку открывает бургер; закрытие — крестик, клик по фону,
 * Esc или переход по ссылке. Фон страницы затемняется, скролл блокируется.
 */

const VIEWPORTS = {
  figmaMobile430: {
    name: "Mobile 430 (Figma)",
    styles: { width: "430px", height: "820px" },
  },
  figmaTablet724: {
    name: "Tablet 724 (Figma)",
    styles: { width: "724px", height: "820px" },
  },
  figmaDesktop1366: {
    name: "Desktop 1366 (Figma)",
    styles: { width: "1366px", height: "820px" },
  },
} as const;

const meta = {
  title: "Composed Components/Menu Drawer",
  parameters: {
    layout: "fullscreen",
    viewport: {
      viewports: VIEWPORTS,
      defaultViewport: "figmaMobile430",
    },
    docs: {
      description: {
        component:
          "Открытая левая шторка: 12 разделов сайта отеля, блок «Бронирование» с телефоном, " +
          "переключатели языка и валюты, соцсети и лого. Ширина панели — до 375px, " +
          "фон — токен `--ds-primary-500`.",
      },
    },
  },
  render: () => ({
    components: { HeaderMenuDrawer },
    template: `
      <div style="min-height: 480px; background: var(--a-mainBg, #f8f8f8);">
        <HeaderMenuDrawer :is-open="true" locale="ru" currency="RUB" />
      </div>
    `,
  }),
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Мобайл: шторка на всю ширину экрана.
 */
export const Mobile430: Story = {
  name: "Mobile — 430px",
  parameters: {
    viewport: { defaultViewport: "figmaMobile430" },
  },
};

/**
 * Планшет и десктоп: панель фиксированной ширины 375px, фон затемнён.
 */
export const Desktop1366: Story = {
  name: "Desktop — 1366px",
  parameters: {
    viewport: { defaultViewport: "figmaDesktop1366" },
  },
};
