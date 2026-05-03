<template>
  <div
    ref="bar"
    class="booking-bar"
    :class="{
      creating: isCreating,
      ghost: isGhost,
      'drag-source': isDragSource,
    }"
    :style="{
      top: `${topOffset}px`,
      left: `${leftOffset}px`,
      width: `${length}px`,
      backgroundColor,
    }"
    @mouseenter="$emit('mouse-enter')"
    @mousedown="onDrag"
    @click="onClick"
    @contextmenu.prevent="onRightClick"
  >
    <div
      v-if="isHandlesVisible"
      class="resize-handle left"
      :style="{ backgroundColor }"
      @mousedown="onResize($event, ResizeDirection.LEFT)"
    />
    <a-typography-text
      :content="title"
      :style="{
        color: isCreating ? 'black' : 'white',
      }"
      ellipsis
    />
    <div
      v-if="isHandlesVisible"
      class="resize-handle right"
      :style="{ backgroundColor }"
      @mousedown="onResize($event, ResizeDirection.RIGHT)"
    />
  </div>
</template>
<script setup lang="ts">
import {
  type DragEventPayload,
  ResizeDirection,
  type ResizeEventPayload,
} from '@/utils/planTableUtils';
import { computed, useTemplateRef } from 'vue';
import { useScopedI18n } from '@/composables/useScopedI18n';
import { BookingStatus } from '@shared/enums/BookingStatus.ts';

interface Props {
  topOffset: number,
  leftOffset: number,
  length: number,
  title: string,
  status?: BookingStatus,
  isCreating?: boolean;
  isDragSource?: boolean;
  isGhost?: boolean;
}

const DRAG_THRESHOLD = 4;

defineOptions({ name: 'BookingBar' });
const { t } = useScopedI18n();

const props = defineProps<Props>();
const emit = defineEmits<{(event: 'bar-clicked'): void;
  (event: 'mouse-enter'): void;
  (event: 'drag-start', pointerPosition: DragEventPayload): void;
  (event: 'resize-start', resizeData: ResizeEventPayload): void;
  (event: 'right-click', e: MouseEvent): void;
}>();

const barRef = useTemplateRef<HTMLElement>('bar');

const backgroundColor = computed<string>(() => {
  if (props.isCreating) {
    return '#2995f96b';
  }
  switch (props.status) {
    case BookingStatus.ACTIVE:
      return '#1890ff';
    case BookingStatus.CHECKED_IN:
      return '#73d13d';
    case BookingStatus.CHECKED_OUT:
      return '#b3b3b3';
    default:
      return '#1890ff';
  }
});

const isHandlesVisible = computed<boolean>(() => !props.isCreating && !props.isDragSource && props.status !== BookingStatus.CHECKED_OUT);

let startX = 0;
let startY = 0;
let isDragging = false;

const onDrag = (e: MouseEvent) => {
  e.stopPropagation();
  if (e.button !== 0) {
    return;
  }

  startX = e.clientX;
  startY = e.clientY;
  isDragging = false;

  const rect = barRef.value!.getBoundingClientRect();
  const grabOffsetX = e.clientX - rect.left;
  const grabOffsetY = e.clientY - rect.top;

  const onMouseMove = (moveEvent: MouseEvent) => {
    const dx = Math.abs(moveEvent.clientX - startX);
    const dy = Math.abs(moveEvent.clientY - startY);

    if (!isDragging && (dx > DRAG_THRESHOLD || dy > DRAG_THRESHOLD)) {
      isDragging = true;

      emit('drag-start', {
        grabOffsetX,
        grabOffsetY,
      });
    }
  };

  const onMouseUp = () => {
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
  };

  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
};

const onResize = (e: MouseEvent, direction: ResizeDirection) => {
  e.stopPropagation();
  emit('resize-start', { direction, startX: e.clientX });
};

const onClick = () => {
  if (isDragging) {
    return;
  }
  emit('bar-clicked');
};

const onRightClick = (e: MouseEvent) => {
  emit('right-click', e);
};
</script>
<style scoped>
.booking-bar {
  position: absolute;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  z-index: 10;
  cursor: pointer;
  border-radius: 4px;
  pointer-events: auto;
}

.booking-bar.creating {
  border-style: dashed;
  border-color: #1890ff;
}

.booking-bar.drag-source {
  background-color: #a6a6a6;
}

.booking-bar.ghost {
  cursor: grabbing;
}

.booking-bar.ghost.creating {
  cursor: ew-resize;
}

.resize-handle {
  position: absolute;
  width: 6px;
  height: 100%;
  cursor: ew-resize;
  top: 0;
  border-radius: 4px;
}

.resize-handle.left {
  left: 0;
}

.resize-handle.right {
  right: 0;
}
</style>
