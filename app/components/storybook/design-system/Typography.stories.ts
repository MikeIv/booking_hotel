import type { Meta, StoryObj } from "@nuxtjs/storybook";

import DesignSystemTypographyView from "./DesignSystemTypographyView.vue";

const meta = {
  title: "Дизайн система/Типографика",
  component: DesignSystemTypographyView,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof DesignSystemTypographyView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Обзор: Story = {
  render: () => ({
    components: { DesignSystemTypographyView },
    template: "<DesignSystemTypographyView />",
  }),
};
