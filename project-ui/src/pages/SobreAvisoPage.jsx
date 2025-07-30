// src/pages/SobreAvisoPage.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import SobreAvisoForm from '../forms/SobreAvisoForm';
import '../styles/SobreAvisoPage.css';
import api from '../config/api';

function SobreAvisoPage() {
  const [showForm, setShowForm] = useState(false);
  const [sobreAvisos, setSobreAvisos] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await api.get('/sobreaviso',{
          withCredentials: true,
        });
        setSobreAvisos(response.data);
      } catch (error) {
        console.error('Erro ao buscar sobre avisos:', error);
      }
    }
    fetchData();
  }, []);

  const handleAddClick = () => {
    setShowForm(true);
  };

  const handleFormSubmit = (newSobreAviso) => {
    setSobreAvisos([...sobreAvisos, newSobreAviso]);
    setShowForm(false);
  };

  // Pagination
  const totalPages = Math.ceil(sobreAvisos.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sobreAvisos.slice(indexOfFirstItem, indexOfLastItem);

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="sobreaviso-page">
      <h1 className="sobreaviso-title">Gestão de Sobre Avisos</h1>

      <div className="sobreaviso-actions">
        <button className="btn-add" onClick={handleAddClick}>+ Adicionar</button>
        <button className="btn-filter">Filtro</button>
      </div>

      {showForm && <SobreAvisoForm onClose={() => setShowForm(false)} onSubmit={handleFormSubmit} />}

      <table className="sobreaviso-table">
        <thead>
          <tr>
            <th>Data</th>
            <th>Hora Início</th>
            <th>Hora Fim</th>
            <th>Motivo</th>
            <th>A Ser Feito</th>
            <th>Observações</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((item, index) => (
            <tr key={index}>
              <td>{new Date(item.data).toLocaleDateString()}</td>
              <td>{new Date(item.horaInicio).toLocaleTimeString()}</td>
              <td>{new Date(item.horaFim).toLocaleTimeString()}</td>
              <td>{item.motivo}</td>
              <td>{item.aSerFeito}</td>
              <td>{item.observacoes || '-'}</td>
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

export default SobreAvisoPage;