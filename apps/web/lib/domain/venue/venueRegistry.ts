import type { VenueSettings } from "@queueless/types";
import { VENUE_MODE, PAYMENT_METHOD } from "@queueless/types";
import type { OrderingMode } from "@/lib/mockData";

export type CityName = "Karachi" | "Hyderabad" | "Lahore" | "Peshawar";

export interface CityRegistryItem {
  id: string;
  name: CityName;
  displayName: string;
  province: string;
  hubs: string[];
}

export const CITY_REGISTRY: CityRegistryItem[] = [
  {
    id: "karachi",
    name: "Karachi",
    displayName: "Karachi",
    province: "Sindh",
    hubs: [
      "Clifton Block 4",
      "Bahadurabad",
      "Saddar Heritage Area",
      "IBA Main Campus",
      "Gulshan-e-Iqbal",
    ],
  },
  {
    id: "hyderabad",
    name: "Hyderabad",
    displayName: "Hyderabad",
    province: "Sindh",
    hubs: [
      "Auto Bhan Road",
      "Saddar Cantt",
      "Qasimabad Phase 1",
      "MUET Campus Jamshoro",
    ],
  },
  {
    id: "lahore",
    name: "Lahore",
    displayName: "Lahore",
    province: "Punjab",
    hubs: [
      "Gulberg III",
      "DHA Phase 5",
      "Mall Road",
      "Shadman",
      "FAST-NUCES Campus",
      "LUMS Campus",
    ],
  },
  {
    id: "peshawar",
    name: "Peshawar",
    displayName: "Peshawar",
    province: "Khyber Pakhtunkhwa",
    hubs: [
      "University Town",
      "Hayatabad Phase 3",
      "Saddar Cantt",
      "Peshawar University Campus",
    ],
  },
];

export interface VenueRegistryItem {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  tagline: string;
  city: CityName;
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
  // --- Lahore Partner Venues ---
  {
    id: "v-brewery",
    tenantId: "11111111-1111-1111-1111-111111111111",
    name: "Brewery Cafe Gulberg",
    slug: "brewery-gulberg",
    tagline: "Specialty Smash Burgers & Third-Wave Coffee",
    city: "Lahore",
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
    city: "Lahore",
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
    city: "Lahore",
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
    city: "Lahore",
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

  // --- Karachi Partner Venues ---
  {
    id: "v-burnsroad",
    tenantId: "55555555-5555-5555-5555-555555555555",
    name: "Burns Road Bun Kabab & Chai",
    slug: "burns-road-cafe",
    tagline: "Heritage Spiced Bun Kababs & Irani Doodh Patti",
    city: "Karachi",
    neighborhood: "Clifton Block 4, Karachi",
    address: "Boat Basin Promenade, Clifton, Karachi",
    distance: "1.2 km",
    rating: "4.8",
    reviewsCount: "3.4k+",
    coverImageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&auto=format&fit=crop&q=80",
    operatingHours: "10:00 - 02:00",
    isOpen: true,
    openStatusText: "Open • Closes 02:00 AM",
    supportedModes: ["REMOTE", "IN_VENUE"],
    cuisines: ["Fast Food", "Pakistani", "Breakfast"],
    featuredDishes: ["Special Daal Anda Bun Kabab", "Karachi Hunter Beef Burger", "Karak Chai"],
    itemIds: ["item-1", "item-3", "item-paratha-1"],
    signatureItemId: "item-1",
    prepLeadMinutes: 8,
    priceRange: "Rs. 220 - 580",
    settings: {
      id: "00000000-0000-0000-0000-000000000005",
      tenantId: "55555555-5555-5555-5555-555555555555",
      name: "Burns Road Bun Kabab & Chai",
      slug: "burns-road-cafe",
      tagline: "Heritage Spiced Bun Kababs & Irani Doodh Patti",
      coverImageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&auto=format&fit=crop&q=80",
      rating: "4.8",
      reviewsCount: "3.4k+",
      operatingHours: "10:00 - 02:00",
      mode: VENUE_MODE.COUNTER_PICKUP,
      isOrderingPaused: false,
      slotDurationMinutes: 10,
      prepLeadTimeMinutes: 8,
      claimDeadlineMinutes: 15,
      paymentAccounts: [
        {
          method: PAYMENT_METHOD.SADAPAY,
          accountTitle: "Burns Road Clifton",
          accountNumber: "0333-1122334",
          instructions: "Transfer with customer mobile in reference",
          isActive: true,
        },
      ],
    },
  },
  {
    id: "v-chambeli",
    tenantId: "66666666-6666-6666-6666-666666666666",
    name: "Chambeli Cafe & Roastery",
    slug: "chambeli-cafe",
    tagline: "Cold Brews, Grilled Melt Sandwiches & Specialty Bakes",
    city: "Karachi",
    neighborhood: "IBA Main Campus, Karachi",
    address: "University Road, Karachi",
    distance: "0.4 km",
    rating: "4.9",
    reviewsCount: "1.5k+",
    coverImageUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&auto=format&fit=crop&q=80",
    operatingHours: "08:30 - 22:30",
    isOpen: true,
    openStatusText: "Open • Closes 22:30",
    supportedModes: ["REMOTE"], // Counter pickup only
    cuisines: ["Specialty Coffee", "Fast Food", "Breakfast"],
    featuredDishes: ["Spanish Iced Latte", "Double Smash Burger", "Chocolate Chip Cookie"],
    itemIds: ["item-2", "item-1", "item-4"],
    signatureItemId: "item-2",
    prepLeadMinutes: 10,
    priceRange: "Rs. 380 - 820",
    settings: {
      id: "00000000-0000-0000-0000-000000000006",
      tenantId: "66666666-6666-6666-6666-666666666666",
      name: "Chambeli Cafe & Roastery",
      slug: "chambeli-cafe",
      tagline: "Cold Brews, Grilled Melt Sandwiches & Specialty Bakes",
      coverImageUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&auto=format&fit=crop&q=80",
      rating: "4.9",
      reviewsCount: "1.5k+",
      operatingHours: "08:30 - 22:30",
      mode: VENUE_MODE.COUNTER_PICKUP,
      isOrderingPaused: false,
      slotDurationMinutes: 10,
      prepLeadTimeMinutes: 10,
      claimDeadlineMinutes: 15,
      paymentAccounts: [
        {
          method: PAYMENT_METHOD.EASYPAISA,
          accountTitle: "Chambeli Roasters",
          accountNumber: "0345-9876543",
          instructions: "Transfer and input 6-digit TID",
          isActive: true,
        },
      ],
    },
  },

  // --- Hyderabad Partner Venues ---
  {
    id: "v-bombaycafe",
    tenantId: "77777777-7777-7777-7777-777777777777",
    name: "Bombay Cafe & Heritage Bakery",
    slug: "bombay-cafe-hyderabad",
    tagline: "Celebrated Coffee Cake, Mutton Rolls & Irani Tea",
    city: "Hyderabad",
    neighborhood: "Auto Bhan Road, Hyderabad",
    address: "Auto Bhan Commercial Avenue, Hyderabad",
    distance: "1.1 km",
    rating: "4.9",
    reviewsCount: "4.1k+",
    coverImageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80",
    operatingHours: "09:00 - 23:00",
    isOpen: true,
    openStatusText: "Open • Closes 23:00",
    supportedModes: ["REMOTE", "IN_VENUE"],
    cuisines: ["Breakfast", "Specialty Coffee", "Paratha"],
    featuredDishes: ["Famous Coffee Cake Slice", "Desi Nashta Thali", "Chicken Paratha Roll"],
    itemIds: ["item-breakfast-1", "item-paratha-1", "item-2"],
    signatureItemId: "item-breakfast-1",
    prepLeadMinutes: 10,
    priceRange: "Rs. 250 - 620",
    settings: {
      id: "00000000-0000-0000-0000-000000000007",
      tenantId: "77777777-7777-7777-7777-777777777777",
      name: "Bombay Cafe & Heritage Bakery",
      slug: "bombay-cafe-hyderabad",
      tagline: "Celebrated Coffee Cake, Mutton Rolls & Irani Tea",
      coverImageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80",
      rating: "4.9",
      reviewsCount: "4.1k+",
      operatingHours: "09:00 - 23:00",
      mode: VENUE_MODE.COUNTER_PICKUP,
      isOrderingPaused: false,
      slotDurationMinutes: 10,
      prepLeadTimeMinutes: 10,
      claimDeadlineMinutes: 15,
      paymentAccounts: [
        {
          method: PAYMENT_METHOD.SADAPAY,
          accountTitle: "Bombay Cafe Auto Bhan",
          accountNumber: "0302-3344556",
          instructions: "Transfer via SadaPay handle @bombaycafe",
          isActive: true,
        },
      ],
    },
  },

  // --- Peshawar Partner Venues ---
  {
    id: "v-charsi",
    tenantId: "88888888-8888-8888-8888-888888888888",
    name: "Charsi Shinwari Express",
    slug: "charsi-shinwari-peshawar",
    tagline: "Traditional Shinwari Karahi, Dum Pukht & Qehwa",
    city: "Peshawar",
    neighborhood: "University Town, Peshawar",
    address: "Jamrud Road, University Town, Peshawar",
    distance: "1.8 km",
    rating: "4.8",
    reviewsCount: "2.7k+",
    coverImageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&auto=format&fit=crop&q=80",
    operatingHours: "12:00 - 00:00",
    isOpen: true,
    openStatusText: "Open • Closes 00:00",
    supportedModes: ["REMOTE", "IN_VENUE"],
    cuisines: ["Pakistani", "Fast Food"],
    featuredDishes: ["Bannu Beef Pulao", "Chicken Malai Boti Paratha Roll", "Double Smash Burger"],
    itemIds: ["item-pulao-1", "item-paratha-1", "item-1"],
    signatureItemId: "item-pulao-1",
    prepLeadMinutes: 15,
    priceRange: "Rs. 350 - 950",
    settings: {
      id: "00000000-0000-0000-0000-000000000008",
      tenantId: "88888888-8888-8888-8888-888888888888",
      name: "Charsi Shinwari Express",
      slug: "charsi-shinwari-peshawar",
      tagline: "Traditional Shinwari Karahi, Dum Pukht & Qehwa",
      coverImageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&auto=format&fit=crop&q=80",
      rating: "4.8",
      reviewsCount: "2.7k+",
      operatingHours: "12:00 - 00:00",
      mode: VENUE_MODE.COUNTER_PICKUP,
      isOrderingPaused: false,
      slotDurationMinutes: 15,
      prepLeadTimeMinutes: 15,
      claimDeadlineMinutes: 15,
      paymentAccounts: [
        {
          method: PAYMENT_METHOD.EASYPAISA,
          accountTitle: "Charsi Shinwari Town",
          accountNumber: "0313-5566778",
          instructions: "Transfer and input transaction reference",
          isActive: true,
        },
      ],
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

export function getVenuesByCity(city: CityName): VenueRegistryItem[] {
  return VENUE_REGISTRY.filter((v) => v.city.toLowerCase() === city.toLowerCase());
}
