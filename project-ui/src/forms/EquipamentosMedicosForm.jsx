import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/EquipamentosMedicosForm.css';
import api from '../config/api';

function EquipamentosMedicosForm({ onClose, onSubmit, initialData = null }) {
  const [formData, setFormData] = useState({
    numeroPatrimonio: '',
    Identificação: '',
    numeroSerie: '',
    numeroAnvisa: '',
    nomeEquipamento: '',
    modelo: '',
    Fabricante: '',
    valorCompra: '',
    dataCompra: '',
    inicioGarantia: '',
    terminoGarantia: '',
    notaFiscal: '',
    obs: '',
    setorId: '',
    localizacaoId: '',
    tipoEquipamentoId: '',
  });

  const [setores, setSetores] = useState([]); // Store sectors from API
  const [filteredLocalizacoes, setFilteredLocalizacoes] = useState([]); // Store filtered locations
  const [tiposEquipamentos, setTiposEquipamentos] = useState([]); // Store equipment types from API

  // Fetch sectors and equipment types on component mount
  useEffect(() => {
    const fetchSetores = async () => {
      try {
        const response = await api.get('/setor', {
          withCredentials: true,
        });
        setSetores(response.data);
      } catch (error) {
        console.error('Erro ao buscar setores:', error);
      }
    };

    const fetchTiposEquipamentos = async () => {
      try {
        const response = await api.get('/tipos-equipamento', {
          withCredentials: true,
        });
        setTiposEquipamentos(response.data);
      } catch (error) {
        console.error('Erro ao buscar tipos de equipamentos:', error);
      }
    };

    fetchSetores();
    fetchTiposEquipamentos();
  }, []);

  // Initialize formData with initialData
  useEffect(() => {
    if (initialData) {
      console.log('initialData:', initialData); // Debug initialData
      setFormData({
        numeroPatrimonio: initialData.numeroPatrimonio ?? '',
        Identificação: initialData.Identificação ?? '',
        numeroSerie: initialData.numeroSerie ?? '',
        numeroAnvisa: initialData.numeroAnvisa ?? '',
        nomeEquipamento: initialData.nomeEquipamento ?? '',
        modelo: initialData.modelo ?? '',
        Fabricante: initialData.Fabricante ?? '',
        valorCompra: initialData.valorCompra ? String(initialData.valorCompra) : '',
        dataCompra: initialData.dataCompra ? initialData.dataCompra.slice(0, 10) : '',
        inicioGarantia: initialData.inicioGarantia ? initialData.inicioGarantia.slice(0, 10) : '',
        terminoGarantia: initialData.terminoGarantia ? initialData.terminoGarantia.slice(0, 10) : '',
        notaFiscal: initialData.notaFiscal ?? '',
        obs: initialData.obs ?? '',
        setorId: initialData.setorId ? String(initialData.setorId) : '',
        localizacaoId: initialData.localizacaoId ?? initialData.localizacao?.id ?? '',
        tipoEquipamentoId: initialData.tipoEquipamentoId ? String(initialData.tipoEquipamentoId) : '',
      });
    }
  }, [initialData]);

  // Filter locations when setorId changes
  useEffect(() => {
    if (formData.setorId) {
      const selectedSetor = setores.find((setor) => setor.id === parseInt(formData.setorId));
      setFilteredLocalizacoes(selectedSetor ? selectedSetor.localizacoes : []);
      // Reset localizacaoId if the current one is not valid for the selected setor
      if (
        formData.localizacaoId &&
        !selectedSetor?.localizacoes.some((loc) => loc.id === parseInt(formData.localizacaoId))
      ) {
        setFormData((prev) => ({ ...prev, localizacaoId: '' }));
      }
    } else {
      setFilteredLocalizacoes([]);
      setFormData((prev) => ({ ...prev, localizacaoId: '' }));
    }
  }, [formData.setorId, setores]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      valorCompra: formData.valorCompra ? parseFloat(formData.valorCompra) : null,
      dataCompra: formData.dataCompra || null,
      inicioGarantia: formData.inicioGarantia || null,
      terminoGarantia: formData.terminoGarantia || null,
      setorId: formData.setorId ? parseInt(formData.setorId) : null,
      localizacaoId: formData.localizacaoId ? parseInt(formData.localizacaoId) : null,
      tipoEquipamentoId: formData.tipoEquipamentoId ? parseInt(formData.tipoEquipamentoId) : null,
    };

    try {
      let response;
      if (initialData?.id) {
        response = await api.put(`/equipamentos-medicos/${initialData.id}`, payload, {
          withCredentials: true,
        });
      } else {
        response = await api.post('/equipamentos-medicos', payload, {
          withCredentials: true,
        });
      }

      onSubmit(response.data);
      onClose();

      // Clear form after both insert and update
      setFormData({
        numeroPatrimonio: '',
        Identificação: '',
        numeroSerie: '',
        numeroAnvisa: '',
        nomeEquipamento: '',
        modelo: '',
        Fabricante: '',
        valorCompra: '',
        dataCompra: '',
        inicioGarantia: '',
        terminoGarantia: '',
        notaFiscal: '',
        obs: '',
        setorId: '',
        localizacaoId: '',
        tipoEquipamentoId: '',
      });
    } catch (error) {
      console.error('Erro ao salvar equipamento médico:', error);
      alert('Erro ao salvar equipamento médico. Tente novamente.');
    }
  };

  // Prevent rendering until initialData is ready (optional)
  if (!initialData && initialData !== null) {
    return <div>Loading...</div>;
  }

  return (
    <div className="form-container">
      <div className="equip-form">
        <h2>{initialData ? 'Editar Equipamento Médico' : 'Cadastrar Equipamento Médico'}</h2>
        <form onSubmit={handleSubmit}>
          <table className="form-table">
            <tbody>
              <tr>
                <td><label>Nº Patrimônio</label></td>
                <td>
                  <input
                    type="text"
                    name="numeroPatrimonio"
                    value={formData.numeroPatrimonio || ''}
                    onChange={handleChange}
                  />
                </td>
              </tr>
              <tr>
                <td><label>Identificação</label></td>
                <td>
                  <input
                    type="text"
                    name="Identificação"
                    value={formData.Identificação || ''}
                    onChange={handleChange}
                  />
                </td>
              </tr>
              <tr>
                <td><label>Nº Série</label></td>
                <td>
                  <input
                    type="text"
                    name="numeroSerie"
                    value={formData.numeroSerie || ''}
                    onChange={handleChange}
                  />
                </td>
              </tr>
              <tr>
                <td><label>Nº Anvisa</label></td>
                <td>
                  <input
                    type="text"
                    name="numeroAnvisa"
                    value={formData.numeroAnvisa || ''}
                    onChange={handleChange}
                  />
                </td>
              </tr>
              <tr>
                <td><label>Nome do Equipamento</label></td>
                <td>
                  <input
                    type="text"
                    name="nomeEquipamento"
                    value={formData.nomeEquipamento || ''}
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
                    value={formData.modelo || ''}
                    onChange={handleChange}
                  />
                </td>
              </tr>
              <tr>
                <td><label>Fabricante</label></td>
                <td>
                  <input
                    type="text"
                    name="Fabricante"
                    value={formData.Fabricante || ''}
                    onChange={handleChange}
                  />
                </td>
              </tr>
              <tr>
                <td><label>Valor de Compra</label></td>
                <td>
                  <input
                    type="number"
                    step="0.01"
                    name="valorCompra"
                    value={formData.valorCompra || ''}
                    onChange={handleChange}
                  />
                </td>
              </tr>
              <tr>
                <td><label>Data de Compra</label></td>
                <td>
                  <input
                    type="date"
                    name="dataCompra"
                    value={formData.dataCompra || ''}
                    onChange={handleChange}
                  />
                </td>
              </tr>
              <tr>
                <td><label>Início da Garantia</label></td>
                <td>
                  <input
                    type="date"
                    name="inicioGarantia"
                    value={formData.inicioGarantia || ''}
                    onChange={handleChange}
                  />
                </td>
              </tr>
              <tr>
                <td><label>Término da Garantia</label></td>
                <td>
                  <input
                    type="date"
                    name="terminoGarantia"
                    value={formData.terminoGarantia || ''}
                    onChange={handleChange}
                  />
                </td>
              </tr>
              <tr>
                <td><label>Nota Fiscal</label></td>
                <td>
                  <input
                    type="text"
                    name="notaFiscal"
                    value={formData.notaFiscal || ''}
                    onChange={handleChange}
                  />
                </td>
              </tr>
              <tr>
                <td><label>Observações</label></td>
                <td>
                  <textarea
                    name="obs"
                    value={formData.obs || ''}
                    onChange={handleChange}
                  />
                </td>
              </tr>
              <tr>
                <td><label>Setor</label></td>
                <td>
                  <select
                    name="setorId"
                    value={formData.setorId || ''}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Selecione um setor</option>
                    {setores.map((setor) => (
                      <option key={setor.id} value={setor.id}>
                        {setor.nome}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
              <tr>
                <td><label>Localização</label></td>
                <td>
                  <select
                    name="localizacaoId"
                    value={formData.localizacaoId || ''}
                    onChange={handleChange}
                    disabled={!formData.setorId}
                    required
                  >
                    <option value="">Selecione uma localização</option>
                    {filteredLocalizacoes.map((localizacao) => (
                      <option key={localizacao.id} value={localizacao.id}>
                        {localizacao.nome}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
              <tr>
                <td><label>Tipo de Equipamento</label></td>
                <td>
                  <select
                    name="tipoEquipamentoId"
                    value={formData.tipoEquipamentoId || ''}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Selecione um tipo de equipamento</option>
                    {tiposEquipamentos.map((tipo) => (
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

export default EquipamentosMedicosForm;