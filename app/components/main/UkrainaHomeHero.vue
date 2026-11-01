<script setup lang="ts">
  import { stripUkrainaScrapedHeader } from "~/utils/ukrainaHomeMarkup";

  const props = defineProps<{
    html: string;
    cssText: string;
  }>();

  const heroHtml = computed(() => stripUkrainaScrapedHeader(props.html));
</script>

<template>
  <div :class="$style.hero">
    <LayoutHeaderAside variant="overlay" />
    <MainUkrainaHtmlFragment :html="heroHtml" :css-text="cssText" />
  </div>
</template>

<style module lang="scss">
  .hero {
    position: relative;
    width: 100%;
  }
</style>
