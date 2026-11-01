import type { Meta, StoryObj } from "@nuxtjs/storybook";
import { ref } from "vue";

import FilterSelect from "./FilterSelect.vue";
import {
  FILTER_BALCONY_OPTIONS,
  FILTER_VIEW_OPTIONS,
} from "./selectStoryOptions";

/**
 * Отдельный title от `Select.stories.ts`: в одном CSF сторис с id `*--filter-showcase`
 * не подхватывается рантайном Storybook 9 + Vite (index vs importFn).
 * Подраздел в сайдбаре: Simple Components → Select → Filter.
 */
const meta = {
  title: "Simple Components/Select/Filter",
  component: FilterSelect,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof FilterSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Все состояния FilterSelect на одном экране */
export const AllStates: Story = {
  render: () => ({
    components: { FilterSelect },
    setup() {
      const view = ref(0);
      const balcony = ref(0);
      const disabledModel = ref(1);
      const emptyModel = ref<number | undefined>(undefined);
      return {
        view,
        balcony,
        disabledModel,
        emptyModel,
        viewOptions: FILTER_VIEW_OPTIONS,
        balconyOptions: FILTER_BALCONY_OPTIONS,
        disabledOptions: FILTER_BALCONY_OPTIONS,
        emptyOptions: [] as { id: number; title: string }[],
      };
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--ds-space-200, 16px); width: 368px; max-width: 100%;">
        <div>
          <p style="margin: 0 0 var(--ds-space-100, 8px); font-size: 12px; color: var(--a-text-light);">
            Два фильтра (как на странице номеров)
          </p>
          <div style="display: flex; flex-direction: column; gap: var(--ds-space-200, 16px);">
            <FilterSelect
              v-model="view"
              :options="viewOptions"
              option-label="title"
              option-value="id"
              placeholder="Вид из окна"
            />
            <FilterSelect
              v-model="balcony"
              :options="balconyOptions"
              option-label="title"
              option-value="id"
              placeholder="Балкон"
            />
          </div>
        </div>
        <div>
          <p style="margin: 0 0 var(--ds-space-100, 8px); font-size: 12px; color: var(--a-text-light);">
            Отключён
          </p>
          <FilterSelect
            v-model="disabledModel"
            :options="disabledOptions"
            option-label="title"
            option-value="id"
            placeholder="Балкон"
            disabled
          />
        </div>
        <div>
          <p style="margin: 0 0 var(--ds-space-100, 8px); font-size: 12px; color: var(--a-text-light);">
            Нет опций (триггер неактивен)
          </p>
          <FilterSelect
            v-model="emptyModel"
            :options="emptyOptions"
            option-label="title"
            option-value="id"
            placeholder="Плейсхолдер"
          />
        </div>
      </div>
    `,
  }),
};
