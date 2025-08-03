import { useState, useEffect } from 'react';
import axios from 'axios';
import EquipamentosMedicosForm from '../forms/EquipamentosMedicosForm';
import PopupEquip from '../popups/Popup';
import { FaEdit, FaEye } from 'react-icons/fa';
import "../styles/EquipamentosMedicosPage.css"
import api from '../config/api';

function EquipamentosMedicosPage() {
  const [showForm, setShowForm] = useState(false);
  const [equipamentos, setEquipamentos] = useState([]);
  const [filteredEquipamentos, setFilteredEquipamentos] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [editMode, setEditMode] = useState(false);
  const [equipamentoParaEditar, setEquipamentoParaEditar] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [equipamentoParaVisualizar, setEquipamentoParaVisualizar] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const itemsPerPage = 10;

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await api.get('/equipamentos-medicos', {
          withCredentials: true,
        });
        setEquipamentos(response.data);
        setFilteredEquipamentos(response.data);
      } catch (error) {
      }
    }
    fetchData();
  }, []);

  const handleAddClick = () => {
    setShowForm(true);
  };

  const handleEditClick = (equipamento) => {
    setEquipamentoParaEditar(equipamento);
    setEditMode(true);
    setShowForm(true);
  };

  const handleViewClick = (equipamento) => {
    setEquipamentoParaVisualizar(equipamento);
    setShowDetailsModal(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editMode && equipamentoParaEditar) {
        const response = await api.put(
          `/equipamentos-medicos/${equipamentoParaEditar.id}`,
          formData,
          { withCredentials: true }
        );
        const updatedList = equipamentos.map((eq) =>
          eq.id === equipamentoParaEditar.id ? response.data : eq
        );
        setEquipamentos(updatedList);
        setFilteredEquipamentos(updatedList);
      } else {
        const updatedList = [...equipamentos, formData];
        setEquipamentos(updatedList);
        setFilteredEquipamentos(updatedList);
      }
      setShowForm(false);
      setEditMode(false);
      setEquipamentoParaEditar(null);
    } catch (error) {
    }
  };

  const handleFilterClick = () => {
    setShowFilter(!showFilter);
    setSearchTerm('');
    setFilteredEquipamentos(equipamentos);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    const lower = term.toLowerCase();
    const filtered = equipamentos.filter((item) =>
      (item.numeroPatrimonio && item.numeroPatrimonio.toLowerCase().includes(lower)) ||
      (item.numeroSerie && item.numeroSerie.toLowerCase().includes(lower))
    );
    setFilteredEquipamentos(filtered);
    setCurrentPage(1);
  };

  // Pagination
  const totalPages = Math.ceil(filteredEquipamentos.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredEquipamentos.slice(indexOfFirstItem, indexOfLastItem);

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="equip-page">
      <h1 className="equip-title">Gestão de Equipamentos</h1>

      <div className="equip-actions">
        <button className="btn-add" onClick={handleAddClick}>+ Adicionar</button>
        <button className="btn-filter" onClick={handleFilterClick}>
          {showFilter ? 'Fechar Filtro' : 'Filtro'}
        </button>
      </div>

      {showFilter && (
        <div className="filter-bar">
          <input
            type="text"
            placeholder="Buscar por Nº Patrimônio ou Nº Série"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="filter-input"
          />
        </div>
      )}

      {showForm && (
        <EquipamentosMedicosForm
          onClose={() => {
            setShowForm(false);
            setEditMode(false);
            setEquipamentoParaEditar(null);
          }}
          onSubmit={handleFormSubmit}
          initialData={equipamentoParaEditar}
        />
      )}

      {showDetailsModal && (
        <PopupEquip
          equipamento={equipamentoParaVisualizar}
          onClose={() => setShowDetailsModal(false)}
        />
      )}

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
              <th>Localização</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item) => (
              <tr key={item.id}>
                <td>{item.numeroPatrimonio || '-'}</td>
                <td>{item.identificacao || '-'}</td>
                <td>{item.numeroSerie || '-'}</td>
                <td>{item.nomeEquipamento}</td>
                <td>{item.modelo || '-'}</td>
                <td>{item.fabricante || '-'}</td>
                <td>{item.notaFiscal || '-'}</td>
                <td>{item.obs || '-'}</td>
                <td>{item.localizacao?.nome || '-'}</td>
                <td className="actions-cell">
                  <button className="btn-edit" onClick={() => handleEditClick(item)} title="Editar equipamento">
                    <FaEdit />
                  </button>
                  <button className="btn-view" onClick={() => handleViewClick(item)} title="Visualizar detalhes">
                    <FaEye />
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
