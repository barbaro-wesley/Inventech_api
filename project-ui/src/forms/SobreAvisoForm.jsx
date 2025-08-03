// src/components/SobreAvisoForm.jsx
import { useState } from 'react';
import axios from 'axios';
import '../styles/SobreAvisoForm.css';
import api from '../config/api';

function SobreAvisoForm({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    data: '',
    horaInicio: '',
    horaFim: '',
    motivo: '',
    aSerFeito: '',
    observacoes: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const response = await api.post(
      '/sobreaviso',
      {
        ...formData,
        data: formData.data ? new Date(formData.data).toISOString() : null,
        horaInicio: formData.horaInicio ? new Date(formData.horaInicio).toISOString() : null,
        horaFim: formData.horaFim ? new Date(formData.horaFim).toISOString() : null,
      },
      {
        withCredentials: true, // <- aqui
      }
    );

    onSubmit(response.data);

    setFormData({
      data: '',
      horaInicio: '',
      horaFim: '',
      motivo: '',
      aSerFeito: '',
      observacoes: '',
    });
  } catch (error) {
  }
};

  return (
    <div className="form-container">
      <div className="sobreaviso-form">
        <h2>Cadastrar Sobre Aviso</h2>
        <form onSubmit={handleSubmit}>
          <table className="form-table">
            <tbody>
              <tr>
                <td><label>Data</label></td>
                <td><input type="date" name="data" value={formData.data} onChange={handleChange} required /></td>
              </tr>
              <tr>
                <td><label>Hora Início</label></td>
                <td><input type="datetime-local" name="horaInicio" value={formData.horaInicio} onChange={handleChange} required /></td>
              </tr>
              <tr>
                <td><label>Hora Fim</label></td>
                <td><input type="datetime-local" name="horaFim" value={formData.horaFim} onChange={handleChange} required /></td>
              </tr>
              <tr>
                <td><label>Motivo</label></td>
                <td><textarea name="motivo" value={formData.motivo} onChange={handleChange} required /></td>
              </tr>
              <tr>
                <td><label>A Ser Feito</label></td>
                <td><textarea name="aSerFeito" value={formData.aSerFeito} onChange={handleChange} required /></td>
              </tr>
              <tr>
                <td><label>Observações</label></td>
                <td><textarea name="observacoes" value={formData.observacoes} onChange={handleChange} /></td>
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

export default SobreAvisoForm;