// src/pages/OsChamado.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/OsChamado.css';
import api from '../config/api';

function OsChamado() {
  const [ordens, setOrdens] = useState([]);
  const [filteredOrdens, setFilteredOrdens] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const statusOptions = [
    { value: '', label: 'Todos' },
    { value: 'ABERTA', label: 'Aberta' },
    { value: 'EM_ANDAMENTO', label: 'Em Andamento' },
    { value: 'CONCLUIDA', label: 'Concluída' },
  ];

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await api.get('/os', {
          withCredentials: true,
        });
        setOrdens(response.data);
        setFilteredOrdens(response.data);
      } catch (error) {
        console.error('Erro ao buscar ordens de serviço:', error);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    const filtered = ordens.filter((ordem) => {
      const matchesSearch = ordem.descricao
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus ? ordem.status === filterStatus : true;
      return matchesSearch && matchesStatus;
    });
    setFilteredOrdens(filtered);
    setCurrentPage(1); 
  }, [searchTerm, filterStatus, ordens]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilterChange = (e) => {
    setFilterStatus(e.target.value);
  };

  const totalPages = Math.ceil(filteredOrdens.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredOrdens.slice(indexOfFirstItem, indexOfLastItem);

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="os-chamado-page">
      <h1 className="os-chamado-title">Ordens de Serviço</h1>

      <div className="os-chamado-actions">
        <div className="filter-controls">
          <input
            type="text"
            placeholder="Pesquisar por descrição..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
          <select
            value={filterStatus}
            onChange={handleStatusFilterChange}
            className="status-filter"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <table className="os-chamado-table">
        <thead>
          <tr>
            <th>Descrição</th>
            <th>Tipo de Equipamento</th>
            <th>Técnico</th>
            <th>Status</th>
            <th>Setor</th>
            <th>Solicitante</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((item) => (
            <tr key={item.id}>
              <td>{item.descricao}</td>
              <td>{item.tipoEquipamento?.nome || '-'}</td>
              <td>{item.tecnico?.nome || '-'}</td>
              <td>{item.status}</td>
              <td>{item.Setor?.nome || '-'}</td>
              <td>{item.solicitante?.nome || '-'}</td>
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

export default OsChamado;