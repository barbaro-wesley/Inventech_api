import { useState, useEffect } from 'react';
import { FaEdit } from 'react-icons/fa';
import PrinterForm from '../forms/PrinterForm';
import '../styles/PrinterPage.css';
import api from '../config/api';

function PrinterPage() {
  const [showForm, setShowForm] = useState(false);
  const [printers, setPrinters] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingPrinter, setEditingPrinter] = useState(null);
  const itemsPerPage = 10;

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await api.get('/printers', {
          withCredentials: true,
        });
        console.log('Resposta da API:', response.data);
        setPrinters(response.data);
      } catch (error) {
        console.error('Erro ao buscar impressoras:', error);
      }
    }

    fetchData();
  }, []);

  const handleAddClick = () => {
    setShowForm(true);
  };

  const handleFormSubmit = (savedPrinter) => {
    if (editingPrinter) {
      setPrinters((prev) =>
        prev.map((printer) => (printer.id === savedPrinter.id ? savedPrinter : printer))
      );
    } else {
      setPrinters((prev) => [...prev, savedPrinter]);
    }

    setEditingPrinter(null);
    setShowForm(false);
  };

  const handleEdit = (printer) => {
    setEditingPrinter(printer);
    setShowForm(true);
  };

  // Pagination
  const totalPages = Math.ceil(printers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = printers.slice(indexOfFirstItem, indexOfLastItem);

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="printer-page">
      <h1 className="printer-title">Gerenciamento de Impressoras</h1>

      <div className="printer-actions">
        <button className="btn-add" onClick={handleAddClick}>+ Adicionar</button>
        <button className="btn-filter">Filtro</button>
      </div>

      {showForm && (
        <PrinterForm
          onClose={() => {
            setShowForm(false);
            setEditingPrinter(null);
          }}
          onSubmit={handleFormSubmit}
          initialData={editingPrinter}
        />
      )}

      <table className="printer-table">
        <thead>
          <tr>
            <th>Nº Patrimônio</th>
            <th>Modelo</th>
            <th>IP</th>
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
              <td>{item.modelo}</td>
              <td>{item.ip}</td>
              <td>{item.localizacao?.nome || '-'}</td>
              <td>{item.setor?.nome || '-'}</td>
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

export default PrinterPage;