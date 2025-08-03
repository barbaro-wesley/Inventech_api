// src/components/TecnicoForm.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/TecnicoForm.css';
import api from '../config/api';

function TecnicoForm({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    grupoId: '',
    cpf: '',
    matricula: '',
    admissao: '',
    telegramChatId: '',
  });
  const [gruposOptions, setGruposOptions] = useState([]);

  useEffect(() => {
    async function fetchGrupos() {
      try {
        const response = await api.get('/grupos-manutencao',{
          withCredentials: true,
        });
        setGruposOptions(response.data);
      } catch (error) {
      }
    }
    fetchGrupos();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const response = await api.post(
      '/tecnicos',
      {
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
        grupoId: formData.grupoId ? Number(formData.grupoId) : null,
        cpf: formData.cpf,
        matricula: formData.matricula,
        admissao: formData.admissao ? new Date(formData.admissao).toISOString() : null,
        telegramChatId: formData.telegramChatId || null,
      },
      {
        withCredentials: true, // Aqui sim, na config
      }
    );

    onSubmit(response.data);
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      grupoId: '',
      cpf: '',
      matricula: '',
      admissao: '',
      telegramChatId: '',
    });
  } catch (error) {

  }
};

  return (
    <div className="form-container">
      <div className="tecnico-form">
        <h2>Cadastrar Técnico</h2>
        <form onSubmit={handleSubmit}>
          <table className="form-table">
            <tbody>
              <tr>
                <td><label>Nome</label></td>
                <td><input type="text" name="nome" value={formData.nome} onChange={handleChange} required /></td>
              </tr>
              <tr>
                <td><label>Email</label></td>
                <td><input type="email" name="email" value={formData.email} onChange={handleChange} required /></td>
              </tr>
              <tr>
                <td><label>Telefone</label></td>
                <td><input type="text" name="telefone" value={formData.telefone} onChange={handleChange} required /></td>
              </tr>
              <tr>
                <td><label>Grupo</label></td>
                <td>
                  <select name="grupoId" value={formData.grupoId} onChange={handleChange}>
                    <option value="">Nenhum</option>
                    {gruposOptions.map((grupo) => (
                      <option key={grupo.id} value={grupo.id}>
                        {grupo.nome}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
              <tr>
                <td><label>CPF</label></td>
                <td><input type="text" name="cpf" value={formData.cpf} onChange={handleChange} required /></td>
              </tr>
              <tr>
                <td><label>Matrícula</label></td>
                <td><input type="text" name="matricula" value={formData.matricula} onChange={handleChange} required /></td>
              </tr>
              <tr>
                <td><label>Admissão</label></td>
                <td><input type="date" name="admissao" value={formData.admissao} onChange={handleChange} required /></td>
              </tr>
              <tr>
                <td><label>Telegram Chat ID</label></td>
                <td><input type="text" name="telegramChatId" value={formData.telegramChatId} onChange={handleChange} /></td>
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

export default TecnicoForm;