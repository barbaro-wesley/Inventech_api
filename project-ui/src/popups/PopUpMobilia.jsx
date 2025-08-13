import React from 'react';
import { FaTimes } from 'react-icons/fa';
import "./Styles/PopupEquip.css";

const PopUpMobilia = ({ mobilia, onClose }) => {
  if (!mobilia) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        
        <div className="modal-header">
          <h2>{mobilia.nome}</h2>
          <span>{mobilia.tipoEquipamento?.nome}</span>
          <button className="close-btn" onClick={onClose}><FaTimes /></button>
        </div>

        <div className="modal-content">
          <div className="section">
            <h3>Informações Gerais</h3>
            <div className="grid-container">
              <div className="grid-item">
                <strong>Nº Patrimônio:</strong>
                <span>{mobilia.nPatrimonio}</span>
              </div>
              <div className="grid-item">
                <strong>Estado:</strong>
                <span>{mobilia.estado}</span>
              </div>
              <div className="grid-item">
                <strong>Setor:</strong>
                <span>{mobilia.setor?.nome}</span>
              </div>
              <div className="grid-item">
                <strong>Localização:</strong>
                <span>{mobilia.localizacao?.nome}</span>
              </div>
            </div>
          </div>

          <div className="section">
            <h3>Detalhes Financeiros</h3>
            <div className="grid-container">
              <div className="grid-item">
                <strong>Valor de Compra:</strong>
                <span>R$ {mobilia.valorCompra?.toFixed(2) || '-'}</span>
              </div>
              <div className="grid-item">
                <strong>Data de Compra:</strong>
                <span>{mobilia.dataCompra ? new Date(mobilia.dataCompra).toLocaleDateString() : '-'}</span>
              </div>
              <div className="grid-item">
                <strong>Valor Atual:</strong>
                <span>R$ {mobilia.valorAtual?.toFixed(2) || '-'}</span>
              </div>
            </div>
          </div>

          <div className="section">
            <h3>Observações</h3>
            <p>{mobilia.obs || '-'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default PopUpMobilia;