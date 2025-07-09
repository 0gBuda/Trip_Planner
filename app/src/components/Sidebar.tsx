import React from 'react';
import {PlaceInfo} from '../types/place';

interface SidebarProps {
    places: PlaceInfo[];
    routeInfo: { duration: number; distance: string; stops: number } | null;
    onDelete: (index: number) => void;
    onMoveUp: (index: number) => void;
    onMoveDown: (index: number) => void;
}

const formatHours = (h: number) => {
    const hours = Math.floor(h);
    const mins = Math.round((h - hours) * 60);
    return `${hours} ч ${mins} мин`;
};

export default function Sidebar({
                                    places,
                                    routeInfo,
                                    onDelete,
                                    onMoveUp,
                                    onMoveDown,
                                }: SidebarProps) {
    return (
        <div
            style={{
                width: 280,
                padding: 12,
                backgroundColor: '#f7f7f7',
                borderRight: '1px solid #ddd',
                overflowY: 'auto',
            }}
        >
            <h3>Точки маршрута</h3>

            {routeInfo && (
                <div style={{marginTop: 12, fontSize: 14}}>
                    <div>Длительность: {formatHours(routeInfo.duration / 60)}</div>
                    <div>Расстояние: {routeInfo.distance}</div>
                    <div>Остановки: {routeInfo.stops}</div>
                </div>
            )}
            {places.length === 0 && <p>Нет точек</p>}
            <ul style={{listStyle: 'none', padding: 0}}>
                {places.map((place, i) => (
                    <li
                        key={i}
                        style={{
                            marginBottom: 12,
                            background: '#fff',
                            padding: 8,
                            borderRadius: 4,
                            boxShadow: '0 0 3px rgba(0,0,0,0.1)',
                        }}
                    >
                        <strong>Точка №{i + 1}: {place.name}</strong>
                        <br/>
                        <small>{place.address}</small>
                        <br/>
                        {place.type && (
                            <div style={{marginTop: 6, fontSize: 12, color: '#666'}}>
                                <div><strong>Тип:</strong> {place.type}</div>
                                {/* Если есть visit_time */}
                                <div>
                                    <strong>Приб. время прибытия:</strong> {place.visit_time}
                                </div>
                                {/* Описание (из description или metaData) */}
                                {place.additional?.address && (
                                    <div><strong>Адрес:</strong> {place.additional.address}</div>
                                )}
                                {/* Режим работы */}
                                {place.additional?.opening_hours && (
                                    <div><strong>Время работы:</strong> {place.additional.opening_hours}</div>
                                )}
                                {/* Телефон */}
                                {place.additional?.phone && (
                                    <div><strong>Телефон:</strong> {place.additional.phone}</div>
                                )}
                                {/* Рейтинг */}
                                {place.additional?.rating != null && (
                                    <div><strong>Рейтинг:</strong> {place.additional.rating.toFixed(1)}</div>
                                )}
                            </div>
                        )}
                        <div style={{marginTop: 8}}>
                            <button
                                disabled={i === 0}
                                onClick={() => onMoveUp(i)}
                                style={{marginRight: 6}}
                            >
                                ↑
                            </button>
                            <button
                                disabled={i === places.length - 1}
                                onClick={() => onMoveDown(i)}
                                style={{marginRight: 6}}
                            >
                                ↓
                            </button>
                            <button onClick={() => onDelete(i)} style={{color: 'red'}}>
                                ✕
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
