// src/components/Sidebar.jsx
import { useState } from 'react';
import '../styles/Sidebar.css';
import { FaTools, FaCalendarAlt, FaLaptopCode, FaChevronDown, FaChevronUp, FaTimes, FaClipboardList,  } from 'react-icons/fa';
import { FaGears } from "react-icons/fa6";
import logo from '../assets/logo.png'; // ✅ Caminho da logo
function Sidebar({ setContent, isOpen, onClose }) {
  const [openMenu, setOpenMenu] = useState(null);

  const toggleMenu = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const handleContentChange = (contentType) => {
    setContent(contentType); // Update content in Layout
    onClose(); // Close the sidebar
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <button className="close-btn" onClick={onClose}>
        <FaTimes />
      </button>
     <div className="logo-container">
      <a href="#" target="_blank" rel="noopener noreferrer">
    <img src={logo} alt="Logo HCR TI" className="sidebar-logo" />
  </a>
</div>
      <div className="menu">
        <div className="menu-group">
          <button className="menu-btn" onClick={() => toggleMenu('equipamentos')}>
            <FaLaptopCode />
            Gestão de Equipamentos
            {openMenu === 'equipamentos' ? <FaChevronUp /> : <FaChevronDown />}
          </button>
          {openMenu === 'equipamentos' && (
            <ul className="submenu">
              <li onClick={() => handleContentChange('computadores')}>Computadores</li>
              <li onClick={() => handleContentChange('equipamentos_medicos')}>Equipamentos </li>
              <li onClick={() => handleContentChange('ares_condicionados')}>Ar-Condicionado</li>
              <li onClick={() => handleContentChange('impressoras')}>Impressoras</li>
            </ul>
          )}
        </div>

        <div className="menu-group">
          <button className="menu-btn" onClick={() => toggleMenu('manutencao')}>
           <FaGears />
            Manutenção 
            {openMenu === 'manutencao' ? <FaChevronUp /> : <FaChevronDown />}
          </button>
          {openMenu === 'manutencao' && (
            <ul className="submenu">
              <li onClick={() => handleContentChange('Oschamados')}>Chamados</li>
              <li onClick={() => handleContentChange('Os')}>Ordem de Serviço</li>
              <li onClick={() => handleContentChange('preventiva')}>Preventiva</li>
            </ul>
          )}
        </div>

        <div className="menu-group">
          <button className="menu-btn" onClick={() => toggleMenu('registros')}>
            <FaLaptopCode />
            Registros TI
            {openMenu === 'registros' ? <FaChevronUp /> : <FaChevronDown />}
          </button>
          {openMenu === 'registros' && (
            <ul className="submenu">
              <li onClick={() => handleContentChange('chamados')}>Chamados</li>
              <li onClick={() => handleContentChange('registro_Sobreaviso')}>registro de Sobreaviso</li>
              <li onClick={() => handleContentChange('Incidente')}>registro de incidente </li>
            </ul>
          )}
        </div>
        <div className="menu-group">
          <button className="menu-btn" onClick={() => toggleMenu('cadastro')}>
            <FaClipboardList />
            Cadastros
            {openMenu === 'cadastro' ? <FaChevronUp /> : <FaChevronDown />}
          </button>
          {openMenu === 'cadastro' && (
            <ul className="submenu">
              <li onClick={() => handleContentChange('tecnico')}>Tecnicos</li>
              <li onClick={() => handleContentChange('grupo_manutencao')}>Grupo de Manutenção</li>
              <li onClick={() => handleContentChange('usuarios')}>Usuarios</li>

            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default Sidebar;