import React, {useState} from 'react';
import {Form, Button, Alert} from 'react-bootstrap';
import {getRouteInfo} from '../utils/yandexMapApi'; // Импортируем функцию для получения данных о маршруте

interface RouteFormData {
    origin: string;
    destination: string;
    max_drive_hours_per_day: number;
    hotel_stop: boolean,
    departure_time: string; // формат HH:MM (например, "08:30")
    food_stop_frequency: string;
    poi_stop_count: string;
    poi_types: {
        nature: boolean;
        culture: boolean;
        entertainment: boolean;
    };
    distance: number;  // добавляем для расстояния
    duration: number;  // добавляем для времени
}

interface RouteFormProps {
    onSubmit: (data: RouteFormData) => Promise<void>;
}

const RouteForm: React.FC<RouteFormProps> = ({onSubmit}) => {
    const [formData, setFormData] = useState<RouteFormData>({
        origin: '',
        destination: '',
        max_drive_hours_per_day: 0,
        hotel_stop: false,
        food_stop_frequency: 'нет',
        poi_stop_count: 'нет',
        poi_types: {
            nature: false,
            culture: false,
            entertainment: false,
        },
        distance: 0,
        duration: 0,
        departure_time: '00:00',
    });
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<boolean>(false);

    // для input type text и number
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'max_drive_hours_per_day' ? Number(value) : value,
        }));
    };

    // для select
    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const {name, value} = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // для checkbox
    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, checked} = e.target;
        setFormData((prev) => ({
            ...prev,
            poi_types: {
                ...prev.poi_types,
                [name]: checked,
            },
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        try {
            // Получаем информацию о маршруте (расстояние и время)
            const routeInfo = await getRouteInfo(formData.origin, formData.destination);
            console.log(routeInfo)
            // Добавляем полученные данные в formData
            const fullFormData = {
                ...formData,
                distance: routeInfo.distance,  // длина маршрута
                duration: routeInfo.duration,  // время в пути
            };

            // Отправляем данные на сервер
            console.log(fullFormData)
            await onSubmit(fullFormData);

            setSuccess(true);
            setTimeout(() => {
                // Выполнив успешно, например, редирект
            }, 1500);
        } catch (error) {
            setError('Ошибка при расчете маршрута. Попробуйте еще раз.');
        }
    };

    return (
        <Form onSubmit={handleSubmit} className="p-4 border rounded bg-light shadow-sm">
            <h4 className="mb-4">Создание поездки</h4>

            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">Маршрут успешно создан!</Alert>}

            <Form.Group className="mb-3">
                <Form.Label>Начальная точка</Form.Label>
                <Form.Control
                    type="text"
                    name="origin"
                    value={formData.origin}
                    onChange={handleInputChange}
                    required
                />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Конечная точка</Form.Label>
                <Form.Control
                    type="text"
                    name="destination"
                    value={formData.destination}
                    onChange={handleInputChange}
                    required
                />
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label>Максимальное время в пути в день без остановок (часов)</Form.Label>
                <Form.Control
                    type="number"
                    name="max_drive_hours_per_day"
                    value={formData.max_drive_hours_per_day}
                    onChange={handleInputChange}
                    min={0}
                    required
                />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Частота остановок на еду</Form.Label>
                <Form.Select
                    name="food_stop_frequency"
                    value={formData.food_stop_frequency}
                    onChange={handleSelectChange}
                >
                    <option value="нет">Нет</option>
                    <option value="раз в 2 часа">Раз в 2 часа</option>
                    <option value="раз в 4 часа">Раз в 4 часа</option>
                </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Количество остановок у достопримечательностей</Form.Label>
                <Form.Select
                    name="poi_stop_count"
                    value={formData.poi_stop_count}
                    onChange={handleSelectChange}
                >
                    <option value="нет">Нет</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3–5">3–5</option>
                    <option value="больше 5">Больше 5</option>
                </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Типы достопримечательностей</Form.Label>
                <div>
                    <Form.Check
                        inline
                        type="checkbox"
                        label="Природа"
                        name="nature"
                        checked={formData.poi_types.nature}
                        onChange={handleCheckboxChange}
                    />
                    <Form.Check
                        inline
                        type="checkbox"
                        label="Культура"
                        name="culture"
                        checked={formData.poi_types.culture}
                        onChange={handleCheckboxChange}
                    />
                    <Form.Check
                        inline
                        type="checkbox"
                        label="Развлечения"
                        name="entertainment"
                        checked={formData.poi_types.entertainment}
                        onChange={handleCheckboxChange}
                    />
                </div>
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label>Время начала поездки</Form.Label>
                <Form.Control
                    type="time"
                    name="departure_time"
                    value={formData.departure_time}
                    onChange={handleInputChange}
                    required
                />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Check
                    type="checkbox"
                    label="Нужны остановки на ночевку"
                    name="hotel_stop"
                    checked={formData.hotel_stop}
                    onChange={(e) =>
                        setFormData((prev) => ({...prev, hotel_stop: e.target.checked}))
                    }
                />
            </Form.Group>

            <Button variant="primary" type="submit">
                Создать поездку
            </Button>
        </Form>
    );
};

export default RouteForm;
