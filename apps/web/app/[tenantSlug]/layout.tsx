import type { ReactNode } from "react";
import { TenantProvider } from "@/lib/tenant/TenantContext";
import { apiClient } from "@/lib/api";

interface TenantLayoutProps {
  params: Promise<{ tenantSlug: string }>;
  children: ReactNode;
}

export default async function TenantLayout({ params, children }: TenantLayoutProps) {
  const { tenantSlug } = await params;
  const venue = await apiClient.getVenue(tenantSlug);

  return <TenantProvider venue={venue}>{children}</TenantProvider>;
}
