import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import miImagen from './logo.jpg';
import './Home.css';
import Agendarcita1 from './agendarcita1';

function Home() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div>
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Sidebar Template</title>
      <link
        href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css"
        rel="stylesheet"
      />
      <div className={`d-flex ${isSidebarOpen ? 'toggled' : ''}`} id="wrapper">
        {/* Sidebar */}
        <div className="bg-dark border-right" id="sidebar-wrapper">
        <div className="sidebar-heading text-white"><br /><br />CENTRO MEDICO</div>
        <div className="sidebar-heading text-white"> JERUSALEM <br /><br /></div>
          <div className="list-group list-group-flush">
          <Link to="/Agregar_productos" className="list-group-item list-group-item-action bg-dark text-white">
              Agregar Medicamentos
            </Link>
            <Link to="/ventas" className="list-group-item list-group-item-action bg-dark text-white">
              Farmacia
            </Link>
            <Link to="/Historial" className="list-group-item list-group-item-action bg-dark text-white">
              Historial Medico
            </Link>
            <Link to="/Buscar_paciente" className="list-group-item list-group-item-action bg-dark text-white">
            Buscar paciente
            </Link>
          </div>
          <div className="sidebar-heading text-white mt-4">CITAS</div>
          <div className="list-group list-group-flush">
          <  Link to="/AgendarCita" className="list-group-item list-group-item-action bg-dark text-white">
              Agendar Cita
            </Link>
            <Link to="/Agenda" className="list-group-item list-group-item-action bg-dark text-white">
            Ver Citas
            </Link>
          </div>
        </div>
        {/* /#sidebar-wrapper */}
        {/* Page Content */}
        <div id="page-content-wrapper">
          <nav className="navbar navbar-expand-lg navbar-light bg-light border-bottom">
            <button className="btn btn-primary" id="menu-toggle" onClick={toggleSidebar}>
              Menu
            </button>
          </nav>
          <div className="container-fluid">
          </div>
          <Agendarcita1 />  {/* Aquí se renderiza el componente de agendar cita */}
        </div>
        {/* /#page-content-wrapper */}
      </div>
    </div>
  );
}

export default Home;
