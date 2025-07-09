import React, {useState, useEffect, useRef} from 'react';
import Sidebar from '../components/Sidebar';
import {initYandexMap} from '../hooks/initYandexMap';
import {PlaceInfo, FullRouteRequest} from '../types/place';
import api from '../api/axios';
import { useParams } from 'react-router-dom';


export default function TTTRoute() {
    const {id} = useParams<{ id: string }>();
    const [places, setPlaces] = useState<PlaceInfo[]>([]);
    const [routeInfo, setRouteInfo] = useState<{ duration: number; distance: string; stops: number } | null>(null);
    const [routeRequest, setRouteRequest] = useState<FullRouteRequest | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const updateRouteRef = useRef<((places: PlaceInfo[]) => void) | null>(null);

    useEffect(() => {
        if (!id) {
            setError('Не указан id поездки');
            setLoading(false);
            return;
        }

        api.get<FullRouteRequest>(`/api/v1/trips/${id}`)
            .then(res => {
                setRouteRequest(res.data);
            })
            .catch(() => setError('Ошибка при загрузке поездки.'))
            .finally(() => setLoading(false));
    }, [id]);

    useEffect(() => {
        if (!routeRequest) return;

        (async () => {
            const mapObjects = await initYandexMap({
                setPlaces,
                onRouteUpdate: setRouteInfo,
                routeRequest,
            });

            if (mapObjects) {
                updateRouteRef.current = mapObjects.updateRoute;
            }
        })();
    }, [routeRequest]);

    useEffect(() => {
        if (updateRouteRef.current) {
            updateRouteRef.current(places);
        }
    }, [places]);

    const handleDelete = (index: number) => {
        setPlaces(prev => {
            const newPlaces = [...prev];
            newPlaces.splice(index, 1);
            return newPlaces;
        });
    };

    const handleMoveUp = (index: number) => {
        if (index === 0) return;
        setPlaces(prev => {
            const newPlaces = [...prev];
            [newPlaces[index - 1], newPlaces[index]] = [newPlaces[index], newPlaces[index - 1]];
            return newPlaces;
        });
    };

    const handleMoveDown = (index: number) => {
        if (index === places.length - 1) return;
        setPlaces(prev => {
            const newPlaces = [...prev];
            [newPlaces[index], newPlaces[index + 1]] = [newPlaces[index + 1], newPlaces[index]];
            return newPlaces;
        });
    };

    const handleSaveRoute = async () => {
        if (!routeRequest || !routeInfo) return;

        setSaving(true);

        const payload = {
            trip_id: (routeRequest as any).id,
            origin: routeRequest.origin,
            destination: routeRequest.destination,
            departure_time: routeRequest.departure_time,
            distance: parseInt(routeInfo.distance.replace(/\D/g, '')) || 0,
            duration: routeInfo.duration,
            final_route: places,
        };

        try {
            await api.post('/api/v1/route', payload);
            alert('Маршрут сохранён!');
        } catch (err) {
            console.log(payload)
            alert('Ошибка при сохранении маршрута');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <p>Загрузка маршрута…</p>;
    if (error) return <p style={{color: 'red'}}>{error}</p>;
    if (!routeRequest) return <p>Данные маршрута не найдены.</p>;

    return (
        <div style={{display: 'flex', height: '100vh'}}>
            <Sidebar
                places={places}
                routeInfo={routeInfo}
                onDelete={handleDelete}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
            />
            <div style={{flex: 1, position: 'relative'}}>
                <button
                    onClick={handleSaveRoute}
                    disabled={saving}
                    style={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        zIndex: 1000,
                        padding: '8px 16px',
                        backgroundColor: saving ? '#999' : '#007bff',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 4,
                        cursor: saving ? 'not-allowed' : 'pointer',
                    }}
                >
                    {saving ? 'Сохранение...' : 'Сохранить маршрут'}
                </button>
                <div id="map" style={{height: '100%', width: '100%'}}/>
            </div>
        </div>
    );
}
