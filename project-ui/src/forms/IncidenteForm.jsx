// src/components/IncidenteForm.jsx
import { useState } from 'react';
import axios from 'axios';
import '../styles/IncidenteForm.css';

function IncidenteForm({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    data: '',
    motivo: '',
    quemRelatou: '',
    local: '',
    descricao: '',
    oQueFoiFeito: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/incidentes', {
        ...formData,
        data: formData.data ? new Date(formData.data).toISOString() : null,
      });
      onSubmit(response.data);
      setFormData({
        data: '',
        motivo: '',
        quemRelatou: '',
        local: '',
        descricao: '',
        oQueFoiFeito: '',
      });
    } catch (error) {
      console.error('Erro ao cadastrar incidente:', error);
    }
  };

  return (
    <div className="form-container">
      <div className="incidente-form">
        <h2>Cadastrar Incidente</h2>
        <form onSubmit={handleSubmit}>
          <table className="form-table">
            <tbody>
              <tr>
                <td><label>Data</label></td>
                <td><input type="datetime-local" name="data" value={formData.data} onChange={handleChange} required /></td>
              </tr>
              <tr>
                <td><label>Motivo</label></td>
                <td><textarea name="motivo" value={formData.motivo} onChange={handleChange} required /></td>
              </tr>
              <tr>
                <td><label>Quem Relatou</label></td>
                <td><textarea name="quemRelatou" value={formData.quemRelatou} onChange={handleChange} required /></td>
              </tr>
              <tr>
                <td><label>Local</label></td>
                <td><textarea name="local" value={formData.local} onChange={handleChange} required /></td>
              </tr>
              <tr>
                <td><label>Descrição</label></td>
                <td><textarea name="descricao" value={formData.descricao} onChange={handleChange} required /></td>
              </tr>
              <tr>
                <td><label>O que foi Feito</label></td>
                <td><textarea name="oQueFoiFeito" value={formData.oQueFoiFeito} onChange={handleChange} required /></td>
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

export default IncidenteForm;