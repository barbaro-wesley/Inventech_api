
import { useState } from 'react';
import axios from 'axios';
import '../styles/EquipamentosMedicosForm.css';

function EquipamentosMedicosForm({ onClose, onSubmit }) {
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/equipamentos-medicos', {
        ...formData,
        valorCompra: formData.valorCompra ? parseFloat(formData.valorCompra) : null,
        dataCompra: formData.dataCompra || null,
        inicioGarantia: formData.inicioGarantia || null,
        terminoGarantia: formData.terminoGarantia || null,
        setorId: formData.setorId ? parseInt(formData.setorId) : null,
        localizacaoId: formData.localizacaoId ? parseInt(formData.localizacaoId) : null,
        tipoEquipamentoId: formData.tipoEquipamentoId ? parseInt(formData.tipoEquipamentoId) : null,
      });
      onSubmit(response.data);
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
      console.error('Erro ao cadastrar equipamento médico:', error);
    }
  };

  return (
    <div className="form-container">
      <div className="equip-form">
        <h2>Cadastrar Equipamento Médico</h2>
        <form onSubmit={handleSubmit}>
          <table className="form-table">
            <tbody>
              <tr>
                <td><label>Nº Patrimônio</label></td>
                <td><input type="text" name="numeroPatrimonio" value={formData.numeroPatrimonio} onChange={handleChange} /></td>
              </tr>
              <tr>
                <td><label>Identificação</label></td>
                <td><input type="text" name="Identificação" value={formData.Identificação} onChange={handleChange} /></td>
              </tr>
              <tr>
                <td><label>Nº Série</label></td>
                <td><input type="text" name="numeroSerie" value={formData.numeroSerie} onChange={handleChange} /></td>
              </tr>
              <tr>
                <td><label>Nº Anvisa</label></td>
                <td><input type="text" name="numeroAnvisa" value={formData.numeroAnvisa} onChange={handleChange} /></td>
              </tr>
              <tr>
                <td><label>Nome do Equipamento</label></td>
                <td><input type="text" name="nomeEquipamento" value={formData.nomeEquipamento} onChange={handleChange} required /></td>
              </tr>
              <tr>
                <td><label>Modelo</label></td>
                <td><input type="text" name="modelo" value={formData.modelo} onChange={handleChange} /></td>
              </tr>
              <tr>
                <td><label>Fabricante</label></td>
                <td><input type="text" name="Fabricante" value={formData.Fabricante} onChange={handleChange} /></td>
              </tr>
              <tr>
                <td><label>Valor de Compra</label></td>
                <td><input type="number" step="0.01" name="valorCompra" value={formData.valorCompra} onChange={handleChange} /></td>
              </tr>
              <tr>
                <td><label>Data de Compra</label></td>
                <td><input type="date" name="dataCompra" value={formData.dataCompra} onChange={handleChange} /></td>
              </tr>
              <tr>
                <td><label>Início da Garantia</label></td>
                <td><input type="date" name="inicioGarantia" value={formData.inicioGarantia} onChange={handleChange} /></td>
              </tr>
              <tr>
                <td><label>Término da Garantia</label></td>
                <td><input type="date" name="terminoGarantia" value={formData.terminoGarantia} onChange={handleChange} /></td>
              </tr>
              <tr>
                <td><label>Nota Fiscal</label></td>
                <td><input type="text" name="notaFiscal" value={formData.notaFiscal} onChange={handleChange} /></td>
              </tr>
              <tr>
                <td><label>Observações</label></td>
                <td><textarea name="obs" value={formData.obs} onChange={handleChange} /></td>
              </tr>
              <tr>
                <td><label>Setor (ID)</label></td>
                <td><input type="number" name="setorId" value={formData.setorId} onChange={handleChange} /></td>
              </tr>
              <tr>
                <td><label>Localização (ID)</label></td>
                <td><input type="number" name="localizacaoId" value={formData.localizacaoId} onChange={handleChange} /></td>
              </tr>
              <tr>
                <td><label>Tipo de Equipamento (ID)</label></td>
                <td><input type="number" name="tipoEquipamentoId" value={formData.tipoEquipamentoId} onChange={handleChange} /></td>
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