import React from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import TRoute from './pages/TRoute';
import Navbar from './components/Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import Profile from './pages/Profile';
import TTTRoute from './components/TTTRoute';
import Main from './pages/Main';
import TripDetailsPage from "./pages/TRoute";

function App() {
    return (
        <Router>
            <Navbar/>
            <div className="container mt-4">
                <Routes>
                    <Route path="/" element={<Home/>}/>
                    <Route path="/login" element={<Login/>}/>
                    <Route path="/register" element={<Register/>}/>
                    <Route path="/profile" element={<Profile/>}/>
                    <Route path="/trip/:id" element={<TripDetailsPage/>} />
                    <Route path="/route/:id" element={<TTTRoute />} />
                    <Route path="/main" element={<Main/>}/>
                </Routes>
            </div>
        </Router>
    );
}

export default App;
