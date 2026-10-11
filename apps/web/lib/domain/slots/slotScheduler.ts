import { SLOT_STATUS, type PickupSlot, type VenueSettings } from "@queueless/types";

/**
 * Generates dynamic pickup slots for a given venue and target date/time.
 * Follows the 10-minute prep lead time rule and slot duration in VenueSettings.
 */
export function generateVenuePickupSlots(
  venue: VenueSettings,
  now: Date = new Date()
): PickupSlot[] {
  const [openHourStr, openMinStr] = (venue.operatingHours.split(" - ")[0] || "08:00")
    .split(":")
    .map((s) => parseInt(s, 10));
  const [closeHourStr, closeMinStr] = (venue.operatingHours.split(" - ")[1] || "22:00")
    .split(":")
    .map((s) => parseInt(s, 10));

  const openTimeMinutes = (openHourStr || 8) * 60 + (openMinStr || 0);
  const closeTimeMinutes = (closeHourStr || 22) * 60 + (closeMinStr || 0);

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const prepLead = venue.prepLeadTimeMinutes || 10;
  const slotDuration = venue.slotDurationMinutes || 10;

  // Earliest allowable pickup slot is current time + prep lead time
  const earliestPickupMinutes = Math.max(openTimeMinutes, currentMinutes + prepLead);

  // Round up to nearest slotDuration increment
  const startMinutes =
    Math.ceil(earliestPickupMinutes / slotDuration) * slotDuration;

  const slots: PickupSlot[] = [];
  let index = 1;

  for (let m = startMinutes; m < closeTimeMinutes; m += slotDuration) {
    const hours = Math.floor(m / 60);
    const mins = m % 60;
    const timeFormatted = `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;

    // Stagger availability demo status
    let status: PickupSlot["status"] = SLOT_STATUS.AVAILABLE;
    if (index === 3) status = SLOT_STATUS.FILLING_FAST;
    if (index === 4) status = SLOT_STATUS.FULL;

    slots.push({
      time: timeFormatted,
      status,
      capacity: 10,
      reservedCount: status === SLOT_STATUS.FULL ? 10 : status === SLOT_STATUS.FILLING_FAST ? 8 : 2,
      breakSlotName: `Break Slot #${index}`,
    });

    index++;
    if (slots.length >= 8) break; // Offer up to 8 immediate upcoming slots
  }

  // Fallback if past venue closing time
  if (slots.length === 0) {
    slots.push({
      time: "08:30",
      status: SLOT_STATUS.AVAILABLE,
      capacity: 10,
      reservedCount: 0,
      breakSlotName: "Next Day Slot #1",
    });
  }

  return slots;
}
