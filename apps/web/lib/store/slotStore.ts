import { create } from "zustand";
import { getAvailableSlots, type PickupSlotOption } from "../mockData";

interface SlotState {
  availableSlots: PickupSlotOption[];
  selectedSlot: PickupSlotOption;
  refreshSlots: () => void;
  setSelectedSlot: (slot: PickupSlotOption) => void;
}

const fallbackSlot: PickupSlotOption = {
  time: "13:30",
  status: "available",
  label: "13:30",
  breakSlot: "Break Slot #1",
};

const initialSlots = getAvailableSlots();
const defaultSlot =
  initialSlots.find((s) => s.status !== "full") || initialSlots[0] || fallbackSlot;

export const useSlotStore = create<SlotState>((set) => ({
  availableSlots: initialSlots,
  selectedSlot: defaultSlot,

  refreshSlots: () => {
    const updated = getAvailableSlots();
    const nextSelected =
      updated.find((s) => s.status !== "full") || updated[0] || fallbackSlot;
    set({
      availableSlots: updated,
      selectedSlot: nextSelected,
    });
  },

  setSelectedSlot: (slot) => set({ selectedSlot: slot }),
}));
