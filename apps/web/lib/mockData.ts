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
  weight?: string | undefined;
  image: string;
  modifierGroups?: ModifierGroup[] | undefined;
}

export interface CategoryData {
  id: string;
  name: string;
  icon: string;
  image?: string | undefined;
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
  neighborhood?: string | undefined;
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

export type OrderingMode = "REMOTE" | "IN_VENUE";

export interface TableContext {
  zoneSlug: string;
  tableNumber: string;
  zoneName?: string;
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
  mode?: OrderingMode | undefined;
  zoneSlug?: string | undefined;
  tableNumber?: string | undefined;
  tableLabel?: string | undefined;
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

export interface CuisineShortcut {
  id: string;
  name: string;
  image: string;
}

export const CUISINE_SHORTCUTS: CuisineShortcut[] = [
  { id: "cat-breakfast", name: "Breakfast", image: "/categories/cat-breakfast.png" },
  { id: "cat-paratha", name: "Paratha", image: "/categories/cat-paratha.png" },
  { id: "cat-fastfood", name: "Fast Food", image: "/categories/cat-fastfood.png" },
  { id: "cat-biryani", name: "Biryani", image: "/categories/cat-biryani.png" },
  { id: "cat-icecream", name: "Ice Cream", image: "/categories/cat-icecream.png" },
  { id: "cat-pulao", name: "Pulao", image: "/categories/cat-pulao.png" },
  { id: "cat-oriental", name: "Oriental", image: "/categories/cat-oriental.png" },
  { id: "cat-pakistani", name: "Pakistani", image: "/categories/cat-pakistani.png" },
];

export const MOCK_CATEGORIES: CategoryData[] = [
  { id: "cat-popular", name: "Popular", icon: "Flame" },
  { id: "cat-all", name: "All", icon: "Utensils" },
  { id: "cat-fastfood", name: "Fast Food", icon: "Burger", image: "/categories/cat-fastfood.png" },
  { id: "cat-paratha", name: "Paratha", icon: "Utensils", image: "/categories/cat-paratha.png" },
  { id: "cat-biryani", name: "Biryani", icon: "Flame", image: "/categories/cat-biryani.png" },
  { id: "cat-pulao", name: "Pulao", icon: "Flame", image: "/categories/cat-pulao.png" },
  { id: "cat-pakistani", name: "Pakistani", icon: "Utensils", image: "/categories/cat-pakistani.png" },
  { id: "cat-breakfast", name: "Breakfast", icon: "Coffee", image: "/categories/cat-breakfast.png" },
  { id: "cat-coffee", name: "Specialty Coffee", icon: "Coffee" },
  { id: "cat-icecream", name: "Ice Cream", icon: "CupSoda", image: "/categories/cat-icecream.png" },
  { id: "cat-oriental", name: "Oriental", icon: "Utensils", image: "/categories/cat-oriental.png" },
  { id: "cat-bites", name: "Quick Bites", icon: "Pizza" },
  { id: "cat-refreshers", name: "Refreshers", icon: "CupSoda" },
];

export const MOCK_ITEMS: MenuItemData[] = [
  {
    id: "item-1",
    categoryId: "cat-fastfood",
    nameEn: "Double Smash Burger",
    nameRomanUrdu: "Do Patties Smash Burger",
    description: "Two 80g smashed prime beef patties, melted cheddar, caramelized onions, house truffle mayo in glazed brioche.",
    price: 750,
    popular: true,
    weight: "240g",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80",
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
    id: "item-paratha-1",
    categoryId: "cat-paratha",
    nameEn: "Chicken Malai Boti Paratha Roll",
    nameRomanUrdu: "Malai Boti Roll",
    description: "Charcoal-grilled tender chicken boti, mint coriander chutney, and pickled onions rolled in a flaky layered paratha.",
    price: 490,
    popular: true,
    weight: "220g",
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80",
    modifierGroups: []
  },
  {
    id: "item-biryani-1",
    categoryId: "cat-biryani",
    nameEn: "Special Sindhi Chicken Biryani",
    nameRomanUrdu: "Special Dum Biryani",
    description: "Aromatic aged basmati rice dum-cooked with tender chicken, spiced aloo, dried plums and fragrant whole saffron.",
    price: 580,
    popular: true,
    weight: "400g",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80",
    modifierGroups: []
  },
  {
    id: "item-pulao-1",
    categoryId: "cat-pulao",
    nameEn: "Bannu Beef Pulao",
    nameRomanUrdu: "Bannu Pulao",
    description: "Traditional slow-cooked bone broth basmati rice infused with tender melt-in-mouth beef chunks and fried onions.",
    price: 650,
    popular: true,
    weight: "420g",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80",
    modifierGroups: []
  },
  {
    id: "item-pakistani-1",
    categoryId: "cat-pakistani",
    nameEn: "Chicken White Karahi (Single)",
    nameRomanUrdu: "Chicken Safaid Karahi",
    description: "Tender boneless chicken wok-cooked with thick yogurt, freshly cracked black pepper, slivered ginger and green chilies.",
    price: 890,
    popular: true,
    weight: "350g",
    image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&auto=format&fit=crop&q=80",
    modifierGroups: []
  },
  {
    id: "item-breakfast-1",
    categoryId: "cat-breakfast",
    nameEn: "Desi Nashta Thali",
    nameRomanUrdu: "Halwa Puri Chana",
    description: "Two freshly fried golden puris served with spiced Lahori chana tarkari, warm suji halwa and mixed pickle.",
    price: 420,
    popular: true,
    weight: "300g",
    image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80",
    modifierGroups: []
  },
  {
    id: "item-2",
    categoryId: "cat-coffee",
    nameEn: "Spanish Iced Latte",
    nameRomanUrdu: "Meethi Iced Latte",
    description: "Double specialty espresso shaken with sweetened condensed milk and cold whole milk over clear craft ice.",
    price: 520,
    popular: true,
    weight: "350ml",
    image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&auto=format&fit=crop&q=80",
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
    id: "item-icecream-1",
    categoryId: "cat-icecream",
    nameEn: "Belgian Chocolate Soft Serve",
    nameRomanUrdu: "Chocolate Soft Serve",
    description: "Rich dark Belgian chocolate swirled in a waffle cone with roasted almond flakes and warm chocolate fudge.",
    price: 360,
    popular: false,
    weight: "160g",
    image: "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=600&auto=format&fit=crop&q=80",
    modifierGroups: []
  },
  {
    id: "item-oriental-1",
    categoryId: "cat-oriental",
    nameEn: "Fiery Szechuan Chow Mein",
    nameRomanUrdu: "Chilli Garlic Chow Mein",
    description: "Wok-tossed noodles with shredded chicken, crisp cabbage, spring onions and homemade garlic chili crisp.",
    price: 590,
    popular: false,
    weight: "320g",
    image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&auto=format&fit=crop&q=80",
    modifierGroups: []
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
    image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80",
    modifierGroups: []
  },
  {
    id: "item-4",
    categoryId: "cat-fastfood",
    nameEn: "Nashville Hot Chicken Sando",
    nameRomanUrdu: "Nashville Chicken Burger",
    description: "Buttermilk fried chicken breast dipped in fiery cayenne oil, dill pickle chips, creamy coleslaw on soft potato bun.",
    price: 680,
    popular: false,
    weight: "260g",
    image: "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=600&auto=format&fit=crop&q=80",
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
    image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&auto=format&fit=crop&q=80",
    modifierGroups: []
  },
  {
    id: "item-bundu-seekh",
    categoryId: "cat-pakistani",
    nameEn: "Mutton Seekh Kabab",
    nameRomanUrdu: "Kabab Seekh",
    description: "Charcoal-grilled minced mutton skewers seasoned with coriander, cumin, crushed chili and fresh ginger.",
    price: 680,
    popular: true,
    weight: "4 skewers",
    image: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80",
    modifierGroups: []
  },
  {
    id: "item-bundu-paratha",
    categoryId: "cat-paratha",
    nameEn: "Puri Paratha",
    nameRomanUrdu: "Crispy Puri Paratha",
    description: "Golden flaky deep-fried multi-layered paratha, perfectly paired with charcoal grilled kababs.",
    price: 150,
    popular: false,
    weight: "120g",
    image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80",
    modifierGroups: []
  },
  {
    id: "item-savour-broast",
    categoryId: "cat-fastfood",
    nameEn: "Crispy Chicken Broast",
    nameRomanUrdu: "Chicken Broast",
    description: "Deep-fried golden quarter chicken coated in signature spiced crust with dinner roll and garlic mayo.",
    price: 520,
    popular: true,
    weight: "Quarter chicken",
    image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80",
    modifierGroups: []
  },
  {
    id: "item-chaikhana-chai",
    categoryId: "cat-coffee",
    nameEn: "Doodh Patti Karak Chai",
    nameRomanUrdu: "Karak Chai",
    description: "Slow-brewed full cream milk tea infused with crushed cardamom pods and Kashmiri saffron strands.",
    price: 180,
    popular: true,
    weight: "250ml",
    image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&auto=format&fit=crop&q=80",
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
    customerName: "Ahmad Ali",
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
    customerName: "Zainab Fatima",
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
