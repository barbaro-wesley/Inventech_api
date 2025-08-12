import { useState, useEffect } from 'react';
import api from '../config/api';
import '../styles/OsChamado.css';

function OsChamado() {
  const [preventivas, setPreventivas] = useState([]);
  const [corretivas, setCorretivas] = useState([]);
  const [filteredOrdens, setFilteredOrdens] = useState([]);
  const [activeTab, setActiveTab] = useState('corretivas'); // padrão corretivas
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

  // Busca dados da API
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await api.get('/os', { withCredentials: true });

        const prevList = Array.isArray(response.data.preventivas) ? response.data.preventivas : [];
        const corrList = Array.isArray(response.data.corretivas) ? response.data.corretivas : [];

        setPreventivas(prevList);
        setCorretivas(corrList);
      } catch (error) {
        console.error('Erro ao buscar ordens de serviço:', error);
      }
    }
    fetchData();
  }, []);

  // Atualiza lista filtrada ao trocar filtros ou aba
  useEffect(() => {
    const sourceList = activeTab === 'preventivas' ? preventivas : corretivas;

    const filtered = sourceList.filter((ordem) => {
      const matchesSearch = ordem.descricao
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus ? ordem.status === filterStatus : true;
      return matchesSearch && matchesStatus;
    });

    setFilteredOrdens(filtered);
    setCurrentPage(1);
  }, [searchTerm, filterStatus, activeTab, preventivas, corretivas]);

  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleStatusFilterChange = (e) => setFilterStatus(e.target.value);

  const totalPages = Math.ceil(filteredOrdens.length / itemsPerPage) || 1;
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

      {/* Abas */}
      <div className="tab-container">
        <button
          className={`tab-btn ${activeTab === 'corretivas' ? 'active' : ''}`}
          onClick={() => setActiveTab('corretivas')}
        >
          Corretivas
        </button>
        <button
          className={`tab-btn ${activeTab === 'preventivas' ? 'active' : ''}`}
          onClick={() => setActiveTab('preventivas')}
        >
          Preventivas
        </button>
      </div>
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
            <th>N.Ordem</th>
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
          {currentItems.length > 0 ? (
            currentItems.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.descricao}</td>
                <td>{item.tipoEquipamento?.nome || '-'}</td>
                <td>{item.tecnico?.nome || '-'}</td>
                <td>{item.status}</td>
                <td>{item.Setor?.nome || '-'}</td>
                <td>{item.solicitante?.nome || '-'}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">Nenhuma OS encontrada.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Paginação */}
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
