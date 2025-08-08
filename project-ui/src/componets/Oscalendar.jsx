import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import api from '../config/api';

const localizer = momentLocalizer(moment);

const Oscalendar = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const fetchOsData = async () => {
      try {
        const response = await api.get('/os');
        const data = response.data;

        const calendarEvents = data.preventivas.map(os => ({
          id: os.id,
          title: `${os.descricao} - ${os.Setor.nome}`,
          start: new Date(os.dataAgendada),
          end: new Date(new Date(os.dataAgendada).getTime() + 60 * 60 * 1000),
          allDay: false,
          resource: {
            tecnico: os.tecnico.nome,
            tipoEquipamento: os.tipoEquipamento.nome,
            status: os.status,
            recorrencia: os.recorrencia,
            solicitante: os.solicitante.nome
          }
        }));

        setEvents(calendarEvents);
        setLoading(false);
      } catch (err) {
        setError('Erro ao carregar dados das OS.');
        setLoading(false);
      }
    };

    fetchOsData();
  }, []);

  const handleNavigate = (newDate) => {
    setCurrentDate(newDate);
  };

  const handleViewChange = (view) => {
    console.log(`View changed to: ${view}`);
  };

  const eventStyleGetter = (event) => {
    const style = {
      backgroundColor: event.resource.status === 'ABERTA' ? '#3B82F6' : '#9CA3AF',
      borderRadius: '8px',
      padding: '4px 6px',
      color: 'white',
      border: 'none',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    };
    return { style };
  };

  const EventComponent = ({ event }) => (
    <div>
      <strong style={{ fontSize: '14px' }}>{event.title}</strong>
      <div style={{ fontSize: '12px', marginTop: '4px' }}>
        <p style={{ margin: '2px 0' }}><b>Técnico:</b> {event.resource.tecnico}</p>
        <p style={{ margin: '2px 0' }}><b>Equipamento:</b> {event.resource.tipoEquipamento}</p>
      </div>
    </div>
  );

  if (loading) return <div style={{ textAlign: 'center', padding: '16px' }}>Carregando...</div>;
  if (error) return <div style={{ textAlign: 'center', padding: '16px', color: '#dc2626' }}>{error}</div>;

  return (
    <div style={{
      height: '100vh',
      padding: '24px',
      backgroundColor: '#F9FAFB',
      fontFamily: 'Segoe UI, sans-serif'
    }}>
      <h2 style={{
        fontSize: '28px',
        fontWeight: 700,
        marginBottom: '20px',
        color: '#111827'
      }}></h2>

      <div className="calendar-wrapper">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 'calc(100vh - 140px)' }}
          eventPropGetter={eventStyleGetter}
          components={{ event: EventComponent }}
          views={['month', 'week', 'day']}
          defaultView="month"
          date={currentDate}
          onNavigate={handleNavigate}
          onView={handleViewChange}
          className="calendar-container"
          messages={{
            next: "Próximo",
            previous: "Anterior",
            today: "Hoje",
            month: "Mês",
            week: "Semana",
            day: "Dia"
          }}
        />
      </div>

      <style jsx>{`
        .calendar-wrapper {
          background-color: #FFFFFF;
          border-radius: 12px;
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
          padding: 16px;
        }

        .rbc-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          font-size: 16px;
        }

        .rbc-btn-group button {
          background-color: #E5E7EB;
          border: none;
          padding: 8px 14px;
          margin: 0 2px;
          border-radius: 6px;
          font-weight: 500;
          transition: background-color 0.2s ease;
          cursor: pointer;
        }

        .rbc-btn-group button:hover {
          background-color: #D1D5DB;
        }

        .rbc-active {
          background-color: #3B82F6 !important;
          color: white !important;
        }

        .rbc-today {
          background-color: #EFF6FF !important;
        }

        .rbc-event {
          padding: 4px !important;
        }
      `}</style>
    </div>
  );
};

export default Oscalendar;
