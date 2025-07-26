// src/layout/Layout.jsx
import { useState } from 'react';
import Home from '../pages/Home';
import Navbar from '../componets/Navbar';
import Sidebar from '../componets/Sidebar';
import PcPage from '../pages/PcPage';
import ArCondicionadoPage from '../pages/ArCondicionadoPage';
import EquipamentosMedicosPage from '../pages/EquipamentosMedicosPage';
import ChamadoPage from "../pages/ChamadoPage"
import SobreAvisoPage from '../pages/SobreAvisoPage';
import IncidentePage from '../pages/IncidentePage';
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
      case 'registro_Sobreaviso':
        return <SobreAvisoPage/>;
      case 'Incidente':
        return <IncidentePage/>;
      case 'dashboard':
        return <div><h1>Dashboard</h1><p>Conteúdo em desenvolvimento.</p></div>;
      case 'home':
      default:
        return (
          <>
            <Home />
          </>
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