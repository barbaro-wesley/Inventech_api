// src/components/FormPc.jsx
import { useState } from "react";
import "../styles/PcPage.css";

function FormPc({ onClose }) {
  const [formData, setFormData] = useState({
    nPatrimonio: "",
    nomePC: "",
    ip: "",
    sistemaOperacional: "",
    setorId: "",
    localizacaoId: "",
    tipoEquipamentoId: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Enviando dados:", formData);
    onClose();
  };

  return (
    <div className="form-container">
      <form className="pc-form" onSubmit={handleSubmit}>
        <h2>Cadastrar Computador</h2>

        <label>Nº Patrimônio</label>
        <input type="text" name="nPatrimonio" value={formData.nPatrimonio} onChange={handleChange} required />

        <label>Nome do PC</label>
        <input type="text" name="nomePC" value={formData.nomePC} onChange={handleChange} required />

        <label>IP</label>
        <input type="text" name="ip" value={formData.ip} onChange={handleChange} required />

        <label>Sistema Operacional</label>
        <input type="text" name="sistemaOperacional" value={formData.sistemaOperacional} onChange={handleChange} required />

        <label>Setor (ID)</label>
        <input type="number" name="setorId" value={formData.setorId} onChange={handleChange} required />

        <label>Localização (ID)</label>
        <input type="number" name="localizacaoId" value={formData.localizacaoId} onChange={handleChange} required />

        <label>Tipo de Equipamento (ID)</label>
        <input type="number" name="tipoEquipamentoId" value={formData.tipoEquipamentoId} onChange={handleChange} required />

        <div className="form-buttons">
          <button type="submit" className="btn-submit">Salvar</button>
          <button type="button" className="btn-cancel" onClick={onClose}>Cancelar</button>
        </div>
      </form>
    </div>
  );
}

export default FormPc;
