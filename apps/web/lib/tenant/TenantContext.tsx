"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { VenueSettings } from "@queueless/types";
import { MOCK_VENUE_SETTINGS } from "../api/mockClient";

export interface TenantContextValue {
  venue: VenueSettings;
  tenantId: string;
  tenantSlug: string;
  isOrderingAvailable: boolean;
}

const TenantContext = createContext<TenantContextValue | null>(null);

export interface TenantProviderProps {
  venue: VenueSettings;
  children: ReactNode;
}

export function TenantProvider({ venue, children }: TenantProviderProps) {
  const value = useMemo<TenantContextValue>(
    () => ({
      venue,
      tenantId: venue.tenantId,
      tenantSlug: venue.slug,
      isOrderingAvailable: !venue.isOrderingPaused,
    }),
    [venue]
  );

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenant(): TenantContextValue {
  const context = useContext(TenantContext);
  if (!context) {
    return {
      venue: MOCK_VENUE_SETTINGS,
      tenantId: MOCK_VENUE_SETTINGS.tenantId,
      tenantSlug: MOCK_VENUE_SETTINGS.slug,
      isOrderingAvailable: !MOCK_VENUE_SETTINGS.isOrderingPaused,
    };
  }
  return context;
}
