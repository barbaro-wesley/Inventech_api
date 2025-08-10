import { useState, useEffect } from 'react';
import api from '../config/api';
import { toast } from 'react-toastify';
import { Paperclip } from 'lucide-react';
import '../styles/FormArCondicionado.css';

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
    arquivos: [], // New files to upload
    arquivosExistentes: [], // Existing files from initialData
  });

  const [fileNames, setFileNames] = useState([]);
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
        BTUS: initialData.BTUS ? String(initialData.BTUS) : '',
        setorId: initialData.setorId ? String(initialData.setorId) : '',
        localizacaoId: initialData.localizacaoId ? String(initialData.localizacaoId) : '',
        tipoEquipamentoId: initialData.tipoEquipamentoId ? String(initialData.tipoEquipamentoId) : '',
        obs: initialData.obs || '',
        dataCompra: initialData.dataCompra?.substring(0, 10) || '',
        inicioGarantia: initialData.inicioGarantia?.substring(0, 10) || '',
        terminoGarantia: initialData.terminoGarantia?.substring(0, 10) || '',
        notaFiscal: initialData.notaFiscal || '',
        valorCompra: initialData.valorCompra ? String(initialData.valorCompra) : '',
        arquivos: [],
        arquivosExistentes: initialData.arquivos || [],
      });
      if (Array.isArray(initialData.arquivos)) {
        const nomes = initialData.arquivos.map((a) => a.nome || a.path?.split('/').pop());
        setFileNames(nomes.filter(Boolean));
      }
    }
  }, [modoEdicao, initialData]);

  useEffect(() => {
    async function fetchSetores() {
      try {
        const response = await api.get('/setor', { withCredentials: true });
        setSetores(response.data);
      } catch (error) {
        toast.error('Erro ao carregar setores.');
      }
    }

    async function fetchTiposEquipamentos() {
      try {
        const response = await api.get('/tipos-equipamento', { withCredentials: true });
        setTiposEquipamentos(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        toast.error('Erro ao carregar tipos de equipamento.');
      }
    }

    fetchSetores();
    fetchTiposEquipamentos();
  }, []);

  useEffect(() => {
    const setorSelecionado = setores.find((s) => s.id === Number(formData.setorId));
    setLocalizacoesFiltradas(setorSelecionado?.localizacoes || []);
    if (setorSelecionado && formData.localizacaoId) {
      if (!setorSelecionado.localizacoes.some((loc) => loc.id === Number(formData.localizacaoId))) {
        setFormData((prev) => ({ ...prev, localizacaoId: '' }));
      }
    }
  }, [formData.setorId, setores]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'arquivos' && files) {
      const validFiles = Array.from(files).filter((file) => {
        if (file.type !== 'application/pdf') {
          toast.error(`Arquivo ${file.name} não é um PDF.`);
          return false;
        }
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`Arquivo ${file.name} excede o limite de 5MB.`);
          return false;
        }
        return true;
      });
      const names = validFiles.map((file) => file.name);
      setFileNames((prev) => [
        ...prev.filter((name) => formData.arquivosExistentes.some((a) => a.nome === name || a.path?.split('/').pop() === name)),
        ...names,
      ]);
      setFormData((prev) => ({ ...prev, arquivos: validFiles }));
    } else if (name === 'valorCompra') {
      const apenasNumeros = value.replace(/\D/g, '');
      const valorFormatado = (Number(apenasNumeros) / 100).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      });
      setFormData((prev) => ({ ...prev, valorCompra: valorFormatado }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        ...(name === 'setorId' ? { localizacaoId: '' } : {}),
      }));
    }
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
      formPayload.append('nControle', formData.nControle || '');
      formPayload.append('numeroSerie', formData.numeroSerie);
      formPayload.append('marca', formData.marca);
      formPayload.append('modelo', formData.modelo || '');
      formPayload.append('BTUS', formData.BTUS ? parseInt(formData.BTUS, 10).toString() : '');
      formPayload.append('setorId', formData.setorId ? parseInt(formData.setorId, 10).toString() : '');
      formPayload.append('localizacaoId', formData.localizacaoId ? parseInt(formData.localizacaoId, 10).toString() : '');
      formPayload.append('tipoEquipamentoId', formData.tipoEquipamentoId ? parseInt(formData.tipoEquipamentoId, 10).toString() : '');
      formPayload.append('obs', formData.obs || '');
      formPayload.append('dataCompra', formData.dataCompra ? new Date(formData.dataCompra).toISOString() : '');
      formPayload.append('inicioGarantia', formData.inicioGarantia ? new Date(formData.inicioGarantia).toISOString() : '');
      formPayload.append('terminoGarantia', formData.terminoGarantia ? new Date(formData.terminoGarantia).toISOString() : '');
      formPayload.append('notaFiscal', formData.notaFiscal || '');
      formPayload.append(
        'valorCompra',
        formData.valorCompra ? parseFloat(formData.valorCompra.replace(/[^\d,]/g, '').replace(',', '.')).toString() : ''
      );

      if (formData.arquivosExistentes.length > 0) {
        formPayload.append('arquivosExistentes', JSON.stringify(formData.arquivosExistentes));
      }

      if (formData.arquivos && formData.arquivos.length > 0) {
        for (const arquivo of formData.arquivos) {
          formPayload.append('arquivos', arquivo);
        }
      }

      console.log('FormData contents:');
      for (let [key, value] of formPayload.entries()) {
        console.log(key, value);
      }

      const config = {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      };

      let response;
      let equipamentoAtualizado;

      if (modoEdicao) {
        await api.put(`/condicionadores/${initialData.id}`, formPayload, config);
        const { data } = await api.get(`/condicionadores/${initialData.id}`);
        equipamentoAtualizado = data;
        toast.success('Equipamento atualizado com sucesso!');
      } else {
        response = await api.post('/condicionadores', formPayload, config);
        equipamentoAtualizado = response.data;
        toast.success('Equipamento cadastrado com sucesso!');
      }

      const setorCompleto = setores.find((s) => s.id === parseInt(formData.setorId)) || { nome: '--' };
      const localizacaoCompleta = localizacoesFiltradas.find((l) => l.id === parseInt(formData.localizacaoId)) || { nome: '--' };
      const tipoEquipamentoCompleto = tiposEquipamentos.find((te) => te.id === parseInt(formData.tipoEquipamentoId)) || { nome: '--' };

      const itemCompleto = {
        ...equipamentoAtualizado,
        setor: setorCompleto,
        localizacao: localizacaoCompleta,
        tipoEquipamento: tipoEquipamentoCompleto,
      };

      onSubmit(itemCompleto);
      onClose();
      setFormData({
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
        arquivos: [],
        arquivosExistentes: [],
      });
      setFileNames([]);
    } catch (error) {
      console.error('Erro ao salvar condicionador:', error.response?.data || error.message);
      toast.error(`Erro ao salvar o ar-condicionado: ${error.response?.data?.error || error.message}`);
    }
  };

  return (
    <div className="form-container">
      <form className="equip-form" onSubmit={handleSubmit}>
        <h2>{modoEdicao ? 'Editar Ar-Condicionado' : 'Cadastrar Ar-Condicionado'}</h2>
        <div className="form-grid">
          <div className="form-field">
            <label>Nº Patrimônio</label>
            <input type="text" name="nPatrimonio" value={formData.nPatrimonio} onChange={handleChange} required />
          </div>
          <div className="form-field">
            <label>Nº Controle</label>
            <input type="text" name="nControle" value={formData.nControle} onChange={handleChange} />
          </div>
          <div className="form-field">
            <label>Nº Série</label>
            <input type="text" name="numeroSerie" value={formData.numeroSerie} onChange={handleChange} required />
          </div>
          <div className="form-field">
            <label>Marca</label>
            <input type="text" name="marca" value={formData.marca} onChange={handleChange} required />
          </div>
          <div className="form-field">
            <label>Modelo</label>
            <input type="text" name="modelo" value={formData.modelo} onChange={handleChange} />
          </div>
          <div className="form-field">
            <label>BTUs</label>
            <input type="number" name="BTUS" value={formData.BTUS} onChange={handleChange} required />
          </div>
          <div className="form-field">
            <label>Data de Compra</label>
            <input type="date" name="dataCompra" value={formData.dataCompra} onChange={handleChange} />
          </div>
          <div className="form-field">
            <label>Início da Garantia</label>
            <input type="date" name="inicioGarantia" value={formData.inicioGarantia} onChange={handleChange} />
          </div>
          <div className="form-field">
            <label>Término da Garantia</label>
            <input type="date" name="terminoGarantia" value={formData.terminoGarantia} onChange={handleChange} />
          </div>
          <div className="form-field">
            <label>Nota Fiscal</label>
            <input type="text" name="notaFiscal" value={formData.notaFiscal} onChange={handleChange} />
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
            <select name="tipoEquipamentoId" value={formData.tipoEquipamentoId} onChange={handleChange}>
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
            <select name="setorId" value={formData.setorId} onChange={handleChange}>
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
              disabled={!formData.setorId}
            >
              <option value="">Selecione uma localização</option>
              {localizacoesFiltradas.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.nome}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field full os-upload-area">
            <label>
              <Paperclip size={18} style={{ marginRight: 6 }} />
              Arquivos (PDF, máx. 5MB)
            </label>
            <div className="custom-file-upload">
              <input
                type="file"
                name="arquivos"
                multiple
                accept="application/pdf"
                onChange={handleChange}
                id="fileInputAr"
              />
              <label htmlFor="fileInputAr">Clique ou arraste arquivos PDF aqui</label>
            </div>
            {fileNames.length > 0 && (
              <ul className="file-list">
                {fileNames.map((name, idx) => (
                  <li key={idx}>{name}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="form-field">
          <label>Observações</label>
          <textarea name="obs" value={formData.obs} onChange={handleChange} />
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