"use client";

import { useState, useEffect } from "react";
import type { PickupSlot } from "@queueless/types";
import { useTenant } from "../tenant/TenantContext";
import { generateVenuePickupSlots } from "../domain/slots/slotScheduler";

export function useSlots() {
  const { venue } = useTenant();
  const [slots, setSlots] = useState<PickupSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<PickupSlot | null>(null);

  useEffect(() => {
    const generated = generateVenuePickupSlots(venue);
    setSlots(generated);
    const initial = generated.find((s) => s.status !== "FULL") || generated[0] || null;
    setSelectedSlot(initial);
  }, [venue]);

  return {
    slots,
    selectedSlot,
    setSelectedSlot,
  };
}
