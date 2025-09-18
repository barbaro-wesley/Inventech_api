import React, { useState, useEffect } from 'react';
import HcrMobiliaForm from '../forms/HcrMobiliaForm';
import api from '../config/api';
import '../styles/HcrMobiliaPage.css'; 
import PopUpMobilia from '../popups/PopUpMobilia';
import { FaEye } from 'react-icons/fa';

const HcrMobiliaPage = () => {
  const [mobilias, setMobilias] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [filtro, setFiltro] = useState('');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const registrosPorPagina = 10;

  const [mobiliaSelecionada, setMobiliaSelecionada] = useState(null);

  const carregarMobilias = async () => {
    try {
      const res = await api.get('/hcr-mobilia');
      setMobilias(res.data);
    } catch (error) {
      console.error('Erro ao carregar mobilias:', error);
    }
  };

  useEffect(() => {
    carregarMobilias();
  }, []);

  const handleSuccess = () => {
    setShowForm(false);
    carregarMobilias();
  };

  const mobiliasFiltradas = mobilias.filter(m =>
    m.nome.toLowerCase().includes(filtro.toLowerCase()) ||
    m.nPatrimonio.toLowerCase().includes(filtro.toLowerCase())
  );

  // Cálculo da paginação
  const indiceInicial = (paginaAtual - 1) * registrosPorPagina;
  const indiceFinal = indiceInicial + registrosPorPagina;
  const mobiliasPaginadas = mobiliasFiltradas.slice(indiceInicial, indiceFinal);
  const totalPaginas = Math.ceil(mobiliasFiltradas.length / registrosPorPagina);

  return (
    <div className="equip-page">
      <h1 className="equip-title">Cadastro de Mobiliário</h1>

      <div className="equip-actions">
        <button className="btn-add" onClick={() => setShowForm(true)}>+ Adicionar</button>
        <div className="filter-bar">
          <input
            type="text"
            placeholder="Filtrar por nome ou patrimônio..."
            className="filter-input"
            value={filtro}
            onChange={e => {
              setFiltro(e.target.value);
              setPaginaAtual(1); // Reset para primeira página ao filtrar
            }}
          />
        </div>
      </div>

      <div className="table-container">
        <table className="equip-table">
          <thead>
            <tr>
              <th>Nº Patrimônio</th>
              <th>Nome</th>
              <th>Estado</th>
              <th>Tipo</th>
              <th>Localização</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {mobiliasPaginadas.length > 0 ? (
              mobiliasPaginadas.map(m => (
                <tr key={m.id}>
                  <td>{m.nPatrimonio}</td>
                  <td>{m.nome}</td>
                  <td>{m.estado}</td>
                  <td>{m.tipoEquipamento?.nome}</td>
                  <td>{m.localizacao?.nome}</td>
                  <td>
                    <button
                      className="btn-view"
                      onClick={() => setMobiliaSelecionada(m)}
                    >
                      <FaEye />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center' }}>Nenhum registro encontrado</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      {totalPaginas > 1 && (
        <div className="pagination">
          <button 
            onClick={() => setPaginaAtual(prev => Math.max(prev - 1, 1))}
            disabled={paginaAtual === 1}
          >
            Anterior
          </button>
          <span>Página {paginaAtual} de {totalPaginas}</span>
          <button 
            onClick={() => setPaginaAtual(prev => Math.min(prev + 1, totalPaginas))}
            disabled={paginaAtual === totalPaginas}
          >
            Próxima
          </button>
        </div>
      )}

      {/* Popup */}
      {mobiliaSelecionada && (
        <PopUpMobilia
          mobilia={mobiliaSelecionada}
          onClose={() => setMobiliaSelecionada(null)}
        />
      )}

      {showForm && (
        <div className="form-container">
          <HcrMobiliaForm
            onSuccess={handleSuccess}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}
    </div>
  );
};

export default HcrMobiliaPage;
