import { useState, useEffect } from 'react';
import api from '../config/api';
import { toast } from 'react-toastify';
import "../styles/FormArCondicionado.css"

function ArCondicionadoForm({ onClose, onSubmit, initialData }) {
  const modoEdicao = !!initialData;
  const [formData, setFormData] = useState({
    nPatrimonio: '',
    nControle: '',
    numeroSerie: '',
    marca: '',
    modelo: '',
    BTUS: '',
    setorId: '',
    localizacaoId: '',
    tipoEquipamentoId: '',
    obs: '',
    dataCompra: '',
    inicioGarantia: '',
    terminoGarantia: '',
    notaFiscal: '',
    valorCompra: '',
    arquivos: []
  });

  const [arquivos, setArquivos] = useState([]);

  const [setores, setSetores] = useState([]);
  const [localizacoesFiltradas, setLocalizacoesFiltradas] = useState([]);
  const [tiposEquipamentos, setTiposEquipamentos] = useState([]);

  useEffect(() => {
    if (modoEdicao && initialData) {
      setFormData({
        nPatrimonio: initialData.nPatrimonio || '',
        nControle: initialData.nControle || '',
        numeroSerie: initialData.numeroSerie || '',
        marca: initialData.marca || '',
        modelo: initialData.modelo || '',
        BTUS: initialData.BTUS || '',
        setorId: initialData.setorId || '',
        localizacaoId: initialData.localizacaoId || '',
        tipoEquipamentoId: initialData.tipoEquipamentoId || '',
        obs: initialData.obs || '',
        dataCompra: initialData.dataCompra?.substring(0, 10) || '',
        inicioGarantia: initialData.inicioGarantia?.substring(0, 10) || '',
        terminoGarantia: initialData.terminoGarantia?.substring(0, 10) || '',
        notaFiscal: initialData.notaFiscal || '',
        valorCompra: initialData.valorCompra?.toString() || '',
        arquivos: initialData.arquivos ?? [],
      });
    }
  }, [modoEdicao, initialData]);

  useEffect(() => {
    async function fetchSetores() {
      try {
        const response = await api.get('/setor', { withCredentials: true });
        setSetores(response.data);
      } catch (error) {
        // tratar erro
      }
    }

    async function fetchTiposEquipamentos() {
      try {
        const response = await api.get('/tipos-equipamento', { withCredentials: true });
        setTiposEquipamentos(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        // tratar erro
      }
    }

    fetchSetores();
    fetchTiposEquipamentos();
  }, []);

  useEffect(() => {
    const setorSelecionado = setores.find(s => s.id === Number(formData.setorId));
    if (setorSelecionado) {
      setLocalizacoesFiltradas(setorSelecionado.localizacoes || []);
    } else {
      setLocalizacoesFiltradas([]);
    }
  }, [formData.setorId, setores]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'valorCompra') {
      const apenasNumeros = value.replace(/\D/g, '');
      const valorFormatado = (Number(apenasNumeros) / 100).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      });

      setFormData((prev) => ({
        ...prev,
        valorCompra: valorFormatado,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'setorId' ? { localizacaoId: '' } : {}),
    }));
  };

  const handleArquivosChange = (e) => {
    setArquivos(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nPatrimonio || !formData.numeroSerie || !formData.marca || !formData.BTUS) {
      toast.error('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      const formPayload = new FormData();

      formPayload.append('nPatrimonio', formData.nPatrimonio);
      formPayload.append('nControle', formData.nControle || '0');
      formPayload.append('numeroSerie', formData.numeroSerie);
      formPayload.append('marca', formData.marca);
      formPayload.append('modelo', formData.modelo);
      formPayload.append('BTUS', formData.BTUS.toString());
      formPayload.append('setorId', formData.setorId ? Number(formData.setorId) : '');
      formPayload.append('localizacaoId', formData.localizacaoId ? Number(formData.localizacaoId) : '');
      formPayload.append('tipoEquipamentoId', formData.tipoEquipamentoId ? Number(formData.tipoEquipamentoId) : '');
      formPayload.append('obs', formData.obs || '');
      formPayload.append('dataCompra', formData.dataCompra || '');
      formPayload.append('inicioGarantia', formData.inicioGarantia || '');
      formPayload.append('terminoGarantia', formData.terminoGarantia || '');
      formPayload.append('notaFiscal', formData.notaFiscal || '');
      formPayload.append('valorCompra', formData.valorCompra
        ? parseFloat(formData.valorCompra.replace(/\D/g, '')) / 100
        : '');

      arquivos.forEach(file => {
        formPayload.append('arquivos', file);
      });

      const config = {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      };

      const response = modoEdicao
        ? await api.put(`/condicionadores/${initialData.id}`, formPayload, config)
        : await api.post('/condicionadores', formPayload, config);

      if (!response.data || !response.data.id) {
        throw new Error('Resposta da API inválida: item sem ID');
      }

      // Atualizar visualmente, buscar nomes completos etc. conforme sua lógica
      onSubmit(response.data);
      toast.success('Equipamento salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar condicionador:', error);
      toast.error('Erro ao salvar o ar-condicionado. Tente novamente.');
    }
  };

  return (
  <div className="form-container">
    <form className="equip-form" onSubmit={handleSubmit}>
      <h2>{modoEdicao ? 'Editar Ar-Condicionado' : 'Cadastrar Ar-Condicionado'}</h2>
      <div className="form-grid">
        <div className="form-field">
          <label>Nº Patrimônio</label>
          <input
            type="text"
            name="nPatrimonio"
            value={formData.nPatrimonio}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-field">
          <label>Nº Controle</label>
          <input
            type="text"
            name="nControle"
            value={formData.nControle}
            onChange={handleChange}
          />
        </div>

        <div className="form-field">
          <label>Nº Série</label>
          <input
            type="text"
            name="numeroSerie"
            value={formData.numeroSerie}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-field">
          <label>Marca</label>
          <input
            type="text"
            name="marca"
            value={formData.marca}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-field">
          <label>Modelo</label>
          <input
            type="text"
            name="modelo"
            value={formData.modelo}
            onChange={handleChange}
          />
        </div>

        <div className="form-field">
          <label>BTUs</label>
          <input
            type="text"
            name="BTUS"
            value={formData.BTUS}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-field">
          <label>Data de Compra</label>
          <input
            type="date"
            name="dataCompra"
            value={formData.dataCompra}
            onChange={handleChange}
          />
        </div>

        <div className="form-field">
          <label>Início da Garantia</label>
          <input
            type="date"
            name="inicioGarantia"
            value={formData.inicioGarantia}
            onChange={handleChange}
          />
        </div>

        <div className="form-field">
          <label>Término da Garantia</label>
          <input
            type="date"
            name="terminoGarantia"
            value={formData.terminoGarantia}
            onChange={handleChange}
          />
        </div>

        <div className="form-field">
          <label>Nota Fiscal</label>
          <input
            type="text"
            name="notaFiscal"
            value={formData.notaFiscal}
            onChange={handleChange}
          />
        </div>

        <div className="form-field">
          <label>Valor da Compra</label>
          <input
            type="text"
            name="valorCompra"
            value={formData.valorCompra}
            onChange={handleChange}
            placeholder="R$ 0,00"
          />
        </div>

        <div className="form-field">
          <label>Tipo de Equipamento</label>
          <select
            name="tipoEquipamentoId"
            value={formData.tipoEquipamentoId}
            onChange={handleChange}
          >
            <option value="">Selecione um tipo de equipamento</option>
            {tiposEquipamentos.map((tipo) => (
              <option key={tipo.id} value={tipo.id}>
                {tipo.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label>Setor</label>
          <select
            name="setorId"
            value={formData.setorId}
            onChange={handleChange}
          >
            <option value="">Selecione um setor</option>
            {setores.map((setor) => (
              <option key={setor.id} value={setor.id}>
                {setor.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label>Localização</label>
          <select
            name="localizacaoId"
            value={formData.localizacaoId}
            onChange={handleChange}
          >
            <option value="">Selecione uma localização</option>
            {localizacoesFiltradas.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label>Arquivos (PDF, múltiplos)</label>
          <input
            type="file"
            accept="application/pdf"
            multiple
            onChange={handleArquivosChange}
          />
        </div>
      </div>

      <div className="form-field">
        <label>Observações</label>
        <textarea
          name="obs"
          value={formData.obs}
          onChange={handleChange}
        />
      </div>

      <div className="form-buttons">
        <button type="submit" className="btn-submit">
          {modoEdicao ? 'Atualizar' : 'Salvar'}
        </button>
        <button type="button" className="btn-cancel" onClick={onClose}>
          Cancelar
        </button>
      </div>
    </form>
  </div>
);
}

export default ArCondicionadoForm;





