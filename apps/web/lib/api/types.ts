import type {
  VenueSettings,
  MenuCategory,
  MenuItem,
  PickupSlot,
  Order,
  OrderCreateInput,
  PaymentClaim,
  PaymentClaimSubmitInput,
  CustomerProfile,
  CustomerLoginInput,
  CustomerRegisterInput,
} from "@queueless/types";

export interface MenuResponse {
  categories: MenuCategory[];
  items: MenuItem[];
}

export interface ApiClient {
  getVenue(tenantSlug: string): Promise<VenueSettings>;
  getMenu(tenantId: string): Promise<MenuResponse>;
  getPickupSlots(tenantId: string): Promise<PickupSlot[]>;
  createOrder(input: OrderCreateInput): Promise<Order>;
  submitPaymentClaim(input: PaymentClaimSubmitInput): Promise<PaymentClaim>;
  getOrderById(tenantId: string, orderId: string): Promise<Order | null>;
  cancelOrder(tenantId: string, orderId: string): Promise<Order>;
  loginCustomer(input: CustomerLoginInput): Promise<{ profile: CustomerProfile; token: string }>;
  registerCustomer(input: CustomerRegisterInput): Promise<{ profile: CustomerProfile; token: string }>;
}
