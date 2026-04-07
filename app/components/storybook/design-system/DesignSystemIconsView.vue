<script setup lang="ts">
  type IconSize = 16 | 20 | 24;
  type IconStatus = "approved" | "legacy";
  type IconKind = "ui" | "brand" | "illustration";

  interface IconItem {
    name: string;
    icon: string;
    kind: IconKind;
    style: "outline" | "filled" | "mixed";
    size: IconSize | "custom";
    status: IconStatus;
    note?: string;
  }

  const iconModules = import.meta.glob("~/assets/icons/*.svg");
  const iconNames = Object.keys(iconModules)
    .map((path) => path.split("/").pop()?.replace(".svg", ""))
    .filter((name): name is string => Boolean(name))
    .sort((a, b) => a.localeCompare(b));

  const uiLegacy = new Set([
    "chevron-down-select",
    "icon-man",
    "icon-child",
    "icon-plus-person",
  ]);

  const brand = new Set(["telegram", "vk", "pdf"]);
  const illustration = new Set(["arrow-long"]);

  const sizeMap: Partial<Record<string, IconSize | "custom">> = {
    "fork-knife": 16,
    "icon-plus-person2": 20,
    persons: 20,
    square: 20,
    "dash-square": 20,
    payment: 20,
    cancellation: 20,
    eye: 20,
    "eye-off": 20,
    "gift-line": 20,
    "inform-circle": 20,
    calendar: 24,
    phone: 24,
    close: 24,
    "chevron-down": 24,
    "chevron-up": 24,
    "arrow-back": 24,
    trash: 24,
    "upgrade-comfort": 24,
  };

  const styleMap: Partial<Record<string, IconItem["style"]>> = {
    payment: "outline",
    cancellation: "outline",
    eye: "outline",
    "eye-off": "outline",
    "chevron-down": "outline",
    "chevron-up": "outline",
    "arrow-back": "outline",
    square: "outline",
    calendar: "outline",
    phone: "outline",
    close: "outline",
    trash: "outline",
    "upgrade-comfort": "outline",
    "arrow-long": "mixed",
  };

  const legacyNotes: Partial<Record<string, string>> = {
    "chevron-down-select": "select-only glyph 17x7",
    "icon-man": "guest composition glyph 8x20",
    "icon-child": "guest composition glyph 6x13",
    "icon-plus-person": "guest composition glyph 6x6",
  };

  const icons: IconItem[] = iconNames.map((name) => {
    const kind: IconKind = brand.has(name)
      ? "brand"
      : illustration.has(name)
        ? "illustration"
        : "ui";

    const status: IconStatus =
      kind === "ui" && uiLegacy.has(name) ? "legacy" : "approved";

    const size = sizeMap[name] ?? "custom";
    const style =
      styleMap[name] ??
      (kind === "illustration" ? "mixed" : "filled");

    const note = legacyNotes[name];

    return {
      name,
      icon: `i-${name}`,
      kind,
      style,
      size,
      status,
      ...(note ? { note } : {}),
    };
  });

  const groups = computed(() => ({
    ui: icons.filter((icon) => icon.kind === "ui"),
    brand: icons.filter((icon) => icon.kind === "brand"),
    illustration: icons.filter((icon) => icon.kind === "illustration"),
  }));

  const sizeLabel = (size: IconItem["size"]) =>
    typeof size === "number" ? `${size}px` : "custom";
</script>

<template>
  <div :class="$style.root">
    <header :class="$style.header">
      <h1 :class="$style.title">Design System: Icons</h1>
      <p :class="$style.lead">
        Источник правды: <code>app/assets/icons</code>. Для Figma: <code>Foundations/Icons</code> + frame
        <code>Used in Project</code>.
      </p>
    </header>

    <section :class="$style.section">
      <h2 :class="$style.sectionTitle">UI Icons</h2>
      <ul :class="$style.grid">
        <li v-for="item in groups.ui" :key="item.icon" :class="$style.card">
          <UIcon :name="item.icon" :class="$style.icon" />
          <div :class="$style.meta">
            <strong>{{ item.name }}</strong>
            <code>{{ item.icon }}</code>
            <span>size: {{ sizeLabel(item.size) }}</span>
            <span>style: {{ item.style }}</span>
            <span :class="[$style.badge, item.status === 'approved' ? $style.ok : $style.warn]">
              {{ item.status }}
            </span>
            <small v-if="item.note">{{ item.note }}</small>
          </div>
        </li>
      </ul>
    </section>

    <section :class="$style.section">
      <h2 :class="$style.sectionTitle">Brand / Social / Doc</h2>
      <ul :class="$style.grid">
        <li v-for="item in groups.brand" :key="item.icon" :class="$style.card">
          <UIcon :name="item.icon" :class="$style.icon" />
          <div :class="$style.meta">
            <strong>{{ item.name }}</strong>
            <code>{{ item.icon }}</code>
          </div>
        </li>
      </ul>
    </section>

    <section :class="$style.section">
      <h2 :class="$style.sectionTitle">Illustrative</h2>
      <ul :class="$style.grid">
        <li v-for="item in groups.illustration" :key="item.icon" :class="$style.card">
          <UIcon :name="item.icon" :class="$style.icon" />
          <div :class="$style.meta">
            <strong>{{ item.name }}</strong>
            <code>{{ item.icon }}</code>
          </div>
        </li>
      </ul>
    </section>
  </div>
</template>

<style module lang="scss">
  @use "~/assets/styles/tools/functions" as *;

  .root {
    max-width: rem(1000);
    margin: 0 auto;
    padding: rem(24);
    color: var(--a-text-dark);
    background: var(--a-whiteBg);
  }

  .header {
    margin-bottom: rem(24);
  }

  .title {
    margin: 0 0 rem(8);
    font-size: rem(32);
    color: var(--a-text-primary);
  }

  .lead {
    margin: 0;
    color: var(--a-text-light);
  }

  .section {
    margin-bottom: rem(28);
  }

  .sectionTitle {
    margin: 0 0 rem(12);
    font-size: rem(22);
  }

  .grid {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(rem(220), 1fr));
    gap: rem(12);
  }

  .card {
    border: rem(1) solid var(--a-border);
    border-radius: rem(10);
    display: grid;
    grid-template-columns: rem(48) 1fr;
    gap: rem(10);
    padding: rem(10);
    align-items: center;
  }

  .icon {
    width: rem(24);
    height: rem(24);
    color: var(--a-text-dark);
  }

  .meta {
    display: flex;
    flex-direction: column;
    gap: rem(3);
    font-size: rem(12);

    code {
      color: var(--a-text-light);
    }
  }

  .badge {
    width: fit-content;
    padding: rem(2) rem(6);
    border-radius: rem(6);
  }

  .ok {
    color: var(--a-text-dark);
    background: var(--ui-color-primary-100);
  }

  .warn {
    color: var(--a-text-dark);
    background: var(--ui-color-secondary-200);
  }
</style>
