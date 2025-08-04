import { useState, useEffect } from 'react';
import '../styles/UsuarioForm.css';
import api from '../config/api';

function UsuarioForm({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    papel: '',
    tecnicoId: '', // novo campo
  });

  const [tecnicos, setTecnicos] = useState([]);

  const papelOptions = [
    { value: 'admin', label: 'Administrador' },
    { value: 'cadastro', label: 'Cadastro' },
    { value: 'tecnico', label: 'Técnico' },
    { value: 'visualizador', label: 'Visualizador' },
    { value: 'usuario_comum', label: 'Usuário Comum' },
  ];

  useEffect(() => {
    const fetchTecnicos = async () => {
      try {
        const response = await api.get('/tecnicos');
        setTecnicos(response.data);
      } catch (error) {;
      }
    };
    fetchTecnicos();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('usuarios/cadastro', {
        nome: formData.nome,
        email: formData.email,
        senha: formData.senha,
        papel: formData.papel,
        tecnicoId: formData.tecnicoId || null,
      });
      onSubmit(response.data);
      setFormData({
        nome: '',
        email: '',
        senha: '',
        papel: '',
        tecnicoId: '',
      });
    } catch (error) {
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
              <tr>
                <td><label>Técnico</label></td>
                <td>
                  <select name="tecnicoId" value={formData.tecnicoId} onChange={handleChange}>
                    <option value="">Nenhum</option>
                    {tecnicos.map((tecnico) => (
                      <option key={tecnico.id} value={tecnico.id}>
                        {tecnico.nome}
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
