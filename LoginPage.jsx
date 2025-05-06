import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Menu from '../layout/Menu';
import { useAuth } from '../contexts/authContext';
import './styles.css';
import { Eye, EyeOff } from "lucide-react";

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:3001/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, senha: password }) // "senha" deve bater com o backend
      });

      const data = await response.json();

      if (data.success) {
        console.log('Login bem-sucedido!');
        setCurrentUser(data.user);
        localStorage.setItem('isLoggedIn', 'true');
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }
        navigate('/emprestimo');
      } else {
        alert('Email ou senha incorretos.');
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
    }
  };

  const handleRememberMe = (e) => {
    setRememberMe(e.target.checked);
  };

  const handleForgotPassword = () => {
    alert('A redefinição de senha ainda não está implementada no sistema com SQLite.');
  };

  return (
    <div className="custom-body">
      <Menu />
      {!currentUser ? (
        <section className="container">
          <div className="image-section">
            <div className="image-wrapper">
              <img className="custom-img" src={require('../assets/Library.avif')} alt="Mesh Gradient" />
            </div>
            <div className="content-container">
              <h1 className="section-heading">
                Capacitando mentes por meio da educação<span>Digital.</span>
              </h1>
              <p className="section-paragraph">
                Cada passo em frente é um passo em direção ao conhecimento. Abrace a jornada.
              </p>
            </div>
          </div>
          <div className="form-section">
            <div className="form-wrapper">
              <h2>Bem vindo! 👋🏻</h2>
              <p>Insira suas credenciais para acessar sua conta.</p>
              <div className="input-container">
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    className="input-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="off"
                  />
                </div>
                <div className="form-group relative">
                  <label htmlFor="password">Senha</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      className="input-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="eye-button"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="remember-forgot">
                <div className="remember-me">
                  <input
                    type="checkbox"
                    id="remember-me"
                    className="input-remember"
                    checked={rememberMe}
                    onChange={handleRememberMe}
                  />
                  <label htmlFor="remember-me">Lembrar-me</label>
                </div>
                <a href="/redefinir-senha">Esqueceu a senha?</a>

              </div>
              <button className="login-btn custom-button" onClick={handleLogin}>
                Entrar
              </button>
              <div className="or-divider">////</div>
            </div>
          </div>
        </section>
      ) : (
        <div>
          <button
            className="custom-button logout-button"
            onClick={() => {
              setCurrentUser(null);
              localStorage.removeItem('isLoggedIn');
            }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default LoginPage;
