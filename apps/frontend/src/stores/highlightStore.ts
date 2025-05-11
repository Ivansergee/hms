import { defineStore } from "pinia";
import { ref } from "vue";

export const useHighlightStore = defineStore('highlight', () => {
  const highlightedRoom = ref<number>();
  const highlightedDays = ref<string[]>([]);
  const isEditMode = ref<boolean>(false);

  const isColHighlighted = (day: string): boolean => {
    return highlightedDays.value.includes(day);
  };

  const isRowHighlighted = (roomId: number): boolean => {
    return highlightedRoom.value === roomId;
  };

  return {
    highlightedRoom,
    highlightedDays,
    isEditMode,
    isColHighlighted,
    isRowHighlighted,
  };
});
