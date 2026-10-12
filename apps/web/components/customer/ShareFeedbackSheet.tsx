"use client";

import { useState } from "react";
import { Drawer } from "vaul";
import { X, Star, Check, Bell, Plus, Sparkles } from "lucide-react";
import { apiClient } from "@/lib/api";
import type { TableContext, OrderingMode } from "@/lib/mockData";

interface ShareFeedbackSheetProps {
  isOpen: boolean;
  onClose: () => void;
  tableContext?: TableContext | null | undefined;
  mode?: OrderingMode | undefined;
  orderId?: string | null | undefined;
}

const FEEDBACK_TAGS = [
  "Food Quality",
  "Order Speed",
  "Order Accuracy",
  "Staff Service",
  "Cleanliness",
  "Packaging",
];

export function ShareFeedbackSheet({
  isOpen,
  onClose,
  tableContext,
  mode = "REMOTE",
  orderId,
}: ShareFeedbackSheetProps) {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [notifyOnResolution, setNotifyOnResolution] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleReset = () => {
    setRating(5);
    setHoverRating(null);
    setSelectedTags([]);
    setComment("");
    setNotifyOnResolution(true);
    setIsSubmitting(false);
    setIsSubmitted(false);
  };

  const handleClose = () => {
    onClose();
    setTimeout(handleReset, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await apiClient.submitFeedback({
        rating,
        tags: selectedTags,
        comment: comment.trim() || undefined,
        notifyOnResolution,
        orderId: orderId ?? undefined,
        tableNumber: mode === "IN_VENUE" ? tableContext?.tableNumber : undefined,
      });
      setIsSubmitted(true);
      setTimeout(() => {
        handleClose();
      }, 1800);
    } catch {
      // Graceful fallback display
      setIsSubmitted(true);
      setTimeout(() => {
        handleClose();
      }, 1800);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentDisplayRating = hoverRating ?? rating;

  return (
    <Drawer.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <Drawer.Content className="fixed bottom-0 inset-x-0 z-50 max-w-md mx-auto h-auto max-h-[92vh] bg-white rounded-t-[2.5rem] shadow-float overflow-hidden flex flex-col focus:outline-none">
          {/* iOS Pull Handle */}
          <div className="pt-3 pb-1 flex justify-center shrink-0">
            <div className="w-12 h-1.5 rounded-full bg-neutral-300" />
          </div>

          {/* Top Bar with circular close button and title (matching visual reference) */}
          <div className="relative px-5 py-3 border-b border-neutral-100 flex items-center justify-center shrink-0 bg-white">
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close feedback panel"
              className="absolute left-4 w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-extrabold text-base sm:text-lg text-neutral-900 tracking-tight text-center">
              Share Feedback
            </h3>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-4">
            {isSubmitted ? (
              /* Success Confirmation */
              <div className="py-8 px-4 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 mx-auto flex items-center justify-center shadow-xs">
                  <Check className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-black text-neutral-900 tracking-tight">
                    Thank you for your feedback!
                  </h4>
                  <p className="text-xs text-neutral-500 max-w-xs mx-auto leading-relaxed">
                    Your comments help our kitchen and counter team serve you better.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Context & Friendly Prompt */}
                <div className="text-center space-y-1">
                  <p className="text-sm font-black text-neutral-900 tracking-tight">
                    How was your experience?
                  </p>
                  <p className="text-xs text-neutral-500 font-medium">
                    {mode === "IN_VENUE" && tableContext
                      ? `Table ${tableContext.tableNumber} • Brewery Cafe Gulberg`
                      : "Brewery Cafe Gulberg • Counter Pickup"}
                  </p>
                </div>

                {/* 5-Star Interactive Rating Control */}
                <div className="flex flex-col items-center justify-center gap-1.5 py-1">
                  <div
                    className="flex items-center gap-2"
                    role="radiogroup"
                    aria-label="Rating out of 5 stars"
                  >
                    {[1, 2, 3, 4, 5].map((starVal) => {
                      const isFilled = starVal <= currentDisplayRating;
                      return (
                        <button
                          key={starVal}
                          type="button"
                          onClick={() => setRating(starVal)}
                          onMouseEnter={() => setHoverRating(starVal)}
                          onMouseLeave={() => setHoverRating(null)}
                          aria-label={`${starVal} star${starVal > 1 ? "s" : ""}`}
                          className="w-10 h-10 rounded-full flex items-center justify-center text-neutral-300 hover:scale-110 active:scale-95 transition-all cursor-pointer focus:outline-none"
                        >
                          <Star
                            className={`w-7 h-7 transition-colors ${
                              isFilled
                                ? "text-[#f9b318] fill-[#f9b318]"
                                : "text-neutral-200 fill-neutral-100"
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                  <span className="text-[11px] font-bold text-neutral-400">
                    {currentDisplayRating === 5 && "Exceptional"}
                    {currentDisplayRating === 4 && "Great"}
                    {currentDisplayRating === 3 && "Average"}
                    {currentDisplayRating === 2 && "Could be better"}
                    {currentDisplayRating === 1 && "Disappointing"}
                  </span>
                </div>

                {/* Compact Quick-Select Follow-up Options */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block text-center">
                    What stood out? (Optional)
                  </label>
                  <div className="flex flex-wrap items-center justify-center gap-1.5 pt-0.5">
                    {FEEDBACK_TAGS.map((tag) => {
                      const isSelected = selectedTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          className={`text-xs font-semibold py-1.5 px-3 rounded-full border transition-all cursor-pointer active:scale-95 ${
                            isSelected
                              ? "bg-[#fd8535] text-white border-[#fd8535] shadow-xs"
                              : "bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100"
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Light Gray Comment Card matching visual reference */}
                <div className="space-y-2">
                  <div className="p-3.5 rounded-2xl bg-neutral-100/90 border border-neutral-200/60 relative focus-within:ring-2 focus-within:ring-[#fd8535]/40 transition-all">
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder='e.g. "Burger was hot and fresh" or "Order ready faster than expected"'
                      rows={3}
                      className="w-full bg-transparent resize-none border-none focus:outline-none text-xs text-neutral-900 placeholder:text-neutral-400 font-medium leading-relaxed"
                    />

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-neutral-400 font-medium">
                        Optional notes
                      </span>
                      <button
                        type="button"
                        aria-label="Add extra details"
                        className="w-6 h-6 rounded-lg bg-neutral-200/80 hover:bg-neutral-300 text-neutral-600 flex items-center justify-center transition-colors cursor-pointer"
                        title="Add note"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Notification Toggle Line matching visual reference */}
                  <div className="pt-0.5 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setNotifyOnResolution(!notifyOnResolution)}
                      className="flex items-center gap-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 transition-colors select-none cursor-pointer"
                    >
                      <Bell
                        className={`w-3.5 h-3.5 ${
                          notifyOnResolution
                            ? "text-[#fd8535] fill-[#fd8535]"
                            : "text-neutral-400"
                        }`}
                      />
                      <span>We&apos;ll notify you when reviewed</span>
                    </button>
                    {notifyOnResolution && (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60 flex items-center gap-0.5">
                        <Check className="w-2.5 h-2.5" />
                        Active
                      </span>
                    )}
                  </div>
                </div>

                {/* Primary Action Button matching reference */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-full bg-neutral-950 hover:bg-[#fd8535] text-white font-extrabold text-sm shadow-soft transition-all duration-150 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4 text-white" />
                    <span>{isSubmitting ? "Sending..." : "Send Feedback"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
