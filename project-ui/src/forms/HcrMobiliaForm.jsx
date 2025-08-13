import React, { useState, useEffect } from 'react';
import api from '../config/api';
import '../styles/HcrMobiliaForm.css';
import { toast } from 'react-toastify';

const HcrMobiliaForm = ({ onSuccess, onCancel }) => {
  const [form, setForm] = useState({
    nPatrimonio: '',
    nome: '',
    estado: '',
    obs: '',
    valorCompra: '',
    dataCompra: '',
    tipoEquipamentoId: '',
    localizacaoId: '',
    setorId: ''
  });

  const [tiposEquipamento, setTiposEquipamento] = useState([]);
  const [localizacoes, setLocalizacoes] = useState([]);
  const [localizacoesFiltradas, setLocalizacoesFiltradas] = useState([]);
  const [setores, setSetores] = useState([]);

  useEffect(() => {
    api.get('/tipos-equipamento').then(res => setTiposEquipamento(res.data));
    api.get('/localizacao').then(res => setLocalizacoes(res.data));
    api.get('/setor').then(res => setSetores(res.data));
  }, []);

  useEffect(() => {
    if (form.setorId) {
      setLocalizacoesFiltradas(
        localizacoes.filter(loc => String(loc.setorId) === String(form.setorId))
      );
    } else {
      setLocalizacoesFiltradas([]);
    }
  }, [form.setorId, localizacoes]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    await api.post('/hcr-mobilia', form);
    onSuccess();
    toast.success('Mobiliário cadastrado com sucesso!');
  };

  return (
    <div className="equip-form">
      <h2>Adicionar Mobiliário</h2>
      <form onSubmit={handleSubmit}>
        
        {/* Linha 1 */}
        <div className="form-row">
          <div className="form-group">
            <label>Nº Patrimônio</label>
            <input name="nPatrimonio" value={form.nPatrimonio} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Nome</label>
            <input name="nome" value={form.nome} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Estado</label>
            <select name="estado" value={form.estado} onChange={handleChange} required>
              <option value="">Selecione</option>
              <option value="novo">Novo</option>
              <option value="bom">Bom</option>
              <option value="regular">Regular</option>
              <option value="ruim">Ruim</option>
            </select>
          </div>
          <div className="form-group">
            <label>Tipo de Equipamento</label>
            <select name="tipoEquipamentoId" value={form.tipoEquipamentoId} onChange={handleChange} required>
              <option value="">Selecione</option>
              {tiposEquipamento.map(t => (
                <option key={t.id} value={t.id}>{t.nome}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Linha 2 - Novos Campos */}
        <div className="form-row">
          <div className="form-group">
            <label>Valor de Compra (R$)</label>
            <input type="number" step="0.01" name="valorCompra" value={form.valorCompra} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Data de Compra</label>
            <input type="date" name="dataCompra" value={form.dataCompra} onChange={handleChange} />
          </div>
        </div>

        {/* Linha 3 */}
        <div className="form-row">
          <div className="form-group">
            <label>Setor</label>
            <select name="setorId" value={form.setorId} onChange={handleChange} required>
              <option value="">Selecione</option>
              {setores.map(s => (
                <option key={s.id} value={s.id}>{s.nome}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Localização</label>
            <select
              name="localizacaoId"
              value={form.localizacaoId}
              onChange={handleChange}
              required
              disabled={!form.setorId}
            >
              <option value="">Selecione</option>
              {localizacoesFiltradas.map(l => (
                <option key={l.id} value={l.id}>{l.nome}</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ flex: '1 1 100%' }}>
            <label>Observações</label>
            <textarea name="obs" value={form.obs} onChange={handleChange}></textarea>
          </div>
        </div>

        {/* Botões */}
        <div className="form-buttons">
          <button type="submit" className="btn-submit">Salvar</button>
          <button type="button" className="btn-cancel" onClick={onCancel}>Cancelar</button>
        </div>
      </form>
    </div>
  );
};

export default HcrMobiliaForm;
