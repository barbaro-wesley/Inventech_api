import { useState, useEffect } from 'react';
import { Paperclip } from "lucide-react";
import '../styles/OS.css';
import { toast } from 'react-toastify';
import api from '../config/api';

function OS({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    arquivos: [],
    descricao: '',
    tipoEquipamentoId: '',
    tecnicoId: '',
    status: 'ABERTA',
    preventiva: false,
    setorId: '',
    equipamentoId: '',
  });

  const [tiposEquipamento, setTiposEquipamento] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [filteredTecnicos, setFilteredTecnicos] = useState([]);
  const [equipamentos, setEquipamentos] = useState([]);
  const [grupo, setGrupo] = useState('');
  const [fileNames, setFileNames] = useState([]);
  const [loadingEquipamentos, setLoadingEquipamentos] = useState(false);

  const statusOptions = [
    { value: 'ABERTA', label: 'Aberta' },
    { value: 'EM_ANDAMENTO', label: 'Em Andamento' },
    { value: 'CONCLUIDA', label: 'Concluída' },
  ];

  const endpointPorTipo = {
    '1': '/hcr-computers',
    '2': '/printers',
    '3': '/equipamentos-medicos',
    '4': '/condicionadores',
    '5': '/equipamentos-medicos', // Equipamentos Gerais
  };

  useEffect(() => {
    async function fetchOptions() {
      try {
        const [tiposRes, tecnicosRes] = await Promise.all([
          api.get('/tipos-equipamento', { withCredentials: true }),
          api.get('/tecnicos', { withCredentials: true }),
        ]);
        setTiposEquipamento(tiposRes.data);
        setTecnicos(tecnicosRes.data);
        setFilteredTecnicos(tecnicosRes.data);
      } catch (error) {
        console.error('Erro ao buscar opções:', error);
        toast.error('Erro ao carregar opções do formulário');
      }
    }
    fetchOptions();
  }, []);

  const handleChange = async (e) => {
    const { name, value, type, checked, files } = e.target;

    if (name === "arquivos") {
      const filesArray = Array.from(files);
      setFormData({ ...formData, arquivos: filesArray });
      setFileNames(filesArray.map((file) => file.name));
      return;
    }

    if (type === 'file') {
      setFormData({ ...formData, arquivos: Array.from(files) });
    } else if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });

      if (name === 'tipoEquipamentoId') {
        const tipoId = String(value);
        const selectedTipo = tiposEquipamento.find((t) => t.id === parseInt(value));
        setGrupo(selectedTipo?.grupo?.nome || '');

        // Filtrar técnicos
        if (selectedTipo?.grupo?.id) {
          const filtered = tecnicos.filter(t => t.grupo?.id === selectedTipo.grupo.id);
          setFilteredTecnicos(filtered);
          if (!filtered.some(t => t.id === parseInt(formData.tecnicoId))) {
            setFormData(prev => ({ ...prev, tecnicoId: '' }));
          }
        } else {
          setFilteredTecnicos(tecnicos);
          setFormData(prev => ({ ...prev, tecnicoId: '' }));
        }

        // Buscar equipamentos
        const endpoint = endpointPorTipo[tipoId];
        if (endpoint) {
          try {
            setLoadingEquipamentos(true);
            setEquipamentos([]);
            const res = await api.get(endpoint, { 
              withCredentials: true,
              params: { tipoEquipamentoId: tipoId } // Enviar tipoEquipamentoId como parâmetro
            });
            // Filtrar equipamentos no frontend, caso a API não faça isso
            const filteredEquipamentos = res.data.filter(e => String(e.tipoEquipamentoId) === tipoId);
            setEquipamentos(filteredEquipamentos);
            setFormData((prev) => ({ ...prev, equipamentoId: '', setorId: '' }));
          } catch (error) {
            console.error('Erro ao buscar equipamentos:', error);
            setEquipamentos([]);
            toast.error('Erro ao carregar equipamentos');
          } finally {
            setLoadingEquipamentos(false);
          }
        } else {
          setEquipamentos([]);
          setFormData((prev) => ({ ...prev, equipamentoId: '', setorId: '' }));
          toast.warn('Nenhum endpoint configurado para este tipo de equipamento');
        }
      } else if (name === 'equipamentoId') {
        const selectedEquipamento = equipamentos.find((e) => e.id === parseInt(value));
        setFormData({
          ...formData,
          equipamentoId: value,
          setorId: selectedEquipamento?.setor?.id || '',
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formData.arquivos.forEach((file) => formDataToSend.append('arquivos', file));
      formDataToSend.append('descricao', formData.descricao);
      formDataToSend.append('tipoEquipamentoId', Number(formData.tipoEquipamentoId));
      formDataToSend.append('tecnicoId', Number(formData.tecnicoId));
      formDataToSend.append('status', formData.status);
      formDataToSend.append('preventiva', formData.preventiva ? 'true' : 'false');
      if (formData.setorId) formDataToSend.append('setorId', Number(formData.setorId));
      formDataToSend.append('equipamentoId', Number(formData.equipamentoId));

      const response = await api.post('/os', formDataToSend, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Ordem de Serviço cadastrada com sucesso!');
      if (typeof onSubmit === 'function') {
        onSubmit(response.data);
      }

      setFormData({
        arquivos: [],
        descricao: '',
        tipoEquipamentoId: '',
        tecnicoId: '',
        status: 'ABERTA',
        preventiva: false,
        setorId: '',
        equipamentoId: '',
      });
      setGrupo('');
      setFilteredTecnicos(tecnicos);
      setEquipamentos([]);
      if (typeof onClose === 'function') {
        onClose();
      }
    } catch (error) {
      console.error('Erro ao cadastrar OS:', error.response?.data || error);
      toast.error('Erro ao cadastrar Ordem de Serviço');
    }
  };

  const getEquipamentoNome = (equipamento, tipoEquipamentoId) => {
    switch (tipoEquipamentoId) {
      case '1': // Computadores
        return `${equipamento.nomePC || 'Sem Nome'} - ${equipamento.ip || 'Sem IP'}`;
      case '2': // Impressoras
        return `${equipamento.ip || 'Sem Nome'} - ${equipamento.marca || 'Sem Marca'}`;
      case '3': // Equipamentos médicos
      case '5': // Equipamentos Gerais
        return `${equipamento.numeroSerie || 'Sem Nº de Série'} - ${equipamento.modelo || 'Sem Modelo'}`;
      case '4': // Condicionadores
        return `${equipamento.marca || 'Sem Marca'} - ${equipamento.nPatrimonio || 'Sem Patrimônio'}`;
      default:
        return 'Equipamento não identificado';
    }
  };

  return (
    <div className="os-wrapper">
      <div className="os-card">
        <h2 className="os-title">Cadastro de OS</h2>
        <form onSubmit={handleSubmit} className="os-form-grid">
          {/* Tipo de Equipamento */}
          <div className="os-field">
            <label>Tipo de Equipamento</label>
            <select
              name="tipoEquipamentoId"
              value={formData.tipoEquipamentoId}
              onChange={handleChange}
              required
            >
              <option value="">Selecione</option>
              {tiposEquipamento.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Equipamento */}
          <div className="os-field">
            <label>Equipamento</label>
            <select
              name="equipamentoId"
              value={formData.equipamentoId}
              onChange={handleChange}
              required
              disabled={loadingEquipamentos || !formData.tipoEquipamentoId}
            >
              <option value="">{loadingEquipamentos ? 'Carregando...' : 'Selecione'}</option>
              {equipamentos.map((e) => (
                <option key={e.id} value={e.id}>
                  {getEquipamentoNome(e, formData.tipoEquipamentoId)}
                </option>
              ))}
            </select>
          </div>

          {/* Técnico */}
          <div className="os-field">
            <label>Técnico Responsável</label>
            <select
              name="tecnicoId"
              value={formData.tecnicoId}
              onChange={handleChange}
              required
            >
              <option value="">Selecione</option>
              {filteredTecnicos.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nome} {t.matricula ? `(${t.matricula})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Grupo do Técnico */}
          <div className="os-field">
            <label>Grupo</label>
            <input
              type="text"
              value={
                filteredTecnicos.find((t) => t.id === parseInt(formData.tecnicoId))?.grupo?.nome || ""
              }
              readOnly
            />
          </div>

          {/* Status */}
          <div className="os-field">
            <label>Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
            >
              <option value="">Selecione</option>
              {statusOptions.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Grupo do Equipamento */}
          <div className="os-field">
            <label>Grupo do Equipamento</label>
            <input type="text" value={grupo} readOnly />
          </div>

          {/* Upload de Arquivos */}
          <div className="os-field full os-upload-area">
            <label>
              <Paperclip size={18} style={{ marginRight: 6 }} />
              Arquivos (Imagens)
            </label>
            <div className="custom-file-upload">
              <input
                type="file"
                name="arquivos"
                multiple
                accept="image/*"
                onChange={handleChange}
                id="fileInput"
              />
              <label htmlFor="fileInput">Clique ou arraste arquivos aqui</label>
            </div>
            {fileNames.length > 0 && (
              <ul className="file-list">
                {fileNames.map((name, idx) => (
                  <li key={idx}>{name}</li>
                ))}
              </ul>
            )}
          </div>

          {/* Descrição */}
          <div className="os-field full">
            <label>Descrição</label>
            <textarea
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              rows={4}
              required
            />
          </div>

          {/* Botões */}
          <div className="os-buttons full">
            <button type="submit" className="btn-primary btn-large">
              Salvar
            </button>
            <button
              type="button"
              className="btn-secondary btn-large"
              onClick={() => typeof onClose === 'function' && onClose()}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default OS;