import type {
  ApiClient,
  MenuResponse,
  UpdateCustomerProfileInput,
  VoucherItem,
  InviteInfo,
} from "./types";
import {
  ORDER_STATUS,
  PAYMENT_CLAIM_STATUS,
  PAYMENT_METHOD,
  SLOT_STATUS,
  VENUE_MODE,
  type CustomerLoginInput,
  type CustomerProfile,
  type CustomerRegisterInput,
  type MenuCategory,
  type MenuItem,
  type Order,
  type OrderCreateInput,
  type PaymentClaim,
  type PaymentClaimSubmitInput,
  type PickupSlot,
  type VenueSettings,
} from "@queueless/types";

export const MOCK_VENUE_SETTINGS: VenueSettings = {
  id: "00000000-0000-0000-0000-000000000001",
  tenantId: "11111111-1111-1111-1111-111111111111",
  name: "Brewery Cafe Gulberg",
  slug: "brewery-gulberg",
  tagline: "Specialty Smash Burgers & Third-Wave Coffee • Fast Counter Pickup",
  coverImageUrl:
    "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&auto=format&fit=crop&q=80",
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
    {
      method: PAYMENT_METHOD.RAAST_QR,
      accountTitle: "Brewery Cafe Raast ID",
      accountNumber: "923001234567",
      instructions: "Scan Raast QR at pickup counter or enter mobile IBAN",
      isActive: true,
    },
  ],
};

export const MOCK_CATEGORIES: MenuCategory[] = [
  {
    id: "cat-popular",
    tenantId: MOCK_VENUE_SETTINGS.tenantId,
    nameEn: "Popular",
    nameUrdu: "Mashhoor",
    iconName: "Flame",
    sortOrder: 1,
  },
  {
    id: "cat-burgers",
    tenantId: MOCK_VENUE_SETTINGS.tenantId,
    nameEn: "Burgers",
    nameUrdu: "Smash Burgers",
    iconName: "Utensils",
    sortOrder: 2,
  },
  {
    id: "cat-coffee",
    tenantId: MOCK_VENUE_SETTINGS.tenantId,
    nameEn: "Specialty Coffee",
    nameUrdu: "Khaas Coffee",
    iconName: "Coffee",
    sortOrder: 3,
  },
  {
    id: "cat-sides",
    tenantId: MOCK_VENUE_SETTINGS.tenantId,
    nameEn: "Sides & Fries",
    nameUrdu: "French Fries",
    iconName: "Flame",
    sortOrder: 4,
  },
  {
    id: "cat-shakes",
    tenantId: MOCK_VENUE_SETTINGS.tenantId,
    nameEn: "Thick Shakes",
    nameUrdu: "Thick Shakes",
    iconName: "Coffee",
    sortOrder: 5,
  },
];

export const MOCK_MENU_ITEMS: MenuItem[] = [
  {
    id: "item-smash-burger",
    tenantId: MOCK_VENUE_SETTINGS.tenantId,
    categoryId: "cat-burgers",
    nameEn: "Double Smash Burger",
    nameUrdu: "Double Smash Burger • Ziada Cheese",
    descriptionEn:
      "Two 80g smashed beef patties, melted sharp cheddar, house burger sauce, toasted potato bun.",
    portionWeightGrams: 240,
    pricePkr: 890,
    imageUrl:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80",
    prepTimeMinutes: 6,
    isAvailable: true,
    isPopular: true,
    modifierGroups: [
      {
        id: "mod-addons",
        nameEn: "Add-Ons",
        required: false,
        minSelections: 0,
        maxSelections: 3,
        options: [
          {
            id: "opt-extra-patty",
            nameEn: "Extra Smash Patty",
            nameUrdu: "Extra Patty",
            pricePkr: 250,
            type: "ADD_ON",
          },
          {
            id: "opt-truffle-mayo",
            nameEn: "Truffle Mayo",
            nameUrdu: "Truffle Mayo",
            pricePkr: 80,
            type: "ADD_ON",
          },
          {
            id: "opt-turkey-bacon",
            nameEn: "Halal Turkey Bacon",
            nameUrdu: "Crispy Bacon",
            pricePkr: 150,
            type: "ADD_ON",
          },
        ],
      },
      {
        id: "mod-exclusions",
        nameEn: "Preparation Preference",
        required: false,
        minSelections: 0,
        maxSelections: 2,
        options: [
          {
            id: "opt-no-onion",
            nameEn: "No Pickled Onions",
            nameUrdu: "Piyaz ke baghair",
            pricePkr: 0,
            type: "EXCLUSION",
          },
          {
            id: "opt-sauce-side",
            nameEn: "Sauce on the Side",
            nameUrdu: "Sauce alag",
            pricePkr: 0,
            type: "PREFERENCE",
          },
        ],
      },
    ],
  },
  {
    id: "item-iced-latte",
    tenantId: MOCK_VENUE_SETTINGS.tenantId,
    categoryId: "cat-coffee",
    nameEn: "Spanish Iced Latte",
    nameUrdu: "Spanish Iced Latte",
    descriptionEn:
      "Double espresso shot over sweetened milk and slow-melt artisanal ice.",
    portionWeightGrams: 350,
    pricePkr: 580,
    imageUrl:
      "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&auto=format&fit=crop&q=80",
    prepTimeMinutes: 4,
    isAvailable: true,
    isPopular: true,
    modifierGroups: [
      {
        id: "mod-milk",
        nameEn: "Milk Choice",
        required: true,
        minSelections: 1,
        maxSelections: 1,
        options: [
          {
            id: "opt-whole-milk",
            nameEn: "Fresh Whole Milk",
            nameUrdu: "Whole Milk",
            pricePkr: 0,
            type: "PREFERENCE",
          },
          {
            id: "opt-oat-milk",
            nameEn: "Oat Milk Substitute",
            nameUrdu: "Oat Milk",
            pricePkr: 120,
            type: "ADD_ON",
          },
        ],
      },
      {
        id: "mod-sweetness",
        nameEn: "Sweetness Level",
        required: true,
        minSelections: 1,
        maxSelections: 1,
        options: [
          {
            id: "opt-regular-sweet",
            nameEn: "Standard Sweetness",
            nameUrdu: "Normal Meetha",
            pricePkr: 0,
            type: "PREFERENCE",
          },
          {
            id: "opt-less-sweet",
            nameEn: "Half Sweetness",
            nameUrdu: "Kam Meetha",
            pricePkr: 0,
            type: "PREFERENCE",
          },
        ],
      },
    ],
  },
  {
    id: "item-loaded-fries",
    tenantId: MOCK_VENUE_SETTINGS.tenantId,
    categoryId: "cat-sides",
    nameEn: "Animal Style Fries",
    nameUrdu: "Loaded Cheese Fries",
    descriptionEn:
      "Skin-on golden fries topped with melted cheddar, grilled onions, and house sauce.",
    portionWeightGrams: 280,
    pricePkr: 490,
    imageUrl:
      "https://images.unsplash.com/photo-1585109649139-366815a0d713?w=600&auto=format&fit=crop&q=80",
    prepTimeMinutes: 5,
    isAvailable: true,
    isPopular: false,
    modifierGroups: [],
  },
  {
    id: "item-cold-brew",
    tenantId: MOCK_VENUE_SETTINGS.tenantId,
    categoryId: "cat-coffee",
    nameEn: "Nitro Cold Brew",
    nameUrdu: "Cold Brew Coffee",
    descriptionEn:
      "Steeped for 18 hours in cold filtered water. Smooth, chocolatey, low-acidity notes.",
    portionWeightGrams: 300,
    pricePkr: 520,
    imageUrl:
      "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&auto=format&fit=crop&q=80",
    prepTimeMinutes: 2,
    isAvailable: true,
    isPopular: false,
    modifierGroups: [],
  },
  {
    id: "item-cookie-shake",
    tenantId: MOCK_VENUE_SETTINGS.tenantId,
    categoryId: "cat-shakes",
    nameEn: "Lotus Biscoff Shake",
    nameUrdu: "Biscoff Thick Shake",
    descriptionEn:
      "Vanilla bean soft serve blended with Biscoff spread and crushed caramelized cookie crumble.",
    portionWeightGrams: 380,
    pricePkr: 650,
    imageUrl:
      "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&auto=format&fit=crop&q=80",
    prepTimeMinutes: 5,
    isAvailable: true,
    isPopular: false,
    modifierGroups: [],
  },
];

export const MOCK_PICKUP_SLOTS: PickupSlot[] = [
  {
    time: "08:40",
    status: SLOT_STATUS.AVAILABLE,
    capacity: 10,
    reservedCount: 2,
    breakSlotName: "Break Slot #1",
  },
  {
    time: "08:55",
    status: SLOT_STATUS.AVAILABLE,
    capacity: 10,
    reservedCount: 5,
    breakSlotName: "Break Slot #2",
  },
  {
    time: "09:10",
    status: SLOT_STATUS.FILLING_FAST,
    capacity: 10,
    reservedCount: 8,
    breakSlotName: "Break Slot #3",
  },
  {
    time: "09:25",
    status: SLOT_STATUS.FULL,
    capacity: 10,
    reservedCount: 10,
    breakSlotName: "Break Slot #4",
  },
  {
    time: "09:40",
    status: SLOT_STATUS.AVAILABLE,
    capacity: 10,
    reservedCount: 1,
    breakSlotName: "Break Slot #5",
  },
];

export class MockApiClient implements ApiClient {
  async getVenue(tenantSlug: string): Promise<VenueSettings> {
    return {
      ...MOCK_VENUE_SETTINGS,
      slug: tenantSlug,
    };
  }

  async getMenu(tenantId: string): Promise<MenuResponse> {
    return {
      categories: MOCK_CATEGORIES,
      items: MOCK_MENU_ITEMS,
    };
  }

  async getPickupSlots(tenantId: string): Promise<PickupSlot[]> {
    return MOCK_PICKUP_SLOTS;
  }

  async createOrder(input: OrderCreateInput): Promise<Order> {
    const orderNumber = Math.floor(100 + Math.random() * 900);
    const subtotal = input.items.reduce((acc, it) => {
      const match = MOCK_MENU_ITEMS.find((m) => m.id === it.menuItemId);
      const base = match ? match.pricePkr : 890;
      const mods = it.selectedModifiers.reduce((mSum, m) => mSum + m.pricePkr, 0);
      return acc + (base + mods) * it.quantity;
    }, 0);

    const isTableOrder = input.mode === "IN_VENUE";

    const newOrder: Order = {
      id: crypto.randomUUID(),
      orderNumber,
      tenantId: input.tenantId,
      customerRef: isTableOrder ? null : crypto.randomUUID(),
      customerDisplayName: input.customerDisplayName || (isTableOrder ? "Table Guest" : "Ahmad Ali"),
      mode: input.mode,
      tableContext: input.tableContext || null,
      pickupSlot: input.pickupSlot || null,
      breakSlot: input.pickupSlot ? "Break Slot #1" : undefined,
      state: isTableOrder ? ORDER_STATUS.PREPARING : ORDER_STATUS.PENDING_PAYMENT,
      subtotalPkr: subtotal,
      discountPkr: 0,
      totalPkr: subtotal,
      kitchenStartAt: isTableOrder ? new Date().toISOString() : null,
      readyAt: null,
      servedAt: null,
      voidedAt: null,
      items: input.items.map((it) => {
        const itemMatch = MOCK_MENU_ITEMS.find((m) => m.id === it.menuItemId);
        return {
          id: crypto.randomUUID(),
          orderId: "",
          menuItemId: it.menuItemId,
          nameSnapshot: itemMatch ? itemMatch.nameEn : "Menu Item",
          pricePkrSnapshot: itemMatch ? itemMatch.pricePkr : 890,
          quantity: it.quantity,
          selectedModifiers: it.selectedModifiers,
          itemNotes: it.itemNotes || null,
        };
      }),
      claim: null,
      createdAt: new Date().toISOString(),
    };

    return newOrder;
  }

  async submitPaymentClaim(input: PaymentClaimSubmitInput): Promise<PaymentClaim> {
    return {
      id: crypto.randomUUID(),
      orderId: input.orderId,
      tenantId: MOCK_VENUE_SETTINGS.tenantId,
      paymentMethod: input.paymentMethod,
      claimedTxnId: input.claimedTxnId,
      proofImageUrl: input.proofImageUrl || null,
      status: PAYMENT_CLAIM_STATUS.UNVERIFIED,
      reviewedAt: null,
      reviewedByStaffId: null,
      undoExpiresAt: null,
      createdAt: new Date().toISOString(),
    };
  }

  async getOrderById(tenantId: string, orderId: string): Promise<Order | null> {
    return null;
  }

  async cancelOrder(tenantId: string, orderId: string): Promise<Order> {
    throw new Error("Order cancellation must be performed via active session");
  }

  async loginCustomer(input: CustomerLoginInput): Promise<{ profile: CustomerProfile; token: string }> {
    return {
      profile: {
        id: crypto.randomUUID(),
        email: input.email,
        phone: "+923001234567",
        displayName: "Ahmad Ali",
        emailVerified: true,
        affiliation: "FAST-NUCES",
        badge: "Student",
        dietaryNotes: "Halal only • Mild spice",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      token: "mock-jwt-token-authenticated",
    };
  }

  async registerCustomer(input: CustomerRegisterInput): Promise<{ profile: CustomerProfile; token: string }> {
    return {
      profile: {
        id: crypto.randomUUID(),
        email: input.email,
        phone: input.phone,
        displayName: input.displayName || "Diner",
        emailVerified: false,
        affiliation: null,
        badge: "Diner",
        dietaryNotes: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      token: "mock-jwt-token-unverified",
    };
  }

  async updateCustomerProfile(input: UpdateCustomerProfileInput): Promise<{ profile: CustomerProfile }> {
    const isAffiliated = Boolean(input.affiliation && input.affiliation !== "None");
    return {
      profile: {
        id: "00000000-0000-0000-0000-000000000002",
        email: "ahmad.ali@nu.edu.pk",
        phone: input.phone || "+923001234567",
        displayName: input.displayName || "Ahmad Ali",
        emailVerified: true,
        affiliation: isAffiliated ? input.affiliation ?? null : null,
        badge: isAffiliated ? "Student" : "Diner",
        dietaryNotes: input.dietaryNotes || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };
  }

  async getVouchers(): Promise<VoucherItem[]> {
    return MOCK_VOUCHERS;
  }

  async getInviteLink(): Promise<InviteInfo> {
    return MOCK_INVITE_INFO;
  }
}

export const MOCK_VOUCHERS: VoucherItem[] = [
  {
    id: "vouch-1",
    code: "PROMO50",
    title: "First Order Discount",
    description: "50% off your first order",
    discountType: "PERCENTAGE",
    discountValue: 50,
    validUntil: "Dec 31, 2026",
    status: "UNUSED",
    minOrderAmount: 300,
  },
  {
    id: "vouch-2",
    code: "STUDENT10",
    title: "Campus Partner Perk",
    description: "10% off as a verified student",
    discountType: "PERCENTAGE",
    discountValue: 10,
    validUntil: "Dec 31, 2026",
    status: "UNUSED",
    minOrderAmount: 200,
  },
  {
    id: "vouch-3",
    code: "WELCOME15",
    title: "Welcome Order",
    description: "15% off your welcome order",
    discountType: "PERCENTAGE",
    discountValue: 15,
    validUntil: "Nov 30, 2026",
    status: "USED",
    minOrderAmount: 250,
  },
  {
    id: "vouch-4",
    code: "FRIENDME",
    title: "Referral Bonus",
    description: "Rs. 100 off when a friend orders",
    discountType: "FIXED",
    discountValue: 100,
    validUntil: "Dec 31, 2026",
    status: "UNUSED",
    minOrderAmount: 400,
  },
];

export const MOCK_INVITE_INFO: InviteInfo = {
  inviteCode: "AAHMADALI",
  inviteUrl: "https://queueless.pk/join/AAHMADALI",
  headline: "Invite friends, get Rs. 100",
  friendRewardText: "They get Rs. 50 on signup",
  userRewardText: "You get Rs. 100 once they complete their first order (min. Rs. 200)",
  invitedFriends: [
    {
      id: "inv-1",
      name: "Bilal Khan",
      joinedDate: "Oct 10, 2026",
      status: "PENDING",
    },
    {
      id: "inv-2",
      name: "Sarah Ahmed",
      joinedDate: "Sep 28, 2026",
      status: "COMPLETED",
      rewardClaimed: true,
    },
  ],
};
