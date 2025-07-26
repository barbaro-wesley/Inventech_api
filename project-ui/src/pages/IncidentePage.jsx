// src/pages/IncidentePage.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import IncidenteForm from '../forms/IncidenteForm';
import '../styles/IncidentePage.css';

function IncidentePage() {
  const [showForm, setShowForm] = useState(false);
  const [incidentes, setIncidentes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get('http://localhost:5000/api/incidentes');
        setIncidentes(response.data);
      } catch (error) {
        console.error('Erro ao buscar incidentes:', error);
      }
    }
    fetchData();
  }, []);

  const handleAddClick = () => {
    setShowForm(true);
  };

  const handleFormSubmit = (newIncidente) => {
    setIncidentes([...incidentes, newIncidente]);
    setShowForm(false);
  };

  // Pagination
  const totalPages = Math.ceil(incidentes.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = incidentes.slice(indexOfFirstItem, indexOfLastItem);

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1 ) };

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="incidente-page">
      <h1 className="incidente-title">Gestão de Incidentes</h1>

      <div className="incidente-actions">
        <button className="btn-add" onClick={handleAddClick}>+ Adicionar</button>
        <button className="btn-filter">Filtro</button>
      </div>

      {showForm && <IncidenteForm onClose={() => setShowForm(false)} onSubmit={handleFormSubmit} />}

      <table className="incidente-table">
        <thead>
          <tr>
            <th>Data</th>
            <th>Motivo</th>
            <th>Quem Relatou</th>
            <th>Local</th>
            <th>Descrição</th>
            <th>O que foi Feito</th>
            <th>Criado Em</th>
            <th>Atualizado Em</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((item) => (
            <tr key={item.id}>
              <td>{new Date(item.data).toLocaleDateString()} {new Date(item.data).toLocaleTimeString()}</td>
              <td>{item.motivo}</td>
              <td>{item.quemRelatou}</td>
              <td>{item.local}</td>
              <td>{item.descricao}</td>
              <td>{item.oQueFoiFeito}</td>
              <td>{new Date(item.criadoEm).toLocaleDateString()} {new Date(item.criadoEm).toLocaleTimeString()}</td>
              <td>{new Date(item.atualizadoEm).toLocaleDateString()} {new Date(item.atualizadoEm).toLocaleTimeString()}</td>
              <td>{/* Placeholder for future actions */}</td>
            </tr>
          ))}
        </tbody>
      </table>

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

export default IncidentePage;