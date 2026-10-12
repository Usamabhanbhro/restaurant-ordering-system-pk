import { useMemo } from "react";
import type { VenueRegistryItem, CityName } from "./venueRegistry";
import type { OrderingMode } from "@/lib/mockData";

export interface VenueFilterCriteria {
  city?: CityName | "ALL";
  hub?: string | "ALL";
  searchQuery?: string;
  modeFilter?: "ALL" | OrderingMode;
  onlyOpenNow?: boolean;
  cuisine?: string | null;
}

/**
 * Filter Predicate 1: City Filter
 */
export function filterByCity(venue: VenueRegistryItem, city?: CityName | "ALL"): boolean {
  if (!city || city === "ALL") return true;
  return venue.city.toLowerCase() === city.toLowerCase();
}

/**
 * Filter Predicate 2: Neighborhood / Campus Hub Filter
 */
export function filterByHub(venue: VenueRegistryItem, hub?: string | "ALL"): boolean {
  if (!hub || hub === "ALL") return true;
  const q = hub.toLowerCase();
  return (
    venue.neighborhood.toLowerCase().includes(q) ||
    venue.address.toLowerCase().includes(q)
  );
}

/**
 * Filter Predicate 3: Search Query (Name, Tagline, Address, Neighborhood, Cuisines, Dishes)
 */
export function filterBySearch(venue: VenueRegistryItem, searchQuery?: string): boolean {
  if (!searchQuery || !searchQuery.trim()) return true;
  const q = searchQuery.toLowerCase().trim();
  return (
    venue.name.toLowerCase().includes(q) ||
    venue.tagline.toLowerCase().includes(q) ||
    venue.address.toLowerCase().includes(q) ||
    venue.neighborhood.toLowerCase().includes(q) ||
    venue.cuisines.some((c) => c.toLowerCase().includes(q)) ||
    venue.featuredDishes.some((d) => d.toLowerCase().includes(q))
  );
}

/**
 * Filter Predicate 4: Service Mode Filter (Remote Counter Pickup vs In-Venue Table QR)
 */
export function filterByMode(venue: VenueRegistryItem, modeFilter?: "ALL" | OrderingMode): boolean {
  if (!modeFilter || modeFilter === "ALL") return true;
  return venue.supportedModes.includes(modeFilter);
}

/**
 * Filter Predicate 5: Open Status Filter
 */
export function filterByOpenNow(venue: VenueRegistryItem, onlyOpenNow?: boolean): boolean {
  if (!onlyOpenNow) return true;
  return venue.isOpen;
}

/**
 * Filter Predicate 6: Cuisine Shortcut Filter
 */
export function filterByCuisine(venue: VenueRegistryItem, cuisine?: string | null): boolean {
  if (!cuisine) return true;
  return venue.cuisines.some((c) => c.toLowerCase() === cuisine.toLowerCase());
}

/**
 * Composable filter pipeline applying each predicate in sequence
 */
export function runVenueFilterPipeline(
  venues: VenueRegistryItem[],
  criteria: VenueFilterCriteria
): VenueRegistryItem[] {
  return venues.filter((venue) => {
    return (
      filterByCity(venue, criteria.city) &&
      filterByHub(venue, criteria.hub) &&
      filterBySearch(venue, criteria.searchQuery) &&
      filterByMode(venue, criteria.modeFilter) &&
      filterByOpenNow(venue, criteria.onlyOpenNow) &&
      filterByCuisine(venue, criteria.cuisine)
    );
  });
}

/**
 * Swappable React Hook for venue filtering
 */
export function useFilteredVenues(
  venues: VenueRegistryItem[],
  criteria: VenueFilterCriteria
): VenueRegistryItem[] {
  return useMemo(() => {
    return runVenueFilterPipeline(venues, criteria);
  }, [
    venues,
    criteria.city,
    criteria.hub,
    criteria.searchQuery,
    criteria.modeFilter,
    criteria.onlyOpenNow,
    criteria.cuisine,
  ]);
}
