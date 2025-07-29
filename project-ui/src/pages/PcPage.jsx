// src/pages/PcPage.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit } from 'react-icons/fa';
import FormPc from '../forms/FormPc';
import '../styles/PcPage.css';

function PcPage() {
  const [showForm, setShowForm] = useState(false);
  const [computadores, setComputadores] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingPc, setEditingPc] = useState(null);
  const itemsPerPage = 10;

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get('http://localhost:5000/api/hcr-computers', {
          withCredentials: true,
        });
        setComputadores(response.data);
      } catch (error) {
        console.error('Erro ao buscar computadores:', error);
      }
    }
    fetchData();
  }, []);

  const handleAddClick = () => {
    setShowForm(true);
  };

  const handleFormSubmit = (savedPc) => {
  if (editingPc) {
    setComputadores((prev) =>
      prev.map((pc) => (pc.id === savedPc.id ? savedPc : pc))
    );
  } else {
    setComputadores((prev) => [...prev, savedPc]);
  }

  setEditingPc(null);
  setShowForm(false);
};

  const handleEdit = (pc) => {
  setEditingPc(pc);
  setShowForm(true);
};

  // Pagination
  const totalPages = Math.ceil(computadores.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = computadores.slice(indexOfFirstItem, indexOfLastItem);

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="pc-page">
      <h1 className="pc-title">Gestão de Computadores</h1>

      <div className="pc-actions">
        <button className="btn-add" onClick={handleAddClick}>+ Adicionar</button>
        <button className="btn-filter">Filtro</button>
      </div>
      {showForm && (
  <FormPc
    onClose={() => {
      setShowForm(false);
      setEditingPc(null);
    }}
    onSubmit={handleFormSubmit}
    initialData={editingPc}
  />
)}
      <table className="pc-table">
        <thead>
          <tr>
            <th>Nº Patrimônio</th>
            <th>Nome do PC</th>
            <th>IP</th>
            <th>Sistema Operacional</th>
            <th>Localização</th>
            <th>Setor</th>
            <th>Tipo de Equipamento</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
  {currentItems.map((item) => (
    <tr key={item.id}>
      <td>{item.nPatrimonio}</td>
      <td>{item.nomePC}</td>
      <td>{item.ip}</td>
      <td>{item.sistemaOperacional}</td>
      <td>{item.localizacao?.nome || '-'}</td>
      <td>{item.localizacao?.setor?.nome || '-'}</td>
      <td>{item.tipoEquipamento?.nome || '-'}</td>
      <td>
        <button className="btn-edit" onClick={() => handleEdit(item)}>
          <FaEdit />
        </button>
      </td>
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

export default PcPage;