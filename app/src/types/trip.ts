export interface StrategyStop {
    type: string;
    at_hour: number;
    position: number;
}

export interface EnrichedStop extends StrategyStop {
    coords: [number, number];
}

// src/types/trip.ts
export interface TripCreate {
  origin: string;
  destination: string;
  max_drive_hours_per_day: number;
  hotel_stop: boolean;
  food_stop_frequency: string;
  poi_stop_count: string;
  poi_types: {
    nature: boolean;
    culture: boolean;
    entertainment: boolean;
  };
  distance: number;   // теперь обязательно
  duration: number;   // теперь обязательно
}


export interface TripRead {
    id: number;
    origin: string;
    destination: string;
    strategy_stops: StrategyStop[];
    enriched_stops: EnrichedStop[];
}
