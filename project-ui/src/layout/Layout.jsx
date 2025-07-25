// src/layout/Layout.jsx
import { useState } from 'react';
import Navbar from '../componets/Navbar';
import Sidebar from '../componets/Sidebar';
import PcPage from '../pages/PcPage';
import ArCondicionadoPage from '../pages/ArCondicionadoPage';
import EquipamentosMedicosPage from '../pages/EquipamentosMedicosPage';
import ChamadoPage from "../pages/ChamadoPage"
function Layout() {
  const [content, setContent] = useState('home');

  const renderContent = () => {
    switch (content) {
      case 'computadores':
        return <PcPage />;
      case 'equipamentos_medicos':
        return <EquipamentosMedicosPage/>;
      case 'ares_condicionados':
        return <ArCondicionadoPage/>;
      case 'impressoras':
        return <div><h1>Impressoras</h1><p>Conteúdo em desenvolvimento.</p></div>;
      case 'calendario':
        return <div><h1>Calendário</h1><p>Conteúdo em desenvolvimento.</p></div>;
      case 'chamados':
        return <ChamadoPage/>;
      case 'registros_adversos':
        return <div><h1>Registros Adversos</h1><p>Conteúdo em desenvolvimento.</p></div>;
      case 'dashboard':
        return <div><h1>Dashboard</h1><p>Conteúdo em desenvolvimento.</p></div>;
      case 'home':
      default:
        return (
          <div className="home-content">
            <h1>Bem-vindo ao FIXLAB</h1>
            <p>Escolha uma opção no menu ao lado para começar.</p>
          </div>
        );
    }
  };

  return (
    <div className="layout">
      <Navbar setContent={setContent} />
      <div className="main-container">
        <Sidebar setContent={setContent} />
        <div className="content-area">{renderContent()}</div>
      </div>
    </div>
  );
}

export default Layout;