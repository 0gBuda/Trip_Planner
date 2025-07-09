import {PlaceInfo, FullRouteRequest} from '../types/place';

let ymapsInstance: any = null;
let mapInstance: any = null;
let routeObj: any = null;

let originCoords: [number, number] | null = null;
let destinationCoords: [number, number] | null = null;

// Конвертируем places в массив координат [lat, lon]
function getRouteCoords(places: PlaceInfo[]): [number, number][] {
    if (!originCoords || !destinationCoords) return [];
    const intermediateCoords = places.map(
        (p) => [p.coordinates.lat, p.coordinates.lon] as [number, number]
    );
    return [originCoords, ...intermediateCoords, destinationCoords];
}

export const initYandexMap = async ({
                                        setPlaces,
                                        onRouteUpdate,
                                        routeRequest,
                                    }: {
    setPlaces: React.Dispatch<React.SetStateAction<PlaceInfo[]>>;
    onRouteUpdate?: (info: { duration: number; distance: string; stops: number }) => void;
    routeRequest: FullRouteRequest;
}) => {
    ymapsInstance = (window as any).ymaps;
    await ymapsInstance.ready();

    const {origin, destination, route} = routeRequest;

    // Геокодируем старт и финиш
    const [originRes, destinationRes] = await Promise.all([
        ymapsInstance.geocode(origin),
        ymapsInstance.geocode(destination),
    ]);

    originCoords = originRes.geoObjects.get(0)?.geometry.getCoordinates();
    destinationCoords = destinationRes.geoObjects.get(0)?.geometry.getCoordinates();

    if (!originCoords || !destinationCoords) {
        console.error('Не удалось получить координаты origin или destination');
        return;
    }

    // Формируем places из маршрута (промежуточные точки)
    const places: PlaceInfo[] = route.map((p) => ({
        name: p.name,
        address: p.additional?.address || '',
        visit_time: p.visit_time || '',
        rating: p.additional?.rating?.toString() || '—',
        coordinates: {
            lat: p.coordinates.lat,
            lon: p.coordinates.lon,
        },
        type: p.type, // добавляем тип
        additional: p.additional, // добавляем доп. инфо
    }));

    setPlaces(places);

    // Инициализируем карту
    mapInstance = new ymapsInstance.Map('map', {
        center: originCoords,
        zoom: 7,
        controls: [],
    });

    // Добавляем SearchControl
    const searchControl = new ymapsInstance.control.SearchControl({
        options: {
            size: 'large',
            provider: 'yandex#search',
            noPlacemark: true,
        },
    });
    mapInstance.controls.add(searchControl);

    // Обработка выбора результата поиска
    searchControl.events.add('resultselect', async (e: any) => {
        const index = e.get('index');
        const result = await searchControl.getResult(index);
        const coords = result.geometry.getCoordinates();

        // Извлекаем CompanyMetaData, если есть
        const props = result.properties;
        const companyMeta = props.get('CompanyMetaData') || {};
        const cmAddress: string = companyMeta.address || '';
        const cmHours: string = companyMeta.Hours?.text || '';
        const cmPhones: string = Array.isArray(companyMeta.Phones)
            ? companyMeta.Phones.map((p: any) => p.formatted).join(', ')
            : '';
        const cmRating: number | undefined = companyMeta.Rating?.value
            ? Number(companyMeta.Rating.value)
            : undefined;

        setPlaces((prev) => {
            const newPlaces = [
                ...prev,
                {
                    name: props.get('name') || 'Неизвестное место',
                    address: cmAddress || props.get('description') || '',
                    visit_time: props.get('visit_time') || '—',
                    rating: cmRating != null ? cmRating.toFixed(1) : '—',
                    coordinates: {lat: coords[0], lon: coords[1]},
                    type: props.get('type') || '',
                    additional: {
                        address: cmAddress,
                        opening_hours: cmHours,
                        phone: cmPhones,
                        rating: cmRating,
                    },
                },
            ];
            updateRoute(newPlaces);
            return newPlaces;
        });
    });

    // Функция обновления маршрута на карте
    function updateRoute(placesForRoute: PlaceInfo[]) {
        // Удаляем всё с карты
        mapInstance.geoObjects.removeAll();

        const coords = getRouteCoords(placesForRoute);
        if (coords.length < 2) return;

        ymapsInstance
            .route(coords, {mapStateAutoApply: true})
            .then((r: any) => {
                routeObj = r;
                mapInstance.geoObjects.add(routeObj);

                // Промежуточные точки (нумерация от 0)
                coords.slice(0, -1).forEach((c, i) => {
                    const mark = new ymapsInstance.Placemark(
                        c,
                        {
                            balloonContent: `Точка №${i}`,
                        },
                        {
                            preset: 'islands#blueDotIcon',
                            openBalloonOnClick: true,
                        }
                    );
                    mapInstance.geoObjects.add(mark);
                });

                // Метка старта
                const startMark = new ymapsInstance.Placemark(
                    originCoords,
                    {
                        iconCaption: 'Старт',
                    },
                    {
                        preset: 'islands#greenDotIcon',
                        hasBalloon: false,
                    }
                );
                mapInstance.geoObjects.add(startMark);

                // Метка финиша
                const endMark = new ymapsInstance.Placemark(
                    destinationCoords,
                    {
                        iconCaption: 'Финиш',
                    },
                    {
                        preset: 'islands#redDotIcon',
                        hasBalloon: false,
                    }
                );
                mapInstance.geoObjects.add(endMark);

                const distance = r.getLength();
                const duration = r.getTime();

                if (onRouteUpdate) {
                    onRouteUpdate({
                        duration: Math.round(duration / 60),
                        distance: (distance / 1000).toFixed(1) + ' км',
                        stops: coords.length - 2,
                    });
                }
            });
    }

    // Изначально рисуем маршрут
    updateRoute(places);

    return {
        updateRoute,
        mapInstance,
        ymapsInstance,
    };
};
