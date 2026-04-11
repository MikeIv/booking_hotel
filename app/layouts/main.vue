<template>
  <div :class="$style.layout">
    <LayoutMainHeader />
    <slot />
    <LayoutFooter />
  </div>
</template>

<script setup lang="ts">
</script>

<style module lang="scss">
  .layout {
    display: grid;
    /* Главная страница сохраняет Inter как основной шрифт */
    --a-font-body: "Inter", sans-serif;
    --ds-typo-family-body: "Inter", sans-serif;
  }
</style>
