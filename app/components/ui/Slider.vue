<script setup lang="ts">
  type ControlsVisibility = "always" | "hover" | "never";

  const props = withDefaults(
    defineProps<{
      items: readonly unknown[];
      initialIndex?: number;
      loop?: boolean;
      showIndicators?: boolean;
      showControls?: boolean;
      controlsVisibility?: ControlsVisibility;
      swipeEnabled?: boolean;
      dragEnabled?: boolean;
      ariaLabel?: string;
    }>(),
    {
      initialIndex: 0,
      loop: false,
      showIndicators: true,
      showControls: true,
      controlsVisibility: "always",
      swipeEnabled: true,
      dragEnabled: true,
      ariaLabel: "",
    },
  );

  const emit = defineEmits<{
    (e: "update:index", value: number): void;
    (e: "change", value: number): void;
  }>();

  const viewportRef = ref<HTMLElement | null>(null);
  const activeIndex = ref(0);
  const dragOffsetPx = ref(0);
  const isDragging = ref(false);
  const suppressClick = ref(false);

  interface DragState {
    pointerId: number;
    pointerType: string;
    startX: number;
    deltaX: number;
    width: number;
    moved: boolean;
  }

  const dragState = ref<DragState | null>(null);

  const clampIndex = (index: number) => {
    if (props.items.length === 0) {
      return 0;
    }

    return Math.min(Math.max(index, 0), props.items.length - 1);
  };

  const setActiveIndex = (index: number) => {
    let nextIndex = index;

    if (props.loop && props.items.length > 0) {
      if (index < 0) {
        nextIndex = props.items.length - 1;
      } else if (index > props.items.length - 1) {
        nextIndex = 0;
      }
    }

    nextIndex = clampIndex(nextIndex);

    if (nextIndex === activeIndex.value) {
      return;
    }

    activeIndex.value = nextIndex;
    emit("update:index", nextIndex);
    emit("change", nextIndex);
  };

  watch(
    () => props.initialIndex,
    (value) => {
      activeIndex.value = clampIndex(value);
    },
    { immediate: true },
  );

  watch(
    () => props.items.length,
    () => {
      activeIndex.value = clampIndex(activeIndex.value);
    },
  );

  const showControlsValue = computed(
    () =>
      props.showControls &&
      props.controlsVisibility !== "never" &&
      props.items.length > 1,
  );
  const showIndicatorsValue = computed(
    () => props.showIndicators && props.items.length > 1,
  );
  const canGoPrev = computed(() => props.loop || activeIndex.value > 0);
  const canGoNext = computed(
    () => props.loop || activeIndex.value < props.items.length - 1,
  );
  const controlsVisibilityClass = computed(() => {
    if (props.controlsVisibility === "hover") {
      return "controlsHover";
    }

    if (props.controlsVisibility === "never") {
      return "controlsNever";
    }

    return "controlsAlways";
  });

  const slideTransform = computed(
    () => `translate3d(calc(-${activeIndex.value * 100}% + ${dragOffsetPx.value}px), 0, 0)`,
  );
  const slideStyle = computed(() => ({
    transform: slideTransform.value,
    transition: isDragging.value ? "none" : "transform 0.3s ease",
  }));

  const goToPrev = () => {
    if (!canGoPrev.value) {
      return;
    }

    setActiveIndex(activeIndex.value - 1);
  };

  const goToNext = () => {
    if (!canGoNext.value) {
      return;
    }

    setActiveIndex(activeIndex.value + 1);
  };

  const goToIndex = (index: number) => {
    setActiveIndex(index);
  };

  const resetDragState = () => {
    dragState.value = null;
    dragOffsetPx.value = 0;
    isDragging.value = false;
  };

  const shouldHandlePointer = (event: PointerEvent) => {
    if (props.items.length <= 1) {
      return false;
    }

    const target = event.target;
    if (
      target instanceof Element &&
      target.closest("[data-slider-control='true'], [data-slider-indicator='true']")
    ) {
      return false;
    }

    if (event.pointerType === "mouse") {
      return props.dragEnabled && event.button === 0;
    }

    return props.swipeEnabled;
  };

  const onPointerDown = (event: PointerEvent) => {
    if (!shouldHandlePointer(event) || !viewportRef.value) {
      return;
    }

    dragState.value = {
      pointerId: event.pointerId,
      pointerType: event.pointerType,
      startX: event.clientX,
      deltaX: 0,
      width: viewportRef.value.clientWidth,
      moved: false,
    };

    suppressClick.value = false;
    viewportRef.value.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: PointerEvent) => {
    if (!dragState.value || dragState.value.pointerId !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - dragState.value.startX;
    dragState.value.deltaX = deltaX;

    if (!dragState.value.moved && Math.abs(deltaX) > 4) {
      dragState.value.moved = true;
      isDragging.value = true;
    }

    if (!dragState.value.moved) {
      return;
    }

    const atStart = activeIndex.value === 0 && deltaX > 0 && !props.loop;
    const atEnd =
      activeIndex.value === props.items.length - 1 &&
      deltaX < 0 &&
      !props.loop;
    const resistanceOffset = atStart || atEnd ? deltaX * 0.35 : deltaX;

    dragOffsetPx.value = resistanceOffset;
  };

  const finishDrag = (event: PointerEvent) => {
    if (!dragState.value || dragState.value.pointerId !== event.pointerId) {
      return;
    }

    if (viewportRef.value?.hasPointerCapture(event.pointerId)) {
      viewportRef.value.releasePointerCapture(event.pointerId);
    }

    const currentDragState = dragState.value;
    const distanceThreshold = Math.max(currentDragState.width * 0.12, 40);

    if (currentDragState.moved) {
      suppressClick.value = true;

      if (currentDragState.deltaX <= -distanceThreshold && canGoNext.value) {
        goToNext();
      } else if (currentDragState.deltaX >= distanceThreshold && canGoPrev.value) {
        goToPrev();
      }
    }

    resetDragState();

    if (suppressClick.value) {
      window.setTimeout(() => {
        suppressClick.value = false;
      }, 0);
    }
  };

  const onPointerUp = (event: PointerEvent) => {
    finishDrag(event);
  };

  const onPointerCancel = (event: PointerEvent) => {
    finishDrag(event);
  };

  const onViewportClickCapture = (event: MouseEvent) => {
    if (!suppressClick.value) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
  };

</script>

<template>
  <section
    :class="[$style.slider, $style[controlsVisibilityClass]]"
    :aria-label="props.ariaLabel || undefined"
  >
    <div
      ref="viewportRef"
      :class="$style.viewport"
      @click.capture="onViewportClickCapture"
      @pointercancel="onPointerCancel"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
    >
      <div :class="$style.track">
        <div
          v-for="(item, index) in props.items"
          :key="index"
          :class="$style.slide"
          :style="slideStyle"
          :aria-hidden="index !== activeIndex"
        >
          <slot
            :item="item"
            :index="index"
            :is-active="index === activeIndex"
          />
        </div>
      </div>

      <template v-if="showControlsValue">
        <button
          data-slider-control="true"
          type="button"
          :class="[$style.control, $style.controlPrev]"
          :disabled="!canGoPrev"
          aria-label="Предыдущий слайд"
          @click="goToPrev"
        >
          <slot name="prev">
            <UIcon name="i-arrow-back" :class="$style.controlIcon" aria-hidden="true" />
          </slot>
        </button>

        <button
          data-slider-control="true"
          type="button"
          :class="[$style.control, $style.controlNext]"
          :disabled="!canGoNext"
          aria-label="Следующий слайд"
          @click="goToNext"
        >
          <slot name="next">
            <UIcon name="i-arrow-back" :class="[$style.controlIcon, $style.controlIconNext]" aria-hidden="true" />
          </slot>
        </button>
      </template>
      <div v-if="showIndicatorsValue" :class="$style.indicators">
        <button
          data-slider-indicator="true"
          v-for="(_, index) in props.items"
          :key="index"
          type="button"
          :class="[$style.indicator, index === activeIndex && $style.indicatorActive]"
          :aria-label="`Перейти к слайду ${index + 1}`"
          :aria-current="index === activeIndex ? 'true' : undefined"
          @click="goToIndex(index)"
        >
          <slot
            name="indicator"
            :index="index"
            :is-active="index === activeIndex"
          >
            <span :class="$style.indicatorBar" />
          </slot>
        </button>
      </div>
    </div>
  </section>
</template>

<style module lang="scss">
  .slider {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    --ui-slider-control-side-offset: var(--a-space-2);
    --ui-slider-control-color: var(--a-white);
    --ui-slider-control-hover-color: var(--a-white);
    --ui-slider-control-disabled-opacity: 0.45;
    --ui-slider-indicator-gap: var(--a-space-1);
    --ui-slider-indicator-padding-top: var(--a-space-1);
    --ui-slider-indicator-bottom-offset: var(--a-space-2);
    --ui-slider-indicator-track-color: rgba(255, 255, 255, 0.5);
    --ui-slider-indicator-active-color: var(--a-white);
    --ui-slider-indicator-track-height: var(--a-space-1);
    --ui-slider-indicator-track-radius: var(--a-borderR--btn);
  }

  .viewport {
    position: relative;
    flex: 1;
    width: 100%;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
    touch-action: pan-y;
  }

  .track {
    display: flex;
    height: 100%;
  }

  .slide {
    flex: 0 0 100%;
    min-width: 0;
    height: 100%;
    will-change: transform;
  }

  .control {
    position: absolute;
    top: 50%;
    z-index: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: rem(48);
    height: rem(48);
    padding: 0;
    color: var(--ui-slider-control-color);
    background: transparent;
    border: none;
    cursor: pointer;
    transform: translateY(-50%);
    transition:
      opacity 0.2s ease,
      color 0.2s ease;

    &:disabled {
      cursor: default;
      color: var(--a-text-light);
      opacity: var(--ui-slider-control-disabled-opacity);
    }

    &:not(:disabled):hover {
      color: var(--ui-slider-control-hover-color);
    }

    &:focus-visible {
      outline: rem(2) solid var(--a-border-primary);
      outline-offset: rem(2);
      border-radius: 50%;
    }
  }

  .controlPrev {
    left: var(--ui-slider-control-side-offset);
  }

  .controlNext {
    right: var(--ui-slider-control-side-offset);
  }

  .controlIcon {
    width: rem(24);
    height: rem(44);
  }

  .controlIconNext {
    transform: rotate(180deg);
  }

  .indicators {
    position: absolute;
    right: 0;
    bottom: var(--ui-slider-indicator-bottom-offset);
    left: 0;
    display: flex;
    gap: var(--ui-slider-indicator-gap);
    width: calc(100% - (var(--ui-slider-control-side-offset) * 2));
    margin: 0 auto;
    z-index: 1;
  }

  .indicator {
    display: flex;
    flex: 1 1 0;
    padding: 0;
    background: transparent;
    border: none;
    cursor: pointer;

    &:focus-visible {
      outline: rem(2) solid var(--a-border-primary);
      outline-offset: rem(2);
      border-radius: var(--ui-slider-indicator-track-radius);
    }
  }

  .indicatorBar {
    display: block;
    width: 100%;
    height: var(--ui-slider-indicator-track-height);
    background: var(--ui-slider-indicator-track-color);
    border-radius: var(--ui-slider-indicator-track-radius);
    transition: background-color 0.2s ease;
  }

  .indicatorActive .indicatorBar {
    background: var(--ui-slider-indicator-active-color);
  }

  .controlsAlways {
    .control,
    .indicators {
      opacity: 1;
      pointer-events: auto;
    }
  }

  .controlsHover {
    .control,
    .indicators {
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s ease;
    }

    &:hover,
    &:focus-within {
      .control,
      .indicators {
        opacity: 1;
        pointer-events: auto;
      }
    }
  }

  .controlsNever {
    .control,
    .indicators {
      display: none;
    }
  }
</style>
