export type AccommodationType = 'hotel' | 'hostel' | 'bnb' | 'ryokan' | 'apartment' | 'camping' | 'other';

export interface Accommodation {
    id: string; // e.g., "hotel-1"
    name: string; // e.g., "Park Hyatt Tokyo"
    type: AccommodationType | undefined;
    address: string;
    checkInTime: Date | null;
    checkOutTime: Date | null;
    link?: string;
}

export interface ItineraryItem {
    id: string;
    time: string;
    activity: string;
    location: string;
    // New: link back to the accommodation
    accommodationId?: string;
    type: 'check-in' | 'check-out' | 'staying-at' | 'activity' | 'transport' | 'meal';
}

export interface TodoItem {
    id: string;
    text: string;
    completed: boolean;
}

export interface Day {
    date: Date;
    dayNum: number;
    notes: string;
    items: ItineraryItem[];
    todos: TodoItem[]
}

export interface Trip {
    id: string;
    title: string;
    // A master list of all places you are staying during this specific trip
    accommodations: Accommodation[];
    startDate: Date | null;
    endDate: Date | null;
    days: Day[];
    destination: string;
}

export interface TripSummary {
    id: string;
    title: string;
    destination: string;
}