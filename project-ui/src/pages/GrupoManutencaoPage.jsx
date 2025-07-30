// src/pages/GrupoManutencaoPage.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import GrupoManutencaoForm from '../forms/GrupoManutencaoForm';
import '../styles/GrupoManutencaoPage.css';
import api from '../config/api';

function GrupoManutencaoPage() {
  const [showForm, setShowForm] = useState(false);
  const [grupos, setGrupos] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await api.get('/grupos-manutencao',{
          withCredentials: true,
        });
        setGrupos(response.data);
      } catch (error) {
        console.error('Erro ao buscar grupos de manutenção:', error);
      }
    }
    fetchData();
  }, []);

  const handleAddClick = () => {
    setShowForm(true);
  };

  const handleFormSubmit = (newGrupo) => {
    setGrupos([...grupos, newGrupo]);
    setShowForm(false);
  };

  // Pagination
  const totalPages = Math.ceil(grupos.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = grupos.slice(indexOfFirstItem, indexOfLastItem);

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="grupo-page">
      <h1 className="grupo-title">Gestão de Grupos de Manutenção</h1>

      <div className="grupo-actions">
        <button className="btn-add" onClick={handleAddClick}>+ Adicionar</button>
        <button className="btn-filter">Filtro</button>
      </div>

      {showForm && <GrupoManutencaoForm onClose={() => setShowForm(false)} onSubmit={handleFormSubmit} />}

      <table className="grupo-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Descrição</th>
            <th>Tipos de Equipamento</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((item) => (
            <tr key={item.id}>
              <td>{item.nome}</td>
              <td>{item.descricao || '-'}</td>
              <td>{item.tipos?.length > 0 ? item.tipos.map((tipo) => tipo.nome).join(', ') : '-'}</td>
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

export default GrupoManutencaoPage;