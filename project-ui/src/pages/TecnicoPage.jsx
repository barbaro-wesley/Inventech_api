// src/pages/TecnicoPage.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import TecnicoForm from '../forms/TecnicoForm';
import '../styles/TecnicoPage.css';
import api from '../config/api';

function TecnicoPage() {
  const [showForm, setShowForm] = useState(false);
  const [tecnicos, setTecnicos] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await api.get('/tecnicos',{
          withCredentials: true,
        });
        setTecnicos(response.data);
      } catch (error) {
        console.error('Erro ao buscar técnicos:', error);
      }
    }
    fetchData();
  }, []);

  const handleAddClick = () => {
    setShowForm(true);
  };

  const handleFormSubmit = (newTecnico) => {
    setTecnicos([...tecnicos, newTecnico]);
    setShowForm(false);
  };

  // Pagination
  const totalPages = Math.ceil(tecnicos.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = tecnicos.slice(indexOfFirstItem, indexOfLastItem);

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="tecnico-page">
      <h1 className="tecnico-title">Gestão de Técnicos</h1>

      <div className="tecnico-actions">
        <button className="btn-add" onClick={handleAddClick}>+ Adicionar</button>
        <button className="btn-filter">Filtro</button>
      </div>

      {showForm && <TecnicoForm onClose={() => setShowForm(false)} onSubmit={handleFormSubmit} />}

      <table className="tecnico-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Telefone</th>
            <th>Grupo</th>
            <th>CPF</th>
            <th>Matrícula</th>
            <th>Admissão</th>
            <th>Telegram Chat ID</th>
            <th>Ativo</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((item) => (
            <tr key={item.id}>
              <td>{item.nome}</td>
              <td>{item.email}</td>
              <td>{item.telefone}</td>
              <td>{item.grupo?.nome || '-'}</td>
              <td>{item.cpf}</td>
              <td>{item.matricula}</td>
              <td>{new Date(item.admissao).toLocaleDateString()}</td>
              <td>{item.telegramChatId || '-'}</td>
              <td>{item.ativo ? 'Sim' : 'Não'}</td>
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

export default TecnicoPage;