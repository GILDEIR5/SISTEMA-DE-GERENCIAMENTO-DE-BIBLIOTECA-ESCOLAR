import React, { useState, useEffect } from 'react';
import { api } from '../services/api';    // <-- nosso cliente Axios
import './CadastroLivro.css';

function CadastroLivro() {
    const [titulo, setTitulo] = useState('');
    const [autor, setAutor] = useState('');
    const [ano, setAno] = useState('');
    const [editora, setEditora] = useState('');
    const [isbn, setIsbn] = useState('');
    const [quantidade, setQuantidade] = useState('');
    const [imagem, setImagem] = useState('');
    const [sinopse, setSinopse] = useState('');
    const [genero, setGenero] = useState('');
    const [mensagem, setMensagem] = useState('');
    const [livros, setLivros] = useState([]);

    // carrega todos os livros do SQLite
    useEffect(() => {
        api.get('/livros')
            .then(resp => setLivros(resp.data))
            .catch(err => console.error('Erro ao carregar livros:', err));
    }, []);

    // limpa campos quando ISBN muda
    useEffect(() => {
        setTitulo('');
        setAutor('');
        setAno('');
        setEditora('');
        setImagem('');
        setSinopse('');
        setGenero('');
    }, [isbn]);

    const handleBuscaLivro = async () => {
        if (!isbn) {
            setMensagem('Por favor, insira um ISBN.');
            return setTimeout(() => setMensagem(''), 3000);
        }
        try {
            const { data } = await api.get(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
            const info = data.items?.[0].volumeInfo;
            if (info) {
                setTitulo(info.title || '');
                setAutor(info.authors?.join(', ') || '');
                setAno(info.publishedDate?.slice(0, 4) || '');
                setEditora(info.publisher || '');
                setImagem(info.imageLinks?.thumbnail || '');
                setSinopse(info.description || '');
                setGenero(info.categories?.join(', ') || '');
                setMensagem('Livro encontrado!');
            } else {
                setMensagem('Livro não encontrado.');
            }
        } catch (e) {
            console.error(e);
            setMensagem('Erro ao buscar livro.');
        } finally {
            setTimeout(() => setMensagem(''), 3000);
        }
    };

    const handleCadastroLivro = async () => {
        if (!titulo || !autor || !isbn || !quantidade) {
            setMensagem('Preencha todos os campos obrigatórios.');
            return setTimeout(() => setMensagem(''), 3000);
        }

        const qtd = parseInt(quantidade, 10) || 0;
        // verifica se já existe livro com mesmo ISBN
        const livroExistente = livros.find(l => l.isbn === isbn);
        const idExistente = livroExistente ? livroExistente.id : null;
        const novaQuantidade = livroExistente ? (livroExistente.quantidade + qtd) : qtd;

        try {
            if (idExistente) {
                // atualiza quantidade do livro existente
                await api.put(`/livros/${idExistente}`, { quantidade: novaQuantidade });
                setMensagem('Quantidade atualizada com sucesso!');
            } else {
                // cria novo livro
                await api.post('/livros', { titulo, autor, ano, editora, isbn, quantidade: qtd, imagem, sinopse, genero, ativo: 1 });
                setMensagem('Livro cadastrado com sucesso!');
            }

            // recarrega lista
            const resp = await api.get('/livros');
            setLivros(resp.data);
        } catch (e) {
            console.error('Erro ao cadastrar livro:', e);
            setMensagem('Erro no cadastro. Veja o console.');
        } finally {
            setTimeout(() => setMensagem(''), 3000);
        }
    };

    const handleImageUpload = e => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImagem(reader.result);
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="form-container">
            <h2>Cadastro de Livro</h2>
            {mensagem && <p className="error-message">{mensagem}</p>}
            <div className="form-group">
                <label>ISBN:</label>
                <input type="text" value={isbn} onChange={e => setIsbn(e.target.value)} />
                <button type="button" onClick={handleBuscaLivro}>Buscar Livro</button>
            </div>
            <div className="form-group">
                <label>Título:</label>
                <input value={titulo} onChange={e => setTitulo(e.target.value)} />
            </div>
            <div className="form-group">
                <label>Autor:</label>
                <input value={autor} onChange={e => setAutor(e.target.value)} />
            </div>
            <div className="form-group">
                <label>Ano:</label>
                <input type="number" value={ano} onChange={e => setAno(e.target.value)} />
            </div>
            <div className="form-group">
                <label>Editora:</label>
                <input value={editora} onChange={e => setEditora(e.target.value)} />
            </div>
            <div className="form-group">
                <label>Sinopse:</label>
                <textarea value={sinopse} onChange={e => setSinopse(e.target.value)} />
            </div>
            <div className="form-group">
                <label>Gênero:</label>
                <input value={genero} onChange={e => setGenero(e.target.value)} />
            </div>
            <div className="form-group">
                <label>Quantidade:</label>
                <input type="number" value={quantidade} onChange={e => setQuantidade(e.target.value)} />
            </div>
            <div className="form-group">
                <label>URL da Imagem:</label>
                <input value={imagem} onChange={e => setImagem(e.target.value)} />
                <input type="file" accept="image/*" onChange={handleImageUpload} />
            </div>
            {imagem && (
                <div className="form-group image-container">
                    <img src={imagem} alt="Capa" className="book-image" />
                </div>
            )}
            <button type="button" onClick={handleCadastroLivro}>Cadastrar</button>
        </div>
    );
}

export default CadastroLivro;
