import type { Meta, StoryObj } from "@nuxtjs/storybook";

import LayoutHeaderAside from "~/components/layout/header-aside.vue";

/**
 * Хэдер внутренних страниц сайта.
 * Отображается на всех страницах кроме главной (main layout).
 *
 * Figma: https://www.figma.com/design/SN6tow6sTWtt6ITX3io7ss/Bronirovanie-R%D0%B0disson-Collection?node-id=4585-1652&m=dev
 *
 * Брейкпоинты по макету:
 * - ≥ 1642px — логотип + горизонтальная навигация + кнопки + поиск + язык
 * - 1024–1641px — бургер + логотип (центр) + кнопки + поиск + язык
 * - < 1024px — строка 1: бургер + логотип (центр) + поиск + язык; строка 2: кнопки
 */

const VIEWPORTS = {
  figmaDesktop1920: {
    name: "Desktop 1920 (Figma)",
    styles: { width: "1920px", height: "120px" },
  },
  figmaDesktop1366: {
    name: "Desktop 1366 (Figma)",
    styles: { width: "1366px", height: "120px" },
  },
  figmaDesktop1024: {
    name: "Desktop 1024 (Figma)",
    styles: { width: "1024px", height: "120px" },
  },
  figmaTablet724: {
    name: "Tablet 724 (Figma)",
    styles: { width: "724px", height: "180px" },
  },
  figmaMobile430: {
    name: "Mobile 430 (Figma)",
    styles: { width: "430px", height: "180px" },
  },
} as const;

const meta = {
  title: "Composed Components/Inner Page Header",
  parameters: {
    layout: "fullscreen",
    viewport: {
      viewports: VIEWPORTS,
      defaultViewport: "figmaDesktop1366",
    },
    docs: {
      description: {
        component:
          "Хэдер внутренних страниц. Используется в лейаутах `default` и `steps`. " +
          "Главная страница использует отдельный `LayoutAside` (без изменений).",
      },
    },
  },
  render: () => ({
    components: { LayoutHeaderAside },
    template: `
      <div style="min-height: 160px; background: var(--a-mainBg, #f8f8f8);">
        <LayoutHeaderAside />
      </div>
    `,
  }),
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Полная версия десктоп-хэдера: логотип слева, горизонтальная навигация,
 * кнопки «Мое бронирование» + «Войти», поиск, языковой пиль.
 * Бургер и SlideMenu скрыты.
 */
export const Desktop1920: Story = {
  name: "Desktop — 1920px (с навигацией)",
  parameters: {
    viewport: { defaultViewport: "figmaDesktop1920" },
  },
};

/**
 * Средний десктоп: навигация скрыта, логотип по центру,
 * бургер открывает SlideMenu.
 */
export const Desktop1366: Story = {
  name: "Desktop — 1366px",
  parameters: {
    viewport: { defaultViewport: "figmaDesktop1366" },
  },
};

/**
 * Минимальный десктоп: то же что 1366px, но в более узком окне.
 */
export const Desktop1024: Story = {
  name: "Desktop — 1024px",
  parameters: {
    viewport: { defaultViewport: "figmaDesktop1024" },
  },
};

/**
 * Планшет: две строки — верхняя (бургер + логотип + поиск + язык),
 * нижняя (кнопки на всю ширину).
 */
export const Tablet724: Story = {
  name: "Tablet — 724px (две строки)",
  parameters: {
    viewport: { defaultViewport: "figmaTablet724" },
  },
};

/**
 * Мобайл: аналогично планшету, в минимальной ширине.
 */
export const Mobile430: Story = {
  name: "Mobile — 430px",
  parameters: {
    viewport: { defaultViewport: "figmaMobile430" },
  },
};
