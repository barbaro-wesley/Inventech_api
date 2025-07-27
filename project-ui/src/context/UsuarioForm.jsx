// src/components/UsuarioForm.jsx
import { useState } from 'react';
import axios from 'axios';
import '../styles/UsuarioForm.css';

function UsuarioForm({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    papel: '',
  });

  const papelOptions = [
    { value: 'admin', label: 'Administrador' },
    { value: 'cadastro', label: 'Cadastro' },
    { value: 'tecnico', label: 'Técnico' },
    { value: 'visualizador', label: 'Visualizador' },
    { value: 'usuario_comum', label: 'Usuário Comum' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/usuarios/cadastro', {
        nome: formData.nome,
        email: formData.email,
        senha: formData.senha,
        papel: formData.papel,
      });
      onSubmit(response.data);
      setFormData({
        nome: '',
        email: '',
        senha: '',
        papel: '',
      });
    } catch (error) {
      console.error('Erro ao cadastrar usuário:', error);
    }
  };

  return (
    <div className="form-container">
      <div className="usuario-form">
        <h2>Cadastrar Usuário</h2>
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
                <td><label>Senha</label></td>
                <td><input type="text" name="senha" value={formData.senha} onChange={handleChange} required /></td>
              </tr>
              <tr>
                <td><label>Papel</label></td>
                <td>
                  <select name="papel" value={formData.papel} onChange={handleChange} required>
                    <option value="">Selecione</option>
                    {papelOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </td>
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

export default UsuarioForm;