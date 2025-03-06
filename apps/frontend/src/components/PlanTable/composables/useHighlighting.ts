import { ref } from "vue";

export function useHighlighting() {
  const highlightedDays = ref<string[]>([]);
  const highlightedRoomId = ref<number>();

  const isColHighlighted = (dayIndex: string): boolean => {
    return highlightedDays.value.includes(dayIndex);
  };

  const isRowHighlighted = (roomId: number): boolean => {
    return highlightedRoomId.value === roomId;
  };

  return { highlightedDays, highlightedRoomId, isColHighlighted, isRowHighlighted };
}
