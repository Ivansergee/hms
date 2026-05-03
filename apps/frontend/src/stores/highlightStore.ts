import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useHighlightStore = defineStore('highlight', () => {
  const highlightedRoom = ref<number>();
  const highlightedDays = ref<string[]>([]);
  const isEditMode = ref<boolean>(false);

  const isColHighlighted = (day: string): boolean => highlightedDays.value.includes(day);

  const isRowHighlighted = (roomId: number): boolean => highlightedRoom.value === roomId;

  return {
    highlightedRoom,
    highlightedDays,
    isEditMode,
    isColHighlighted,
    isRowHighlighted,
  };
});
