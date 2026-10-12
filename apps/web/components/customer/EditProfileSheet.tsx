"use client";

import { useState, useRef, useEffect } from "react";
import { Drawer } from "vaul";
import {
  X,
  Camera,
  Trash2,
  Lock,
  GraduationCap,
  Utensils,
  AlertCircle,
  Check,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";
import { apiClient } from "@/lib/api";
import { PAKISTANI_PHONE_REGEX } from "@queueless/types";

interface EditProfileSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

const AFFILIATIONS = ["FAST-NUCES", "LUMS", "IBA", "NUST", "SZABIST", "None"] as const;

export function EditProfileSheet({
  isOpen,
  onClose,
  onSaved,
}: EditProfileSheetProps) {
  const { currentUser, updateProfile } = useAuthStore();

  const [displayName, setDisplayName] = useState(currentUser?.name || "");
  const [phone, setPhone] = useState(currentUser?.phone || "");
  const [affiliation, setAffiliation] = useState(currentUser?.affiliation || "None");
  const [dietaryNotes, setDietaryNotes] = useState(currentUser?.dietaryNotes || "");
  const [profilePicture, setProfilePicture] = useState<string | undefined>(currentUser?.profilePicture);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [photoUrlInput, setPhotoUrlInput] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync form state when currentUser changes or modal opens
  useEffect(() => {
    if (isOpen && currentUser) {
      setDisplayName(currentUser.name || "");
      setPhone(currentUser.phone || "");
      setAffiliation(currentUser.affiliation || "None");
      setDietaryNotes(currentUser.dietaryNotes || "");
      setProfilePicture(currentUser.profilePicture);
      setErrorMessage("");
      setShowUrlInput(false);
      setPhotoUrlInput("");
    }
  }, [isOpen, currentUser]);

  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage("Photo size must be under 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setProfilePicture(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    if (photoUrlInput.trim()) {
      setProfilePicture(photoUrlInput.trim());
      setShowUrlInput(false);
      setPhotoUrlInput("");
    }
  };

  const handleRemovePhoto = () => {
    setProfilePicture(undefined);
    setShowUrlInput(false);
    setPhotoUrlInput("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const trimmedName = displayName.trim();
    if (trimmedName.length < 2 || trimmedName.length > 50) {
      setErrorMessage("Display name must be between 2 and 50 characters.");
      return;
    }

    // Pakistani phone normalization & validation
    const rawClean = phone.replace(/[\s-]/g, "");
    let normalizedPhone = rawClean;
    if (rawClean.startsWith("03")) {
      normalizedPhone = `+92${rawClean.slice(1)}`;
    } else if (rawClean.startsWith("3") && rawClean.length === 10) {
      normalizedPhone = `+92${rawClean}`;
    }

    if (!PAKISTANI_PHONE_REGEX.test(normalizedPhone)) {
      setErrorMessage("Phone number must be a valid Pakistani mobile number (e.g. +923001234567).");
      return;
    }

    setIsSubmitting(true);
    try {
      const isAffiliated = affiliation && affiliation !== "None";
      const newBadge = isAffiliated ? "Student" : "Diner";
      const newAffiliation = isAffiliated ? affiliation : undefined;
      const newDietary = dietaryNotes.trim() ? dietaryNotes.trim() : undefined;

      await apiClient.updateCustomerProfile({
        displayName: trimmedName,
        phone: normalizedPhone,
        affiliation: newAffiliation || null,
        badge: newBadge,
        dietaryNotes: newDietary || null,
        profilePicture: profilePicture || null,
      });

      updateProfile({
        name: trimmedName,
        phone: normalizedPhone,
        affiliation: newAffiliation,
        badge: newBadge,
        dietaryNotes: newDietary,
        profilePicture: profilePicture || undefined,
      });

      if (onSaved) onSaved();
      onClose();
    } catch {
      setErrorMessage("Failed to update profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const initials = displayName.trim()
    ? displayName
        .trim()
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "AA";

  return (
    <Drawer.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <Drawer.Content className="fixed bottom-0 inset-x-0 z-50 max-w-md mx-auto h-full max-h-[92vh] bg-white rounded-t-[2.5rem] shadow-float overflow-hidden flex flex-col focus:outline-none">
          {/* iOS Handle */}
          <div className="pt-3 pb-1 flex justify-center shrink-0">
            <div className="w-12 h-1.5 rounded-full bg-neutral-300" />
          </div>

          {/* Sheet Header */}
          <div className="px-5 py-3 border-b border-neutral-100 flex items-center justify-between shrink-0 bg-white">
            <div>
              <h3 className="font-extrabold text-base text-neutral-900 tracking-tight">
                Edit Profile
              </h3>
              <p className="text-[11px] text-neutral-400 font-medium">
                Personal details and counter callout credentials
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-full transition-colors"
              title="Close"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable Form Body */}
          <form onSubmit={handleSave} className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-4">
            {/* Error Banner */}
            {errorMessage && (
              <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Profile Picture Section */}
            <div className="p-3.5 rounded-2xl bg-neutral-50/80 border border-neutral-100 space-y-2.5">
              <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
                Profile Photo
              </span>
              <div className="flex items-center gap-3.5">
                {profilePicture ? (
                  <img
                    src={profilePicture}
                    alt={displayName || "Profile photo"}
                    className="w-14 h-14 rounded-full object-cover border-2 border-neutral-200 shadow-xs shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-[#fd8535] text-white font-extrabold flex items-center justify-center text-base shadow-xs shrink-0">
                    {initials}
                  </div>
                )}

                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-800 text-xs font-bold inline-flex items-center gap-1.5 transition-colors shadow-2xs active:scale-95"
                    >
                      <Camera className="w-3.5 h-3.5 text-neutral-600" />
                      <span>Change Photo</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowUrlInput(!showUrlInput)}
                      className="text-[11px] font-bold text-[#fd8535] hover:underline"
                    >
                      {showUrlInput ? "Hide URL" : "Enter URL"}
                    </button>

                    {profilePicture && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-colors ml-auto"
                        title="Remove photo"
                        aria-label="Remove photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <p className="text-[10px] text-neutral-400">
                    Pick a picture from your device or provide a public URL.
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoFileChange}
                  className="hidden"
                />
              </div>

              {/* URL Input Drawer */}
              {showUrlInput && (
                <div className="pt-2 flex items-center gap-2">
                  <input
                    type="url"
                    placeholder="https://example.com/avatar.jpg"
                    value={photoUrlInput}
                    onChange={(e) => setPhotoUrlInput(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-white border border-neutral-200 text-base sm:text-xs focus:ring-1 focus:ring-[#fd8535] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleApplyUrl}
                    className="px-3 py-2 rounded-xl bg-[#fd8535] hover:bg-[#e0681c] text-white text-xs font-bold transition-colors"
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>

            {/* Display Name */}
            <div className="space-y-1">
              <label htmlFor="edit-display-name" className="text-xs font-bold text-neutral-800 block">
                Display Name <span className="text-red-500">*</span>
              </label>
              <input
                id="edit-display-name"
                type="text"
                required
                maxLength={50}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Ahmad Ali"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-neutral-200 text-base sm:text-xs font-medium text-neutral-900 focus:ring-1 focus:ring-[#fd8535] focus:outline-none"
              />
              <p className="text-[10px] text-neutral-400">
                What counter staff calls you when your food is ready.
              </p>
            </div>

            {/* Email (Read-only Account Identity) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label htmlFor="edit-email" className="text-xs font-bold text-neutral-800">
                  Email
                </label>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-neutral-400">
                  <Lock className="w-2.5 h-2.5" />
                  Account Identity
                </span>
              </div>
              <input
                id="edit-email"
                type="email"
                disabled
                value={currentUser?.email || ""}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-100 border border-neutral-200/80 text-base sm:text-xs font-medium text-neutral-500 cursor-not-allowed select-none"
              />
              <p className="text-[10px] text-neutral-400">
                Email cannot be changed in this release.
              </p>
            </div>

            {/* Mobile Number */}
            <div className="space-y-1">
              <label htmlFor="edit-phone" className="text-xs font-bold text-neutral-800 block">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                id="edit-phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+92 300 1234567"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-neutral-200 text-base sm:text-xs font-mono font-medium text-neutral-900 focus:ring-1 focus:ring-[#fd8535] focus:outline-none"
              />
              <p className="text-[10px] text-neutral-400">
                Pakistani mobile number (+923XXXXXXXXX) for pickup SMS updates.
              </p>
            </div>

            {/* Campus Affiliation */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-neutral-600" />
                <label className="text-xs font-bold text-neutral-800">
                  Campus Affiliation
                </label>
              </div>
              <p className="text-[10px] text-neutral-400">
                Select your university to unlock campus partner discounts.
              </p>

              <div className="grid grid-cols-3 gap-1.5 pt-1">
                {AFFILIATIONS.map((univ) => {
                  const isSelected = affiliation === univ;
                  return (
                    <button
                      key={univ}
                      type="button"
                      onClick={() => setAffiliation(univ)}
                      className={`py-2 px-2 rounded-xl text-center text-xs font-bold transition-all border ${
                        isSelected
                          ? "bg-neutral-950 text-white border-neutral-950 shadow-2xs"
                          : "bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50"
                      }`}
                    >
                      {univ}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dietary & Kitchen Notes */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Utensils className="w-3.5 h-3.5 text-neutral-600" />
                  <label htmlFor="edit-dietary" className="text-xs font-bold text-neutral-800">
                    Dietary & Kitchen Notes
                  </label>
                </div>
                {dietaryNotes && (
                  <button
                    type="button"
                    onClick={() => setDietaryNotes("")}
                    className="text-[10px] font-bold text-red-500 hover:underline"
                  >
                    Clear notes
                  </button>
                )}
              </div>
              <textarea
                id="edit-dietary"
                rows={2}
                value={dietaryNotes}
                onChange={(e) => setDietaryNotes(e.target.value)}
                placeholder="e.g. Halal only • Mild spice • No dairy"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-neutral-200 text-base sm:text-xs font-medium text-neutral-900 focus:ring-1 focus:ring-[#fd8535] focus:outline-none resize-none"
              />
              <p className="text-[10px] text-neutral-400">
                Optional preferences printed on counter preparation chits. Can be cleared anytime.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 space-y-2 pb-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl bg-[#fd8535] hover:bg-[#e0681c] text-white font-extrabold text-xs shadow-soft transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Saving Changes...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs transition-all active:scale-[0.98]"
              >
                Cancel
              </button>
            </div>
          </form>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
