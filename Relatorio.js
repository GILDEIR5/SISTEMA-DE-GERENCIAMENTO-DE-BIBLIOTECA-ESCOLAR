import React, { useState, useEffect } from 'react';
import './Relatorio.css';

function Relatorio() {
  const [livros, setLivros] = useState([]);
  const [pessoas, setPessoas] = useState([]);
  const [devolucoes, setDevolucoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear());
  const [mesSelecionado, setMesSelecionado] = useState(new Date().getMonth() + 1);
  const [termoPesquisa, setTermoPesquisa] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [livrosRes, pessoasRes, devolRes] = await Promise.all([
          fetch('http://localhost:3001/livros'),
          fetch('http://localhost:3001/pessoas'),
          fetch('http://localhost:3001/devolucoes'),
        ]);
        setLivros(await livrosRes.json());
        setPessoas(await pessoasRes.json());
        setDevolucoes(await devolRes.json());
      } catch (e) {
        console.error('Erro ao buscar dados:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div>Carregando...</div>;

  const devolucoesArray = Array.isArray(devolucoes) ? devolucoes : [];

  const devolucoesFiltradas = devolucoesArray.filter(d => {
    const livro = livros.find(l => l.id === d.livroId) || {};
    const pessoa = pessoas.find(p => p.id === d.pessoaId) || {};
    const dt = new Date(d.dataDevolucao);

    const matchesTerm = 
      (livro.titulo || '').toLowerCase().includes(termoPesquisa) ||
      (pessoa.nome || '').toLowerCase().includes(termoPesquisa);

    const matchesDate =
      dt.getFullYear() === anoSelecionado &&
      dt.getMonth() + 1 === mesSelecionado;

    return matchesTerm && matchesDate;
  });

  const getNomeMes = m => 
    ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'][m-1];

  return (
    <div className="relatorio-container">
      <h2>Relatório de Devoluções</h2>
      <div>
        <label>Ano:
          <select value={anoSelecionado} onChange={e => setAnoSelecionado(+e.target.value)}>
            {[2025,2026,2027,2028,2029,2030].map(a=> <option key={a} value={a}>{a}</option>)}
          </select>
        </label>
        <label>Mês:
          <select value={mesSelecionado} onChange={e => setMesSelecionado(+e.target.value)}>
            {Array.from({length:12},(_,i)=>i+1).map(m=> 
              <option key={m} value={m}>{getNomeMes(m)}</option>)}
          </select>
        </label>
        <input 
          placeholder="Pesquisar..."
          value={termoPesquisa}
          onChange={e => setTermoPesquisa(e.target.value.toLowerCase())}
        />
      </div>
      <p>Total: {devolucoesFiltradas.length}</p>
      <table>
        <thead>
          <tr>
            <th>Livro</th><th>Pessoa</th><th>Empréstimo</th><th>Devolução</th>
          </tr>
        </thead>
        <tbody>
          {devolucoesFiltradas.map(d=> {
            const livro = livros.find(l=>l.id===d.livroId) || {};
            const pessoa = pessoas.find(p=>p.id===d.pessoaId) || {};
            return (
              <tr key={d.id}>
                <td>{livro.titulo}</td>
                <td>{pessoa.nome}</td>
                <td>{new Date(d.dataEmprestimo).toLocaleDateString()}</td>
                <td>{new Date(d.dataDevolucao).toLocaleDateString()}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default Relatorio;
