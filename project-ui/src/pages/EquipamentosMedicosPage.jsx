// src/pages/HcrEquipamentosMedicosPage.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import EquipamentosMedicosForm from '../forms/EquipamentosMedicosForm';
import "../styles/EquipamentosMedicosPage.css"

function EquipamentosMedicosPage() {
  const [showForm, setShowForm] = useState(false);
  const [equipamentos, setEquipamentos] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get('http://localhost:5000/api/equipamentos-medicos',{
          withCredentials: true,
        });
        setEquipamentos(response.data);
      } catch (error) {
        console.error('Erro ao buscar equipamentos médicos:', error);
      }
    }
    fetchData();
  }, []);

  const handleAddClick = () => {
    setShowForm(true);
  };

  const handleFormSubmit = (newEquipamento) => {
    setEquipamentos([...equipamentos, newEquipamento]);
    setShowForm(false);
  };

  // Pagination
  const totalPages = Math.ceil(equipamentos.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = equipamentos.slice(indexOfFirstItem, indexOfLastItem);

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="equip-page">
      <h1 className="equip-title">Gestão de Equipamentos Médicos</h1>

      <div className="equip-actions">
        <button className="btn-add" onClick={handleAddClick}>+ Adicionar</button>
        <button className="btn-filter">Filtro</button>
      </div>

      {showForm && <EquipamentosMedicosForm onClose={() => setShowForm(false)} onSubmit={handleFormSubmit} />}

   <div className="table-container">
  <table className="equip-table">
    <thead>
      <tr>
        <th>Nº Patrimônio</th>
        <th>Identificação</th>
        <th>Nº Série</th>
        <th>Nome Equipamento</th>
        <th>Modelo</th>
        <th>Fabricante</th>
        <th>Nota Fiscal</th>
        <th>Obs</th>
        <th>Setor</th>
        <th>Localização</th>
        <th>Ações</th>
      </tr>
    </thead>
    <tbody>
      {currentItems.map((item) => (
        <tr key={item.id}>
          <td>{item.numeroPatrimonio || '-'}</td>
          <td>{item.Identificação || '-'}</td>
          <td>{item.numeroSerie || '-'}</td>
          <td>{item.nomeEquipamento}</td>
          <td>{item.modelo || '-'}</td>
          <td>{item.Fabricante || '-'}</td>
          <td>{item.notaFiscal || '-'}</td>
          <td>{item.obs || '-'}</td>
          <td>{item.setor?.nome || '-'}</td>
          <td>{item.localizacao?.nome || '-'}</td>
          <td>
            <button style={{ padding: "4px 8px", fontSize: "0.9rem" }}>
              Editar
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
      <div className="pagination-controls">
        <button onClick={goToPrevPage} disabled={currentPage === 1}>
          Anterior
        </button>
        <span>
          Página {currentPage} de {totalPages}
        </span>
        <button onClick={goToNextPage} disabled={currentPage === totalPages}>
          Próxima
        </button>
      </div>
    </div>
  );
}

export default EquipamentosMedicosPage;