import React, { useState, useEffect } from 'react';
import './Devolucao.css';

function DevolucaoLivros() {
  const [livros, setLivros] = useState([]);
  const [pessoas, setPessoas] = useState([]);
  const [emprestimos, setEmprestimos] = useState([]);
  const [devolucoes, setDevolucoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLateReturnAlert, setShowLateReturnAlert] = useState(false);
  const [quantidadeAtrasadas, setQuantidadeAtrasadas] = useState(0);
  const [filtro, setFiltro] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalFilter, setModalFilter] = useState('');

  // Fetch data from SQLite backend
  useEffect(() => {
    async function fetchAll() {
      try {
        const [livrosRes, pessoasRes, emprestimosRes, devolucoesRes] = await Promise.all([
          fetch('http://localhost:3001/livros'),
          fetch('http://localhost:3001/pessoas'),
          fetch('http://localhost:3001/emprestimos'),
          fetch('http://localhost:3001/devolucoes')
        ]);
        const livrosData = await livrosRes.json();
        const pessoasData = await pessoasRes.json();
        const emprestimosData = await emprestimosRes.json();
        const devolucoesData = await devolucoesRes.json();

        setLivros(livrosData);
        setPessoas(pessoasData);
        setEmprestimos(emprestimosData);
        setDevolucoes(devolucoesData);

        // count late returns
        const now = new Date();
        const atrasados = emprestimosData.filter(e => new Date(e.prazoEntrega) < now);
        setQuantidadeAtrasadas(atrasados.length);
        setShowLateReturnAlert(atrasados.length > 0);
      } catch (err) {
        console.error('Erro carregando dados:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  const handleFilterChange = e => setFiltro(e.target.value);
  const handleModalFilterChange = e => setModalFilter(e.target.value);

  const handleDevolucao = async emprestimo => {
    try {
      // delete emprestimo
      await fetch(`http://localhost:3001/emprestimos/${emprestimo.id}`, { method: 'DELETE' });
      // update livro quantity
      await fetch(`http://localhost:3001/livros/${emprestimo.livroId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantidade: livros.find(l => l.id === emprestimo.livroId).quantidade + 1 })
      });
      // record devolucao
      await fetch('http://localhost:3001/devolucoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          livro_id: emprestimo.livroId,
          pessoa_id: emprestimo.pessoaId,
          data_emprestimo: emprestimo.dataEmprestimo,
          data_devolucao: new Date().toISOString()
        })
      });
      // refresh lists
      const [empRes, livRes, devRes] = await Promise.all([
        fetch('http://localhost:3001/emprestimos'),
        fetch('http://localhost:3001/livros'),
        fetch('http://localhost:3001/devolucoes')
      ]);
      setEmprestimos(await empRes.json());
      setLivros(await livRes.json());
      setDevolucoes(await devRes.json());
      setQuantidadeAtrasadas(prev => prev - 1);
      alert('Devolução registrada com sucesso!');
    } catch (err) {
      console.error('Erro ao registrar devolução:', err);
      alert('Erro ao registrar devolução.');
    }
  };

  // filtered emprestimos
  const emprestimosFiltrados = emprestimos.filter(e => {
    const livro = livros.find(l => l.id === e.livroId) || {};
    const pessoa = pessoas.find(p => p.id === e.pessoaId) || {};
    return (
      livro.titulo.toLowerCase().includes(filtro.toLowerCase()) ||
      (livro.isbn || '').toLowerCase().includes(filtro.toLowerCase()) ||
      pessoa.nome.toLowerCase().includes(filtro.toLowerCase())
    );
  });

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="devolucao-container">
      <h2>Devolução de Livros</h2>
      {showLateReturnAlert && (
        <div className="late-returns-alert">
          Existem {quantidadeAtrasadas} devoluções atrasadas!
          <button onClick={() => setShowModal(true)}>Ver atrasadas</button>
        </div>
      )}
      <input
        type="text"
        placeholder="Filtrar empréstimos..."
        value={filtro}
        onChange={handleFilterChange}
      />
      <table>
        <thead><tr><th>Livro</th><th>Pessoa</th><th>Empréstimo</th><th>Prazo</th><th>Ação</th></tr></thead>
        <tbody>
          {emprestimosFiltrados.map(e => {
            const livro = livros.find(l => l.id === e.livroId) || {};
            const pessoa = pessoas.find(p => p.id === e.pessoaId) || {};
            return (
              <tr key={e.id}>
                <td>{livro.titulo}</td>
                <td>{pessoa.nome}</td>
                <td>{new Date(e.dataEmprestimo).toLocaleDateString()}</td>
                <td>{new Date(e.prazoEntrega).toLocaleDateString()}</td>
                <td><button onClick={() => handleDevolucao(e)}>Registrar</button></td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {showModal && (
        <div className="modal">
          <h3>Atrasados</h3>
          <input
            type="text"
            placeholder="Filtrar..."
            value={modalFilter}
            onChange={handleModalFilterChange}
          />
          <ul>
            {emprestimos.filter(e => new Date(e.prazoEntrega) < new Date()).map(e => {
              const livro = livros.find(l => l.id === e.livroId) || {};
              const pessoa = pessoas.find(p => p.id === e.pessoaId) || {};
              return <li key={e.id}>{livro.titulo} - {pessoa.nome}</li>;
            })}
          </ul>
          <button onClick={() => setShowModal(false)}>Fechar</button>
        </div>
      )}
    </div>
  );
}

export default DevolucaoLivros;
