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
import GrupoManutencaoPage from '../pages/GrupoManutencaoPage';
import TecnicoPage from '../pages/TecnicoPage';
import UsuarioPage from '../pages/UsuarioPage';
import OS from '../pages/OS';
import OsChamado from '../pages/OsChamado';
import PrinterPage from '../pages/PrinterPage';
import ChamadosTecnico from '../pages/ChamadosTecnico';
import OSPreventiva from '../pages/OSPreventiva';
import Oscalendar from '../componets/Oscalendar';
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
      case 'calendario':
        return <Oscalendar/>;
      case 'impressoras':
        return <PrinterPage/>;
      case 'Os':
        return <OS/>;
      case 'Oschamados':
        return <OsChamado/>;
      case 'registro_Sobreaviso':
        return <SobreAvisoPage/>;
      case 'Incidente':
        return <IncidentePage/>;
      case 'grupo_manutencao':
        return <GrupoManutencaoPage/>;
      case 'tecnico':
        return <TecnicoPage/>;
      case 'usuarios':
        return <UsuarioPage/>;
      case 'chamados':
        return <ChamadoPage/>;
        case 'preventiva':
        return <OSPreventiva/>;
      case 'home':
        case 'meuschamados':
        return <ChamadosTecnico/>;
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