// src/components/GrupoManutencaoForm.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/GrupoManutencaoForm.css';

function GrupoManutencaoForm({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    tiposIds: [],
  });
  const [tiposOptions, setTiposOptions] = useState([]);

  useEffect(() => {
    async function fetchOptions() {
      try {
        // Fetch equipment types (expects [{ id, nome, grupoId?, grupo? }])
        const tiposRes = await axios.get('http://localhost:5000/api/tipos-equipamento',{
          withCredentials: true,
        });
        setTiposOptions(tiposRes.data);
      } catch (error) {
        console.error('Erro ao buscar tipos de equipamento:', error);
      }
    }
    fetchOptions();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleMultiSelectChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map((option) => option.value);
    setFormData({ ...formData, tiposIds: selectedOptions });
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const response = await axios.post(
      'http://localhost:5000/api/grupos-manutencao',
      {
        nome: formData.nome,
        descricao: formData.descricao || null,
        tiposIds: formData.tiposIds.map(Number),
      },
      {
        withCredentials: true, 
      }
    );
    onSubmit(response.data);
    setFormData({
      nome: '',
      descricao: '',
      tiposIds: [],
    });
  } catch (error) {
    console.error('Erro ao cadastrar grupo de manutenção:', error);
  }
};

  return (
    <div className="form-container">
      <div className="grupo-form">
        <h2>Cadastrar Grupo de Manutenção</h2>
        <form onSubmit={handleSubmit}>
          <table className="form-table">
            <tbody>
              <tr>
                <td><label>Nome</label></td>
                <td><input type="text" name="nome" value={formData.nome} onChange={handleChange} required /></td>
              </tr>
              <tr>
                <td><label>Descrição</label></td>
                <td><textarea name="descricao" value={formData.descricao} onChange={handleChange} /></td>
              </tr>
              <tr>
                <td><label>Tipos de Equipamento</label></td>
                <td>
                  <select
                    multiple
                    name="tiposIds"
                    value={formData.tiposIds}
                    onChange={handleMultiSelectChange}
                  >
                    {tiposOptions.map((tipo) => (
                      <option key={tipo.id} value={tipo.id}>
                        {tipo.nome}
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

export default GrupoManutencaoForm;