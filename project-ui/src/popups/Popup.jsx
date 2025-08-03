import React, { useRef } from 'react';
import { FaFilePdf, FaPrint } from 'react-icons/fa';
import api from '../config/api';
import "./Styles/PopupEquip.css";

const logoUrl = "/logo.png";
const PopupEquip = ({ equipamento, onClose }) => {
  const modalRef = useRef();    // usado na tela
  if (!equipamento) return null;
   const printRef = useRef();

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const handleOpenPdf = (filePath) => {
    const filename = filePath.split('\\').pop();
    const fileUrl = `${import.meta.env.VITE_API_URL2}/uploads/pdfs/${filename}`;
    window.open(fileUrl, '_blank');
  };
const handlePrint = () => {
  // Get current date and time for "Hora da impressão"
  const currentDate = new Date().toLocaleString('pt-BR');

  // Replace placeholders in the HTML template with equipamento data
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .print-container { width: 100%; max-width: 800px; margin: auto; padding: 20px; box-sizing: border-box; }
            .print-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #ccc; padding-bottom: 10px; }
            .print-header p { margin: 0; font-size: 12px; }
            .print-header img { max-height: 50px; }
            .print-title { font-size: 18px; color: #333; margin-top: 20px; margin-bottom: 10px; border-bottom: 2px solid #333; padding-bottom: 5px; }
            .print-section { margin-bottom: 20px; }
            .print-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
            .print-item { font-size: 14px; line-height: 1.5; }
            .print-item strong { display: block; margin-bottom: 5px; }
            .full-width { grid-column: 1 / -1; }
            .arquivos-container { display: flex; flex-direction: column; }
        </style>
    </head>
    <body>
        <div class="print-container">
            <div class="print-header">
                <div class="header-logo">
                    <img src="${logoUrl}" alt="Logo da Empresa" onerror="this.style.display='none';" />
                </div>
            </div>

            <h2 class="print-title">Dados do Equipamento</h2>
            <div class="print-section">
                <div class="print-grid">
                    <div class="print-item"><strong>Identificação:</strong> <span>${equipamento.identificacao || '-'}</span></div>
                    <div class="print-item"><strong>Equipamento:</strong> <span>${equipamento.nomeEquipamento || '-'}</span></div>
                    <div class="print-item"><strong>Nº Anvisa:</strong> <span>${equipamento.numeroAnvisa || '-'}</span></div>
                    <div class="print-item"><strong>Fabricante:</strong> <span>${equipamento.fabricante || '-'}</span></div>
                    <div class="print-item"><strong>Modelo:</strong> <span>${equipamento.modelo || '-'}</span></div>
                    <div class="print-item"><strong>Nº Série:</strong> <span>${equipamento.numeroSerie || '-'}</span></div>
                    <div class="print-item"><strong>Nº Patrimônio:</strong> <span>${equipamento.numeroPatrimonio || '-'}</span></div>
                </div>
            </div>
            
            <h3 class="print-title">Dados da Compra</h3>
            <div class="print-section">
                <div class="print-grid">
                    <div class="print-item"><strong>Valor da Compra:</strong> <span>R$ ${equipamento.valorCompra ? equipamento.valorCompra.toFixed(2) : '0.00'}</span></div>
                    <div class="print-item"><strong>Data da Compra:</strong> <span>${formatDate(equipamento.dataCompra)}</span></div>
                    <div class="print-item"><strong>NF:</strong> <span>${equipamento.notaFiscal || '-'}</span></div>
                    <div class="print-item"><strong>Início da Garantia:</strong> <span>${formatDate(equipamento.inicioGarantia)}</span></div>
                    <div class="print-item"><strong>Fim da Garantia:</strong> <span>${formatDate(equipamento.terminoGarantia)}</span></div>
                    <div class="print-item full-width"><strong>OBS:</strong> <span>${equipamento.obs || '-'}</span></div>
                </div>
            </div>
            
            <h3 class="print-title">Informações Adicionais</h3>
            <div class="print-section">
                <div class="print-grid">
                    <div class="print-item"><strong>Setor:</strong> <span>${equipamento.setor?.nome || '-'}</span></div>
                    <div class="print-item"><strong>Localização:</strong> <span>${equipamento.localizacao?.nome || '-'}</span></div>
                    <div class="print-item"><strong>Tipo de Equipamento:</strong> <span>${equipamento.tipoEquipamento?.nome || '-'}</span></div>
                </div>
            </div>
            
            
        </div>
    </body>
    </html>
  `;

  // Open a new window and print the content
  const newWindow = window.open('', '', 'width=800,height=600');
  newWindow.document.write(htmlContent);
  newWindow.document.close();
  newWindow.focus();
  newWindow.print();
  newWindow.close();
};

  return (
    <>
      <div className="modal-overlay">
        <div className="modal" ref={modalRef}>
          <div className="modal-header">
            <h2>Informações do Equipamento</h2>
            <div className="header-actions">
              <button className="print-btn" onClick={() => handlePrint()}>
                <FaPrint />
              </button>
              <span className="data-cadastro">Data de Cadastro: {formatDate(equipamento.createdAt)}</span>
              <button className="close-btn" onClick={onClose}>&times;</button>
            </div>
          </div>
          <div className="modal-content">
            <div className="section">
              <h3>Dados Gerais</h3>
              <div className="grid-container">
                <div className="grid-item">
                  <strong>Identificação:</strong>
                  <span>{equipamento.identificacao || '-'}</span>
                </div>
                <div className="grid-item">
                  <strong>Equipamento:</strong>
                  <span>{equipamento.nomeEquipamento || '-'}</span>
                </div>
                <div className="grid-item">
                  <strong>Modelo:</strong>
                  <span>{equipamento.modelo || '-'}</span>
                </div>
                <div className="grid-item">
                  <strong>Fabricante:</strong>
                  <span>{equipamento.fabricante || '-'}</span>
                </div>
                <div className="grid-item">
                  <strong>Nº Patrimônio:</strong>
                  <span>{equipamento.numeroPatrimonio || '-'}</span>
                </div>
                <div className="grid-item">
                  <strong>Nº Série:</strong>
                  <span>{equipamento.numeroSerie || '-'}</span>
                </div>
                <div className="grid-item">
                  <strong>Nº Anvisa:</strong>
                  <span>{equipamento.numeroAnvisa || '-'}</span>
                </div>
              </div>
            </div>

            <div className="section">
              <h3>Dados da Compra</h3>
              <div className="grid-container">
                <div className="grid-item">
                  <strong>Valor da Compra:</strong>
                  <span>R$ {equipamento.valorCompra ? equipamento.valorCompra.toFixed(2) : '0.00'}</span>
                </div>
                <div className="grid-item">
                  <strong>Data da Compra:</strong>
                  <span>{formatDate(equipamento.dataCompra)}</span>
                </div>
                <div className="grid-item">
                  <strong>NF:</strong>
                  <span>{equipamento.notaFiscal || '-'}</span>
                </div>
                <div className="grid-item">
                  <strong>Início da Garantia:</strong>
                  <span>{formatDate(equipamento.inicioGarantia)}</span>
                </div>
                <div className="grid-item">
                  <strong>Fim da Garantia:</strong>
                  <span>{formatDate(equipamento.terminoGarantia)}</span>
                </div>
                <div className="grid-item">
                  <strong>OBS:</strong>
                  <span>{equipamento.obs || '-'}</span>
                </div>
              </div>
            </div>

            <div className="section">
              <div className="grid-container">
                <div className="grid-item">
                  <strong>Setor:</strong>
                  <span>{equipamento.setor?.nome || '-'}</span>
                </div>
                <div className="grid-item">
                  <strong>Localização:</strong>
                  <span>{equipamento.localizacao?.nome || '-'}</span>
                </div>
                <div className="grid-item">
                  <strong>Tipo de Equipamento:</strong>
                  <span>{equipamento.tipoEquipamento?.nome || '-'}</span>
                </div>
              </div>
            </div>

            {equipamento.arquivos && equipamento.arquivos.length > 0 && (
              <div className="section">
                <h3>Anexos</h3>
                <div className="arquivos-container">
                  {equipamento.arquivos.map((arquivo, index) => (
                    <div key={index} className="anexo-item">
                      <FaFilePdf className="pdf-icon" />
                      <span onClick={() => handleOpenPdf(arquivo)} className="anexo-link">
                        {arquivo.split('\\').pop()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

    </>
  );
};

export default PopupEquip;
