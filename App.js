import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CadastroLivro from './Cadastro Livro/CadastroLivro';
import CadastroPessoa from './Cadastro Pessoa/CadastroPessoa';
import Emprestimo from './Empréstimo Livro/EmprestimoLivros';
import Relatorio from './Relatório/Relatorio';
import Devolucao from './Devolução Livro/DevolucaoLivros';
import LivrosCadastrados from './Lista/LivrosCadastrados';
import ListaPessoas from './Lista/ListaPessoas';
import Layout from './Layout';
import LivrosDisponiveis from './Home/LivrosDisponiveis';
import LoginPage from './Login/LoginPage';
import './App.css';
import PrivateRoute from './PrivateRoute';
import { AuthProvider } from './contexts/authContext';
import RedefinirSenha from './Login/RedefinirSenha';



function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    
                    <Route path="/" element={<LivrosDisponiveis />} />
                    <Route path="/LoginPage" element={<LoginPage />} />
                    <Route path="/redefinir-senha" element={<RedefinirSenha />} />
                    <Route element={<PrivateRoute />}>
                        <Route path="/cadastro-livro" element={<Layout><CadastroLivro /></Layout>} />
                        <Route path="/cadastro-pessoa" element={<Layout><CadastroPessoa /></Layout>} />
                        <Route path="/emprestimo" element={<Layout><Emprestimo /></Layout>} />
                        <Route path="/livros-cadastrados" element={<Layout><LivrosCadastrados /></Layout>} />
                        <Route path="/lista-pessoas" element={<Layout><ListaPessoas /></Layout>} />
                        <Route path="/relatorio" element={<Layout><Relatorio /></Layout>} />
                        <Route path="/devolucao" element={<Layout><Devolucao /></Layout>} />
                    </Route>
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
