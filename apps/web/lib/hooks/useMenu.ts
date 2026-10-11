"use client";

import { useState, useEffect } from "react";
import type { MenuCategory, MenuItem } from "@queueless/types";
import { apiClient } from "../api";
import { useTenant } from "../tenant/TenantContext";

export function useMenu() {
  const { tenantId } = useTenant();
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);

    apiClient
      .getMenu(tenantId)
      .then((data) => {
        if (!mounted) return;
        setCategories(data.categories);
        setItems(data.items);
        setError(null);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message || "Failed to load menu");
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [tenantId]);

  return { categories, items, isLoading, error };
}
