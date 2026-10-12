import type {
  ApiClient,
  MenuResponse,
  UpdateCustomerProfileInput,
  VoucherItem,
  InviteInfo,
  FeedbackSubmitInput,
} from "./types";
import type {
  CustomerLoginInput,
  CustomerProfile,
  CustomerRegisterInput,
  Order,
  OrderCreateInput,
  PaymentClaim,
  PaymentClaimSubmitInput,
  PickupSlot,
  VenueSettings,
} from "@queueless/types";
import { MockApiClient } from "./mockClient";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export class HttpApiClient implements ApiClient {
  private fallback = new MockApiClient();

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${path}`;
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      const errorBody = await res.text();
      throw new Error(`API Request failed (${res.status}): ${errorBody}`);
    }
    return (await res.json()) as T;
  }

  async getVenue(tenantSlug: string): Promise<VenueSettings> {
    try {
      return await this.request<VenueSettings>(`/api/v1/venues/${tenantSlug}`);
    } catch {
      // Fallback to mock if API server is not running
      return this.fallback.getVenue(tenantSlug);
    }
  }

  async getMenu(tenantId: string): Promise<MenuResponse> {
    try {
      return await this.request<MenuResponse>(`/api/v1/menu/${tenantId}`);
    } catch {
      return this.fallback.getMenu(tenantId);
    }
  }

  async getPickupSlots(tenantId: string): Promise<PickupSlot[]> {
    try {
      return await this.request<PickupSlot[]>(`/api/v1/venues/${tenantId}/slots`);
    } catch {
      return this.fallback.getPickupSlots(tenantId);
    }
  }

  async createOrder(input: OrderCreateInput): Promise<Order> {
    try {
      return await this.request<Order>("/api/v1/orders", {
        method: "POST",
        body: JSON.stringify(input),
      });
    } catch {
      return this.fallback.createOrder(input);
    }
  }

  async submitPaymentClaim(input: PaymentClaimSubmitInput): Promise<PaymentClaim> {
    try {
      return await this.request<PaymentClaim>(`/api/v1/orders/${input.orderId}/claim`, {
        method: "POST",
        body: JSON.stringify(input),
      });
    } catch {
      return this.fallback.submitPaymentClaim(input);
    }
  }

  async getOrderById(tenantId: string, orderId: string): Promise<Order | null> {
    try {
      return await this.request<Order>(`/api/v1/orders/${orderId}`);
    } catch {
      return this.fallback.getOrderById(tenantId, orderId);
    }
  }

  async cancelOrder(tenantId: string, orderId: string): Promise<Order> {
    try {
      return await this.request<Order>(`/api/v1/orders/${orderId}/cancel`, {
        method: "POST",
      });
    } catch {
      return this.fallback.cancelOrder(tenantId, orderId);
    }
  }

  async loginCustomer(input: CustomerLoginInput): Promise<{ profile: CustomerProfile; token: string }> {
    try {
      return await this.request<{ profile: CustomerProfile; token: string }>("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify(input),
      });
    } catch {
      return this.fallback.loginCustomer(input);
    }
  }

  async registerCustomer(input: CustomerRegisterInput): Promise<{ profile: CustomerProfile; token: string }> {
    try {
      return await this.request<{ profile: CustomerProfile; token: string }>("/api/v1/auth/register", {
        method: "POST",
        body: JSON.stringify(input),
      });
    } catch {
      return this.fallback.registerCustomer(input);
    }
  }

  async updateCustomerProfile(input: UpdateCustomerProfileInput): Promise<{ profile: CustomerProfile }> {
    try {
      return await this.request<{ profile: CustomerProfile }>("/api/v1/auth/profile", {
        method: "PUT",
        body: JSON.stringify(input),
      });
    } catch {
      return this.fallback.updateCustomerProfile(input);
    }
  }

  async getVouchers(): Promise<VoucherItem[]> {
    try {
      return await this.request<VoucherItem[]>("/api/v1/vouchers");
    } catch {
      return this.fallback.getVouchers();
    }
  }

  async getInviteLink(): Promise<InviteInfo> {
    try {
      return await this.request<InviteInfo>("/api/v1/invite");
    } catch {
      return this.fallback.getInviteLink();
    }
  }

  async submitFeedback(input: FeedbackSubmitInput): Promise<{ success: boolean; message: string }> {
    try {
      return await this.request<{ success: boolean; message: string }>("/api/v1/feedback", {
        method: "POST",
        body: JSON.stringify(input),
      });
    } catch {
      return this.fallback.submitFeedback(input);
    }
  }

  async getVenues(): Promise<VenueSettings[]> {
    try {
      return await this.request<VenueSettings[]>("/api/v1/venues");
    } catch {
      return this.fallback.getVenues();
    }
  }
}
