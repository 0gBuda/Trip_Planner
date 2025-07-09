import React, {useEffect, useState} from 'react';
import {
    Container,
    Form,
    Alert,
    Spinner,
    Button,
    Card,
    ListGroup
} from 'react-bootstrap';
import api from '../api/axios';
import {useNavigate} from 'react-router-dom';

interface POIEntry {
    type?: string;
    name?: string;
    visit_time: string;
    coordinates?: {
        lat: number;
        lon: number;
    };
    additional?: {
        address?: string;
        opening_hours?: string;
        phone?: string;
        rating?: number;
    };
}

interface Route {
    id: number;
    trip_id: number;
    origin: string;
    destination: string;
    departure_time: string;
    final_route: POIEntry[];
    distance: number;
    duration: number;
}

const UserProfilePage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [routes, setRoutes] = useState<Route[]>([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [passwordMessage, setPasswordMessage] = useState<string | null>(null);

    const navigate = useNavigate();

    useEffect(() => {
        api
            .get('/api/v1/users/me')
            .then((res) => {
                setEmail(res.data.email);
                return api.get<Route[]>('/api/v1/route');
            })
            .then((res) => {
                setRoutes(res.data);
                setLoading(false);
            })
            .catch(() => {
                setError('Вы еще не вошли в аккаунт(');
                setLoading(false);
            });
    }, []);

    const handleLogout = () => {
        api.post('/api/v1/auth/logout').finally(() => {
            localStorage.removeItem('token');
            navigate('/login', {replace: true});
        });
    };

    const convertDistanceKm = (meters: number) => (meters / 1000).toFixed(1);
    const formatHours = (h: number) => {
        const hours = Math.floor(h);
        const mins = Math.round((h - hours) * 60);
        return `${hours} ч ${mins} мин`;
    };

    const handleChangePassword = (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordMessage(null);
        api
            .post('/api/v1/users/change-password', {
                old_password: oldPassword,
                new_password: newPassword,
            })
            .then(() => {
                setPasswordMessage('Пароль успешно изменён!');
                setOldPassword('');
                setNewPassword('');
            })
            .catch(() => {
                setPasswordMessage('Не удалось сменить пароль. Проверьте данные.');
            });
    };

    // Собираем ссылку на Яндекс.Карты для переданного маршрута
    const buildYandexLink = (route: Route) => {
        const parts: string[] = [];
        parts.push(encodeURIComponent(route.origin));
        route.final_route.forEach((poi) => {
            if (poi.coordinates) {
                parts.push(`${poi.coordinates.lat},${poi.coordinates.lon}`);
            }
        });
        parts.push(encodeURIComponent(route.destination));
        const rtext = parts.join('~');
        return `https://yandex.ru/maps/?rtext=${rtext}&rtt=auto`;
    };

    if (loading) return <Spinner animation="border" className="d-block mx-auto"/>;
    if (error) return <Alert variant="danger">{error}</Alert>;

    return (
        <Container style={{maxWidth: '700px', marginTop: '50px'}}>
            <h2 className="mb-4 text-center">Мой профиль</h2>

            <Card className="mb-4 shadow-sm">
                <Card.Body>
                    <Form>
                        <Form.Group controlId="formEmail">
                            <Form.Label>Email</Form.Label>
                            <Form.Control type="email" value={email} readOnly/>
                        </Form.Group>

                        <Button variant="danger" onClick={handleLogout} className="w-100 mt-3">
                            Выйти из аккаунта
                        </Button>
                    </Form>
                </Card.Body>
            </Card>

            {/*<Card className="mb-5 shadow-sm">*/}
            {/*    <Card.Body>*/}
            {/*        <h5 className="mb-3">Сменить пароль</h5>*/}
            {/*        <Form onSubmit={handleChangePassword}>*/}
            {/*            <Form.Group className="mb-2" controlId="formOldPassword">*/}
            {/*                <Form.Control*/}
            {/*                    type="password"*/}
            {/*                    placeholder="Старый пароль"*/}
            {/*                    value={oldPassword}*/}
            {/*                    onChange={(e) => setOldPassword(e.target.value)}*/}
            {/*                    required*/}
            {/*                />*/}
            {/*            </Form.Group>*/}
            {/*            <Form.Group className="mb-3" controlId="formNewPassword">*/}
            {/*                <Form.Control*/}
            {/*                    type="password"*/}
            {/*                    placeholder="Новый пароль"*/}
            {/*                    value={newPassword}*/}
            {/*                    onChange={(e) => setNewPassword(e.target.value)}*/}
            {/*                    required*/}
            {/*                />*/}
            {/*            </Form.Group>*/}
            {/*            <Button type="submit" variant="primary" className="w-100">*/}
            {/*                Сменить пароль*/}
            {/*            </Button>*/}
            {/*        </Form>*/}
            {/*        {passwordMessage && (*/}
            {/*            <Alert*/}
            {/*                className="mt-3"*/}
            {/*                variant={passwordMessage.includes('успешно') ? 'success' : 'danger'}*/}
            {/*            >*/}
            {/*                {passwordMessage}*/}
            {/*            </Alert>*/}
            {/*        )}*/}
            {/*    </Card.Body>*/}
            {/*</Card>*/}

            <h4 className="mb-3">Мои маршруты</h4>

            {routes.length === 0 ? (
                <Alert variant="info">Маршрутов пока нет.</Alert>
            ) : (
                routes.map((route) => {
                    const yandexLink = buildYandexLink(route);

                    return (
                        <Card key={route.id} className="mb-4 shadow-sm">
                            <Card.Body>
                                <Card.Title>
                                    {route.origin} → {route.destination}
                                </Card.Title>
                                {/* Заменили Card.Text на div, чтобы не вкладывать div внутрь <p> */}
                                <div>
                                    <p>
                                        <strong>Расстояние:</strong> {convertDistanceKm(route.distance)} км
                                        <br/>
                                        <strong>Время в пути:</strong> {formatHours(route.duration / 60)}
                                        <br/>
                                        <strong>Время старта:</strong> {route.departure_time}
                                    </p>
                                    <strong>Остановки:</strong>
                                    <ListGroup variant="flush" className="mt-2">
                                        {route.final_route.map((poi, index) => (
                                            <ListGroup.Item
                                                key={`${route.id}-${index}`} // уникальный key
                                                style={{
                                                    padding: '8px',
                                                    border: 0,
                                                    borderBottom: '1px solid #eee',
                                                }}
                                            >
                                                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                          <span style={{fontWeight: 600}}>
                            #{index + 1} {poi.name}
                          </span>
                                                    <span style={{fontStyle: 'italic', fontSize: '0.9em'}}>
                            {poi.visit_time}
                          </span>
                                                </div>
                                                <div style={{fontSize: '0.9em', color: '#555', marginTop: '4px'}}>
                                                    {poi.type && <span>{poi.type}</span>}
                                                    {poi.additional?.rating != null && (
                                                        <span style={{marginLeft: '12px'}}>
                              ⭐ {poi.additional.rating.toFixed(1)}
                            </span>
                                                    )}
                                                </div>
                                                {poi.additional?.address && (
                                                    <div
                                                        style={{fontSize: '0.85em', color: '#777', marginTop: '4px'}}
                                                    >
                                                        📍 {poi.additional.address}
                                                    </div>
                                                )}
                                                {poi.additional?.opening_hours && (
                                                    <div
                                                        style={{fontSize: '0.85em', color: '#777', marginTop: '2px'}}
                                                    >
                                                        🕒 {poi.additional.opening_hours}
                                                    </div>
                                                )}
                                                {poi.additional?.phone && (
                                                    <div
                                                        style={{fontSize: '0.85em', color: '#777', marginTop: '2px'}}
                                                    >
                                                        📞 {poi.additional.phone}
                                                    </div>
                                                )}
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                </div>
                                <Button
                                    as="a"
                                    href={yandexLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    variant="outline-success"
                                    className="w-100 mt-2"
                                >
                                    Открыть в Яндекс.Картах
                                </Button>
                            </Card.Body>
                        </Card>
                    );
                })
            )}
        </Container>
    );
};

export default UserProfilePage;
