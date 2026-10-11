/**
 * Namespaced Storage Utility for QueueLess Multi-Tenant Web App
 * Ensures customer data (cart, order, preferences) does not leak across venue boundaries.
 */

const STORAGE_PREFIX = "queueless";

export function getTenantStorageKey(tenantSlug: string, key: string): string {
  return `${STORAGE_PREFIX}:${tenantSlug}:${key}`;
}

export function getTenantStorageItem<T>(tenantSlug: string, key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(getTenantStorageKey(tenantSlug, key));
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function setTenantStorageItem<T>(tenantSlug: string, key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(getTenantStorageKey(tenantSlug, key), JSON.stringify(value));
  } catch {
    // Storage quota or private mode restriction
  }
}

export function removeTenantStorageItem(tenantSlug: string, key: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(getTenantStorageKey(tenantSlug, key));
  } catch {
    // Storage error
  }
}
