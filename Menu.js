import React from 'react';
import { Link } from 'react-router-dom';
import './Menu.css'; // Importando o arquivo CSS para estilos específicos do menu

function Menu() {
    return (
        <nav className="navbar"> {/* Adicionando a classe "navbar" */}
            <ul>
                <li><Link to="/" className="nav-link">Livros Disponíveis</Link></li> {/* Adicionando a classe "nav-link" */}
                <li><Link to="/LoginPage" className="nav-link">Login</Link></li> {/* Adicionando a classe "nav-link" */}
            </ul>
        </nav>
    );
}

export default Menu;
