export interface ModifierItem {
  id: string;
  nameEn: string;
  nameRomanUrdu: string;
  priceDelta: number;
  type: "ADD_ON" | "EXCLUSION" | "PREFERENCE";
}

export interface ModifierGroup {
  id: string;
  title: string;
  min: number;
  max: number;
  modifiers: ModifierItem[];
}

export interface MenuItemData {
  id: string;
  categoryId: string;
  nameEn: string;
  nameRomanUrdu: string;
  description: string;
  price: number;
  popular: boolean;
  weight?: string;
  image: string;
  modifierGroups?: ModifierGroup[];
}

export interface CategoryData {
  id: string;
  name: string;
  icon: string;
}

export interface PaymentMethodData {
  id: string;
  kind: "EASYPAISA" | "SADAPAY" | "BANK" | "CASH";
  label: string;
  accountTitle: string;
  accountNumber: string;
  instructions: string;
}

export interface VenueData {
  name: string;
  slug: string;
  tagline: string;
  coverImage: string;
  rating: string;
  reviewsCount: string;
  prepLeadMinutes: number;
  openTime: string;
  closeTime: string;
  priceNote: string;
  paymentMethods: PaymentMethodData[];
}

export interface PickupSlotOption {
  time: string;
  status: "available" | "filling" | "full";
  label: string;
  breakSlot: string;
}

export interface OrderLineItem {
  name: string;
  qty: number;
  price: number;
  mods: string[];
  note: string;
}

export interface OrderData {
  id: string;
  code: string;
  customerName: string;
  customerEmail: string;
  items: OrderLineItem[];
  total: number;
  slot: string;
  breakSlot: string;
  state: "PENDING_PAYMENT" | "SCHEDULED" | "PREPARING" | "READY" | "SERVED" | "VOIDED";
  paymentMethod: string;
  txnId: string;
  hasScreenshot: boolean;
  createdAt: string;
  kitchenStartAt: string;
  undoUntil: number | null;
  rejectionReason: string | null;
  refundOwed: boolean;
}

export const MOCK_VENUE: VenueData = {
  name: "Brewery Cafe Gulberg",
  slug: "brewery-cafe-gulberg",
  tagline: "Specialty Coffee & Gourmet Burgers",
  coverImage: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&q=80",
  rating: "4.8",
  reviewsCount: "340+",
  prepLeadMinutes: 10,
  openTime: "08:00",
  closeTime: "22:00",
  priceNote: "Prices are set by the venue.",
  paymentMethods: [
    {
      id: "pm-ep",
      kind: "EASYPAISA",
      label: "Easypaisa Counter",
      accountTitle: "Brewery Cafe Gulberg",
      accountNumber: "0300-1234567",
      instructions: "Transfer exact amount & enter the 11-digit Txn ID."
    },
    {
      id: "pm-sp",
      kind: "SADAPAY",
      label: "SadaPay",
      accountTitle: "Muhammad Usama (Cafe Partner)",
      accountNumber: "0300-9876543",
      instructions: "Send via SadaPay wallet or IBAN with order number in memo."
    },
    {
      id: "pm-bank",
      kind: "BANK",
      label: "Meezan Bank (Raast)",
      accountTitle: "Brewery Cafe Pvt Ltd",
      accountNumber: "PK12MEZN0001234567890123",
      instructions: "Instant transfer via Raast ID or IBAN."
    }
  ]
};

export const MOCK_CATEGORIES: CategoryData[] = [
  { id: "cat-popular", name: "Popular", icon: "Flame" },
  { id: "cat-burgers", name: "Burgers", icon: "Burger" },
  { id: "cat-coffee", name: "Specialty Coffee", icon: "Coffee" },
  { id: "cat-bites", name: "Quick Bites", icon: "Pizza" },
  { id: "cat-refreshers", name: "Refreshers", icon: "CupSoda" },
];

export const MOCK_ITEMS: MenuItemData[] = [
  {
    id: "item-1",
    categoryId: "cat-burgers",
    nameEn: "Double Smash Burger",
    nameRomanUrdu: "Double Smash Burger",
    description: "Two 80g smashed prime beef patties, melted cheddar, caramelized onions, house truffle mayo in glazed brioche.",
    price: 750,
    popular: true,
    weight: "240g",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80",
    modifierGroups: [
      {
        id: "mg-addons",
        title: "Cheese & Add-ons",
        min: 0,
        max: 3,
        modifiers: [
          { id: "m-1", nameEn: "Extra Melted Cheddar", nameRomanUrdu: "Ziada Cheese", priceDelta: 120, type: "ADD_ON" },
          { id: "m-2", nameEn: "Smoked Beef Bacon Strip", nameRomanUrdu: "Beef Bacon", priceDelta: 180, type: "ADD_ON" },
          { id: "m-3", nameEn: "Crispy Fried Egg", nameRomanUrdu: "Anda", priceDelta: 80, type: "ADD_ON" },
        ]
      },
      {
        id: "mg-excl",
        title: "Dietary & Exclusions",
        min: 0,
        max: 3,
        modifiers: [
          { id: "m-4", nameEn: "No Pickles", nameRomanUrdu: "Achar Na Dalein", priceDelta: 0, type: "EXCLUSION" },
          { id: "m-5", nameEn: "No Onion", nameRomanUrdu: "Pyaz Na Dalein", priceDelta: 0, type: "EXCLUSION" },
          { id: "m-6", nameEn: "Sauce on the Side", nameRomanUrdu: "Sauce Alag", priceDelta: 0, type: "PREFERENCE" },
        ]
      }
    ]
  },
  {
    id: "item-2",
    categoryId: "cat-coffee",
    nameEn: "Spanish Iced Latte",
    nameRomanUrdu: "Spanish Iced Latte",
    description: "Double specialty espresso shaken with sweetened condensed milk and cold whole milk over clear craft ice.",
    price: 520,
    popular: true,
    weight: "350ml",
    image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400&q=80",
    modifierGroups: [
      {
        id: "mg-milk",
        title: "Milk Choice",
        min: 0,
        max: 1,
        modifiers: [
          { id: "m-7", nameEn: "Oat Milk Substitute", nameRomanUrdu: "Oat Milk", priceDelta: 150, type: "ADD_ON" },
          { id: "m-8", nameEn: "Almond Milk Substitute", nameRomanUrdu: "Almond Milk", priceDelta: 150, type: "ADD_ON" },
        ]
      },
      {
        id: "mg-sweet",
        title: "Sweetness Level",
        min: 0,
        max: 1,
        modifiers: [
          { id: "m-9", nameEn: "Less Sweet (50%)", nameRomanUrdu: "Kam Cheeni", priceDelta: 0, type: "PREFERENCE" },
          { id: "m-10", nameEn: "Extra Espresso Shot", nameRomanUrdu: "Extra Shot", priceDelta: 120, type: "ADD_ON" },
        ]
      }
    ]
  },
  {
    id: "item-3",
    categoryId: "cat-bites",
    nameEn: "Loaded Truffle Fries",
    nameRomanUrdu: "Truffle Fries",
    description: "Crispy skin-on rustic potato fries tossed in Italian white truffle oil, shaved parmesan & fresh rosemary garlic aioli.",
    price: 450,
    popular: true,
    weight: "180g",
    image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&q=80",
    modifierGroups: []
  },
  {
    id: "item-4",
    categoryId: "cat-burgers",
    nameEn: "Nashville Hot Chicken Sando",
    nameRomanUrdu: "Nashville Chicken Burger",
    description: "Buttermilk fried chicken breast dipped in fiery cayenne oil, dill pickle chips, creamy coleslaw on soft potato bun.",
    price: 680,
    popular: false,
    weight: "260g",
    image: "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=400&q=80",
    modifierGroups: []
  },
  {
    id: "item-5",
    categoryId: "cat-refreshers",
    nameEn: "Peach Passion Fruit Iced Tea",
    nameRomanUrdu: "Peach Iced Tea",
    description: "Slow-brewed Ceylon black tea infused with white peach puree and real passion fruit seeds.",
    price: 390,
    popular: false,
    weight: "400ml",
    image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80",
    modifierGroups: []
  }
];

export function getAvailableSlots(): PickupSlotOption[] {
  const slots: PickupSlotOption[] = [];
  const now = new Date();
  const startMin = Math.ceil((now.getMinutes() + 15) / 10) * 10;
  const start = new Date(now);
  start.setMinutes(startMin, 0, 0);

  for (let i = 0; i < 5; i++) {
    const slotTime = new Date(start.getTime() + i * 15 * 60000);
    const timeStr = slotTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
    const capacityState: "available" | "filling" | "full" = i === 1 ? "filling" : (i === 3 ? "full" : "available");
    slots.push({
      time: timeStr,
      status: capacityState,
      label: timeStr,
      breakSlot: `Break Slot #${i + 1}`
    });
  }
  return slots;
}

export const INITIAL_ORDERS: OrderData[] = [
  {
    id: "ORD-108",
    code: "#108",
    customerName: "Ahmad Ali (FAST)",
    customerEmail: "ahmad.ali@nu.edu.pk",
    items: [
      { name: "Double Smash Burger", qty: 1, price: 750, mods: ["Extra Melted Cheddar", "No Onion"], note: "Cut in half please" },
      { name: "Spanish Iced Latte", qty: 1, price: 520, mods: ["Oat Milk Substitute"], note: "" }
    ],
    total: 1390,
    slot: "13:30",
    breakSlot: "Break Slot #2",
    state: "PENDING_PAYMENT",
    paymentMethod: "Easypaisa",
    txnId: "EP-9823411",
    hasScreenshot: true,
    createdAt: "13:12",
    kitchenStartAt: "13:20",
    undoUntil: null,
    rejectionReason: null,
    refundOwed: false
  },
  {
    id: "ORD-105",
    code: "#105",
    customerName: "Zainab Fatima (LUMS)",
    customerEmail: "zainab@lums.edu.pk",
    items: [
      { name: "Loaded Truffle Fries", qty: 2, price: 900, mods: [], note: "Extra napkins please" }
    ],
    total: 900,
    slot: "13:45",
    breakSlot: "Break Slot #3",
    state: "SCHEDULED",
    paymentMethod: "SadaPay",
    txnId: "SP-5541908",
    hasScreenshot: false,
    createdAt: "13:15",
    kitchenStartAt: "13:35",
    undoUntil: Date.now() + 280000,
    rejectionReason: null,
    refundOwed: false
  },
  {
    id: "ORD-102",
    code: "#102",
    customerName: "Bilal Tariq",
    customerEmail: "bilal@gmail.com",
    items: [
      { name: "Double Smash Burger", qty: 1, price: 750, mods: [], note: "" }
    ],
    total: 750,
    slot: "13:15",
    breakSlot: "Break Slot #1",
    state: "PREPARING",
    paymentMethod: "Meezan Bank",
    txnId: "MB-0987123",
    hasScreenshot: true,
    createdAt: "12:55",
    kitchenStartAt: "13:05",
    undoUntil: null,
    rejectionReason: null,
    refundOwed: false
  }
];
