export const getRouteInfo = async (origin: string, destination: string) => {
    const ymaps = (window as any).ymaps;
    await ymaps.ready();

    // Строим маршрут между origin и destination
    const route = await ymaps.route([origin, destination]);

    const activeRoute = route.getPaths().get(0);

    // Получаем длину и время
    return {
        distance: Math.round(activeRoute.getLength()),  // округляем до целого числа
        duration: activeRoute.getTime() / 60,  // в минутах
    };
};

