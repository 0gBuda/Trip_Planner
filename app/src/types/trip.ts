export interface StrategyStop {
    type: string;
    at_hour: number;
    position: number;
}

export interface EnrichedStop extends StrategyStop {
    coords: [number, number];
}
