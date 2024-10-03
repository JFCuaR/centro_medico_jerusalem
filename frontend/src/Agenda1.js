import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/es';  // Importa la localización en español para moment
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Configura moment para que use el idioma español
moment.locale('es');

const localizador = momentLocalizer(moment);

function Agenda() {
  const [eventos, setEventos] = useState([]);

  useEffect(() => {
    // Simulación de datos de citas médicas. Aquí se cargarán desde la base de datos.
    const citasGuardadas = [
      {
        title: 'Cita con el Dr. Pérez',
        start: new Date(2024, 8, 4, 9, 0),
        end: new Date(2024, 8, 4, 10, 0),
      },
      {
        title: 'Cita con el Dr. López',
        start: new Date(2024, 8, 5, 11, 0),
        end: new Date(2024, 8, 5, 12, 0),
      },
    ];

    setEventos(citasGuardadas);
  }, []);

  return (
    <div className="agenda-contenedor">
      <Calendar
        localizer={localizador}
        events={eventos}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500, margin: '50px' }}
        messages={{
          next: "Sig.",
          previous: "Ant.",
          today: "Hoy",
          month: "Mes",
          week: "Semana",
          day: "Día",
          agenda: "Agenda",
          date: "Fecha",
          time: "Hora",
          event: "Evento",
          noEventsInRange: "No hay eventos en este rango",
        }}
      />
    </div>
  );
}

export default Agenda;
