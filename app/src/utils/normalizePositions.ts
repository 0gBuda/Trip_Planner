export type POIEntry = {
  type: string;
  position: number;
  name: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  additional?: any;
};

export function normalizePositions(routePoints: POIEntry[]): POIEntry[] {
  return [...routePoints]
    .sort((a, b) => a.position - b.position)
    .map((point, index) => ({
      ...point,
      position: index + 1,
    }));
}
