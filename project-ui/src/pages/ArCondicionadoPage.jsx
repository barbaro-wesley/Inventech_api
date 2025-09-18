import { useState, useEffect } from 'react';
import { FaEdit, FaEye } from 'react-icons/fa';
import ArCondicionadoForm from '../forms/ArCondicionadoForm';
import AirPopUp from '../popups/AirPopUp';
import '../styles/ArCondicionadoPage.css';
import api from '../config/api';

function ArCondicionadoPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);
  const [arCondicionados, setArCondicionados] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilter, setShowFilter] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 10;

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await api.get('/condicionadores', { withCredentials: true });
        const validData = Array.isArray(response.data)
          ? response.data.filter(item => item && typeof item === 'object' && item.id)
          : [];
        setArCondicionados(validData);
        setFilteredList(validData);
      } catch (error) {}
    }
    fetchData();
  }, []);

  const handleAddClick = () => {
    setEditingItem(null);
    setShowForm(true);
  };

  const handleEditClick = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleViewClick = (item) => {
    setViewingItem(item);
  };

  const handleFormSubmit = (savedItem) => {
    if (!savedItem || !savedItem.id) return;

    let updatedList;
    if (editingItem) {
      updatedList = arCondicionados.map((ar) =>
        ar.id === savedItem.id ? savedItem : ar
      );
    } else {
      updatedList = [...arCondicionados, savedItem];
    }
    setArCondicionados(updatedList);
    setFilteredList(updatedList);
    setShowForm(false);
    setEditingItem(null);
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    const lowerValue = value.toLowerCase();
    const filtered = arCondicionados.filter((item) =>
      item.nPatrimonio?.toString().toLowerCase().includes(lowerValue) ||
      item.marca?.toLowerCase().includes(lowerValue)
    );
    setFilteredList(filtered);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredList.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredList.slice(indexOfFirstItem, indexOfLastItem);

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
        <button className="btn-filter" onClick={() => setShowFilter(!showFilter)}>Filtro</button>
      </div>

      {showFilter && (
        <input
          type="text"
          placeholder="Buscar por Nº Patrimônio ou Marca..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="filter-input"
        />
      )}

      {showForm && (
        <ArCondicionadoForm
          onClose={() => {
            setShowForm(false);
            setEditingItem(null);
          }}
          onSubmit={handleFormSubmit}
          initialData={editingItem}
        />
      )}

      {viewingItem && (
        <AirPopUp
          equipamento={viewingItem}
          onClose={() => setViewingItem(null)}
        />
      )}

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
            <th>Obs</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.length > 0 ? (
            currentItems.map((item) =>
              item && item.id ? (
                <tr key={item.id}>
                  <td>{item.nPatrimonio || '-'}</td>
                  <td>{item.numeroSerie || '-'}</td>
                  <td>{item.marca || '-'}</td>
                  <td>{item.modelo || '-'}</td>
                  <td>{item.BTUS || '-'}</td>
                  <td>{item.setor?.nome || '-'}</td>
                  <td>{item.localizacao?.nome || '-'}</td>
                  <td>{item.obs || '-'}</td>
                  <td className="acoes">
                    <button
                      className="btn-view"
                      onClick={() => handleViewClick(item)}
                      title="Visualizar equipamento"
                    >
                      <FaEye />
                    </button>
                    <button
                      className="btn-edit"
                      onClick={() => handleEditClick(item)}
                      title="Editar equipamento"
                    >
                      <FaEdit />
                    </button>
                  </td>
                </tr>
              ) : null
            )
          ) : (
            <tr>
              <td colSpan="9">Nenhum ar-condicionado encontrado.</td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="pagination-controls">
        <button onClick={goToPrevPage} disabled={currentPage === 1}>
          Anterior
        </button>
        <span>
          Página {currentPage} de {totalPages || 1}
        </span>
        <button onClick={goToNextPage} disabled={currentPage === totalPages}>
          Próxima
        </button>
      </div>
    </div>
  );
}

export default ArCondicionadoPage;
