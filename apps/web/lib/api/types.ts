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

export interface UpdateCustomerProfileInput {
  displayName?: string | undefined;
  phone?: string | undefined;
  affiliation?: string | null | undefined;
  badge?: string | undefined;
  dietaryNotes?: string | null | undefined;
  profilePicture?: string | null | undefined;
}

export interface VoucherItem {
  id: string;
  code: string;
  title: string;
  description: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  validUntil: string;
  status: "UNUSED" | "USED" | "EXPIRED";
  minOrderAmount?: number | undefined;
}

export interface InvitedFriend {
  id: string;
  name: string;
  joinedDate: string;
  status: "PENDING" | "COMPLETED";
  rewardClaimed?: boolean | undefined;
}

export interface InviteInfo {
  inviteCode: string;
  inviteUrl: string;
  headline: string;
  friendRewardText: string;
  userRewardText: string;
  earnedRupees?: number | undefined;
  invitedFriends: InvitedFriend[];
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
  updateCustomerProfile(input: UpdateCustomerProfileInput): Promise<{ profile: CustomerProfile }>;
  getVouchers(): Promise<VoucherItem[]>;
  getInviteLink(): Promise<InviteInfo>;
}
