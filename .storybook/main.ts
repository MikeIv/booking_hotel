import path from "node:path";
import { fileURLToPath } from "node:url";

import type { StorybookConfig } from "@nuxtjs/storybook";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const componentsGlobBase = path
  .join(projectRoot, "app", "components")
  .replace(/\\/g, "/");

const config: StorybookConfig = {
  stories: [
    `${componentsGlobBase}/storybook/**/*.stories.@(js|jsx|ts|tsx)`,
    `${componentsGlobBase}/ui/**/*.stories.@(js|jsx|ts|tsx)`,
  ],
  addons: [],
  framework: {
    name: "@storybook-vue/nuxt",
    options: {},
  },
};

export default config;
