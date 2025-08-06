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
        setError('Failed to fetch OS data');
        setLoading(false);
      }
    };

    fetchOsData();
  }, []);

  const eventStyleGetter = (event) => {
    const style = {
      backgroundColor: event.resource.status === 'ABERTA' ? '#3174ad' : '#7c7c7c',
      borderRadius: '5px',
      opacity: 0.8,
      color: 'white',
      border: '0px',
      display: 'block'
    };
    return { style };
  };

  const EventComponent = ({ event }) => (
    <div style={{ padding: '4px' }}>
      <strong>{event.title}</strong>
      <p>Técnico: {event.resource.tecnico}</p>
      <p>Equipamento: {event.resource.tipoEquipamento}</p>
    </div>
  );

  if (loading) return <div style={{ textAlign: 'center', padding: '16px' }}>Loading...</div>;
  if (error) return <div style={{ textAlign: 'center', padding: '16px', color: '#dc2626' }}>{error}</div>;

  return (
    <div style={{
      height: '100vh',
      padding: '16px',
      backgroundColor: '#f3f4f6'
    }}>
      <h2 style={{
        fontSize: '24px',
        fontWeight: 'bold',
        marginBottom: '16px',
        color: '#1f2937'
      }}>Calendario de Manutenção Preventiva</h2>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 'calc(100% - 50px)' }}
        eventPropGetter={eventStyleGetter}
        components={{
          event: EventComponent
        }}
        views={['month', 'week', 'day']}
        defaultView="month"
        className="calendar-container"
      />
      <style jsx>{`
        .calendar-container {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
};

export default Oscalendar;