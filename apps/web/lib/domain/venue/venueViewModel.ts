import type { VenueSettings } from "@queueless/types";
import type { VenueData } from "@/lib/mockData";
import { getRegistryVenueBySlug } from "./venueRegistry";

export function toVenueViewModel(settings: VenueSettings): VenueData {
  const [openTime, closeTime] = (settings.operatingHours || "08:00 - 22:00")
    .split(" - ")
    .map((s) => s.trim());

  const reg = getRegistryVenueBySlug(settings.slug);

  return {
    name: settings.name,
    slug: settings.slug,
    tagline: settings.tagline || reg?.tagline || "Specialty Smash Burgers & Third-Wave Coffee",
    neighborhood: reg?.neighborhood || reg?.city || "Dining Hub",
    coverImage:
      settings.coverImageUrl ||
      reg?.coverImageUrl ||
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&auto=format&fit=crop&q=80",
    rating: settings.rating || reg?.rating || "4.8",
    reviewsCount: settings.reviewsCount || reg?.reviewsCount || "1.2k+",
    prepLeadMinutes: settings.prepLeadTimeMinutes || reg?.prepLeadMinutes || 10,
    openTime: openTime || "08:00",
    closeTime: closeTime || "22:00",
    priceNote: "Prices are set directly by the venue.",
    paymentMethods: settings.paymentAccounts.map((acc, idx) => ({
      id: `pm-${idx}`,
      kind: acc.method.includes("EASYPAISA")
        ? "EASYPAISA"
        : acc.method.includes("SADAPAY")
        ? "SADAPAY"
        : acc.method.includes("BANK")
        ? "BANK"
        : "CASH",
      label: acc.accountTitle,
      accountTitle: acc.accountTitle,
      accountNumber: acc.accountNumber,
      instructions: acc.instructions || "Direct transfer via wallet or bank app",
    })),
  };
}
