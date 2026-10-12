import type { VenueSettings } from "@queueless/types";
import { VENUE_MODE, PAYMENT_METHOD } from "@queueless/types";
import type { OrderingMode } from "@/lib/mockData";

export interface VenueRegistryItem {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  tagline: string;
  neighborhood: string;
  address: string;
  distance: string;
  rating: string;
  reviewsCount: string;
  coverImageUrl: string;
  operatingHours: string;
  isOpen: boolean;
  openStatusText: string;
  supportedModes: OrderingMode[];
  cuisines: string[];
  featuredDishes: string[];
  itemIds: string[];
  signatureItemId: string;
  prepLeadMinutes: number;
  priceRange: string;
  settings: VenueSettings;
}

export const VENUE_REGISTRY: VenueRegistryItem[] = [
  {
    id: "v-brewery",
    tenantId: "11111111-1111-1111-1111-111111111111",
    name: "Brewery Cafe Gulberg",
    slug: "brewery-gulberg",
    tagline: "Specialty Smash Burgers & Third-Wave Coffee",
    neighborhood: "Gulberg III, Lahore",
    address: "Kasuri Road, Gulberg III, Lahore",
    distance: "0.8 km",
    rating: "4.8",
    reviewsCount: "1.2k+",
    coverImageUrl: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&auto=format&fit=crop&q=80",
    operatingHours: "08:00 - 23:00",
    isOpen: true,
    openStatusText: "Open • Closes 23:00",
    supportedModes: ["REMOTE", "IN_VENUE"],
    cuisines: ["Fast Food", "Specialty Coffee"],
    featuredDishes: ["Double Smash Burger", "Spanish Iced Latte", "Loaded Truffle Fries"],
    itemIds: ["item-1", "item-2", "item-3", "item-4", "item-5"],
    signatureItemId: "item-1",
    prepLeadMinutes: 10,
    priceRange: "Rs. 450 - 890",
    settings: {
      id: "00000000-0000-0000-0000-000000000001",
      tenantId: "11111111-1111-1111-1111-111111111111",
      name: "Brewery Cafe Gulberg",
      slug: "brewery-gulberg",
      tagline: "Specialty Smash Burgers & Third-Wave Coffee • Fast Counter Pickup",
      coverImageUrl: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&auto=format&fit=crop&q=80",
      rating: "4.8",
      reviewsCount: "1.2k+",
      operatingHours: "08:00 - 23:00",
      mode: VENUE_MODE.COUNTER_PICKUP,
      isOrderingPaused: false,
      slotDurationMinutes: 10,
      prepLeadTimeMinutes: 10,
      claimDeadlineMinutes: 15,
      paymentAccounts: [
        {
          method: PAYMENT_METHOD.EASYPAISA,
          accountTitle: "Brewery Cafe Pvt Ltd",
          accountNumber: "0300-1234567",
          instructions: "Transfer and input 6-digit transaction ID",
          isActive: true,
        },
        {
          method: PAYMENT_METHOD.SADAPAY,
          accountTitle: "Brewery Cafe Gulberg",
          accountNumber: "0312-9876543",
          instructions: "Instant transfer via SadaPay handle @brewery",
          isActive: true,
        },
        {
          method: PAYMENT_METHOD.MEEZAN_BANK,
          accountTitle: "Brewery Hospitality SMC",
          accountNumber: "0102-0105678901",
          instructions: "Meezan Mobile App transfer reference 'BREW'",
          isActive: true,
        },
      ],
    },
  },
  {
    id: "v-bundukhan",
    tenantId: "22222222-2222-2222-2222-222222222222",
    name: "Bundu Khan Express",
    slug: "bundu-khan-express",
    tagline: "Charcoal Seekh Kababs & Fresh Flaky Parathas",
    neighborhood: "Mall Road, Lahore",
    address: "Mall Road Commercial Area, Lahore",
    distance: "1.6 km",
    rating: "4.7",
    reviewsCount: "2.4k+",
    coverImageUrl: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=1200&auto=format&fit=crop&q=80",
    operatingHours: "12:00 - 01:00",
    isOpen: true,
    openStatusText: "Open • Closes 01:00",
    supportedModes: ["REMOTE"], // Counter pickup only
    cuisines: ["Pakistani", "Paratha", "Fast Food"],
    featuredDishes: ["Chicken Malai Boti Paratha Roll", "Mutton Seekh Kabab", "Puri Paratha"],
    itemIds: ["item-paratha-1", "item-bundu-seekh", "item-bundu-paratha", "item-pakistani-1"],
    signatureItemId: "item-paratha-1",
    prepLeadMinutes: 12,
    priceRange: "Rs. 320 - 750",
    settings: {
      id: "00000000-0000-0000-0000-000000000002",
      tenantId: "22222222-2222-2222-2222-222222222222",
      name: "Bundu Khan Express",
      slug: "bundu-khan-express",
      tagline: "Charcoal Seekh Kababs & Fresh Flaky Parathas • Counter Pickup",
      coverImageUrl: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=1200&auto=format&fit=crop&q=80",
      rating: "4.7",
      reviewsCount: "2.4k+",
      operatingHours: "12:00 - 01:00",
      mode: VENUE_MODE.COUNTER_PICKUP,
      isOrderingPaused: false,
      slotDurationMinutes: 10,
      prepLeadTimeMinutes: 12,
      claimDeadlineMinutes: 15,
      paymentAccounts: [
        {
          method: PAYMENT_METHOD.EASYPAISA,
          accountTitle: "Bundu Khan Express Mall Rd",
          accountNumber: "0301-7654321",
          instructions: "Transfer exact amount & enter transaction ID",
          isActive: true,
        },
      ],
    },
  },
  {
    id: "v-savour",
    tenantId: "33333333-3333-3333-3333-333333333333",
    name: "Savour Foods & Pulao",
    slug: "savour-foods",
    tagline: "Legendary Pakistani Pulao Kabab & Crispy Broast",
    neighborhood: "Shadman, Lahore",
    address: "Shadman Roundabout, Lahore",
    distance: "2.1 km",
    rating: "4.9",
    reviewsCount: "5.1k+",
    coverImageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&auto=format&fit=crop&q=80",
    operatingHours: "11:00 - 00:00",
    isOpen: true,
    openStatusText: "Open • Closes 00:00",
    supportedModes: ["REMOTE", "IN_VENUE"],
    cuisines: ["Pulao", "Pakistani", "Biryani"],
    featuredDishes: ["Bannu Beef Pulao", "Special Sindhi Chicken Biryani", "Chicken White Karahi"],
    itemIds: ["item-pulao-1", "item-biryani-1", "item-savour-broast", "item-pakistani-1"],
    signatureItemId: "item-pulao-1",
    prepLeadMinutes: 8,
    priceRange: "Rs. 280 - 890",
    settings: {
      id: "00000000-0000-0000-0000-000000000003",
      tenantId: "33333333-3333-3333-3333-333333333333",
      name: "Savour Foods & Pulao",
      slug: "savour-foods",
      tagline: "Legendary Pakistani Pulao Kabab & Crispy Broast",
      coverImageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&auto=format&fit=crop&q=80",
      rating: "4.9",
      reviewsCount: "5.1k+",
      operatingHours: "11:00 - 00:00",
      mode: VENUE_MODE.COUNTER_PICKUP,
      isOrderingPaused: false,
      slotDurationMinutes: 10,
      prepLeadTimeMinutes: 8,
      claimDeadlineMinutes: 15,
      paymentAccounts: [
        {
          method: PAYMENT_METHOD.SADAPAY,
          accountTitle: "Savour Foods Shadman",
          accountNumber: "0321-4455667",
          instructions: "Transfer via SadaPay with customer name in memo",
          isActive: true,
        },
      ],
    },
  },
  {
    id: "v-chaikhana",
    tenantId: "44444444-4444-4444-4444-444444444444",
    name: "Chai Khana & Bakery",
    slug: "chai-khana",
    tagline: "Traditional Doodh Patti, Desi Nashta & Fresh Pastries",
    neighborhood: "DHA Phase 5, Lahore",
    address: "Sector C Commercial, DHA Phase 5, Lahore",
    distance: "3.4 km",
    rating: "4.6",
    reviewsCount: "890+",
    coverImageUrl: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=1200&auto=format&fit=crop&q=80",
    operatingHours: "07:00 - 15:00",
    isOpen: false, // Honest Closed State demonstration
    openStatusText: "Closed • Opens tomorrow 07:00 AM",
    supportedModes: ["REMOTE", "IN_VENUE"],
    cuisines: ["Breakfast", "Specialty Coffee", "Paratha"],
    featuredDishes: ["Desi Nashta Thali", "Belgian Chocolate Soft Serve", "Spanish Iced Latte"],
    itemIds: ["item-breakfast-1", "item-chaikhana-chai", "item-bundu-paratha", "item-2", "item-icecream-1"],
    signatureItemId: "item-breakfast-1",
    prepLeadMinutes: 15,
    priceRange: "Rs. 180 - 520",
    settings: {
      id: "00000000-0000-0000-0000-000000000004",
      tenantId: "44444444-4444-4444-4444-444444444444",
      name: "Chai Khana & Bakery",
      slug: "chai-khana",
      tagline: "Traditional Doodh Patti, Desi Nashta & Fresh Pastries",
      coverImageUrl: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=1200&auto=format&fit=crop&q=80",
      rating: "4.6",
      reviewsCount: "890+",
      operatingHours: "07:00 - 15:00",
      mode: VENUE_MODE.COUNTER_PICKUP,
      isOrderingPaused: true, // Ordering closed
      slotDurationMinutes: 15,
      prepLeadTimeMinutes: 15,
      claimDeadlineMinutes: 15,
      paymentAccounts: [],
    },
  },
];

export function getRegistryVenueBySlug(slug: string): VenueRegistryItem | undefined {
  return VENUE_REGISTRY.find(
    (v) => v.slug.toLowerCase() === slug.toLowerCase() || v.slug.replace(/-/g, "") === slug.replace(/-/g, "")
  );
}

export function getAllRegistryVenues(): VenueRegistryItem[] {
  return VENUE_REGISTRY;
}
