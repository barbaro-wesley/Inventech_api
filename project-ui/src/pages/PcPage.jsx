// src/pages/PcPage.jsx
import { useState } from "react";
import  FormPc  from "../forms/FormPc";
import "../styles/PcPage.css";

function PcPage() {
  const [showForm, setShowForm] = useState(false);

  const handleAddClick = () => {
    setShowForm(true);
  };

  return (
    <div className="pc-page">
      <h1 className="pc-title">Gestão de Computadores</h1>

      <div className="pc-actions">
        <button className="btn-add" onClick={handleAddClick}>+ Adicionar</button>
        <button className="btn-filter">Filtro</button>
      </div>

      {showForm && <FormPc onClose={() => setShowForm(false)} />}

      <table className="pc-table">
        <thead>
          <tr>
            <th>Nº Patrimônio</th>
            <th>Nome do PC</th>
            <th>IP</th>
            <th>Setor</th>
            <th>Localização</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {/* Aqui vão as linhas dinamicamente futuramente */}
        </tbody>
      </table>
    </div>
  );
}

export default PcPage;
