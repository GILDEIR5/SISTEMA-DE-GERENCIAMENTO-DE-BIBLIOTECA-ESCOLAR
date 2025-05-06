import React, { useState, useEffect, useRef } from 'react';
import DocumentoEmprestimo from './DocumentoEmprestimo';
import { useReactToPrint } from 'react-to-print';
import './Emprestimo.css';

function EmprestimoLivros() {
    const [livros, setLivros] = useState([]);
    const [pessoas, setPessoas] = useState([]);
    const [filteredLivros, setFilteredLivros] = useState([]);
    const [filteredPessoas, setFilteredPessoas] = useState([]);
    const [isbnOuNome, setIsbnOuNome] = useState('');
    const [aluno, setAluno] = useState('');
    const [selectedLivro, setSelectedLivro] = useState(null);
    const [selectedPessoa, setSelectedPessoa] = useState(null);
    const [prazoDias, setPrazoDias] = useState(7);
    const [loading, setLoading] = useState(true);
    const [selectedLivroIndex, setSelectedLivroIndex] = useState(-1);
    const [selectedPessoaIndex, setSelectedPessoaIndex] = useState(-1);
    const [prazoEntrega, setPrazoEntrega] = useState(null);
    const [dataEmprestimo, setDataEmprestimo] = useState(null);
    const documentoRef = useRef();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [livrosRes, pessoasRes] = await Promise.all([
                    fetch('http://localhost:3001/livros'),
                    fetch('http://localhost:3001/pessoas?ativo=true')
                ]);

                const livrosData = await livrosRes.json();
                const pessoasData = await pessoasRes.json();

                setLivros(livrosData);
                setPessoas(pessoasData);
            } catch (error) {
                console.error('Erro ao carregar dados:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handlePrint = useReactToPrint({
        content: () => documentoRef.current,
    });

    const handleEmprestimo = async () => {
        if (!selectedLivro || !selectedPessoa || !prazoDias) {
            alert('Por favor, preencha todos os campos.');
            return;
        }

        if (selectedLivro.quantidade <= 0) {
            alert('Este livro não está disponível no momento.');
            return;
        }

        try {
            const emprestimosRes = await fetch(`http://localhost:3001/emprestimos?alunoId=${selectedPessoa.id}`);
            const emprestimos = await emprestimosRes.json();

            const emprestimosAtivos = emprestimos.filter(e => !e.dataDevolucao);

            if (emprestimosAtivos.length > 0) {
                alert('Este aluno já tem um livro emprestado.');
                return;
            }

            const dataAtual = new Date();
            const prazo = new Date();
            prazo.setDate(dataAtual.getDate() + prazoDias);

            setPrazoEntrega(prazo);
            setDataEmprestimo(dataAtual.toISOString());

            await fetch('http://localhost:3001/emprestimos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    livroId: selectedLivro.id,
                    pessoaId: selectedPessoa.id,
                    dataEmprestimo: dataAtual.toISOString(),
                    prazoEntrega: prazo.toISOString()
                })
            });

            await fetch(`http://localhost:3001/livros/${selectedLivro.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quantidade: selectedLivro.quantidade - 1 })
            });

            setIsbnOuNome('');
            setAluno('');
            setPrazoDias(7);
            setSelectedLivro(null);
            setSelectedPessoa(null);

            const updatedLivros = await (await fetch('http://localhost:3001/livros')).json();
            setLivros(updatedLivros);

            handlePrint();
            alert('Empréstimo registrado com sucesso!');
        } catch (error) {
            alert('Erro ao registrar empréstimo.');
        }
    };

    const handleLivroSearch = (query) => {
        setIsbnOuNome(query);
        const livrosFiltrados = livros.filter(livro =>
            (livro.isbn?.toLowerCase().includes(query.toLowerCase()) || 
             livro.titulo?.toLowerCase().includes(query.toLowerCase()))
        );
        setFilteredLivros(livrosFiltrados);
        setSelectedLivroIndex(-1); // Reset the selected index when searching
    };
    

    const handleAlunoSearch = (nome) => {
        setAluno(nome);
        const filtrados = pessoas.filter(p =>
            `${p.nome} ${p.sobrenome}`.toLowerCase().includes(nome.toLowerCase())
        );
        setFilteredPessoas(filtrados);
        setSelectedPessoaIndex(-1);
    };

    const handleLivroSelect = (livro) => {
        setSelectedLivro(livro);
        setIsbnOuNome(livro.titulo);
        setFilteredLivros([]);
    };

    const handleAlunoSelect = (pessoa) => {
        setSelectedPessoa(pessoa);
        setAluno(`${pessoa.nome} ${pessoa.sobrenome}`);
        setFilteredPessoas([]);
    };

    const handleLivroKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            setSelectedLivroIndex(prev => (prev < filteredLivros.length - 1 ? prev + 1 : prev));
        } else if (e.key === 'ArrowUp') {
            setSelectedLivroIndex(prev => (prev > 0 ? prev - 1 : prev));
        } else if (e.key === 'Enter' && selectedLivroIndex >= 0) {
            handleLivroSelect(filteredLivros[selectedLivroIndex]);
        }
    };

    const handleAlunoKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            setSelectedPessoaIndex(prev => (prev < filteredPessoas.length - 1 ? prev + 1 : prev));
        } else if (e.key === 'ArrowUp') {
            setSelectedPessoaIndex(prev => (prev > 0 ? prev - 1 : prev));
        } else if (e.key === 'Enter' && selectedPessoaIndex >= 0) {
            handleAlunoSelect(filteredPessoas[selectedPessoaIndex]);
        }
    };

    if (loading) return <div>Carregando...</div>;

    return (
        <div className="emprestimo-container">
            <h2 className="emprestimo-title">Registrar Empréstimo</h2>
            <div>
                <input
                    type="text"
                    className="emprestimo-input"
                    placeholder="Digite o ISBN ou nome do livro"
                    value={isbnOuNome}
                    onChange={(e) => {
                        setIsbnOuNome(e.target.value);
                        handleLivroSearch(e.target.value);
                    }}
                    onKeyDown={handleLivroKeyDown}
                />
                {isbnOuNome && filteredLivros.length > 0 && (
                    <ul className="emprestimo-list">
                        {filteredLivros.map((livro, index) => (
                            (livro.quantidade > 0 && livro.ativo) && (
                                <li
                                    key={livro.id}
                                    onClick={() => handleLivroSelect(livro)}
                                    className={`emprestimo-list-item ${index === selectedLivroIndex ? 'selected' : ''}`}
                                >
                                    {livro.titulo} ({livro.isbn})
                                </li>
                            )
                        ))}
                    </ul>
                )}

                <input
                    type="text"
                    className="emprestimo-input"
                    placeholder="Digite o nome do aluno"
                    value={aluno}
                    onChange={(e) => handleAlunoSearch(e.target.value)}
                    onKeyDown={handleAlunoKeyDown}
                />
                {aluno && filteredPessoas.length > 0 && (
                    <ul className="emprestimo-list">
                        {filteredPessoas.map((pessoa, index) => (
                            <li
                                key={pessoa.id}
                                onClick={() => handleAlunoSelect(pessoa)}
                                className={`emprestimo-list-item ${index === selectedPessoaIndex ? 'selected' : ''}`}
                            >
                                {pessoa.nome} {pessoa.sobrenome}
                            </li>
                        ))}
                    </ul>
                )}

                <div className="prazo-entrega">
                    <label htmlFor="prazo">Prazo de entrega:</label>
                    <select
                        id="prazo"
                        className="emprestimo-input"
                        value={prazoDias}
                        onChange={(e) => setPrazoDias(parseInt(e.target.value))}
                    >
                        <option value={7}>7 dias</option>
                        <option value={15}>15 dias</option>
                        <option value={30}>30 dias</option>
                        <option value={45}>45 dias</option>
                    </select>
                </div>

                <button onClick={handleEmprestimo} className="emprestimo-button">Registrar Empréstimo</button>

                {selectedLivro && selectedPessoa && prazoEntrega && dataEmprestimo && (
                    <div style={{ display: 'none' }}>
                        <DocumentoEmprestimo
                            ref={documentoRef}
                            selectedLivro={selectedLivro}
                            selectedPessoa={selectedPessoa}
                            prazoEntrega={prazoEntrega}
                            dataEmprestimo={dataEmprestimo}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

export default EmprestimoLivros;
