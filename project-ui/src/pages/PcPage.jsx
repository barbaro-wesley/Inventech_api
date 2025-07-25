// src/pages/PcPage.jsx
import { useEffect, useState } from "react";
import FormPc from "../forms/FormPc";
import axios from "axios";
import "../styles/PcPage.css";

function PcPage() {
  const [showForm, setShowForm] = useState(false);
  const [computers, setComputers] = useState([]);

  const handleAddClick = () => {
    setShowForm(true);
  };

  useEffect(() => {
    async function fetchComputers() {
      try {
        const response = await axios.get("http://localhost:5000/api/hcr-computers");
        setComputers(response.data); // Certifique-se que o retorno da API seja um array
      } catch (error) {
        console.error("Erro ao buscar computadores:", error);
      }
    }

    fetchComputers();
  }, []);

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
  {computers.map((pc) => (
    <tr key={pc.id}>
      <td>{pc.nPatrimonio}</td>
      <td>{pc.nomePC}</td>
      <td>{pc.ip}</td>
      <td>{pc.setor?.nome}</td>
      <td>{pc.localizacao?.nome}</td>
      <td>
        <button className="btn-acao">Editar</button>
        <button className="btn-acao">Excluir</button>
      </td>
    </tr>
  ))}
</tbody>
      </table>
    </div>
  );
}

export default PcPage;
