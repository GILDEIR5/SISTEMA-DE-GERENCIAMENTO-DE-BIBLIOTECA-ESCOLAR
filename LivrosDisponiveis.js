import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api.js';
import Menu from '../layout/Menu';
import './LivrosDisponiveis.css';

function LivrosDisponiveis() {
  const [livros, setLivros] = useState([]);
  const [livrosFiltrados, setLivrosFiltrados] = useState({});
  const [generos, setGeneros] = useState([]);
  const [generosSelecionados, setGenerosSelecionados] = useState([]);
  const [termoPesquisa, setTermoPesquisa] = useState('');
  const [carouselIndexes, setCarouselIndexes] = useState({});
  const [livroSelecionado, setLivroSelecionado] = useState(null);
  const [mostrarDetalhes, setMostrarDetalhes] = useState(false);
  const detalhesRef = useRef(null);
  const dropdownRef = useRef(null);
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  const [touchStart, setTouchStart] = useState(null);

  // carrega livros do backend
  useEffect(() => {
    api.get('/livros')
      .then(resp => {
        const data = resp.data;       // array de livros do SQLite
        // agrupa por gênero
        const grouped = {};
        data.forEach(l => {
          const g = l.genero || 'Indefinido';
          if (!grouped[g]) grouped[g] = [];
          grouped[g].push(l);
        });

        setLivros(grouped);
        setLivrosFiltrados(grouped);
        setGeneros(Object.keys(grouped));
        setCarouselIndexes(Object.keys(grouped).reduce((acc, g) => { acc[g] = 0; return acc; }, {}));
      })
      .catch(err => console.error('Erro ao carregar livros:', err));
  }, []);



  // filtro por pesquisa ou gêneros
  useEffect(() => {
    let flat = Object.values(livros).flat();

    if (termoPesquisa) {
      flat = flat.filter(l => l.titulo.toLowerCase().includes(termoPesquisa.toLowerCase()));
    }
    if (generosSelecionados.length) {
      flat = flat.filter(l => generosSelecionados.includes(l.genero || 'Indefinido'));
    }

    const grouped = {};
    flat.forEach(l => {
      const g = l.genero || 'Indefinido';
      if (!grouped[g]) grouped[g] = [];
      grouped[g].push(l);
    });

    setLivrosFiltrados(grouped);
    setGeneros(Object.keys(grouped));
    setCarouselIndexes(Object.keys(grouped).reduce((acc, g) => { acc[g] = 0; return acc; }, {}));
  }, [termoPesquisa, generosSelecionados, livros]);

  // fecha detalhes ao clicar fora
  useEffect(() => {
    const handleClickOutside = e => {
      if (detalhesRef.current && !detalhesRef.current.contains(e.target)) {
        setMostrarDetalhes(false);
        setLivroSelecionado(null);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMostrarDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleGeneroChange = g => {
    setGenerosSelecionados(sel =>
      sel.includes(g) ? sel.filter(x => x !== g) : [...sel, g]
    );
  };

  const handlePrev = g => {
    setCarouselIndexes(ix => ({
      ...ix,
      [g]: (ix[g] === 0 ? livrosFiltrados[g].length : ix[g]) - 1
    }));
  };
  const handleNext = g => {
    setCarouselIndexes(ix => ({
      ...ix,
      [g]: (ix[g] + 1) % livrosFiltrados[g].length
    }));
  };

  const handleTouchStart = e => setTouchStart(e.touches[0].clientX);
  const handleTouchMove = (e, g) => {
    if (touchStart == null) return;
    const diff = touchStart - e.touches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? handleNext(g) : handlePrev(g);
      setTouchStart(null);
    }
  };

  const renderCarousel = g => {
    const arr = livrosFiltrados[g] || [];
    const start = carouselIndexes[g] || 0;
    const slice = arr.slice(start, start + 5);
    return (
      <div
        className="carousel"
        onTouchStart={handleTouchStart}
        onTouchMove={e => handleTouchMove(e, g)}
      >
        {slice.map(l => (
          <div
            key={l.id}
            className={`livro-item ${l.quantidade <= 0 ? 'indisponivel' : ''}`}
            onClick={() => { setLivroSelecionado(l); setMostrarDetalhes(true); }}
          >
            <div className="livro-capa">
              {l.imagem ? <img src={l.imagem} alt="" /> : 'Sem imagem'}
            </div>
            <div className="livro-detalhes">
              <h3>{l.titulo}</h3>
              <p>por {l.autor}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      <Menu />
      <div className="livros-container">
        <h1>Bem-Vindo à Minha Biblioteca</h1>
        <div className="pesquisa-container">
          <input
            placeholder="Pesquisar título…"
            value={termoPesquisa}
            onChange={e => setTermoPesquisa(e.target.value)}
          />
        </div>
        <div className="filtros-container">
          <span onClick={() => setMostrarDropdown(d => !d)}>Filtrar por Gênero</span>
          {mostrarDropdown && (
            <div ref={dropdownRef} className="dropdown">
              {generos.map(g => (
                <label key={g}>
                  <input
                    type="checkbox"
                    checked={generosSelecionados.includes(g)}
                    onChange={() => handleGeneroChange(g)}
                  />
                  {g}
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="carousels-container">
          {generos.map(g => (
            <div key={g} className="carousel-container">
              <h3>{g}</h3>
              {livrosFiltrados[g] && livrosFiltrados[g].length > 0 ? (
                <>
                  {renderCarousel(g)}
                  <button onClick={() => handlePrev(g)} className="carousel-nav prev">&lt;</button>
                  <button onClick={() => handleNext(g)} className="carousel-nav next">&gt;</button>
                </>
              ) : (
                <p>Nenhum livro encontrado.</p>
              )}
            </div>
          ))}
        </div>

        {mostrarDetalhes && livroSelecionado && (
          <div className="livro-selecionado" ref={detalhesRef}>
            <button onClick={() => setMostrarDetalhes(false)}>X</button>
            <h3>{livroSelecionado.titulo}</h3>
            <p>Autor: {livroSelecionado.autor}</p>
            <p>Sinopse: {livroSelecionado.sinopse || '—'}</p>
            <p>Qtd: {livroSelecionado.quantidade}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default LivrosDisponiveis;
