import { useEffect, useRef } from 'react';
import { initYandexMap } from '../hooks/initYandexMap';
import { Dispatch, SetStateAction } from 'react';
import { PlaceInfo, FullRouteRequest } from '../types/place';

interface MapProps {
  setPlaces: Dispatch<SetStateAction<PlaceInfo[]>>;
  setRouteInfo: Dispatch<SetStateAction<{
    duration: number;
    distance: string;
    stops: number;
  } | null>>;
  routeRequest: FullRouteRequest;
}

export default function Map({ setPlaces, setRouteInfo, routeRequest }: MapProps) {
  const inited = useRef(false);

  useEffect(() => {
    const ymaps = (window as any).ymaps;
    if (!inited.current && ymaps && routeRequest) {
      inited.current = true;
      ymaps.ready(() => {
        initYandexMap({
          setPlaces,
          onRouteUpdate: setRouteInfo,
          routeRequest,
        });
      });
    }
  }, [routeRequest, setPlaces, setRouteInfo]);

  return <div id="map" style={{ width: '100%', height: '100%' }} />;
}
