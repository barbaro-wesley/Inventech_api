// src/pages/ArCondicionadoPage.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import ArCondicionadoForm from '../forms/ArCondicionadoForm';
import '../styles/ArCondicionadoPage.css';

function ArCondicionadoPage() {
  const [showForm, setShowForm] = useState(false);
  const [arCondicionados, setArCondicionados] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get('http://localhost:5000/api/condicionadores');
        setArCondicionados(response.data);
      } catch (error) {
        console.error('Erro ao buscar ar-condicionados:', error);
      }
    }
    fetchData();
  }, []);

  const handleAddClick = () => {
    setShowForm(true);
  };

  const handleFormSubmit = (newArCondicionado) => {
    setArCondicionados([...arCondicionados, newArCondicionado]);
    setShowForm(false);
  };

  // Pagination
  const totalPages = Math.ceil(arCondicionados.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = arCondicionados.slice(indexOfFirstItem, indexOfLastItem);

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="pc-page">
      <h1 className="pc-title">Gestão de Ar-Condicionados</h1>

      <div className="pc-actions">
        <button className="btn-add" onClick={handleAddClick}>+ Adicionar</button>
        <button className="btn-filter">Filtro</button>
      </div>

      {showForm && <ArCondicionadoForm onClose={() => setShowForm(false)} onSubmit={handleFormSubmit} />}

      <table className="pc-table">
        <thead>
          <tr>
            <th>Nº Patrimônio</th>
            <th>Nº Série</th>
            <th>Marca</th>
            <th>Modelo</th>
            <th>BTUs</th>
            <th>Setor</th>
            <th>Localização</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((item) => (
            <tr key={item.id}>
              <td>{item.nPatrimonio}</td>
              <td>{item.numeroSerie}</td>
              <td>{item.marca}</td>
              <td>{item.modelo}</td>
              <td>{item.BTUs}</td>
              <td>{item.setor?.nome || '-'}</td>
              <td>{item.localizacao?.nome || '-'}</td>
              <td>{/* Placeholder for future actions (e.g., Edit, Delete) */}</td>
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

export default ArCondicionadoPage;