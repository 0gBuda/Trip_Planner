import React, {useEffect, useState} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {Container, Alert, Spinner, Button, Card, Row, Col} from 'react-bootstrap';
import api from '../api/axios';

interface Trip {
    id: number;
    origin: string;
    destination: string;
    max_drive_hours_per_day: number;
    hotel_stop: boolean;
    departure_time: string;
    food_stop_frequency: string;
    poi_stop_count: string;
    poi_types: {
        nature: boolean;
        culture: boolean;
        entertainment: boolean;
    };
    distance: number;
    duration: number;
}

const TripDetailsPage: React.FC = () => {
    const {id} = useParams<{ id: string }>();
    const [trip, setTrip] = useState<Trip | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        setError('');
        api
            .get(`/api/v1/trips/${id}`)
            .then(res => {
                setTrip(res.data);
                setLoading(false);
            })
            .catch(() => {
                setError('Ошибка при загрузке поездки.');
                setLoading(false);
            });
    }, [id]);

    const convertDistanceKm = (meters: number) => (meters / 1000).toFixed(1);

    const formatHours = (h: number) => {
        const hours = Math.floor(h);
        const mins = Math.round((h - hours) * 60);
        return `${hours} ч ${mins} мин`;
    };

    const handleCreateRoute = () => {
        if (trip) {
            navigate(`/route/${trip.id}`);
        }
    };

    const handleDeleteTrip = () => {
        if (trip) {
            api.delete(`/api/v1/trips/${trip.id}`)
                .then(() => {
                    navigate('/');
                })
                .catch(() => {
                    setError('Не удалось удалить поездку.');
                });
        }
    };

    return (
        <Container style={{maxWidth: '600px', marginTop: '50px'}}>
            <h2 className="mb-4 text-center">Поездка</h2>

            {loading && <Spinner animation="border" className="d-block mx-auto"/>}
            {error && <Alert variant="danger">{error}</Alert>}

            {!loading && !error && trip && (
                <Card className="border-0 shadow-sm">
                    <Card.Body>
                        <h4 className="text-center mb-3">
                            {trip.origin} → {trip.destination}
                        </h4>

                        <div className="mb-3" style={{fontSize: '0.95rem'}}>
                            <p>
                                <strong>Расстояние:</strong> {convertDistanceKm(trip.distance)} км
                            </p>
                            <p>
                                <strong>Время в пути:</strong> {formatHours(trip.duration / 60)}
                            </p>
                            <p>
                                <strong>Начало поездки:</strong> {trip.departure_time}
                            </p>
                        </div>

                        <div className="mb-3" style={{fontSize: '0.95rem'}}>
                            <strong>Макс. часов за рулём в день:</strong> {trip.max_drive_hours_per_day}
                            <br/>
                            <strong>Частота остановок на еду:</strong> {trip.food_stop_frequency}
                            <br/>
                            <strong>Ночёвка:</strong> {trip.hotel_stop ? 'Да' : 'Нет'}
                            <br/>
                            <strong>Точек интереса:</strong> {trip.poi_stop_count}
                            <br/>
                            <strong>Типы POI:</strong>{' '}
                            {Object.entries(trip.poi_types)
                                .filter(([, v]) => v)
                                .map(([k]) => k)
                                .join(', ') || 'не выбрано'}
                        </div>

                        <Row className="mt-4">
                            <Col>
                                <Button variant="danger" className="w-100" onClick={handleDeleteTrip}>
                                    Удалить поездку
                                </Button>
                            </Col>
                            <Col>
                                <Button variant="primary" className="w-100" onClick={handleCreateRoute}>
                                    Создать маршрут
                                </Button>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            )}
        </Container>
    );
};

export default TripDetailsPage;
