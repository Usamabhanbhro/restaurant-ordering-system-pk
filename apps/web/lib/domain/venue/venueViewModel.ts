import type { VenueSettings } from "@queueless/types";
import type { VenueData } from "@/lib/mockData";

export function toVenueViewModel(settings: VenueSettings): VenueData {
  const [openTime, closeTime] = (settings.operatingHours || "08:00 - 22:00")
    .split(" - ")
    .map((s) => s.trim());

  return {
    name: settings.name,
    slug: settings.slug,
    tagline: settings.tagline || "Specialty Smash Burgers & Third-Wave Coffee",
    coverImage:
      settings.coverImageUrl ||
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&auto=format&fit=crop&q=80",
    rating: settings.rating || "4.8",
    reviewsCount: settings.reviewsCount || "1.2k+",
    prepLeadMinutes: settings.prepLeadTimeMinutes,
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
