import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Alert, Container} from 'react-bootstrap';
import RouteForm from '../components/RouteForm';
import api from '../api/axios';
import {enrichStopsWithCoords} from '../utils/enrichStops';
import type {EnrichedStop} from '../utils/enrichStops';

interface TripCreateData {
    origin: string;
    destination: string;
    max_drive_hours_per_day: number;
    hotel_stop: boolean;
    food_stop_frequency: string;
    poi_stop_count: string;
    poi_types: Record<string, boolean>;
    distance: number;
    duration: number;
}

const CreateTripPage: React.FC = () => {
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<boolean>(false);
    const navigate = useNavigate();

    const handleSubmit = async (data: TripCreateData): Promise<void> => {
        setError('');
        setSuccess(false);

        try {
            // ─── 1️⃣ Создаём поездку и получаем из ответа strategy_stops ───
            const {data: trip} = await api.post('/api/v1/trips', data);
            // trip.id, trip.origin, trip.destination, trip.strategy_stops

            // ─── 2️⃣ Обогащаем остановки координатами ───
            const ymaps = (window as any).ymaps;
            const enriched: EnrichedStop[] = await enrichStopsWithCoords(
                ymaps,
                trip.origin,
                trip.destination,
                trip.strategy_stops
            );

            // ─── 3️⃣ Сохраняем enriched_stops на бэкенд ───
            await api.patch(`/api/v1/trips/${trip.id}/enriched-stops`, {
                enriched_stops: enriched,
            });


            await api.post(`/api/v1/trips/${trip.id}/find_pois`, {
                enriched_stops: enriched,
                initial_radius: 500
            });


            // ─── 4️⃣ Успешно! Показываем алерт и редиректим ───
            setSuccess(true);
            setTimeout(() => navigate(`/trip/${trip.id}`), 100);

        } catch (e: any) {
            console.error(e);
            setError('Ошибка при создании или обогащении маршрута. Попробуйте ещё раз.');
        }
    };

    return (
        <Container style={{maxWidth: '600px', marginTop: '30px'}}>
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">Маршрут успешно создан!</Alert>}

            <RouteForm onSubmit={handleSubmit}/>
        </Container>
    );
};

export default CreateTripPage;
