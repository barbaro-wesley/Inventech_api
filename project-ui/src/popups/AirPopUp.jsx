// src/components/AirPopUp.jsx
import React, { useRef } from 'react';
import { FaFilePdf } from 'react-icons/fa';
import api from '../config/api';
import "./Styles/PopupEquip.css";

const logoUrl = "/logo.png";

const AirPopUp = ({ equipamento, onClose }) => {
  const modalRef = useRef();
  if (!equipamento) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const handleOpenPdf = (filePath) => {
    const filename = filePath.split('\\').pop();
    const fileUrl = `${import.meta.env.VITE_API_URL2}/${filename.startsWith('uploads/') ? filename : `uploads/pdfs/${filename}`}`;
    window.open(fileUrl, '_blank');
  };

  const totalManutencao = equipamento.ordensServico
    ? equipamento.ordensServico.reduce((acc, os) => acc + Number(os.valorManutencao || 0), 0)
    : 0;

  return (
    <div className="modal-overlay">
      <div className="modal" ref={modalRef}>
        <div className="modal-header">
          <h2>Detalhes do Equipamento</h2>
          <div className="header-actions">
            <span className="data-cadastro">
              Data de Cadastro: {formatDate(equipamento.createdAt)}
            </span>
            <button className="close-btn" onClick={onClose}>&times;</button>
          </div>
        </div>

        <div className="modal-content">
          <div className="section">
            <h3>Dados Gerais</h3>
            <div className="grid-container">
              <div className="grid-item"><strong>Nº Patrimônio:</strong> <span>{equipamento.nPatrimonio || '-'}</span></div>
              <div className="grid-item"><strong>Nº Série:</strong> <span>{equipamento.numeroSerie || '-'}</span></div>
              <div className="grid-item"><strong>Marca:</strong> <span>{equipamento.marca || '-'}</span></div>
              <div className="grid-item"><strong>Modelo:</strong> <span>{equipamento.modelo || '-'}</span></div>
              <div className="grid-item"><strong>BTUs:</strong> <span>{equipamento.BTUS || '-'}</span></div>
              <div className="grid-item"><strong>Setor:</strong> <span>{equipamento.setor?.nome || '-'}</span></div>
              <div className="grid-item"><strong>Localização:</strong> <span>{equipamento.localizacao?.nome || '-'}</span></div>
              <div className="grid-item"><strong>OBS:</strong> <span>{equipamento.obs || '-'}</span></div>
            </div>
          </div>
          {equipamento.arquivos && equipamento.arquivos.length > 0 && (
            <div className="section">
              <h3>Anexos</h3>
              <div className="arquivos-container">
                {equipamento.arquivos.map((arquivo, index) => (
                  <div key={index} className="anexo-item">
                    <FaFilePdf className="pdf-icon" />
                    <span
                      onClick={() => handleOpenPdf(arquivo)}
                      className="anexo-link"
                    >
                      {arquivo.split('\\').pop()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {equipamento.ordensServico && equipamento.ordensServico.length > 0 && (
            <div className="section">
              <h3>Ordens de Serviço</h3>
              <div className="os-table-wrapper">
                <table className="os-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Descrição</th>
                      <th>Status</th>
                      <th>Valor da Manutenção</th>
                      <th>Anexos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {equipamento.ordensServico.map((os) => (
                      <tr key={os.id}>
                        <td>{os.id}</td>
                        <td>{os.descricao}</td>
                        <td>{os.status}</td>
                        <td>
                          {os.valorManutencao
                            ? new Intl.NumberFormat('pt-BR', {
                                style: 'currency',
                                currency: 'BRL',
                              }).format(Number(os.valorManutencao))
                            : '-'}
                        </td>
                        <td>
                          {os.arquivos && os.arquivos.length > 0 ? (
                            os.arquivos.map((arquivo, idx) => (
                              <FaFilePdf
                                key={idx}
                                className="pdf-icon"
                                style={{ cursor: 'pointer', marginRight: '8px' }}
                                onClick={() => handleOpenPdf(arquivo)}
                              />
                            ))
                          ) : (
                            '-'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <div className="section total-manutencao">
            <strong>Total Valor da Manutenção:</strong>{' '}
            <span>
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalManutencao)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AirPopUp;
