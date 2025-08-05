import { useState, useEffect } from 'react';
import '../styles/EquipamentosMedicosForm.css';
import api from '../config/api';
import { Paperclip } from "lucide-react";
import { toast } from 'react-toastify';
function EquipamentosMedicosForm({ onClose, onSubmit, initialData = null }) {
  const [formData, setFormData] = useState({
    numeroPatrimonio: '',
    identificacao: '',
    numeroSerie: '',
    numeroAnvisa: '',
    nomeEquipamento: '',
    modelo: '',
    fabricante: '',
    valorCompra: '',
    dataCompra: '',
    inicioGarantia: '',
    terminoGarantia: '',
    notaFiscal: '',
    obs: '',
    setorId: '',
    localizacaoId: '',
    tipoEquipamentoId: '',
    arquivos: []
  });

  const [fileNames, setFileNames] = useState([]);

  const [setores, setSetores] = useState([]);
  const [filteredLocalizacoes, setFilteredLocalizacoes] = useState([]);
  const [tiposEquipamentos, setTiposEquipamentos] = useState([]);

  useEffect(() => {
    const fetchSetores = async () => {
      try {
        const response = await api.get('/setor', { withCredentials: true });
        setSetores(response.data);
      } catch (error) {
        console.error('Erro ao buscar setores:', error);
      }
    };

    const fetchTiposEquipamentos = async () => {
      try {
        const response = await api.get('/tipos-equipamento', { withCredentials: true });
        setTiposEquipamentos(response.data);
      } catch (error) {
      }
    };

    fetchSetores();
    fetchTiposEquipamentos();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        numeroPatrimonio: initialData.numeroPatrimonio ?? '',
        identificacao: initialData.identificacao ?? '',
        numeroSerie: initialData.numeroSerie ?? '',
        numeroAnvisa: initialData.numeroAnvisa ?? '',
        nomeEquipamento: initialData.nomeEquipamento ?? '',
        modelo: initialData.modelo ?? '',
        fabricante: initialData.fabricante ?? '',
        valorCompra: initialData.valorCompra ? String(initialData.valorCompra) : '',
        dataCompra: initialData.dataCompra ? initialData.dataCompra.slice(0, 10) : '',
        inicioGarantia: initialData.inicioGarantia ? initialData.inicioGarantia.slice(0, 10) : '',
        terminoGarantia: initialData.terminoGarantia ? initialData.terminoGarantia.slice(0, 10) : '',
        notaFiscal: initialData.notaFiscal ?? '',
        obs: initialData.obs ?? '',
        setorId: initialData.setorId ? String(initialData.setorId) : '',
        localizacaoId: initialData.localizacaoId ?? initialData.localizacao?.id ?? '',
        tipoEquipamentoId: initialData.tipoEquipamentoId ? String(initialData.tipoEquipamentoId) : '',
        arquivo: initialData.arquivo ?? [],
      });
    }
  }, [initialData]);

  useEffect(() => {
    if (formData.setorId) {
      const selectedSetor = setores.find((setor) => setor.id === parseInt(formData.setorId));
      setFilteredLocalizacoes(selectedSetor ? selectedSetor.localizacoes : []);
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
  const { name, value, files } = e.target;
    if (name === 'arquivos' && files) {
  const names = Array.from(files).map((file) => file.name);
  setFileNames(names);
  setFormData((prev) => ({ ...prev, arquivos: files })); // você pode manter `arquivos` no state
} else {
    setFormData({ ...formData, [name]: value });
  }
};

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!formData.nomeEquipamento) {
    toast.error('Por favor, preencha o campo obrigatório: Nome do Equipamento.');
    return;
  }

  const formToSend = new FormData();

  formToSend.append('numeroPatrimonio', formData.numeroPatrimonio || '');
  formToSend.append('identificacao', formData.identificacao || '');
  formToSend.append('numeroSerie', formData.numeroSerie || '');
  formToSend.append('numeroAnvisa', formData.numeroAnvisa || '');
  formToSend.append('nomeEquipamento', formData.nomeEquipamento);
  formToSend.append('modelo', formData.modelo || '');
  formToSend.append('fabricante', formData.fabricante || '');
  formToSend.append('valorCompra', formData.valorCompra || '');
  formToSend.append('dataCompra', formData.dataCompra ? new Date(formData.dataCompra).toISOString() : '');
  formToSend.append('inicioGarantia', formData.inicioGarantia ? new Date(formData.inicioGarantia).toISOString() : '');
  formToSend.append('terminoGarantia', formData.terminoGarantia ? new Date(formData.terminoGarantia).toISOString() : '');
  formToSend.append('notaFiscal', formData.notaFiscal || '');
  formToSend.append('obs', formData.obs || '');

  formToSend.append('setorId', formData.setorId || '');
  formToSend.append('localizacaoId', formData.localizacaoId || '');
  formToSend.append('tipoEquipamentoId', formData.tipoEquipamentoId || '');

  if (formData.arquivos && formData.arquivos.length > 0) {
   for (const arquivo of formData.arquivos) {
  formToSend.append('arquivos', arquivo); 
    }
  }

  try {
    let response;
    
    if (initialData?.id) {
      response = await api.put(`/equipamentos-medicos/${initialData.id}`, formToSend, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Equipamento atualizado com sucesso!');
    } else {
      response = await api.post('/equipamentos-medicos', formToSend, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Equipamento cadastrado com sucesso!');
    }

    if (!response.data) {
      throw new Error('Resposta da API inválida: dados não retornados');
    }

    const setorCompleto = setores.find((s) => s.id === parseInt(formData.setorId)) || { nome: '--' };
    const localizacaoCompleta = filteredLocalizacoes.find((l) => l.id === parseInt(formData.localizacaoId)) || { nome: '--' };
    const tipoEquipamentoCompleto = tiposEquipamentos.find((te) => te.id === parseInt(formData.tipoEquipamentoId)) || { nome: '--' };

    const itemCompleto = {
      ...response.data,
      setor: setorCompleto,
      localizacao: localizacaoCompleta,
      tipoEquipamento: tipoEquipamentoCompleto,
    };

    onSubmit(itemCompleto);
    onClose();
    setFormData({
      numeroPatrimonio: '',
      identificacao: '',
      numeroSerie: '',
      numeroAnvisa: '',
      nomeEquipamento: '',
      modelo: '',
      fabricante: '',
      valorCompra: '',
      dataCompra: '',
      inicioGarantia: '',
      terminoGarantia: '',
      notaFiscal: '',
      obs: '',
      setorId: '',
      localizacaoId: '',
      tipoEquipamentoId: '',
      arquivos: [], // <-- Corrigido para "arquivos"
    });
    setFileNames([]); 
  } catch (error) {
    const errorMessage = error.response?.data?.error || error.message || 'Tente novamente.';
    toast.error(`Erro ao salvar equipamento médico: ${errorMessage}`);
  }
};

  if (!initialData && initialData !== null) {
    return <div>Loading...</div>;
  }

  return (
    <div className="form-container">
      <div className="equip-form">
        <h2>{initialData ? 'Editar Equipamento Médico' : 'Cadastrar Equipamento Médico'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Nome do Equipamento</label>
              <input type="text" name="nomeEquipamento" value={formData.nomeEquipamento || ''} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Modelo</label>
              <input type="text" name="modelo" value={formData.modelo || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Fabricante</label>
              <input type="text" name="fabricante" value={formData.fabricante || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Nº Patrimônio</label>
              <input type="text" name="numeroPatrimonio" value={formData.numeroPatrimonio || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Identificação</label>
              <input type="text" name="identificacao" value={formData.identificacao || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Nº Série</label>
              <input type="text" name="numeroSerie" value={formData.numeroSerie || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Nº Anvisa</label>
              <input type="text" name="numeroAnvisa" value={formData.numeroAnvisa || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Valor de Compra</label>
              <input type="number" step="0.01" name="valorCompra" value={formData.valorCompra || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Data de Compra</label>
              <input type="date" name="dataCompra" value={formData.dataCompra || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Início da Garantia</label>
              <input type="date" name="inicioGarantia" value={formData.inicioGarantia || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Término da Garantia</label>
              <input type="date" name="terminoGarantia" value={formData.terminoGarantia || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Nota Fiscal</label>
              <input type="text" name="notaFiscal" value={formData.notaFiscal || ''} onChange={handleChange} />
            </div>
            <div className="form-group" style={{ flex: '1 1 100%' }}>
              <label>Observações</label>
              <textarea name="obs" value={formData.obs || ''} onChange={handleChange}></textarea>
            </div>
            <div className="form-group">
              <label>Setor</label>
              <select name="setorId" value={formData.setorId || ''} onChange={handleChange} required>
                <option value="">Selecione um setor</option>
                {setores.map((setor) => (
                  <option key={setor.id} value={setor.id}>
                    {setor.nome}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Localização</label>
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
            </div>
            <div className="form-group">
              <label>Tipo de Equipamento</label>
              <select name="tipoEquipamentoId" value={formData.tipoEquipamentoId || ''} onChange={handleChange} required>
                <option value="">Selecione um tipo de equipamento</option>
                {tiposEquipamentos.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.nome}
                  </option>
                ))}
              </select>
            </div>
            <div className="os-field full os-upload-area">
              <label>
                <Paperclip size={18} style={{ marginRight: 6 }} />
                Arquivos (PDF)
              </label>
              <div className="custom-file-upload">
                <input
                   type="file"
                    name="arquivos"
                    multiple
                    accept="application/pdf"
                    onChange={handleChange}
                    id="fileInput"
/>
                <label htmlFor="fileInput">Clique ou arraste arquivos PDF aqui</label>
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