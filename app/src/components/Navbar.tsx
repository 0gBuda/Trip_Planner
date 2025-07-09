import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Container, Nav } from 'react-bootstrap';

function NavBarComponent() {
  return (
    <Navbar bg="dark" variant="dark" expand="lg" collapseOnSelect>
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold">
          YanTrip
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />  {/* Бургер-иконка */}
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/main">Главная</Nav.Link>
            <Nav.Link as={Link} to="/login">Вход</Nav.Link>
            <Nav.Link as={Link} to="/">Создать поездку</Nav.Link>
            {/*<Nav.Link as={Link} to="/register">Регистрация</Nav.Link>*/}
            <Nav.Link as={Link} to="/profile">Мой профиль</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavBarComponent;
