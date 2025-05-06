import React, { useState } from 'react';
import './styles.css'; // Usa a mesma estilização do login, se preferir

function RedefinirSenha() {
  const [email, setEmail] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mensagem, setMensagem] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (novaSenha !== confirmarSenha) {
      setMensagem('As senhas não coincidem.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/redefinir-senha', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, novaSenha }),
      });

      const data = await response.json();

      if (data.success) {
        setMensagem('Senha redefinida com sucesso!');
      } else {
        setMensagem(data.message || 'Erro ao redefinir a senha.');
      }
    } catch (error) {
      console.error('Erro:', error);
      setMensagem('Erro ao conectar com o servidor.');
    }
  };

  return (
    <div className="custom-body">
      <section className="container">
        <div className="form-section">
          <div className="form-wrapper">
            <h2>Redefinir Senha 🔐</h2>
            <p>Insira seu email e a nova senha.</p>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="novaSenha">Nova Senha</label>
                <input
                  type="password"
                  id="novaSenha"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmarSenha">Confirmar Senha</label>
                <input
                  type="password"
                  id="confirmarSenha"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="custom-button">
                Redefinir
              </button>
            </form>

            {mensagem && <p style={{ marginTop: '15px', color: 'red' }}>{mensagem}</p>}
          </div>
        </div>
      </section>
    </div>
  );
}

export default RedefinirSenha;
