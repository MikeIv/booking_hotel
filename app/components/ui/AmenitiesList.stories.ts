import type { Meta, StoryObj } from "@nuxtjs/storybook";
import { ref } from "vue";

import AmenitiesList from "./AmenitiesList.vue";

interface AmenityItem {
  title: string;
}

const demoItems: AmenityItem[] = [
  { title: "Бесплатный Wi-Fi" },
  { title: "Бутилированная вода" },
  { title: "Ванна" },
  { title: "Душ" },
  { title: "Кондиционер" },
  { title: "Сейф" },
  { title: "Плотные шторы" },
];

const meta = {
  title: "Simple Components/List",
  component: AmenitiesList,
  parameters: {
    layout: "centered",
  },
  args: {
    items: demoItems,
    expanded: true,
    limit: 4,
    size: "md",
  },
  argTypes: {
    size: {
      control: "radio",
      options: ["md", "lg"],
    },
    limit: {
      control: "number",
    },
    expanded: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof AmenitiesList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Base: Story = {
  args: {
    expanded: true,
    limit: 4,
    size: "md",
  },
  render: (args) => ({
    components: { AmenitiesList },
    setup() {
      return { args };
    },
    template: `
      <div style="width: 760px; max-width: 100%;">
        <AmenitiesList v-bind="args" />
      </div>
    `,
  }),
};

export const CollapsedWithShowMore: Story = {
  args: {
    expanded: false,
    limit: 4,
    size: "md",
  },
  render: (args) => ({
    components: { AmenitiesList },
    setup() {
      const expanded = ref(false);
      const onShowMore = () => {
        expanded.value = true;
      };

      return { args, expanded, onShowMore };
    },
    template: `
      <div style="width: 760px; max-width: 100%;">
        <AmenitiesList
          :items="args.items"
          :limit="args.limit"
          :size="args.size"
          :expanded="expanded"
          @show-more="onShowMore"
        />
      </div>
    `,
  }),
};

export const ExpandedAfterShowMore: Story = {
  args: {
    expanded: true,
    limit: 4,
    size: "lg",
  },
  render: (args) => ({
    components: { AmenitiesList },
    setup() {
      return { args };
    },
    template: `
      <div style="width: 760px; max-width: 100%;">
        <AmenitiesList v-bind="args" />
      </div>
    `,
  }),
};
