import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from './contexts/firebaseConfig';
import { useAuth } from './contexts/authContext';

const Layout = ({ children }) => {
    const navigate = useNavigate();
    const { setCurrentUser } = useAuth();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            setCurrentUser(null);
            navigate('/');
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
        }
    };

    return (
        <div>
            <nav className="fixed-nav">
                <ul>
                    <li>
                        <NavLink to="/emprestimo">Empréstimo de Livro</NavLink>
                    </li>
                    <li>
                        <NavLink to="/cadastro-livro">Cadastro de Livro</NavLink>
                    </li>
                    <li>
                        <NavLink to="/cadastro-pessoa">Cadastro de Pessoa</NavLink>
                    </li>
                    <li>
                        <NavLink to="/devolucao">Devolução de Livro</NavLink>
                    </li>
                    <li>
                        <NavLink to="/relatorio">Relatório de Devolução Livros</NavLink>
                    </li>
                    <li>
                        <NavLink to="/livros-cadastrados">Livro Cadastrado</NavLink>
                    </li>
                    <li>
                        <NavLink to="/lista-pessoas">Lista de Pessoas</NavLink>
                    </li>
                    <li>
                        <button onClick={handleLogout}>Logout</button>
                    </li>
                </ul>
            </nav>
            <div className="content">
                {children}
            </div>
        </div>
    );
};

export default Layout;
