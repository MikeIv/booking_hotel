import type { Preview } from "@nuxtjs/storybook";

/* Токены и шрифты в витрине совпадают с приложением (см. nuxt.config → css). */
import "../app/assets/styles/main.scss";

const preview: Preview = {
  parameters: {
    options: {
      storySort: {
        order: [
          "Дизайн система",
          ["Цвета", "Типографика"],
          "Компоненты",
          ["Кнопка"],
        ],
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
