import { defineStore } from "pinia";
import { ref } from "vue";
import type { PartialBookingDetails } from "@shared/types/booking.ts";

type TrayItem = PartialBookingDetails & { isUnsaved: boolean };

export const useTrayStore = defineStore(
  'tray',
  () => {
    const trayItems = ref<TrayItem[]>([]);

    const add = (data: PartialBookingDetails, isUnsaved: boolean): void => {
      if (trayItems.value.find(item => item.id === data.id)) {
        return;
      }
      trayItems.value.unshift({ ...data, isUnsaved });
    };

    const remove = (id: number): void => {
      trayItems.value = trayItems.value.filter(item => item.id !== id);
    };

    const pop = (id: number): TrayItem | undefined => {
      const index = trayItems.value.findIndex(item => item.id === id);
      if (index === -1) {
        return;
      }
      return trayItems.value.splice(index, 1)[0];
    };

    return {
      trayItems,
      add,
      remove,
      pop,
    };
  },
  { persist: { pick: ['trayItems'] } },
);
