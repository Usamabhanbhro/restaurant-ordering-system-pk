import type { MenuItem, ModifierGroup, SelectedModifier } from "@queueless/types";

export interface CartLineItem {
  item: MenuItem;
  quantity: number;
  selectedModifiers: SelectedModifier[];
  itemNotes?: string;
}

/**
 * Calculates the total PKR price for a single cart line item including its active modifiers.
 */
export function calculateLineItemTotal(lineItem: CartLineItem): number {
  const basePrice = lineItem.item.pricePkr;
  const modifiersPrice = lineItem.selectedModifiers.reduce(
    (sum, mod) => sum + mod.pricePkr,
    0
  );
  return (basePrice + modifiersPrice) * lineItem.quantity;
}

/**
 * Calculates the raw subtotal for an array of cart line items.
 */
export function calculateCartSubtotal(items: CartLineItem[]): number {
  return items.reduce((sum, it) => sum + calculateLineItemTotal(it), 0);
}

/**
 * Validates modifier group selections against minimum and maximum constraints.
 */
export function validateModifierSelections(
  groups: ModifierGroup[],
  selectedModifiers: SelectedModifier[]
): { isValid: boolean; missingGroupName?: string } {
  for (const group of groups) {
    const count = selectedModifiers.filter((m) => m.groupId === group.id).length;
    if (group.required && count < group.minSelections) {
      return { isValid: false, missingGroupName: group.nameEn };
    }
    if (count > group.maxSelections) {
      return { isValid: false, missingGroupName: group.nameEn };
    }
  }
  return { isValid: true };
}

/**
 * Formats a numeric PKR amount with consistent standard notation.
 */
export function formatPkr(amount: number): string {
  return `Rs. ${Math.round(amount).toLocaleString()}`;
}
