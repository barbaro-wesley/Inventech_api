import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/FormPc.css';

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
  });

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
      });
    }
  }, [modoEdicao, initialData]);

  useEffect(() => {
    async function fetchSetores() {
      try {
        const response = await axios.get('http://localhost:5000/api/setor', {
          withCredentials: true,
        });
        setSetores(response.data);
      } catch (error) {
        console.error('Erro ao buscar setores:', error);
        alert('Erro ao carregar setores. Tente novamente.');
      }
    }

    async function fetchTiposEquipamentos() {
      try {
        const response = await axios.get('http://localhost:5000/api/tipos-equipamento', {
          withCredentials: true,
        });
        setTiposEquipamentos(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Erro ao buscar tipos de equipamentos:', error);
        alert('Erro ao carregar tipos de equipamentos. Tente novamente.');
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
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'setorId' ? { localizacaoId: '' } : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nPatrimonio || !formData.numeroSerie || !formData.marca || !formData.BTUS) {
      alert('Por favor, preencha todos os campos obrigatórios (Nº Patrimônio, Nº Série, Marca, BTUs).');
      return;
    }

    try {
      const payload = {
        nPatrimonio: formData.nPatrimonio,
        nControle: formData.nControle || '0',
        numeroSerie: formData.numeroSerie,
        marca: formData.marca,
        modelo: formData.modelo,
        BTUS: formData.BTUS.toString(),
        setorId: formData.setorId ? Number(formData.setorId) : null,
        localizacaoId: formData.localizacaoId ? Number(formData.localizacaoId) : null,
        tipoEquipamentoId: formData.tipoEquipamentoId ? Number(formData.tipoEquipamentoId) : null,
        obs: formData.obs || null,
      };

      const response = modoEdicao
        ? await axios.put(`http://localhost:5000/api/condicionadores/${initialData.id}`, payload, {
            withCredentials: true,
          })
        : await axios.post('http://localhost:5000/api/condicionadores', payload, {
            withCredentials: true,
          });

      if (!response.data || !response.data.id) {
        throw new Error('Resposta da API inválida: item sem ID');
      }

      console.log('Equipamento salvo com sucesso!', response.data);
      onSubmit(response.data);
    } catch (error) {
      console.error('Erro ao salvar condicionador:', error);
      alert('Erro ao salvar o ar-condicionado. Tente novamente.');
    }
  };

  return (
    <div className="form-container">
      <form className="pc-form" onSubmit={handleSubmit}>
        <h2>{modoEdicao ? 'Editar Ar-Condicionado' : 'Cadastrar Ar-Condicionado'}</h2>

        <label>Nº Patrimônio</label>
        <input type="text" name="nPatrimonio" value={formData.nPatrimonio} onChange={handleChange} required />

        <label>Nº Controle</label>
        <input type="text" name="nControle" value={formData.nControle} onChange={handleChange} />

        <label>Nº Série</label>
        <input type="text" name="numeroSerie" value={formData.numeroSerie} onChange={handleChange} required />

        <label>Marca</label>
        <input type="text" name="marca" value={formData.marca} onChange={handleChange} required />

        <label>Modelo</label>
        <input type="text" name="modelo" value={formData.modelo} onChange={handleChange} />

        <label>BTUs</label>
        <input type="text" name="BTUS" value={formData.BTUS} onChange={handleChange} required />

        <label>Tipo de Equipamento</label>
        <select name="tipoEquipamentoId" value={formData.tipoEquipamentoId} onChange={handleChange}>
          <option value="">Selecione um tipo de equipamento</option>
          {tiposEquipamentos.map((tipo) => (
            <option key={tipo.id} value={tipo.id}>
              {tipo.nome}
            </option>
          ))}
        </select>

        <label>Setor</label>
        <select name="setorId" value={formData.setorId} onChange={handleChange}>
          <option value="">Selecione um setor</option>
          {setores.map((setor) => (
            <option key={setor.id} value={setor.id}>
              {setor.nome}
            </option>
          ))}
        </select>

        <label>Localização</label>
        <select name="localizacaoId" value={formData.localizacaoId} onChange={handleChange}>
          <option value="">Selecione uma localização</option>
          {localizacoesFiltradas.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.nome}
            </option>
          ))}
        </select>

        <label>Observações</label>
        <textarea name="obs" value={formData.obs} onChange={handleChange} />

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