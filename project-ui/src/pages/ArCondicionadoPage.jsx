import { useState, useEffect } from 'react';
import axios from 'axios';
import ArCondicionadoForm from '../forms/ArCondicionadoForm';
import { FaEdit } from 'react-icons/fa';
import '../styles/ArCondicionadoPage.css';

function ArCondicionadoPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [arCondicionados, setArCondicionados] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get('http://localhost:5000/api/condicionadores', {
          withCredentials: true,
        });
        const validData = Array.isArray(response.data)
          ? response.data.filter(item => item && typeof item === 'object' && item.id)
          : [];
        setArCondicionados(validData);
        console.log('Dados recebidos da API:', validData);
      } catch (error) {
        console.error('Erro ao buscar ar-condicionados:', error);
        alert('Erro ao carregar os dados. Tente novamente.');
      }
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

  const handleFormSubmit = (savedItem) => {
    if (!savedItem || !savedItem.id) {
      console.error('Item inválido recebido no submit:', savedItem);
      alert('Erro ao salvar o item. Verifique os dados e tente novamente.');
      return;
    }
    if (editingItem) {
      setArCondicionados((prev) =>
        prev.map((ar) => (ar.id === savedItem.id ? savedItem : ar))
      );
    } else {
      setArCondicionados((prev) => [...prev, savedItem]);
    }
    setShowForm(false);
    setEditingItem(null);
  };

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
                  <td>
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