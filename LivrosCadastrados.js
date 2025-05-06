// src/Lista/LivrosCadastrados.js
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import './Lista.css';

function LivrosCadastrados() {
  const [livros, setLivros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [livroEdit, setLivroEdit] = useState({ id: null, quantidade: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [showInativos, setShowInativos] = useState(false);
  const [maxVisibleBooks, setMaxVisibleBooks] = useState(5);
  const [maxVisibleInactiveBooks, setMaxVisibleInactiveBooks] = useState(5);
  const [mensagem, setMensagem] = useState('');
  const [inativosAutenticado, setInativosAutenticado] = useState(false);

  useEffect(() => {
    api.get('/livros')
      .then(resp => setLivros(resp.data))
      .catch(err => console.error('Erro ao carregar livros:', err))
      .finally(() => setLoading(false));
  }, []);

  const updateField = (id, field, value) =>
    api.put(`/livros/${id}`, { [field]: value });

  const exibirMensagem = (texto) => {
    setMensagem(texto);
    setTimeout(() => setMensagem(''), 4000);
  };

  const handleSaveQuantidade = (livroId, novaQuantidade) => {
    updateField(livroId, 'quantidade', novaQuantidade)
      .then(() => {
        setLivros(ls => ls.map(l => l.id === livroId ? { ...l, quantidade: novaQuantidade } : l));
        exibirMensagem('Quantidade atualizada com sucesso!');
      })
      .catch(() => exibirMensagem('Erro ao atualizar quantidade.'));
    setLivroEdit({ id: null, quantidade: 0 });
  };

  const handleInativar = (id) => {
    updateField(id, 'ativo', false)
      .then(() => {
        setLivros(ls => ls.map(l => l.id === id ? { ...l, ativo: false } : l));
        exibirMensagem('Livro inativado com sucesso!');
      })
      .catch(() => exibirMensagem('Erro ao inativar livro.'));
  };

  const handleAtivar = (id) => {
    updateField(id, 'ativo', true)
      .then(() => {
        setLivros(ls => ls.map(l => l.id === id ? { ...l, ativo: true } : l));
        exibirMensagem('Livro ativado com sucesso!');
      })
      .catch(() => exibirMensagem('Erro ao ativar livro.'));
  };

  const handleDeleteLivro = async (livroId) => {
    try {
      await api.delete(`/livros/${livroId}`);
      setLivros(ls => ls.filter(l => l.id !== livroId));
      setMensagem('Livro excluído com sucesso!');
    } catch (err) {
      console.error(err);
      setMensagem('Erro ao excluir livro.');
    }
  };


  if (loading) return <div>Carregando...</div>;

  const ativos = livros.filter(l => l.ativo === true || l.ativo === 1 || l.ativo === undefined);
  const inativos = livros.filter(l => l.ativo === false || l.ativo === 0);

  const filtrarLivros = (lista) =>
    lista.filter(l =>
      l.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(l.isbn).includes(searchTerm)
    );

  const filteredAtivos = filtrarLivros(ativos).slice(0, maxVisibleBooks);
  const filteredInativos = filtrarLivros(inativos).slice(0, maxVisibleInactiveBooks);

  return (
    <div className="container2">
      <h2>Livros Cadastrados</h2>
      <p>Total de livros cadastrados: {livros.length}</p>

      {mensagem && <div className="message">{mensagem}</div>}

      <input
        type="text"
        placeholder="Pesquisar por título ou ISBN..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="input-search"
      />

      <table>
        <thead>
          <tr>
            <th>Imagem</th><th>Título</th><th>Editora</th><th>ISBN</th><th>Quantidade</th><th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {filteredAtivos.map(l => (
            <tr key={l.id}>
              <td>{l.imagem ? <img src={l.imagem} alt="" className="img-thumbnail" /> : 'Sem imagem'}</td>
              <td>{l.titulo}</td>
              <td>{l.editora}</td>
              <td>{l.isbn}</td>
              <td>
                {livroEdit.id === l.id ? (
                  <input
                    type="number"
                    value={livroEdit.quantidade}
                    onChange={e => setLivroEdit({ ...livroEdit, quantidade: parseInt(e.target.value) || 0 })}
                    onBlur={() => handleSaveQuantidade(l.id, livroEdit.quantidade)}
                    className="input-quantidade"
                  />
                ) : (
                  <span>{l.quantidade}</span>
                )}
              </td>
              <td>
                {livroEdit.id === l.id ? (
                  <>
                    <button onClick={() => handleSaveQuantidade(l.id, livroEdit.quantidade)}>Salvar</button>
                    <button onClick={() => setLivroEdit({ id: null, quantidade: 0 })}>Cancelar</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setLivroEdit({ id: l.id, quantidade: l.quantidade })}>Editar</button>
                    <button onClick={() => handleInativar(l.id)}>Inativar</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination-buttons">
        {ativos.length > maxVisibleBooks && (
          <button onClick={() => setMaxVisibleBooks(m => m + 10)}>Ver mais</button>
        )}
        {maxVisibleBooks > 5 && (
          <button onClick={() => setMaxVisibleBooks(m => m - 5)}>Ver menos</button>
        )}
      </div>

      {!inativosAutenticado ? (
        <button onClick={() => {
          const email = prompt('Email da bibliotecária:');
          const senha = prompt('Senha da bibliotecária:');
          if (!email || !senha) return;

          api.post('/auth/check', { email, senha })
            .then(resp => {
              if (resp.data.success) {
                setInativosAutenticado(true);
                setShowInativos(true);
              } else {
                setMensagem('Credenciais inválidas.');
              }
            })
            .catch(() => setMensagem('Erro na autenticação.'));
        }}>
          Mostrar Inativos
        </button>
      ) : (
        <button onClick={() => setShowInativos(si => !si)}>
          {showInativos ? 'Ocultar Inativos' : 'Mostrar Inativos'}
        </button>
      )}


      {showInativos && (
        <>
          <h3>Livros Inativos</h3>
          <table>
            <thead>
              <tr><th>Imagem</th><th>Título</th><th>Ações</th></tr>
            </thead>
            <tbody>
              {filteredInativos.map(l => (
                <tr key={l.id}>
                  <td>{l.imagem ? <img src={l.imagem} alt="" className="img-thumbnail" /> : 'Sem imagem'}</td>
                  <td>{l.titulo}</td>
                  <td>
                    <button onClick={() => handleAtivar(l.id)}>Ativar</button>
                    <button onClick={() => handleDeleteLivro(l.id)}>Excluir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination-buttons">
            {inativos.length > maxVisibleInactiveBooks && (
              <button onClick={() => setMaxVisibleInactiveBooks(m => m + 10)}>Ver mais</button>
            )}
            {maxVisibleInactiveBooks > 5 && (
              <button onClick={() => setMaxVisibleInactiveBooks(m => m - 5)}>Ver menos</button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default LivrosCadastrados;
