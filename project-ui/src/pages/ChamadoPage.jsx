// src/pages/ChamadoPage.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import ChamadoForm from '../forms/ChamadoForm';
import { toast } from 'react-toastify';
import '../styles/ChamadoPage.css';

function ChamadoPage() {
  const [showForm, setShowForm] = useState(false);
  const [chamados, setChamados] = useState([]);
  const [filtro, setFiltro] = useState('abertos'); 

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

 useEffect(() => {
  async function fetchData() {
    try {
      const response = await axios.get(`http://localhost:5000/api/chamados/status/${filtro}`,{
          withCredentials: true,
        });
      setChamados(response.data);
      setCurrentPage(1); // Reinicia para a página 1 sempre que muda o filtro
    } catch (error) {
      console.error('Erro ao buscar chamados:', error);
    }
  }
  fetchData();
}, [filtro]); // Executa toda vez que o filtro muda
  const alternarFiltro = () => {
  setFiltro((prevFiltro) => (prevFiltro === 'abertos' ? 'finalizados' : 'abertos'));
};
  const handleAddClick = () => {
    setShowForm(true);
  };

  const handleFormSubmit = (newChamado) => {
    setChamados([...chamados, newChamado]);
    setShowForm(false);
  };
  const finalizarChamado = async (id) => {
  try {
    await axios.put(`http://localhost:5000/api/chamados/${id}/finalizar`);
    
    // Atualiza os dados
    const response = await axios.get(`http://localhost:5000/api/chamados/status/${filtro}`);
    setChamados(response.data);

    // Notificação de sucesso
    toast.success('Chamado finalizado com sucesso!');
  } catch (error) {
    console.error('Erro ao finalizar chamado:', error);
    toast.error('Erro ao finalizar chamado.');
  }
};
  // Pagination
  const totalPages = Math.ceil(chamados.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = chamados.slice(indexOfFirstItem, indexOfLastItem);

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="chamado-page">
      <h1 className="chamado-title">Gestão de Chamados</h1>

      <div className="chamado-actions">
        <button className="btn-add" onClick={handleAddClick}>+ Adicionar</button>
        <button className="btn-filter" onClick={alternarFiltro}>
  {filtro === 'abertos' ? 'Ver Finalizados' : 'Ver Abertos'}
</button>
      </div>

      {showForm && <ChamadoForm onClose={() => setShowForm(false)} onSubmit={handleFormSubmit} />}

      <table className="chamado-table">
        <thead>
          <tr>
            <th>Número</th>
            <th>Descrição</th>
            <th>Status</th>
            <th>Data Criação</th>
            <th>Data Finalização</th>
            <th>Prioridade</th>
            <th>Sistema</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
  {currentItems.map((item) => (
    <tr key={item.id}>
      <td>{item.numero}</td>
      <td>{item.descricao}</td>
      <td>{item.status}</td>
      <td>{new Date(item.dataCriacao).toLocaleDateString()}</td>
      <td>{item.dataFinalizacao ? new Date(item.dataFinalizacao).toLocaleDateString() : '-'}</td>
      <td>{item.prioridade}</td>
      <td>{item.Sistema?.nome || '-'}</td>
      <td>
        {item.status !== 'Finalizado' && (
          <button onClick={() => finalizarChamado(item.id)} className="btn-finalizar">
            Finalizar
          </button>
        )}
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

export default ChamadoPage;