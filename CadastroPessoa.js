// src/Cadastro Pessoa/CadastroPessoa.js
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';    // <-- nosso cliente Axios
import axios from 'axios';
import './CadastroPessoa.css';

export default function CadastroPessoa() {
  const [nome, setNome] = useState('');
  const [sobrenome, setSobrenome] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [idade, setIdade] = useState('');
  const [CPF, setCPF] = useState('');
  const [CEP, setCEP] = useState('');
  const [WhatsApp, setWhatsApp] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [pessoas, setPessoas] = useState([]);

  // 1) carrega pessoas do backend para checar CPF
  useEffect(() => {
    api.get('/pessoas')
      .then(res => setPessoas(res.data))
      .catch(err => console.error('Erro ao carregar pessoas:', err));
  }, []);

  // 2) busca endereço por CEP (viaCEP)
  useEffect(() => {
    if (!CEP) return;
    axios.get(`https://viacep.com.br/ws/${CEP}/json/`)
      .then(() => setMensagem('Endereço encontrado!'))
      .catch(() => setMensagem('Erro ao buscar endereço por CEP.'))
      .finally(() => setTimeout(() => setMensagem(''), 3000));
  }, [CEP]);

  // 3) calcula idade a partir da data de nascimento
  useEffect(() => {
    if (!dataNascimento) return;
    const hoje = new Date();
    const nasc = new Date(dataNascimento);
    let calc = hoje.getFullYear() - nasc.getFullYear();
    const m = hoje.getMonth() - nasc.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) calc--;
    setIdade(calc);
  }, [dataNascimento]);

  // máscara CPF
  const formatarCPF = v => {
    const nums = v.replace(/\D/g,'').slice(0,11);
    return nums.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
  };
  const handleCPFChange = e => setCPF(formatarCPF(e.target.value));

  // máscara WhatsApp
  const handleWhatsAppChange = e => {
    let v = e.target.value.replace(/\D/g,'').slice(0,11);
    if (v.length>6) v = v.replace(/^(\d{2})(\d{5})(\d{0,4})/,'$1 $2-$3');
    else if (v.length>2) v = v.replace(/^(\d{2})(\d{0,5})/,'$1 $2');
    setWhatsApp(v);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    // validação básica
    if (!nome||!sobrenome||!CPF||!CEP||!idade||!WhatsApp) {
      setMensagem('Preencha todos os campos.');
      return setTimeout(() => setMensagem(''),3000);
    }
    if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(CPF)) {
      setMensagem('CPF inválido (XXX.XXX.XXX-XX).');
      return setTimeout(() => setMensagem(''),3000);
    }
    // checar duplicidade
    if (pessoas.some(p=>p.CPF===CPF)) {
      setMensagem('CPF já cadastrado.');
      return setTimeout(() => setMensagem(''),3000);
    }

    // enviar ao backend
    try {
      await api.post('/pessoas', {
        nome, sobrenome, dataNascimento,
        idade, CPF, CEP, WhatsApp, ativo: 1
      });
      setMensagem('Pessoa cadastrada!');
      // recarrega lista
      const res = await api.get('/pessoas');
      setPessoas(res.data);
      // limpa formulário
      setNome(''); setSobrenome(''); setDataNascimento('');
      setCPF(''); setCEP(''); setWhatsApp('');
    } catch (err) {
      console.error('Erro ao cadastrar pessoa:', err);
      setMensagem('Erro no cadastro.');
    } finally {
      setTimeout(() => setMensagem(''),3000);
    }
  };

  return (
    <div className="cadastro-pessoa-container">
      <h2>Cadastro de Pessoa</h2>
      {mensagem && <p className="cadastro-pessoa-error-message">{mensagem}</p>}
      <form onSubmit={handleSubmit}>
        <label>Nome:</label>
        <input value={nome} onChange={e=>setNome(e.target.value)} />

        <label>Sobrenome:</label>
        <input value={sobrenome} onChange={e=>setSobrenome(e.target.value)} />

        <label>Data de Nascimento:</label>
        <input type="date" value={dataNascimento} onChange={e=>setDataNascimento(e.target.value)} />
        
        <label>Idade:</label>
        <input readOnly value={idade} />

        <label>CEP:</label>
        <input value={CEP} onChange={e=>setCEP(e.target.value)} />

        <label>CPF:</label>
        <input value={CPF} onChange={handleCPFChange} placeholder="000.000.000-00" />

        <label>WhatsApp:</label>
        <input value={WhatsApp} onChange={handleWhatsAppChange} placeholder="00 00000-0000" />

        <button type="submit">Cadastrar</button>
      </form>
    </div>
  );
}
