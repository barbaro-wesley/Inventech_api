import { useState, useEffect } from 'react';
import api from '../config/api';
import '../styles/PrinterForm.css';
import { toast } from 'react-toastify';

function PrinterForm({ onClose, onSubmit, initialData }) {
  const [formData, setFormData] = useState({
    nPatrimonio: initialData?.nPatrimonio || '',
    ip: initialData?.ip || '',
    modelo: initialData?.modelo || '',
    marca: initialData?.marca || '',
    setorId: initialData?.setorId || '',
    localizacaoId: initialData?.localizacaoId || '',
    tipoEquipamentoId: initialData?.tipoEquipamentoId || '',
  });
  const [localizacoes, setLocalizacoes] = useState([]);
  const [tiposImpressora, setTiposImpressora] = useState([]);
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
        setTiposImpressora(tiposRes.data);

        // Atualiza nome do setor se estiver em edição
        if (initialData) {
          const selectedLoc = localizacoesRes.data.find(
            (loc) => loc.id === Number(initialData.localizacaoId)
          );
          if (selectedLoc?.setor?.nome) {
            setSetorNome(selectedLoc.setor.nome);
          }
        }
      } catch (error) {
        console.error('Erro ao buscar opções:', error);
      }
    }
    fetchOptions();
  }, [initialData]);

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

    const payload = {
      nPatrimonio: formData.nPatrimonio,
      ip: formData.ip,
      modelo: formData.modelo,
      marca: formData.marca,
      setorId: Number(formData.setorId),
      localizacaoId: Number(formData.localizacaoId),
      tipoEquipamentoId: Number(formData.tipoEquipamentoId),
    };

    try {
      let response;
      if (initialData?.id) {
        // Edição (PUT)
        response = await api.put(
          `/printers/${initialData.id}`,
          payload,
          { withCredentials: true }
        );
        toast.success('Impressora atualizada com sucesso!');
      } else {
        // Novo cadastro (POST)
        response = await api.post(
          '/printers',
          payload,
          { withCredentials: true }
        );
        toast.success('Impressora cadastrada com sucesso!');
      }

      onSubmit(response.data); // Atualiza lista no PrinterPage
      setFormData({
        nPatrimonio: '',
        ip: '',
        modelo: '',
        marca: '',
        setorId: '',
        localizacaoId: '',
        tipoEquipamentoId: '',
      });
      setSetorNome('');
      onClose();
    } catch (error) {
      console.error('Erro ao cadastrar/atualizar impressora:', error);
      toast.error('Erro ao cadastrar/atualizar impressora.');
    }
  };

  return (
    <div className="form-container">
      <div className="equip-form">
        <h2>{initialData ? 'Editar Impressora' : 'Cadastrar Impressora'}</h2>
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
                <td><label>IP</label></td>
                <td>
                  <input
                    type="text"
                    name="ip"
                    value={formData.ip}
                    onChange={handleChange}
                    required
                  />
                </td>
              </tr>
              <tr>
                <td><label>Modelo</label></td>
                <td>
                  <input
                    type="text"
                    name="modelo"
                    value={formData.modelo}
                    onChange={handleChange}
                    required
                  />
                </td>
              </tr>
              <tr>
                <td><label>Marca</label></td>
                <td>
                  <input
                    type="text"
                    name="marca"
                    value={formData.marca}
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
                    {tiposImpressora.map((tipo) => (
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

export default PrinterForm;