import {type Ref, ref, watch} from "vue";
import { useEventListener } from "@vueuse/core";

export function useMouseEvents(elementRef: Ref<HTMLElement | undefined>) {
  const isMouseDown = ref<boolean>(false);
  const movementX = ref<number>(0);
  const positionX = ref<number>(0);

  const handleMouseDown = () => {
    isMouseDown.value = true;
    movementX.value = 0;
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (isMouseDown.value) {
      movementX.value += event.movementX;
    }
    positionX.value = event.clientX;
  };

  const handleMouseUp = () => {
    isMouseDown.value = false;
  };

  watch(elementRef, (el) => {
    if (!el) {
      return;
    }
    useEventListener(el, "mousedown", handleMouseDown);
    useEventListener(el, "mousemove", handleMouseMove);
    useEventListener(el, "mouseup", handleMouseUp);
  });

  return { isMouseDown, movementX, positionX };
}
