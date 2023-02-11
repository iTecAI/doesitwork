import { Category, Location, Service } from "../../types";

export type Search = {
    selectors: (Category | Location)[];
    text: string;
};

export function isCategory(obj: any): obj is Category {
    return Object.keys(obj).includes("category_id");
}

export function isLocation(obj: any): obj is Location {
    return Object.keys(obj).includes("location_id");
}

export function expandLocationId(
    id: string | null,
    locations: Location[]
): string[] {
    if (id === "root" || id === null || id === "") {
        return [];
    }
    const result: string[] = [id];
    const item: Location = locations.filter((v) => v.location_id === id)[0];
    if (item) {
        result.push(...expandLocationId(item.parent_id, locations));
    }
    return result;
}

export function getVisibleLocations(
    search: Search,
    services: Service[],
    locations: Location[]
): string[] {
    const locationIds: string[] = [];

    const searchedLocations: string[] = search.selectors
        .filter(isLocation)
        .map((v) => v.location_id);
    const searchedCategories: string[] = search.selectors
        .filter(isCategory)
        .map((v) => v.category_id);

    services.forEach((s) => {
        if (
            searchedLocations.length > 0 &&
            !searchedLocations.includes(s.location)
        ) {
            return;
        }
        if (
            searchedCategories.length > 0 &&
            !searchedCategories.includes(s.category)
        ) {
            return;
        }
        if (
            (search.text.toLowerCase().includes(s.name.toLowerCase()) ||
                s.name.toLowerCase().includes(search.text.toLowerCase())) &&
            !locationIds.includes(s.location)
        ) {
            locationIds.push(...expandLocationId(s.location, locations));
        }
    });

    return locationIds;
}

export function isServiceVisible(search: Search, service: Service): boolean {
    const searchedLocations: string[] = search.selectors
        .filter(isLocation)
        .map((v) => v.location_id);
    const searchedCategories: string[] = search.selectors
        .filter(isCategory)
        .map((v) => v.category_id);

    if (
        searchedLocations.length > 0 &&
        !searchedLocations.includes(service.location)
    ) {
        return false;
    }
    if (
        searchedCategories.length > 0 &&
        !searchedCategories.includes(service.category)
    ) {
        return false;
    }
    if (
        search.text.toLowerCase().includes(service.name.toLowerCase()) ||
        service.name.toLowerCase().includes(search.text.toLowerCase())
    ) {
        return true;
    }
    return false;
}
