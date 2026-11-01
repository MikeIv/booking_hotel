<script setup lang="ts">
  defineProps<{
    value: number | string;
  }>();
</script>

<template>
  <span>{{ value }} м<sup :class="$style.exponent">2</sup></span>
</template>

<style module lang="scss">
  .exponent {
    font-size: 0.75em;
    line-height: 0;
    vertical-align: super;
  }
</style>
