"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { OrderingMode, TableContext } from "@queueless/types";
import { getOrderingCapabilities } from "./strategies";
import type { OrderingCapabilities } from "./types";

interface OrderingModeContextValue {
  mode: OrderingMode;
  capabilities: OrderingCapabilities;
  tableContext: TableContext | null;
  isTableOrdering: boolean;
}

const OrderingModeContext = createContext<OrderingModeContextValue | null>(null);

export interface OrderingModeProviderProps {
  mode: OrderingMode;
  tableContext?: TableContext | null;
  children: ReactNode;
}

export function OrderingModeProvider({
  mode,
  tableContext = null,
  children,
}: OrderingModeProviderProps) {
  const value = useMemo<OrderingModeContextValue>(() => {
    const capabilities = getOrderingCapabilities(mode);
    return {
      mode,
      capabilities,
      tableContext: tableContext || null,
      isTableOrdering: mode === "IN_VENUE" && Boolean(tableContext),
    };
  }, [mode, tableContext]);

  return (
    <OrderingModeContext.Provider value={value}>
      {children}
    </OrderingModeContext.Provider>
  );
}

export function useOrderingMode(): OrderingModeContextValue {
  const context = useContext(OrderingModeContext);
  if (!context) {
    throw new Error("useOrderingMode must be used within an OrderingModeProvider");
  }
  return context;
}
