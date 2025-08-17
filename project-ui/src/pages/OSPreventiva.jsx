import { useState, useEffect } from 'react';
import { Paperclip } from "lucide-react";
import { toast } from 'react-toastify';
import api from '../config/api';
import '../styles/OS.css';

function OSPreventiva({ onClose, onSubmit, initialData }) {
  const [formData, setFormData] = useState({
    descricao: '',
    tipoEquipamentoId: '',
    equipamentoId: '',
    tecnicoId: '',
    setorId: '',
    preventiva: true,
    dataAgendada: '',
    recorrencia: '',
    intervaloDias: '',
    arquivos: [],
  });

  const [tiposEquipamento, setTiposEquipamento] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [filteredTecnicos, setFilteredTecnicos] = useState([]);
  const [equipamentos, setEquipamentos] = useState([]);
  const [grupo, setGrupo] = useState('');
  const [fileNames, setFileNames] = useState([]);
  const [loadingEquipamentos, setLoadingEquipamentos] = useState(false);

  const recorrencias = [
    { value: 'DIARIA', label: 'Diariamente' },
    { value: 'SEMANAL', label: 'Semanalmente' },
    { value: 'QUINZENAL', label: 'A cada 15 dias' },
    { value: 'MENSAL', label: 'Mensalmente' },
    { value: 'ANUAL', label: 'Anual' },
  ];

  const endpointPorTipo = {
    '1': '/hcr-computers',
    '2': '/printers',
    '3': '/equipamentos-medicos',
    '4': '/condicionadores',
    '5': '/equipamentos-medicos',
    '6': '/hcr-mobilia',
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
        console.error('Erro ao buscar dados:', error);
        toast.error('Erro ao carregar dados');
      }
    }
    fetchOptions();
  }, []);

  useEffect(() => {
    if (initialData && initialData.equipamento) {
      const eq = initialData.equipamento;
      setFormData({
        ...formData,
        tipoEquipamentoId: String(eq.tipoEquipamentoId || ''),
        equipamentoId: String(eq.id || ''),
        setorId: eq.setor?.id || '',
        preventiva: !!initialData.preventiva,
      });

      // Initialize equipamentos with the provided equipment
      setEquipamentos([eq]);

      // Fetch additional equipment for the same tipoEquipamentoId
      const tipoId = String(eq.tipoEquipamentoId || '');
      const endpoint = endpointPorTipo[tipoId];
      if (endpoint) {
        (async () => {
          try {
            setLoadingEquipamentos(true);
            const res = await api.get(endpoint, {
              withCredentials: true,
              params: { tipoEquipamentoId: tipoId },
            });
            const filteredEquipamentos = res.data.filter(e => String(e.tipoEquipamentoId) === tipoId);
            // Ensure the initial equipment is included, avoiding duplicates
            setEquipamentos(prev => {
              const allEquipamentos = [...prev, ...filteredEquipamentos];
              return Array.from(new Map(allEquipamentos.map(e => [e.id, e])).values());
            });
          } catch (error) {
            console.error('Erro ao buscar equipamentos:', error);
            toast.error('Erro ao carregar equipamentos');
          } finally {
            setLoadingEquipamentos(false);
          }
        })();
      } else {
        toast.warn('Nenhum endpoint configurado para este tipo de equipamento');
      }

      // Set grupo and filter técnicos based on tipoEquipamentoId
      const selectedTipo = tiposEquipamento.find(t => t.id === parseInt(tipoId));
      setGrupo(selectedTipo?.grupo?.nome || '');
      if (selectedTipo?.grupo?.id) {
        const filtered = tecnicos.filter(t => t.grupo?.id === selectedTipo.grupo.id);
        setFilteredTecnicos(filtered);
      } else {
        setFilteredTecnicos(tecnicos);
      }
    }
  }, [initialData, tiposEquipamento, tecnicos]);

  const handleChange = async (e) => {
    const { name, value, files, type, checked } = e.target;

    if (name === 'arquivos') {
      const filesArray = Array.from(files);
      setFormData({ ...formData, arquivos: filesArray });
      setFileNames(filesArray.map((file) => file.name));
      return;
    }

    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'tipoEquipamentoId') {
      const tipoId = String(value);
      const tipo = tiposEquipamento.find((t) => t.id === parseInt(tipoId));
      setGrupo(tipo?.grupo?.nome || '');

      // Filtrar técnicos
      if (tipo?.grupo?.id) {
        const filtered = tecnicos.filter(t => t.grupo?.id === tipo.grupo.id);
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
            params: { tipoEquipamentoId: tipoId }
          });
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
    }

    if (name === 'equipamentoId') {
      const equipamento = equipamentos.find((e) => e.id === parseInt(value));
      setFormData((prev) => ({
        ...prev,
        setorId: equipamento?.setor?.id || '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formDataToSend = new FormData();
      formData.arquivos.forEach((file) => formDataToSend.append('arquivos', file));
      formDataToSend.append('descricao', formData.descricao);
      formDataToSend.append('tipoEquipamentoId', Number(formData.tipoEquipamentoId));
      formDataToSend.append('equipamentoId', Number(formData.equipamentoId));
      formDataToSend.append('tecnicoId', Number(formData.tecnicoId));
      formDataToSend.append('status', 'ABERTA');
      formDataToSend.append('preventiva', 'true');
      if (formData.setorId) formDataToSend.append('setorId', Number(formData.setorId));
      formDataToSend.append('dataAgendada', formData.dataAgendada ? new Date(formData.dataAgendada).toISOString() : null);
      formDataToSend.append('recorrencia', formData.recorrencia || 'NENHUMA');
      if (formData.intervaloDias) formDataToSend.append('intervaloDias', Number(formData.intervaloDias));

      const response = await api.post('/os', formDataToSend, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('OS preventiva cadastrada com sucesso!');
      if (typeof onSubmit === 'function') onSubmit(response.data);
      if (typeof onClose === 'function') onClose();

      setFormData({
        descricao: '',
        tipoEquipamentoId: '',
        equipamentoId: '',
        tecnicoId: '',
        setorId: '',
        preventiva: true,
        dataAgendada: '',
        recorrencia: '',
        intervaloDias: '',
        arquivos: [],
      });
      setFileNames([]);
      setGrupo('');
      setFilteredTecnicos(tecnicos);
      setEquipamentos([]);
    } catch (error) {
      console.error('Erro ao cadastrar OS preventiva:', error);
      toast.error('Erro ao cadastrar OS preventiva');
    }
  };

  const getEquipamentoNome = (equipamento, tipoEquipamentoId) => {
    switch (String(tipoEquipamentoId)) {
      case '1': // Computadores
        return `${equipamento.nomePC || 'Sem Nome'} - ${equipamento.ip || 'Sem IP'}`;
      case '2': // Impressoras
        return `${equipamento.ip || 'Sem IP'} - ${equipamento.marca || 'Sem Marca'}`;
      case '3': // Equipamentos médicos
      case '5': // Equipamentos Gerais
        return `${equipamento.numeroSerie || 'Sem Nº de Série'} - ${equipamento.nomeEquipamento || 'Sem Modelo'}`;
      case '4': // Condicionadores
        return `${equipamento.marca || 'Sem Marca'} - ${equipamento.nPatrimonio || 'Sem Patrimônio'}`;
      case '6': // Mobilia
        return `${equipamento.nPatrimonio || 'Sem Marca'} - ${equipamento.nome || 'Sem Patrimônio'}`;
      default:
        return 'Equipamento não identificado';
    }
  };

  return (
    <div className="os-wrapper">
      <div className="os-card">
        <h2 className="os-title">Cadastro de OS Preventiva</h2>
        <form onSubmit={handleSubmit} className="os-form-grid">
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
                <option key={t.id} value={t.id}>{t.nome}</option>
              ))}
            </select>
          </div>

          {/* Equipamento */}
          <div className="os-field">
            <label htmlFor="equipamentoId">Equipamento</label>
            <select
              id="equipamentoId"
              name="equipamentoId"
              value={formData.equipamentoId}
              onChange={handleChange}
              disabled={loadingEquipamentos || equipamentos.length === 0}
            >
              <option value="">Selecione um equipamento</option>
              {equipamentos.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  {getEquipamentoNome(eq, formData.tipoEquipamentoId)}
                </option>
              ))}
            </select>
          </div>

          {/* Técnico Responsável */}
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
                <option key={t.id} value={t.id}>{t.nome}</option>
              ))}
            </select>
          </div>

          {/* Grupo do Técnico */}
          <div className="os-field">
            <label>Grupo</label>
            <input
              type="text"
              value={filteredTecnicos.find((t) => t.id === parseInt(formData.tecnicoId))?.grupo?.nome || grupo}
              readOnly
            />
          </div>

          {/* Data Agendada */}
          <div className="os-field">
            <label>Data Agendada</label>
            <input
              type="datetime-local"
              name="dataAgendada"
              value={formData.dataAgendada}
              onChange={handleChange}
              required
            />
          </div>

          {/* Recorrência */}
          <div className="os-field">
            <label>Recorrência (opcional)</label>
            <select
              name="recorrencia"
              value={formData.recorrencia}
              onChange={handleChange}
            >
              <option value="">Selecione</option>
              {recorrencias.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          {/* Intervalo Dias */}
          <div className="os-field">
            <label>Intervalo Dias (opcional)</label>
            <input
              type="number"
              name="intervaloDias"
              value={formData.intervaloDias}
              onChange={handleChange}
              min={1}
              placeholder="Informe intervalo em dias"
            />
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
                id="fileInputPreventiva"
              />
              <label htmlFor="fileInputPreventiva">Clique ou arraste arquivos aqui</label>
            </div>
            {fileNames.length > 0 && (
              <ul className="file-list">
                {fileNames.map((name, idx) => (
                  <li key={idx}>{name}</li>
                ))}
              </ul>
            )}
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

export default OSPreventiva;