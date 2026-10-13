import { create } from "zustand";
import { persist } from "zustand/middleware";

interface VenueFavoriteState {
  favoriteIds: string[];
  toggleFavorite: (venueId: string) => void;
  isFavorite: (venueId: string) => boolean;
}

export const useVenueFavoriteStore = create<VenueFavoriteState>()(
  persist(
    (set, get) => ({
      favoriteIds: [],
      toggleFavorite: (venueId: string) => {
        const current = get().favoriteIds;
        if (current.includes(venueId)) {
          set({ favoriteIds: current.filter((id) => id !== venueId) });
        } else {
          set({ favoriteIds: [...current, venueId] });
        }
      },
      isFavorite: (venueId: string) => get().favoriteIds.includes(venueId),
    }),
    {
      name: "queueless_favorite_venues",
    }
  )
);
