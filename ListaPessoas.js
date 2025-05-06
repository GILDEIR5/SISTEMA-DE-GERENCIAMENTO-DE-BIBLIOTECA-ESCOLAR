import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import './ListaPessoas.css';

function ListaPessoas() {
  const [pessoas, setPessoas] = useState([]);
  const [mensagem, setMensagem] = useState('');
  const [editandoPessoa, setEditandoPessoa] = useState(null);
  const [formData, setFormData] = useState({ nome: '', sobrenome: '', idade: '', CPF: '', WhatsApp: '', CEP: '' });
  const [maxVisibleAtivas, setMaxVisibleAtivas] = useState(5);
  const [maxVisibleInativas, setMaxVisibleInativas] = useState(5);
  const [showInativas, setShowInativas] = useState(false);

  // Carrega todas as pessoas
  useEffect(() => {
    api.get('/pessoas')
      .then(res => setPessoas(res.data))
      .catch(err => console.error('Erro ao carregar pessoas:', err));
  }, []);

  const handleUpdatePessoa = async (id, data) => {
    try {
      await api.put(`/pessoas/${id}`, data);
      setPessoas(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
      setMensagem('Informações atualizadas com sucesso!');
    } catch (err) {
      console.error('Erro ao atualizar pessoa:', err);
      setMensagem('Erro ao atualizar informações da pessoa.');
    } finally {
      setTimeout(() => setMensagem(''), 3000);
      setEditandoPessoa(null);
    }
  };

  const handleInativar = id => {
    handleUpdatePessoa(id, { ativo: false });
  };

  const handleReativar = id => {
    handleUpdatePessoa(id, { ativo: true });
  };

  const startEdit = pessoa => {
    setEditandoPessoa(pessoa.id);
    setFormData({
      nome: pessoa.nome,
      sobrenome: pessoa.sobrenome,
      idade: pessoa.idade,
      CPF: pessoa.CPF,
      WhatsApp: pessoa.WhatsApp,
      CEP: pessoa.CEP
    });
  };

  const handleFormChange = e => {
    const { name, value } = e.target;
    setFormData(fd => ({ ...fd, [name]: value }));
  };

  const submitEdit = e => {
    e.preventDefault();
    if (editandoPessoa) {
      handleUpdatePessoa(editandoPessoa, formData);
    }
  };

  const ativadas = pessoas.filter(p => p.ativo !== false);
  const inativadas = pessoas.filter(p => p.ativo === false);

  return (
    <div className="lista-container">
      <h2>Lista de Pessoas</h2>
      {mensagem && <p className="mensagem">{mensagem}</p>}

      {editandoPessoa && (
        <form onSubmit={submitEdit} className="editar-form">
          <h3>Editando Pessoa</h3>
          <input name="nome" value={formData.nome} onChange={handleFormChange} placeholder="Nome" />
          <input name="sobrenome" value={formData.sobrenome} onChange={handleFormChange} placeholder="Sobrenome" />
          <input name="idade" type="number" value={formData.idade} onChange={handleFormChange} placeholder="Idade" />
          <input name="CPF" value={formData.CPF} onChange={handleFormChange} placeholder="CPF" />
          <input name="WhatsApp" value={formData.WhatsApp} onChange={handleFormChange} placeholder="WhatsApp" />
          <input name="CEP" value={formData.CEP} onChange={handleFormChange} placeholder="CEP" />
          <button type="submit">Salvar</button>
          <button type="button" onClick={() => setEditandoPessoa(null)}>Cancelar</button>
        </form>
      )}

      <h3>Pessoas Ativas</h3>
      <table>
        <thead>
          <tr><th>Nome</th><th>Sobrenome</th><th>Idade</th><th>CPF</th><th>WhatsApp</th><th>CEP</th><th>Ações</th></tr>
        </thead>
        <tbody>
          {ativadas.slice(0, maxVisibleAtivas).map(p => (
            <tr key={p.id}>
              <td>{p.nome}</td><td>{p.sobrenome}</td><td>{p.idade}</td><td>{p.CPF}</td><td>{p.WhatsApp}</td><td>{p.CEP}</td>
              <td>
                <button onClick={() => handleInativar(p.id)}>Inativar</button>
                <button onClick={() => startEdit(p)}>Editar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {ativadas.length > maxVisibleAtivas && <button onClick={() => setMaxVisibleAtivas(m => m + 5)}>Ver mais</button>}

      <button onClick={() => setShowInativas(s => !s)}>
        {showInativas ? 'Ocultar Inativas' : 'Mostrar Inativas'}
      </button>

      {showInativas && (
        <>
          <h3>Pessoas Inativas</h3>
          <table>
            <thead>
              <tr><th>Nome</th><th>Sobrenome</th><th>Ações</th></tr>
            </thead>
            <tbody>
              {inativadas.slice(0, maxVisibleInativas).map(p => (
                <tr key={p.id}>
                  <td>{p.nome}</td><td>{p.sobrenome}</td>
                  <td><button onClick={() => handleReativar(p.id)}>Reativar</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {inativadas.length > maxVisibleInativas && <button onClick={() => setMaxVisibleInativas(m => m + 5)}>Ver mais</button>}
        </>
      )}
    </div>
  );
}

export default ListaPessoas;
