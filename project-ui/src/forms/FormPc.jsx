// src/components/FormPc.jsx
import { useState, useEffect } from 'react';
import api from '../config/api';
import '../styles/FormPc.css';
import { toast } from 'react-toastify';
function FormPc({ onClose, onSubmit,initialData }) {
  const [formData, setFormData] = useState({
  nPatrimonio: initialData?.nPatrimonio || '',
  nomePC: initialData?.nomePC || '',
  ip: initialData?.ip || '',
  sistemaOperacional: initialData?.sistemaOperacional || '',
  setorId: initialData?.setorId || '',
  localizacaoId: initialData?.localizacaoId || '',
  tipoEquipamentoId: initialData?.tipoEquipamentoId || '',
});
  const [localizacoes, setLocalizacoes] = useState([]);
  const [tiposEquipamento, setTiposEquipamento] = useState([]);
  const [setorNome, setSetorNome] = useState('');

  useEffect(() => {
  async function fetchOptions() {
    try {
      const localizacoesRes = await api.get('/localizacao', {
        withCredentials: true,
      });
      const tiposRes = await api.get('/tipos-equipamento', {
        withCredentials: true,
      });

      setLocalizacoes(localizacoesRes.data);
      setTiposEquipamento(tiposRes.data);

      if (initialData) {
        const selectedLoc = localizacoesRes.data.find(
          (loc) => loc.id === Number(initialData.localizacaoId)
        );
        if (selectedLoc?.setor?.nome) {
          setSetorNome(selectedLoc.setor.nome);
        }
      }
    } catch (error) {
    }
  }
  fetchOptions();
}, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'localizacaoId') {
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

  const payload = {
    nPatrimonio: formData.nPatrimonio,
    nomePC: formData.nomePC,
    ip: formData.ip,
    sistemaOperacional: formData.sistemaOperacional,
    setorId: Number(formData.setorId),
    localizacaoId: Number(formData.localizacaoId),
    tipoEquipamentoId: Number(formData.tipoEquipamentoId),
  };

  try {
    let response;
    if (initialData?.id) {
      response = await api.put(
        `/hcr-computers/${initialData.id}`,
        payload,
        { withCredentials: true }
      );
       toast.success('Computador atualizado com sucesso!');
      
    } else {

      response = await api.post(
        '/hcr-computers',
        payload,
        { withCredentials: true }
      );
       toast.success('Computador cadastrado com sucesso!');
    }

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