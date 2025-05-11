import { defineStore } from "pinia";
import { ref } from "vue";
import type { BookingFormState } from "@shared/types/booking.ts";

export enum TrayItemType {
  CREATE = "CREATE",
  EDIT = "EDIT",
}

type TrayItem = BookingFormState & {
  isUnsaved: boolean;
  type: TrayItemType;
  resolver?: () => void;
};

export const useTrayStore = defineStore(
  'tray',
  () => {
    const trayItems = ref<TrayItem[]>([]);

    const add = (
      data: BookingFormState,
      type: TrayItemType,
      isUnsaved: boolean,
      resolver?: () => void,
    ): void => {
      if (trayItems.value.find(item => item.id === data.id)) {
        return;
      }
      trayItems.value.unshift({ ...data, type, isUnsaved, resolver });
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
