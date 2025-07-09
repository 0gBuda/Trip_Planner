export interface PlaceInfo {
  name: string;
  address: string;
  rating: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  type?: string;
  visit_time: string;
  additional?: {
    address?: string;
    phone?: string;
    opening_hours?: string;
    description?: string;
    rating?: number;
  };
}


export interface FullRouteRequest {
  origin: string; // адрес или название стартовой точки
  destination: string;
  departure_time: string;
  route: {
    name: string;
    visit_time: string;
    type: string;
    coordinates: {
      lat: number;
      lon: number;
    };
    additional?: {
      address?: string;
      phone?: string;
      opening_hours?: string;
      description?: string;
      rating?: number;
    };
  }[];
}
