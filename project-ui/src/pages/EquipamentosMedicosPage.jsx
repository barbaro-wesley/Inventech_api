import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EquipamentosMedicosForm from '../forms/EquipamentosMedicosForm';
import PopupEquip from '../popups/Popup';
import OS from './OS';
import OSPreventiva from './OSPreventiva';
import { FaEdit, FaEye, FaCog } from 'react-icons/fa';
import "../styles/EquipamentosMedicosPage.css";
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
  const [showMaintenancePopup, setShowMaintenancePopup] = useState(false);
  const [selectedEquipamento, setSelectedEquipamento] = useState(null);
  const [showOSPopup, setShowOSPopup] = useState(false);
  const [showOSPreventivaPopup, setShowOSPreventivaPopup] = useState(false);
  const [osInitialData, setOSInitialData] = useState(null);
  const [showQRScanner, setShowQRScanner] = useState(false);

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
        console.error('Erro ao buscar equipamentos:', error);
      }
    }
    fetchData();
  }, []);

  const handleAddClick = () => {
    setShowForm(true);
  };
  const handleQRScan = (data) => {
  console.log("QR Code lido:", data);
  handleSearch(data);
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

  const handleMaintenanceClick = (equipamento) => {
    setSelectedEquipamento(equipamento);
    setShowMaintenancePopup(true);
  };

  const handleOptionClick = (tipo) => {
    setShowMaintenancePopup(false);
    if (tipo === 'Preventiva') {
      setOSInitialData({ equipamento: selectedEquipamento, preventiva: true });
      setShowOSPreventivaPopup(true);
    } else {
      setOSInitialData({ equipamento: selectedEquipamento, preventiva: false });
      setShowOSPopup(true);
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editMode && equipamentoParaEditar) {
        const updatedList = equipamentos.map((eq) =>
          eq.id === equipamentoParaEditar.id ? { ...eq, ...formData } : eq
        );
        setEquipamentos(updatedList);
        setFilteredEquipamentos(updatedList);
        if (equipamentoParaVisualizar?.id === equipamentoParaEditar.id) {
          setEquipamentoParaVisualizar({ ...equipamentoParaVisualizar, ...formData });
        }
      } else {
        const updatedList = [...equipamentos, formData];
        setEquipamentos(updatedList);
        setFilteredEquipamentos(updatedList);
      }
      setShowForm(false);
      setEditMode(false);
      setEquipamentoParaEditar(null);
    } catch (error) {
      console.error('Erro ao salvar equipamento:', error);
    }
  };

  const handleOSSubmit = (osData) => {
    console.log('OS submitted:', osData);
    setShowOSPopup(false);
    setShowOSPreventivaPopup(false);
    setOSInitialData(null);
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
      (item.nomeEquipamento && item.nomeEquipamento.toLowerCase().includes(lower))
    );
    setFilteredEquipamentos(filtered);
    setCurrentPage(1);
  };

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
            placeholder="Buscar por Nº Patrimônio ou Nome do Equipamento"
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
          onOptionClick={handleOptionClick}
        />
      )}

      {showMaintenancePopup && (
        <div className="maintenance-popup">
          <div className="maintenance-popup-content">
            <h3>Selecionar Tipo de Manutenção</h3>
            <button
              onClick={() => handleOptionClick('Corretiva')}
              className="btn-corretiva"
            >
              Corretiva
            </button>
            <button
              onClick={() => handleOptionClick('Preventiva')}
              className="btn-preventiva"
            >
              Preventiva
            </button>
            <button
              onClick={() => setShowMaintenancePopup(false)}
              className="btn-cancel"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {showOSPopup && (
        <div className="os-popup">
          <div className="os-popup-content">
            <button className="close-btn" onClick={() => setShowOSPopup(false)}>
              &times;
            </button>
            <OS
              initialData={osInitialData}
              onClose={() => setShowOSPopup(false)}
              onSubmit={handleOSSubmit}
            />
          </div>
        </div>
      )}

      {showOSPreventivaPopup && (
        <div className="os-popup">
          <div className="os-popup-content">
            <button className="close-btn" onClick={() => setShowOSPreventivaPopup(false)}>
              &times;
            </button>
            <OSPreventiva
              initialData={osInitialData}
              onClose={() => setShowOSPreventivaPopup(false)}
              onSubmit={handleOSSubmit}
            />
          </div>
        </div>
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
                <td>{item.localizacao?.nome || '-'}</td>
                <td className="actions-cell">
                  <button className="btn-edit" onClick={() => handleEditClick(item)} title="Editar equipamento">
                    <FaEdit />
                  </button>
                  <button className="btn-view" onClick={() => handleViewClick(item)} title="Visualizar detalhes">
                    <FaEye />
                  </button>
                  <button className="btn-maintenance" onClick={() => handleMaintenanceClick(item)} title="Manutenção">
                    <FaCog />
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