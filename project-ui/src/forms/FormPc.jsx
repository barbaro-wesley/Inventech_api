// src/components/FormPc.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/FormPc.css';

function FormPc({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    nPatrimonio: '',
    nomePC: '',
    ip: '',
    sistemaOperacional: '',
    setorId: '',
    localizacaoId: '',
    tipoEquipamentoId: '',
  });
  const [localizacoes, setLocalizacoes] = useState([]);
  const [tiposEquipamento, setTiposEquipamento] = useState([]);
  const [setorNome, setSetorNome] = useState('');

  useEffect(() => {
    async function fetchOptions() {
      try {
        // Fetch localizações (expects [{ id, nome, setorId, setor: { id, nome } }])
        const localizacoesRes = await axios.get('http://localhost:5000/api/localizacao',{
          withCredentials: true,
        });


        // Fetch tipos de equipamento (expects [{ id, nome, grupoId? }])
        const tiposRes = await axios.get('http://localhost:5000/api/tipos-equipamento',{
          withCredentials: true,
        });
        setLocalizacoes(localizacoesRes.data);
        setTiposEquipamento(tiposRes.data);
      } catch (error) {
        console.error('Erro ao buscar opções:', error);
      }
    }
    fetchOptions();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'localizacaoId') {
      // Find the selected localização and set setorId and setorNome
      const selectedLoc = localizacoes.find((loc) => loc.id === Number(value));
      if (selectedLoc) {
        setFormData({
          ...formData,
          localizacaoId: value,
          setorId: selectedLoc.setorId || '',
        });
        setSetorNome(selectedLoc.setor?.nome || '');
      } else {
        setFormData({ ...formData, localizacaoId: value, setorId: '' });
        setSetorNome('');
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const response = await axios.post(
      'http://localhost:5000/api/hcr-computers',
      {
        nPatrimonio: formData.nPatrimonio,
        nomePC: formData.nomePC,
        ip: formData.ip,
        sistemaOperacional: formData.sistemaOperacional,
        setorId: Number(formData.setorId),
        localizacaoId: Number(formData.localizacaoId),
        tipoEquipamentoId: Number(formData.tipoEquipamentoId),
      },
      {
        withCredentials: true, 
      }
    );

    onSubmit(response.data);
    setFormData({
      nPatrimonio: '',
      nomePC: '',
      ip: '',
      sistemaOperacional: '',
      setorId: '',
      localizacaoId: '',
      tipoEquipamentoId: '',
    });
    setSetorNome('');
    onClose();
  } catch (error) {
    console.error('Erro ao cadastrar computador:', error);
  }
};

  return (
    <div className="form-container">
      <div className="pc-form">
        <h2>Cadastrar Computador</h2>
        <form onSubmit={handleSubmit}>
          <table className="form-table">
            <tbody>
              <tr>
                <td><label>Nº Patrimônio</label></td>
                <td>
                  <input
                    type="text"
                    name="nPatrimonio"
                    value={formData.nPatrimonio}
                    onChange={handleChange}
                    required
                  />
                </td>
              </tr>
              <tr>
                <td><label>Nome do PC</label></td>
                <td>
                  <input
                    type="text"
                    name="nomePC"
                    value={formData.nomePC}
                    onChange={handleChange}
                    required
                  />
                </td>
              </tr>
              <tr>
                <td><label>IP</label></td>
                <td>
                  <input type="text" name="ip" value={formData.ip} onChange={handleChange} required />
                </td>
              </tr>
              <tr>
                <td><label>Sistema Operacional</label></td>
                <td>
                  <input
                    type="text"
                    name="sistemaOperacional"
                    value={formData.sistemaOperacional}
                    onChange={handleChange}
                    required
                  />
                </td>
              </tr>
              <tr>
                <td><label>Localização</label></td>
                <td>
                  <select
                    name="localizacaoId"
                    value={formData.localizacaoId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Selecione</option>
                    {localizacoes.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.nome}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
              <tr>
                <td><label>Setor</label></td>
                <td>
                  <input type="text" value={setorNome} disabled />
                  <input type="hidden" name="setorId" value={formData.setorId} />
                </td>
              </tr>
              <tr>
                <td><label>Tipo de Equipamento</label></td>
                <td>
                  <select
                    name="tipoEquipamentoId"
                    value={formData.tipoEquipamentoId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Selecione</option>
                    {tiposEquipamento.map((tipo) => (
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

export default FormPc;