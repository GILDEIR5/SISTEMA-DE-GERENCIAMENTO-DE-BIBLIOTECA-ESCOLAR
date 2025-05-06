const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// open SQLite database
const db = new sqlite3.Database('./database/biblioteca.db', err => {
  if (err) console.error('DB connection error:', err.message);
  else console.log('SQLite conectado');
});

// --- SCHEMA CREATION ---
// usuarios table
db.run(`CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT,
  email TEXT UNIQUE,
  senha TEXT
)`);

// livros table
db.run(`CREATE TABLE IF NOT EXISTS livros (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo TEXT NOT NULL,
  autor TEXT,
  ano INTEGER,
  editora TEXT,
  isbn TEXT,
  quantidade INTEGER DEFAULT 0,
  imagem TEXT,
  sinopse TEXT,
  genero TEXT,
  ativo INTEGER DEFAULT 1
)`);

// pessoas table
db.run(`CREATE TABLE IF NOT EXISTS pessoas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  sobrenome TEXT NOT NULL,
  data_nascimento TEXT,
  idade INTEGER,
  CPF TEXT UNIQUE,
  CEP TEXT,
  WhatsApp TEXT,
  ativo INTEGER DEFAULT 1
)`);

// emprestimos table
db.run(`CREATE TABLE IF NOT EXISTS emprestimos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  livroId INTEGER,
  pessoaId INTEGER,
  dataEmprestimo TEXT,
  prazoEntrega TEXT
)`);

// devolucoes table
db.run(`CREATE TABLE IF NOT EXISTS devolucoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  livro_id INTEGER,
  pessoa_id INTEGER,
  data_emprestimo TEXT,
  data_devolucao TEXT
)`);

// --- AUTH ROUTES ---
// Register
app.post('/usuarios', (req, res) => {
  const { nome, email, senha } = req.body;
  if (!nome || !email || !senha) return res.status(400).json({ error: 'nome, email e senha são obrigatórios' });
  db.run('INSERT INTO usuarios (nome,email,senha) VALUES (?,?,?)', [nome, email, senha], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: this.lastID });
  });
});

// Login
app.post('/login', (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) return res.status(400).json({ success: false, message: 'Email e senha são obrigatórios' });
  db.get('SELECT * FROM usuarios WHERE email = ? AND senha = ?', [email, senha], (err, row) => {
    if (err) return res.status(500).json({ success: false, message: 'Erro interno' });
    if (!row) return res.status(401).json({ success: false, message: 'Credenciais inválidas' });
    res.json({ success: true, user: { id: row.id, nome: row.nome, email: row.email } });
  });
});

// Reset password
app.post('/redefinir-senha', (req, res) => {
  const { email, novaSenha } = req.body;
  if (!email || !novaSenha) return res.status(400).json({ success: false, message: 'Email e nova senha são obrigatórios.' });
  db.run('UPDATE usuarios SET senha = ? WHERE email = ?', [novaSenha, email], function(err) {
    if (err) return res.status(500).json({ success: false, message: 'Erro ao atualizar a senha.' });
    if (this.changes === 0) return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
    res.json({ success: true, message: 'Senha atualizada com sucesso!' });
  });
});

// Credential check
app.post('/auth/check', (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) return res.status(400).json({ success: false, message: 'Email e senha necessários.' });
  db.get('SELECT senha FROM usuarios WHERE email = ?', [email], (err, row) => {
    if (err) return res.status(500).json({ success: false, message: 'Erro no servidor.' });
    if (!row) return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
    const match = row.senha === senha;
    res.json({ success: match, message: match ? 'Autenticado' : 'Senha incorreta.' });
  });
});

// --- LIVROS ROUTES ---
app.get('/livros', (req, res) => {
  db.all('SELECT * FROM livros', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows.map(r => ({ ...r, ativo: r.ativo === 1 })));
  });
});

app.post('/livros', (req, res) => {
  const { titulo, autor, ano, editora, isbn, quantidade, imagem, sinopse, genero, ativo } = req.body;
  if (!titulo || !isbn || quantidade == null) return res.status(400).json({ error: 'Campos obrigatórios faltando' });
  db.run(
    'INSERT INTO livros (titulo,autor,ano,editora,isbn,quantidade,imagem,sinopse,genero,ativo) VALUES (?,?,?,?,?,?,?,?,?,?)',
    [titulo, autor, ano, editora, isbn, quantidade, imagem, sinopse, genero, ativo ? 1 : 0],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID });
    }
  );
});

app.put('/livros/:id', (req, res) => {
  const fields = Object.keys(req.body).map(k => `${k} = ?`).join(', ');
  const vals = Object.values(req.body).map((v, i) => (Object.keys(req.body)[i] === 'ativo' ? (v ? 1 : 0) : v));
  db.run(`UPDATE livros SET ${fields} WHERE id = ?`, [...vals, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ changes: this.changes });
  });
});

// also accept PATCH
app.patch('/livros/:id', (req, res) => {
  const fields = Object.keys(req.body).map(k => `${k} = ?`).join(', ');
  const vals = Object.values(req.body).map((v, i) => (Object.keys(req.body)[i] === 'ativo' ? (v ? 1 : 0) : v));
  db.run(`UPDATE livros SET ${fields} WHERE id = ?`, [...vals, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ changes: this.changes });
  });
});

app.delete('/livros/:id', (req, res) => {
  db.run('DELETE FROM livros WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Livro não encontrado' });
    res.json({ success: true });
  });
});

// --- PESSOAS ROUTES ---
app.get('/pessoas', (req, res) => {
  db.all('SELECT * FROM pessoas', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows.map(r => ({ ...r, ativo: r.ativo === 1 })));
  });
});

app.post('/pessoas', (req, res) => {
  const { nome, sobrenome, data_nascimento, idade, CPF, CEP, WhatsApp, ativo } = req.body;
  if (!nome || !sobrenome || !CPF) return res.status(400).json({ error: 'Campos obrigatórios faltando' });
  db.run(
    'INSERT INTO pessoas (nome,sobrenome,data_nascimento,idade,CPF,CEP,WhatsApp,ativo) VALUES (?,?,?,?,?,?,?,?)',
    [nome, sobrenome, data_nascimento, idade, CPF, CEP, WhatsApp, ativo ? 1 : 0],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID });
    }
  );
});

app.put('/pessoas/:id', (req, res) => {
  const updates = req.body;
  const fields = Object.keys(updates).map(k => `${k} = ?`).join(', ');
  const vals = Object.values(updates).map((v, i) => (Object.keys(updates)[i] === 'ativo' ? (v ? 1 : 0) : v));
  db.run(`UPDATE pessoas SET ${fields} WHERE id = ?`, [...vals, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Pessoa não encontrada' });
    res.json({ changes: this.changes });
  });
});

// --- EMPRÉSTIMOS & DEVOLUÇÕES ---
app.get('/emprestimos', (req, res) => {
  const alunoId = req.query.alunoId;
  let sql = 'SELECT * FROM emprestimos';
  const params = [];
  if (alunoId) {
    sql += ' WHERE pessoaId = ?';
    params.push(alunoId);
  }
  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/emprestimos', (req, res) => {
  const { livroId, pessoaId, dataEmprestimo, prazoEntrega } = req.body;
  db.run(
    'INSERT INTO emprestimos (livroId,pessoaId,dataEmprestimo,prazoEntrega) VALUES (?,?,?,?)',
    [livroId, pessoaId, dataEmprestimo, prazoEntrega],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID });
    }
  );
});

app.delete('/emprestimos/:id', (req, res) => {
  db.run('DELETE FROM emprestimos WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Empréstimo não encontrado' });
    res.json({ success: true });
  });
});

app.get('/devolucoes', (req, res) => {
  db.all(
    `SELECT id, livro_id AS livroId, pessoa_id AS pessoaId, data_emprestimo AS dataEmprestimo, data_devolucao AS dataDevolucao FROM devolucoes`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

app.post('/devolucoes', (req, res) => {
  const { livro_id, pessoa_id, data_emprestimo, data_devolucao } = req.body;
  db.run(
    'INSERT INTO devolucoes (livro_id,pessoa_id,data_emprestimo,data_devolucao) VALUES (?,?,?,?)',
    [livro_id, pessoa_id, data_emprestimo, data_devolucao],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      db.run('UPDATE livros SET quantidade = quantidade + 1 WHERE id = ?', [livro_id]);
      db.run('DELETE FROM emprestimos WHERE livroId = ? AND pessoaId = ?', [livro_id, pessoa_id]);
      res.status(201).json({ id: this.lastID });
    }
  );
});

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
