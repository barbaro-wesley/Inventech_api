// src/components/ChamadoForm.jsx
import { useState } from 'react';
import '../styles/ChamadoForm.css';
import api from '../config/api';
function ChamadoForm({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    numero: '',
    descricao: '',
    status: 'Aberto',
    prioridade: 'MEDIO',
    SistemaId: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/chamados', {
        ...formData,
        numero: parseInt(formData.numero),
        SistemaId: formData.SistemaId ? parseInt(formData.SistemaId) : null,
      });
      onSubmit(response.data);
      setFormData({
        numero: '',
        descricao: '',
        status: 'Aberto',
        prioridade: 'MEDIO',
        SistemaId: '',
      });
    } catch (error) {
    }
  };

  return (
    <div className="form-container">
      <div className="chamado-form">
        <h2>Cadastrar Chamado</h2>
        <form onSubmit={handleSubmit}>
          <table className="form-table">
            <tbody>
              <tr>
                <td><label>Número</label></td>
                <td><input type="number" name="numero" value={formData.numero} onChange={handleChange} required /></td>
              </tr>
              <tr>
                <td><label>Descrição</label></td>
                <td><textarea name="descricao" value={formData.descricao} onChange={handleChange} required /></td>
              </tr>
              <tr>
                <td><label>Status</label></td>
                <td>
                  <select name="status" value={formData.status} onChange={handleChange} required>
                    <option value="Aberto">Aberto</option>
                    <option value="Em Andamento">Em Andamento</option>
                    <option value="Fechado">Fechado</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td><label>Prioridade</label></td>
                <td>
                  <select name="prioridade" value={formData.prioridade} onChange={handleChange} required>
                    <option value="BAIXO">Baixo</option>
                    <option value="MEDIO">Médio</option>
                    <option value="ALTO">Alto</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td><label>Sistema (ID)</label></td>
                <td><input type="number" name="SistemaId" value={formData.SistemaId} onChange={handleChange} /></td>
              </tr>
            </tbody>
          </table>
          <div className="form-buttons">
            <button type="submit" className="btn-submit">Salvar</button>
            <button type="button" className="btn-cancel" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChamadoForm;