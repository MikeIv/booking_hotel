import type { Meta, StoryObj } from "@nuxtjs/storybook";

import DesignSystemIconsView from "./DesignSystemIconsView.vue";

const meta = {
  title: "Дизайн система/Иконки",
  component: DesignSystemIconsView,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof DesignSystemIconsView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Обзор: Story = {
  render: () => ({
    components: { DesignSystemIconsView },
    template: "<DesignSystemIconsView />",
  }),
};
