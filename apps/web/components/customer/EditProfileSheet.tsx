"use client";

import { useState, useRef, useEffect } from "react";
import { Drawer } from "vaul";
import {
  Camera,
  Trash2,
  Lock,
  GraduationCap,
  AlertCircle,
  Check,
  Upload,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";
import { apiClient } from "@/lib/api";
import { PAKISTANI_PHONE_REGEX } from "@queueless/types";

// Google Vector SVG Icon
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.34 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.16 0 9.97 0 12s.45 3.84 1.24 5.42l4.04-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

// Facebook Vector SVG Icon
function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="#1877F2" className={className} aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

interface EditProfileSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export function EditProfileSheet({
  isOpen,
  onClose,
  onSaved,
}: EditProfileSheetProps) {
  const { currentUser, updateProfile } = useAuthStore();

  const [displayName, setDisplayName] = useState(currentUser?.name || "");
  const [phone, setPhone] = useState(currentUser?.phone || "");
  const [profilePicture, setProfilePicture] = useState<string | undefined>(currentUser?.profilePicture);

  // Campus affiliation verification state
  const [campusEmail, setCampusEmail] = useState(
    currentUser?.email?.includes(".edu.pk") ? currentUser.email : ""
  );
  const [studentIdFileName, setStudentIdFileName] = useState<string | null>(null);

  // Connected accounts state
  const [isGoogleConnected, setIsGoogleConnected] = useState(true);
  const [isFacebookConnected, setIsFacebookConnected] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const studentIdInputRef = useRef<HTMLInputElement>(null);

  // Sync form state when currentUser changes or modal opens
  useEffect(() => {
    if (isOpen && currentUser) {
      setDisplayName(currentUser.name || "");
      setPhone(currentUser.phone || "");
      setProfilePicture(currentUser.profilePicture);
      setCampusEmail(
        currentUser.email?.includes(".edu.pk") ? currentUser.email : ""
      );
      setStudentIdFileName(null);
      setErrorMessage("");
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

  const handleRemovePhoto = () => {
    setProfilePicture(undefined);
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
      // Determine affiliation from verified email or uploaded student ID
      let newAffiliation = currentUser?.affiliation;
      let newBadge = currentUser?.badge || "Diner";

      const cleanedCampusEmail = campusEmail.trim().toLowerCase();
      if (studentIdFileName || (cleanedCampusEmail && cleanedCampusEmail.includes(".edu.pk"))) {
        if (cleanedCampusEmail.includes("nu.edu.pk")) newAffiliation = "FAST-NUCES";
        else if (cleanedCampusEmail.includes("lums.edu.pk")) newAffiliation = "LUMS";
        else if (cleanedCampusEmail.includes("iba.edu.pk")) newAffiliation = "IBA";
        else if (cleanedCampusEmail.includes("nust.edu.pk")) newAffiliation = "NUST";
        else if (cleanedCampusEmail.includes("szabist.pk") || cleanedCampusEmail.includes("szabist.edu.pk")) newAffiliation = "SZABIST";
        else if (!newAffiliation || newAffiliation === "None") newAffiliation = "Campus Student";
        newBadge = "Student";
      }

      await apiClient.updateCustomerProfile({
        displayName: trimmedName,
        phone: normalizedPhone,
        affiliation: newAffiliation || null,
        badge: newBadge,
        dietaryNotes: currentUser?.dietaryNotes || null,
        profilePicture: profilePicture || null,
      });

      updateProfile({
        name: trimmedName,
        phone: normalizedPhone,
        affiliation: newAffiliation,
        badge: newBadge,
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

          {/* Sheet Header: swipe-down to dismiss, no X button */}
          <div className="px-5 py-3 border-b border-neutral-100 flex items-center justify-between shrink-0 bg-white">
            <div>
              <h3 className="font-extrabold text-base text-neutral-900 tracking-tight">
                Edit Profile
              </h3>
              <p className="text-[11px] text-neutral-400 font-medium">
                Personal details and counter callout credentials
              </p>
            </div>
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

            {/* Profile Picture Section (Upload only, no URL entry) */}
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
                    Pick a picture from your device.
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

            {/* Campus Affiliation (Verification via Student ID / Campus Email) */}
            <div className="p-3.5 rounded-2xl bg-neutral-50/80 border border-neutral-100 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-neutral-700" />
                  <label className="text-xs font-bold text-neutral-800">
                    Campus Affiliation
                  </label>
                </div>
                {currentUser?.affiliation && currentUser.affiliation !== "None" && (
                  <span className="text-[10px] font-bold text-[#1546d9] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                    {currentUser.affiliation}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                Campus partner discounts require verification via an official campus-issued email or valid student ID card.
              </p>

              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    placeholder="e.g. k211234@nu.edu.pk or lums.edu.pk"
                    value={campusEmail}
                    onChange={(e) => setCampusEmail(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-white border border-neutral-200 text-base sm:text-xs font-medium text-neutral-900 focus:ring-1 focus:ring-[#fd8535] focus:outline-none placeholder:text-neutral-400"
                  />
                  <button
                    type="button"
                    onClick={() => studentIdInputRef.current?.click()}
                    className="px-3 py-2 rounded-xl bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-800 text-xs font-bold inline-flex items-center gap-1.5 transition-colors shadow-2xs shrink-0 active:scale-95"
                  >
                    <Upload className="w-3.5 h-3.5 text-neutral-600" />
                    <span>Upload ID</span>
                  </button>
                  <input
                    ref={studentIdInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setStudentIdFileName(file.name);
                      }
                    }}
                    className="hidden"
                  />
                </div>
                {studentIdFileName && (
                  <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>Student ID attached ({studentIdFileName})</span>
                  </p>
                )}
              </div>
            </div>

            {/* Connected Accounts (Google & Facebook) */}
            <div className="p-3.5 rounded-2xl bg-neutral-50/80 border border-neutral-100 space-y-2.5">
              <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
                Connected Accounts
              </span>
              <div className="space-y-2">
                {/* Google */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-neutral-200/80">
                  <div className="flex items-center gap-2.5">
                    <GoogleIcon className="w-4 h-4 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-neutral-900 block">Google</span>
                      <span className="text-[10px] text-neutral-400">
                        {isGoogleConnected ? currentUser?.email : "Not connected"}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsGoogleConnected(!isGoogleConnected)}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-colors ${
                      isGoogleConnected
                        ? "text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
                        : "text-neutral-500 bg-neutral-100 border-neutral-200 hover:bg-neutral-200"
                    }`}
                  >
                    {isGoogleConnected ? "Connected" : "Unconnected"}
                  </button>
                </div>

                {/* Facebook */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-neutral-200/80">
                  <div className="flex items-center gap-2.5">
                    <FacebookIcon className="w-4 h-4 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-neutral-900 block">Facebook</span>
                      <span className="text-[10px] text-neutral-400">
                        {isFacebookConnected ? "Linked profile" : "Not connected"}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsFacebookConnected(!isFacebookConnected)}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-colors ${
                      isFacebookConnected
                        ? "text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
                        : "text-neutral-500 bg-neutral-100 border-neutral-200 hover:bg-neutral-200"
                    }`}
                  >
                    {isFacebookConnected ? "Connected" : "Unconnected"}
                  </button>
                </div>
              </div>
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
