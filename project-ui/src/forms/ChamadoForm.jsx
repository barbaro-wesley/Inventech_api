// src/components/ChamadoForm.jsx
import { useState,useEffect } from 'react';
import '../styles/ChamadoForm.css';
import api from '../config/api';
import { toast } from 'react-toastify';
function ChamadoForm({ onClose, onSubmit }) {
  const [sistemas, setSistemas] = useState([]);
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
  useEffect(() => {
  const fetchSistemas = async () => {
    try {
      const response = await api.get('/sistemas');
      setSistemas(response.data);
    } catch (error) {
      console.error('Erro ao buscar sistemas:', error);
    }
  };

  fetchSistemas();
}, []);

  const handleSubmit = async (e) => {
  e.preventDefault();

  const sistemaSelecionado = sistemas.find(s => s.nome === formData.SistemaId);

  try {
    const response = await api.post('/chamados', {
      ...formData,
      numero: parseInt(formData.numero),
      SistemaId: sistemaSelecionado ? sistemaSelecionado.id : null,
    });

    onSubmit(response.data);

    setFormData({
      numero: '',
      descricao: '',
      status: 'Aberto',
      prioridade: 'MEDIO',
      SistemaId: '',
    });

    toast.success('Chamado criado com sucesso!');
  } catch (error) {
    console.error(error);
    toast.error('Erro ao criar chamado.');
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
  <td><label>Sistema</label></td>
  <td>
    <select name="SistemaId" value={formData.SistemaId} onChange={handleChange}>
      <option value="">Selecione um sistema</option>
      {sistemas.map((sistema) => (
        <option key={sistema.id} value={sistema.nome}>
          {sistema.nome}
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

export default ChamadoForm;