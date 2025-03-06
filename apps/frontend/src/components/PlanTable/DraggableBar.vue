<template>
  <div
    class="draggable-bar"
    :class="{ hidden: isHidden }"
    :style="{ width: getBookingBarWidth }"
    :draggable="isDraggable"
  >
    <div
      class="resize-handle left"
      @dragstart.stop
      @mousedown="handleResizeStart(ResizeDirection.LEFT)"
    ></div>
    Booking
    <div
      class="resize-handle right"
      @dragstart.stop
      @mousedown="handleResizeStart(ResizeDirection.RIGHT)"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { type Booking } from "@/types/Booking.ts";
import { CELL_WIDTH, ResizeDirection } from "@/components/PlanTable/planTableUtils.ts";

interface Props {
  booking: Booking;
  draggedBookingId: number;
  isDraggable: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (event: "resize", payload: { booking: Booking, direction: ResizeDirection }): void;
}>();

const isHidden = computed(() => props.draggedBookingId === props.booking.id);

const handleResizeStart = (direction: ResizeDirection): void => {
  emit('resize', { booking: props.booking, direction });
};

const getBookingBarWidth = computed((): string => {
  if (!props.booking) {
    return '';
  }

  const daysSpan = props.booking.end - props.booking.start + 1;
  const width = daysSpan * CELL_WIDTH;

  return `${width}px`;
});
</script>

<style scoped>
.draggable-bar {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  z-index: 10;
  cursor: grab;
  border-radius: 4px;
  background-color: #1890ff;
}

.draggable-bar.hidden {
  transition: 0.01s;
  transform: translateX(-9999px);
}

.resize-handle {
  position: absolute;
  width: 6px;
  height: 100%;
  background-color: #1890ff;
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
