import React from 'react';
import LoginForm from '../components/LoginForm';
import api from '../api/axios';

const Login: React.FC = () => {
    const handleLogin = async (data: { email: string; password: string }) => {
        try {
            const params = new URLSearchParams();
            params.append('username', data.email);
            params.append('password', data.password);

            const response = await api.post('/api/v1/auth/login', params, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });

            console.log('Успех:', response.data);
            localStorage.setItem('token', response.data.access_token);
            alert('Вы успешно вошли!');
        } catch (error: any) {
            console.error('Ошибка авторизации:', error);
            alert('Неверный логин или пароль');
        }
    };


    return (
        <div className="d-flex justify-content-center mt-5">
            <LoginForm onSubmit={handleLogin}/>
        </div>
    );
};

export default Login;
