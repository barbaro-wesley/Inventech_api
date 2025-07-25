// src/components/ArCondicionadoForm.jsx
import { useState } from 'react';
import axios from 'axios';
import '../styles/FormPc.css';

function ArCondicionadoForm({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    nPatrimonio: '',
    numeroSerie: '',
    marca: '',
    modelo: '',
    BTUs: '',
    setorId: '',
    localizacaoId: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/condicionadores', formData);
      onSubmit(response.data); // Pass new data to parent
      setFormData({
        nPatrimonio: '',
        numeroSerie: '',
        marca: '',
        modelo: '',
        BTUs: '',
        setorId: '',
        localizacaoId: '',
      });
    } catch (error) {
      console.error('Erro ao cadastrar ar-condicionado:', error);
    }
  };

  return (
    <div className="form-container">
      <form className="pc-form" onSubmit={handleSubmit}>
        <h2>Cadastrar Ar-Condicionado</h2>

        <label>Nº Patrimônio</label>
        <input
          type="text"
          name="nPatrimonio"
          value={formData.nPatrimonio}
          onChange={handleChange}
          required
        />

        <label>Nº Série</label>
        <input
          type="text"
          name="numeroSerie"
          value={formData.numeroSerie}
          onChange={handleChange}
          required
        />

        <label>Marca</label>
        <input type="text" name="marca" value={formData.marca} onChange={handleChange} required />

        <label>Modelo</label>
        <input type="text" name="modelo" value={formData.modelo} onChange={handleChange} required />

        <label>BTUs</label>
        <input type="text" name="BTUs" value={formData.BTUs} onChange={handleChange} required />

        <label>Setor (ID)</label>
        <input
          type="number"
          name="setorId"
          value={formData.setorId}
          onChange={handleChange}
          required
        />

        <label>Localização (ID)</label>
        <input
          type="number"
          name="localizacaoId"
          value={formData.localizacaoId}
          onChange={handleChange}
          required
        />

        <div className="form-buttons">
          <button type="submit" className="btn-submit">
            Salvar
          </button>
          <button type="button" className="btn-cancel" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

export default ArCondicionadoForm;