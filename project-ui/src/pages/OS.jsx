import { useState, useEffect } from 'react';
import { Paperclip } from "lucide-react"; // ícone moderno
import axios from 'axios';
import '../styles/OS.css';

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
  const [equipamentos, setEquipamentos] = useState([]);
  const [grupo, setGrupo] = useState('');
  const [fileNames, setFileNames] = useState([]);
  const statusOptions = [
    { value: 'ABERTA', label: 'Aberta' },
    { value: 'EM_ANDAMENTO', label: 'Em Andamento' },
    { value: 'CONCLUIDA', label: 'Concluída' },
  ];

  const endpointPorTipo = {
    '2': '/hcr-computers',
    '3': '/equipamentos-medicos',
    '4': '/condicionadores',
  };

  useEffect(() => {
    async function fetchOptions() {
      try {
        const [tiposRes, tecnicosRes] = await Promise.all([
          axios.get('http://localhost:5000/api/tipos-equipamento', { withCredentials: true }),
          axios.get('http://localhost:5000/api/tecnicos', { withCredentials: true }),
        ]);
        setTiposEquipamento(tiposRes.data);
        setTecnicos(tecnicosRes.data);
      } catch (error) {
        console.error('Erro ao buscar opções:', error);
      }
    }
    fetchOptions();
  }, []);

  const handleChange = async (e) => {
    const { name, value, type, checked, files } = e.target;
    if (e.target.name === "arquivos") {
  const files = Array.from(e.target.files);
  setFormData({ ...formData, arquivos: files });
  setFileNames(files.map((file) => file.name)); // <- aqui!
  return;
}

    if (type === 'file') {
      setFormData({ ...formData, arquivos: Array.from(files) });
    } else if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });

      if (name === 'tipoEquipamentoId') {
        const tipoId = String(value); // Ensure value is a string
        console.log('Tipo de Equipamento Selecionado:', tipoId);
        const endpoint = endpointPorTipo[tipoId];
        console.log('Endpoint selecionado:', endpoint); // Debug endpoint
        if (endpoint) {
          try {
            setEquipamentos([]); // Clear previous equipamentos
            const res = await axios.get(`http://localhost:5000/api${endpoint}`, { withCredentials: true });
            console.log('Equipamentos retornados:', res.data);
            setEquipamentos(res.data);
            const selectedTipo = tiposEquipamento.find((t) => t.id === parseInt(value));
            setGrupo(selectedTipo?.grupo?.nome || '');
            // Reset equipamentoId when tipoEquipamentoId changes
            setFormData((prev) => ({ ...prev, equipamentoId: '', setorId: '' }));
          } catch (error) {
            console.error('Erro ao buscar equipamentos:', error);
            setEquipamentos([]);
            setGrupo('');
          }
        } else {
          console.warn('Nenhum endpoint encontrado para tipoEquipamentoId:', tipoId);
          setEquipamentos([]);
          setGrupo('');
        }
      } else if (name === 'equipamentoId') {
        const selectedEquipamento = equipamentos.find((e) => e.id === parseInt(value));
        console.log('Equipamento selecionado:', selectedEquipamento);
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
      formDataToSend.append('tipoEquipamentoId', formData.tipoEquipamentoId);
      formDataToSend.append('tecnicoId', formData.tecnicoId);
      formDataToSend.append('status', formData.status);
      formDataToSend.append('preventiva', formData.preventiva.toString());
      formDataToSend.append('setorId', formData.setorId);
      formDataToSend.append('equipamentoId', formData.equipamentoId);

      const response = await axios.post('http://localhost:5000/api/os', formDataToSend, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      console.log('OS cadastrada com sucesso:', response.data);
      if (typeof onSubmit === 'function') {
        onSubmit(response.data);
      } else {
        console.warn('onSubmit não é uma função. Dados salvos, mas não processados pelo callback.');
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
      onClose();
    } catch (error) {
      console.error('Erro ao cadastrar OS:', error);
    }
  };

  // Helper function to get equipment name based on type
  const getEquipamentoNome = (equipamento, tipoEquipamentoId) => {
    console.log('Processando nome para equipamento:', equipamento, 'Tipo:', tipoEquipamentoId);
    switch (tipoEquipamentoId) {
      case '1': 
        return equipamento.nomePC || equipamento.ip ;
      case '3': 
        return equipamento.numeroSerie,equipamento.modelo;
      case '4': 
        return `${equipamento.marca || 'Sem Marca'} ${equipamento.nPatrimonio || 'Sem Modelo'}`.trim() ;
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
    >
      <option value="">Selecione</option>
      {equipamentos.map((e) => {
        const nome = getEquipamentoNome(e, formData.tipoEquipamentoId);
        return (
          <option key={e.id} value={e.id}>
            {nome}
          </option>
        );
      })}
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
      {tecnicos.map((t) => (
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
        tecnicos.find((t) => t.id === parseInt(formData.tecnicoId))?.grupo
          ?.nome || ""
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
      onClick={onClose}
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