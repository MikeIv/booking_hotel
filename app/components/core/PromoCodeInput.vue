<script setup lang="ts">
  defineProps({
    modelValue: {
      type: String,
      default: "",
    },
    placeholderText: {
      type: String,
      default: "Специальный код",
    },
  });

  const emit = defineEmits(["update:modelValue"]);
</script>

<template>
  <div :class="$style.inputWrapper">
    <UiInput
      :model-value="modelValue"
      :label="placeholderText"
      placeholder=""
      variant="booking"
      :class="$style.uiInput"
      @update:model-value="emit('update:modelValue', $event)"
    />
  </div>
</template>

<style module lang="scss">
  .inputWrapper {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    min-width: 0;
    gap: rem(4);
  }

  .uiInput {
    width: 100%;
    min-width: 0;
  }
</style>
