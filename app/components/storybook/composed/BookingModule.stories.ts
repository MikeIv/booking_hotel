import type { Meta, StoryObj } from "@nuxtjs/storybook";
import { computed } from "vue";

import Input from "~/components/ui/Input.vue";
import Select from "~/components/ui/Select.vue";
import Button from "~/components/ui/Button.vue";

type BookingStoryArgs = {
  mode: "home" | "inner";
  viewport: "desktop" | "tablet" | "mobile";
};

const meta = {
  title: "Composed Components/Booking Module",
  parameters: {
    layout: "centered",
  },
  render: (args: BookingStoryArgs) => ({
    components: { Input, Select, Button },
    setup() {
      const widthMap: Record<BookingStoryArgs["viewport"], number> = {
        desktop: 1560,
        tablet: 1000,
        mobile: 760,
      };
      const hostWidth = computed(() => widthMap[args.viewport]);
      const buttonVariant = computed(() =>
        args.mode === "inner" ? "danger" : "primary",
      );
      const moduleBg = computed(() =>
        args.mode === "inner"
          ? "var(--a-primaryBg)"
          : "var(--a-bookingModuleBg)",
      );
      const isDesktop = computed(() => args.viewport === "desktop");
      return { args, hostWidth, buttonVariant, moduleBg, isDesktop };
    },
    template: `
      <div style="padding: var(--a-space-3); background: var(--a-mainBg);">
        <div
          :style="{
            width: hostWidth + 'px',
            maxWidth: '100%',
            margin: '0 auto',
            background: moduleBg,
            borderRadius: 'var(--a-borderR--booking-module)',
            boxShadow: 'var(--a-shadow-booking-module)',
            padding: isDesktop
              ? 'var(--a-space-4) var(--a-space-3)'
              : 'calc(var(--a-space-2) + var(--ds-space-025)) var(--a-space-2)'
          }"
        >
          <div
            :style="{
              display: 'grid',
              gridTemplateColumns:
                args.viewport === 'desktop'
                  ? 'minmax(0, 1.05fr) minmax(0, 0.9fr) minmax(0, 0.9fr) minmax(0, 1fr)'
                  : 'repeat(2, minmax(0, 1fr))',
              gap: 'calc(var(--a-space-2) - var(--ds-space-025))'
            }"
          >
            <div :style="{ gridColumn: args.viewport === 'mobile' ? '1 / -1' : 'auto' }">
              <Select
                label="Заезд — выезд"
                value-text="Выберите даты"
                icon-name="i-calendar"
                variant="booking"
                :rotate-icon-on-open="false"
              />
            </div>

            <div :style="{ gridColumn: args.viewport === 'mobile' ? '1 / -1' : 'auto' }">
              <Select
                label="Гости"
                value-text="1 взрослый, 0 детей"
                icon-name="i-chevron-down-select"
                variant="booking"
              />
            </div>

            <div :style="{ gridColumn: args.viewport === 'mobile' ? '1 / -1' : 'auto' }">
              <Input
                model-value="RUSSIA"
                label="Специальный код"
                placeholder=""
                variant="booking"
              />
            </div>

            <div :style="{ gridColumn: args.viewport === 'desktop' ? 'auto' : (args.viewport === 'mobile' ? '1 / -1' : 'span 1') }">
              <Button :variant="buttonVariant" size="xl" style="width: 100%;">Поиск</Button>
            </div>
          </div>
        </div>
      </div>
    `,
  }),
  argTypes: {
    mode: {
      control: "select",
      options: ["home", "inner"],
    },
    viewport: {
      control: "select",
      options: ["desktop", "tablet", "mobile"],
    },
  },
  args: {
    mode: "home",
    viewport: "desktop",
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Home: Story = {
  args: {
    mode: "home",
    viewport: "desktop",
  },
};

export const InnerPages: Story = {
  name: "Inner pages",
  args: {
    mode: "inner",
    viewport: "desktop",
  },
};

export const HomeTablet: Story = {
  name: "Home / Tablet",
  args: {
    mode: "home",
    viewport: "tablet",
  },
};

export const InnerTablet: Story = {
  name: "Inner pages / Tablet",
  args: {
    mode: "inner",
    viewport: "tablet",
  },
};

export const HomeMobile: Story = {
  name: "Home / Mobile",
  args: {
    mode: "home",
    viewport: "mobile",
  },
};

export const InnerMobile: Story = {
  name: "Inner pages / Mobile",
  args: {
    mode: "inner",
    viewport: "mobile",
  },
};
