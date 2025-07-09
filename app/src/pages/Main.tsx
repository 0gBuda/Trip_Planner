import React from "react";
import {Link} from "react-router-dom";

const Main = () => {
    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 relative">
            <h1 className="text-5xl font-bold text-gray-800 mb-8 text-center">
                Добро пожаловать в <span className="text-blue-500">YanTrip</span>
            </h1>

            <p className="text-lg text-gray-600 max-w-2xl text-center mb-12 leading-relaxed">
                YanTrip — это современное приложение для планирования маршрутов и поездок.
                Выбирайте точки старта и финиша, добавляйте интересные места и создавайте
                оптимальный маршрут с расчетом расстояния, времени и остановок.
                Всё на базе Яндекс.Карт и интеграции с внешними сервисами.
            </p>

            <div className="flex items-center justify-center h-screen bg-gray-50">
                <Link
                    to="/"
                    className="px-10 py-5 bg-blue-500 text-white rounded-xl text-xl font-semibold hover:bg-blue-600 transition"
                >
                    Создать свой маршрут
                </Link>
            </div>


            <div className="absolute inset-0 bg-[url('/assets/map-pattern.png')] bg-cover opacity-10 z-[-1]"/>
        </div>
    );
};

export default Main;
