// src/utils/enrichStopsWithCoords.ts
export interface StrategyStop {
  type: string;
  at_hour: number;
  position: number;
}
export interface EnrichedStop extends StrategyStop {
  coords: [number, number];
}

/**
 * По стратегии стопов строит маршрут через Yandex.Maps
 * и для каждого stop.at_hour находит координаты на полилинии.
 */
export async function enrichStopsWithCoords(
  ymaps: any,
  origin: string,
  destination: string,
  strategyStops: StrategyStop[]
): Promise<EnrichedStop[]> {
  // 1) Геокодим
  const fromGeo = await ymaps.geocode(origin);
  const toGeo = await ymaps.geocode(destination);
  const pointA: [number, number] = fromGeo.geoObjects.get(0).geometry.getCoordinates();
  const pointB: [number, number] = toGeo.geoObjects.get(0).geometry.getCoordinates();

  // 2) Прокладываем маршрут
  const route = await ymaps.route([pointA, pointB]);
  const totalSec = route.getJamsTime() || route.getTime();    // в секундах
  const totalLen = route.getLength();                         // в метрах
  const speed = totalLen / totalSec;                          // м/с
  const paths = route.getPaths();

  // 3) Хелпер: найти координату на маршруте по времени
  function getCoordAt(timeSec: number): [number, number] {
    let acc = 0;
    for (let i = 0; i < paths.getLength(); i++) {
      const segs = paths.get(i).getSegments();
      for (const seg of segs) {
        const len = seg.getLength();
        const dur = len / speed;
        if (acc + dur >= timeSec) {
          const pts = seg.getCoordinates();
          const tInSeg = timeSec - acc;
          const ratio = tInSeg / dur;
          const idx = Math.floor(ratio * (pts.length - 1));
          return pts[idx] as [number, number];
        }
        acc += dur;
      }
    }
    // если не нашли — возвращаем финиш
    return pointB;
  }

  // 4) Собираем enrichedStops
  return strategyStops.map(s => ({
    ...s,
    coords: getCoordAt(s.at_hour * 3600),
  }));
}
