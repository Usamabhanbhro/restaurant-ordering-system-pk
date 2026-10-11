"use client";

import { useState, useEffect } from "react";
import { Drawer } from "vaul";
import { Check, Minus, Plus } from "lucide-react";
import type { MenuItemData, ModifierItem } from "@/lib/mockData";
import { useCartStore } from "@/lib/store/cartStore";

interface ItemCustomizerSheetProps {
  item: MenuItemData | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ItemCustomizerSheet({
  item,
  isOpen,
  onClose,
}: ItemCustomizerSheetProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedModifiers, setSelectedModifiers] = useState<ModifierItem[]>([]);
  const [note, setNote] = useState("");

  const addItem = useCartStore((s) => s.addItem);

  // Reset customizer state when a new item is opened
  useEffect(() => {
    if (item) {
      setQuantity(1);
      setSelectedModifiers([]);
      setNote("");
    }
  }, [item]);

  if (!item) return null;

  const toggleModifier = (mod: ModifierItem) => {
    setSelectedModifiers((prev) => {
      const exists = prev.some((m) => m.id === mod.id);
      if (exists) {
        return prev.filter((m) => m.id !== mod.id);
      } else {
        return [...prev, mod];
      }
    });
  };

  const modTotal = selectedModifiers.reduce((sum, m) => sum + m.priceDelta, 0);
  const totalItemPrice = (item.price + modTotal) * quantity;

  const handleAddToCart = () => {
    addItem(item, quantity, selectedModifiers, note);
    onClose();
  };

  return (
    <Drawer.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-fade-in" />
        <Drawer.Content className="fixed bottom-0 inset-x-0 z-50 max-w-md mx-auto max-h-[88vh] bg-[#FFFBF8] rounded-t-[2.5rem] shadow-float overflow-hidden flex flex-col focus:outline-none">
          {/* iOS Drawer Drag Handle */}
          <div className="pt-3 pb-1 flex justify-center shrink-0">
            <div className="w-12 h-1.5 rounded-full bg-neutral-300" />
          </div>

          {/* Header Image */}
          <div className="relative h-44 w-full bg-neutral-100 shrink-0">
            <img
              src={item.image}
              alt={item.nameEn}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Scrollable Content */}
          <div className="p-4 overflow-y-auto no-scrollbar space-y-4 flex-1">
            <div>
              <h3 className="font-extrabold text-base text-neutral-900">{item.nameEn}</h3>
              {item.nameRomanUrdu && item.nameRomanUrdu.toLowerCase() !== item.nameEn.toLowerCase() && (
                <p className="text-xs text-[#fd8535] font-semibold">{item.nameRomanUrdu}</p>
              )}
              <p className="text-xs text-neutral-500 mt-1">{item.description}</p>
            </div>

            {/* Modifiers List */}
            {(item.modifierGroups || []).map((grp) => (
              <div key={grp.id} className="space-y-2 pt-2 border-t border-neutral-200">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-neutral-900">{grp.title}</h4>
                  <span className="text-[10px] text-neutral-400">Optional</span>
                </div>

                <div className="space-y-2">
                  {grp.modifiers.map((mod) => {
                    const isSelected = selectedModifiers.some((m) => m.id === mod.id);
                    return (
                      <div
                        key={mod.id}
                        onClick={() => toggleModifier(mod)}
                        className={`p-2.5 rounded-2xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                          isSelected
                            ? "bg-neutral-900 text-white border-neutral-900"
                            : "bg-white text-neutral-800 border-neutral-200/80 hover:bg-neutral-50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected ? "border-white bg-[#EF5A30]" : "border-neutral-300"
                            }`}
                          >
                            {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                          </span>
                          <span className="font-semibold">{mod.nameEn}</span>
                          <span
                            className={`text-[10px] ${
                              isSelected ? "text-neutral-300" : "text-neutral-400"
                            }`}
                          >
                            ({mod.nameRomanUrdu})
                          </span>
                        </div>
                        <span className="font-bold">
                          {mod.priceDelta > 0 ? `+Rs. ${mod.priceDelta}` : "Free"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Free-text Kitchen Note (Max 40 chars sanitized) */}
            <div className="space-y-1 pt-2 border-t border-neutral-200">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-neutral-900">
                  Kitchen Note (Max 40 chars)
                </label>
                <span className="text-[10px] text-neutral-400">
                  {note.length}/40
                </span>
              </div>
              <input
                type="text"
                maxLength={40}
                placeholder="e.g. Cut in half, extra napkins"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-neutral-200 text-xs focus:ring-1 focus:ring-[#EF5A30] focus:outline-none"
              />
            </div>
          </div>

          {/* Sticky Action Footer */}
          <div className="p-4 bg-white border-t border-neutral-200 flex items-center gap-3 shrink-0">
            {/* Stepper Capsule */}
            <div className="flex items-center bg-neutral-100 rounded-full px-2 py-1 gap-2.5 text-xs font-extrabold">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-6 h-6 rounded-full bg-white text-neutral-800 flex items-center justify-center shadow-sm"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-3 text-center">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-6 h-6 rounded-full bg-white text-neutral-800 flex items-center justify-center shadow-sm"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            {/* Black Add Pill CTA */}
            <button
              type="button"
              onClick={handleAddToCart}
              className="flex-1 py-3 px-4 rounded-full bg-neutral-900 hover:bg-[#EF5A30] text-white font-extrabold text-xs transition-colors flex items-center justify-between"
            >
              <span>Add to Order</span>
              <span>Rs. {totalItemPrice}</span>
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
